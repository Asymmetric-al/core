import { createHash, randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  admitHosts,
  begin,
  begun,
  claim,
  claimEvent,
  configFor,
  digest,
  dualHost,
  feeFund,
  inTx,
  missionary,
  moneyRows,
  paymentIntent,
  person,
  rateToken,
  readyOnlyHost,
  report,
  role,
  secondEntityBinding,
  seedTwoTenants,
  storeEvent,
  work,
  type Outcome,
} from "./wp8a-rest2a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 2a: the config read, the rate limit, R2, deferred refunds and disputes, the due work (real stack, every test rolled back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function world() {
      const fx = await seedTwoTenants(db);
      const hostsA = await admitHosts(db, fx.A);
      const hostsB = await admitHosts(db, fx.B);
      const feeA = await feeFund(db, fx.A);
      return { A: fx.A, B: fx.B, hostsA, hostsB, feeA };
    }

    async function paidGift(w: Awaited<ReturnType<typeof world>>) {
      const r = begun(
        await begin(db, {
          host: w.hostsA.site,
          lines: [{ fund: w.A.fund, amount: 4000 }],
        }),
      );
      const pi = paymentIntent();
      const claimed = await claim(db, r.operation_id);
      await report(db, r.operation_id, claimed.attempt as number, {
        result: "succeeded",
        provider_object_id: pi,
      });
      const event = await storeEvent(db, w.A, {
        pi,
        amount: 4000,
        metadata: {
          asym_operation: r.operation_id,
          asym_intake: r.donation_id,
        },
      });
      expect((await work(db, event.id)).outcome).toBe("applied");
      return { ...r, pi };
    }

    async function defer(eventId: string, attemptNo: number) {
      await role(db, "service_role");
      await db.query("SAVEPOINT rest2a_defer");
      try {
        const r = (
          await db.query("SELECT public.defer_payment_event($1, $2) AS r", [
            eventId,
            attemptNo,
          ])
        ).rows[0].r as Outcome;
        await db.query("RELEASE SAVEPOINT rest2a_defer");
        return { ok: true as const, r };
      } catch (e) {
        await db.query("ROLLBACK TO SAVEPOINT rest2a_defer");
        const err = e as { code?: string; message?: string };
        return { ok: false as const, refusal: `${err.code} ${err.message}` };
      } finally {
        await role(db, null);
      }
    }

    async function deferredTasks(tenant: string) {
      await role(db, null);
      return (
        await db.query(
          `SELECT t.id, t.issue_type, t.source_module,
                  array(SELECT l.record_type || ':' || l.record_id FROM public.mission_control_task_links AS l
                         WHERE l.task_id = t.id ORDER BY 1) AS links
             FROM public.mission_control_tasks AS t
            WHERE t.tenant_id = $1 AND t.issue_type = 'payment_event_deferred'
            ORDER BY t.created_at`,
          [tenant],
        )
      ).rows as Array<{ id: string; issue_type: string; links: string[] }>;
    }

    describe("the anonymous config read (W8-R18, plan :1125)", () => {
      it("an admitted host, an active organization, one entity and an active test binding get exactly the connected account", () =>
        inTx(db, async () => {
          const w = await world();
          const rows = await configFor(db, w.hostsA.site, [{ fund: w.A.fund }]);
          expect(rows).toEqual([{ connected_account_id: w.A.account }]);
          expect(
            await configFor(db, w.hostsA.home, [{ fund: w.A.fund }]),
          ).toEqual([{ connected_account_id: w.A.account }]);
          const both = await dualHost(db, w.A, w.hostsA);
          expect(await configFor(db, both, [{ fund: w.A.fund }])).toEqual([
            { connected_account_id: w.A.account },
          ]);
        }));

      it("a Site switched off, a name not yet active, another organization's worker and an inactive fund get the same nothing (outcome 2 of 27 November)", () =>
        inTx(db, async () => {
          const w = await world();
          const ready = await readyOnlyHost(db, w.A);
          const bWorker = await missionary(db, w.B);
          const aWorker = await missionary(db, w.A);
          await role(db, null);
          const closed = (
            await db.query(
              "INSERT INTO public.funds (tenant_id, legal_entity_id, name, is_active) VALUES ($1, $2, 'Closed fund', false) RETURNING id",
              [w.A.tenant, w.A.entity],
            )
          ).rows[0].id as string;
          expect(
            await configFor(db, w.hostsA.site, [{ missionary: aWorker }]),
          ).toEqual([{ connected_account_id: w.A.account }]);
          expect(await configFor(db, ready, [{ fund: w.A.fund }])).toEqual([]);
          expect(
            await configFor(db, w.hostsA.site, [{ missionary: bWorker }]),
          ).toEqual([]);
          expect(
            await configFor(db, w.hostsA.site, [{ fund: closed }]),
          ).toEqual([]);
          await role(db, null);
          await db.query(
            "UPDATE public.sites SET status = 'inactive' WHERE id = $1",
            [w.hostsA.siteId],
          );
          expect(
            await configFor(db, w.hostsA.site, [{ fund: w.A.fund }]),
          ).toEqual([]);
        }));

      it("every other case gets the same nothing: unclaimed host, inactive organization, two entities, a reserved fund, another organization's target, no target, a binding not active", () =>
        inTx(db, async () => {
          const w = await world();
          await role(db, null);
          const otherFund = (
            await db.query(
              "INSERT INTO public.funds (tenant_id, legal_entity_id, name) VALUES ($1, $2, 'Second entity fund') RETURNING id",
              [w.A.tenant, w.A.otherEntity],
            )
          ).rows[0].id as string;
          expect(
            await configFor(db, "nowhere.give.example.test", [
              { fund: w.A.fund },
            ]),
          ).toEqual([]);
          expect(
            await configFor(db, w.hostsA.site, [
              { fund: w.A.fund },
              { fund: otherFund },
            ]),
          ).toEqual([]);
          expect(
            await configFor(db, w.hostsA.site, [{ fund: otherFund }]),
          ).toEqual([]);
          expect(
            await configFor(db, w.hostsA.site, [{ fund: w.feeA }]),
          ).toEqual([]);
          expect(
            await configFor(db, w.hostsA.site, [{ fund: w.B.fund }]),
          ).toEqual([]);
          expect(await configFor(db, w.hostsA.site, [])).toEqual([]);
          expect(
            await configFor(db, w.hostsA.site, [{ fund: randomUUID() }]),
          ).toEqual([]);
          await role(db, null);
          await db.query(
            "UPDATE public.tenants SET status = 'suspended' WHERE id = $1",
            [w.A.tenant],
          );
          expect(
            await configFor(db, w.hostsA.site, [{ fund: w.A.fund }]),
          ).toEqual([]);
          await db.query(
            "UPDATE public.tenants SET status = 'active' WHERE id = $1",
            [w.A.tenant],
          );
          for (const status of ["pending", "restricted", "disconnected"]) {
            await role(db, null);
            await db.query(
              "UPDATE public.payment_account_bindings SET status = $2 WHERE id = $1",
              [w.A.binding, status],
            );
            expect(
              await configFor(db, w.hostsA.site, [{ fund: w.A.fund }]),
              status,
            ).toEqual([]);
          }
        }));

      it("anon executes the read and holds no grant on any table beneath it", () =>
        inTx(db, async () => {
          await role(db, null);
          const rows = (
            await db.query(
              `SELECT has_function_privilege('anon', 'public.checkout_giving_config(text,jsonb)', 'EXECUTE') AS can,
                      (SELECT array_agg(t ORDER BY t) FROM unnest(ARRAY['site_domains','donor_portal_hosts','tenants','funds',
                         'missionaries','legal_entities','payment_account_bindings']) AS t
                        WHERE has_table_privilege('anon', 'public.' || t, 'SELECT')) AS granted`,
            )
          ).rows[0];
          expect(rows).toEqual({ can: true, granted: null });
        }));
    });

    describe("the rate limit (plan :1148): a digest per address and window, trimmed by its own calls", () => {
      it("ten requests from one address in a window pass, the eleventh is refused, another address is unaffected", () =>
        inTx(db, async () => {
          const address = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
          const answers: boolean[] = [];
          for (let i = 0; i < 11; i += 1)
            answers.push(await rateToken(db, address));
          expect(answers).toEqual([...Array(10).fill(true), false]);
          expect(await rateToken(db, "203.0.113.7")).toBe(true);
          await role(db, null);
          const stored = (
            await db.query(
              "SELECT address_digest, hits FROM private.intake_rate_windows WHERE address_digest = $1",
              [createHash("sha256").update(address).digest("hex")],
            )
          ).rows;
          expect(stored).toEqual([
            {
              address_digest: createHash("sha256")
                .update(address)
                .digest("hex"),
              hits: 11,
            },
          ]);
          const raw = (
            await db.query(
              "SELECT count(*)::int AS n FROM private.intake_rate_windows AS w WHERE to_jsonb(w)::text LIKE $1",
              [`%${address}%`],
            )
          ).rows[0].n;
          expect(raw).toBe(0);
        }));

      it("a call removes windows that have ended, so the table holds at most the addresses of the current window", () =>
        inTx(db, async () => {
          await role(db, null);
          await db.query(
            "INSERT INTO private.intake_rate_windows (address_digest, window_start, hits) VALUES ($1, now() - interval '1 day', 3)",
            [createHash("sha256").update("old").digest("hex")],
          );
          expect(await rateToken(db, "192.0.2.9")).toBe(true);
          await role(db, null);
          const left = (
            await db.query(
              "SELECT count(*)::int AS n FROM private.intake_rate_windows WHERE window_start < now() - interval '20 minutes'",
            )
          ).rows[0].n;
          expect(left).toBe(0);
        }));

      it("only service_role may take a token; a missing address is refused", () =>
        inTx(db, async () => {
          await role(db, null);
          const rows = (
            await db.query(
              `SELECT r, has_function_privilege(r, 'public.take_intake_rate_token(text)', 'EXECUTE') AS can
                 FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r ORDER BY r`,
            )
          ).rows;
          expect(rows.map((r) => r.can)).toEqual([false, false, true]);
          await role(db, "service_role");
          await db.query("SAVEPOINT rest2a_rate");
          const refused = await db
            .query("SELECT public.take_intake_rate_token('  ')")
            .then(() => null)
            .catch(
              (e: { code?: string; message?: string }) =>
                `${e.code} ${e.message}`,
            );
          await db.query("ROLLBACK TO SAVEPOINT rest2a_rate");
          await role(db, null);
          expect(refused).toBe("22023 rate_limit_address_required");
        }));
    });

    it("R2: after a first signed-in gift the claim finds the giver's donor, not linked; no link and no membership is written", () =>
      inTx(db, async () => {
        const w = await world();
        const giver = await person(db, w.A, { confirmed: true });
        const r = begun(
          await begin(db, {
            host: w.hostsA.home,
            surface: "donor_account",
            lines: [{ fund: w.A.fund, amount: 3000 }],
            contact: {
              email: giver.email,
              first_name: "Sam",
              last_name: "Signed",
            },
            actor: {
              user_id: giver.user,
              email: giver.email,
              email_confirmed: true,
            },
          }),
        );
        const pi = paymentIntent();
        const claimed = await claim(db, r.operation_id);
        await report(db, r.operation_id, claimed.attempt as number, {
          result: "succeeded",
          provider_object_id: pi,
        });
        const event = await storeEvent(db, w.A, {
          pi,
          amount: 3000,
          metadata: {
            asym_operation: r.operation_id,
            asym_intake: r.donation_id,
          },
        });
        expect((await work(db, event.id)).outcome).toBe("applied");
        await role(db, null);
        const gift = (
          await db.query(
            "SELECT donor_id FROM public.donations WHERE id = $1",
            [r.donation_id],
          )
        ).rows[0] as { donor_id: string };
        expect(gift.donor_id).toEqual(expect.any(String));
        const claimRow = (
          await db.query("SELECT * FROM private.account_claim_donor($1, $2)", [
            w.A.tenant,
            giver.email,
          ])
        ).rows;
        expect(claimRow).toHaveLength(1);
        expect(claimRow[0]).toMatchObject({
          donor_id: gift.donor_id,
          linked: false,
        });
        const writes = (
          await db.query(
            `SELECT (SELECT count(*)::int FROM public.account_links WHERE user_id = $1) AS links,
                    (SELECT count(*)::int FROM authz.memberships WHERE user_id = $1 AND tenant_id = $3) AS memberships,
                    (SELECT profile_id FROM public.donors WHERE id = $2) AS profile`,
            [giver.user, gift.donor_id, w.A.tenant],
          )
        ).rows[0];
        expect(writes).toEqual({ links: 0, memberships: 0, profile: null });
      }));

    it("R2 in place (row 1): a first signed-in gift on the shared website and home name keeps the Site, and the claim finds the giver's donor, not linked; no link and no membership is written", () =>
      inTx(db, async () => {
        const w = await world();
        const both = await dualHost(db, w.A, w.hostsA);
        const giver = await person(db, w.A, { confirmed: true });
        const r = begun(
          await begin(db, {
            host: both,
            lines: [{ fund: w.A.fund, amount: 3000 }],
            contact: {
              email: giver.email,
              first_name: "Ina",
              last_name: "Place",
            },
            actor: {
              user_id: giver.user,
              email: giver.email,
              email_confirmed: true,
            },
          }),
        );
        const pi = paymentIntent();
        const claimed = await claim(db, r.operation_id);
        await report(db, r.operation_id, claimed.attempt as number, {
          result: "succeeded",
          provider_object_id: pi,
        });
        const event = await storeEvent(db, w.A, {
          pi,
          amount: 3000,
          metadata: {
            asym_operation: r.operation_id,
            asym_intake: r.donation_id,
          },
        });
        expect((await work(db, event.id)).outcome).toBe("applied");
        await role(db, null);
        const gift = (
          await db.query(
            "SELECT donor_id, site_id, entry_surface FROM public.donations WHERE id = $1",
            [r.donation_id],
          )
        ).rows[0] as {
          donor_id: string;
          site_id: string;
          entry_surface: string;
        };
        expect(gift).toMatchObject({
          site_id: w.hostsA.siteId,
          entry_surface: "website",
        });
        const claimRow = (
          await db.query("SELECT * FROM private.account_claim_donor($1, $2)", [
            w.A.tenant,
            giver.email,
          ])
        ).rows;
        expect(claimRow).toEqual([
          expect.objectContaining({ donor_id: gift.donor_id, linked: false }),
        ]);
        const writes = (
          await db.query(
            `SELECT (SELECT count(*)::int FROM public.account_links WHERE user_id = $1) AS links,
                    (SELECT count(*)::int FROM authz.memberships WHERE user_id = $1 AND tenant_id = $2) AS memberships`,
            [giver.user, w.A.tenant],
          )
        ).rows[0];
        expect(writes).toEqual({ links: 0, memberships: 0 });
      }));

    it("a guest whose e-mail is known and one whose e-mail is not get the same answer, byte for byte apart from opaque ids, with no Party id or match flag in it; no link or membership is written (ruling of 27 November, section 6)", () =>
      inTx(db, async () => {
        const w = await world();
        const known = await person(db, w.A, {
          confirmed: true,
          link: true,
          donor: true,
          donorEmail: null,
        });
        await role(db, null);
        await db.query("UPDATE public.donors SET email = $2 WHERE id = $1", [
          known.donor,
          known.email,
        ]);
        const pay = async (email: string) => {
          const r = begun(
            await begin(db, {
              host: w.hostsA.site,
              lines: [{ fund: w.A.fund, amount: 2700 }],
              contact: { email, first_name: "Same", last_name: "Answer" },
            }),
          );
          const pi = paymentIntent();
          const claimed = await claim(db, r.operation_id);
          await report(db, r.operation_id, claimed.attempt as number, {
            result: "succeeded",
            provider_object_id: pi,
          });
          const event = await storeEvent(db, w.A, {
            pi,
            amount: 2700,
            metadata: {
              asym_operation: r.operation_id,
              asym_intake: r.donation_id,
            },
          });
          const applied = await work(db, event.id);
          const opaque = [r.donation_id, r.operation_id, pi, event.id];
          const mask = (value: unknown) =>
            opaque.reduce(
              (text, id) => text.split(id).join("<id>"),
              JSON.stringify(value),
            );
          return { begun: mask(r), outcome: applied.outcome, raw: r };
        };
        const before = (
          await db.query(
            `SELECT (SELECT count(*)::int FROM public.account_links WHERE user_id = $1) AS links,
                    (SELECT count(*)::int FROM authz.memberships WHERE user_id = $1) AS memberships`,
            [known.user],
          )
        ).rows[0];
        const knownAnswer = await pay(known.email);
        const unknownAnswer = await pay(
          `stranger-${randomUUID()}@example.test`,
        );
        expect(knownAnswer.begun).toBe(unknownAnswer.begun);
        expect(knownAnswer.outcome).toBe(unknownAnswer.outcome);
        for (const answer of [knownAnswer, unknownAnswer]) {
          expect(Object.keys(answer.raw).sort()).toEqual(
            [
              "amount",
              "currency",
              "donation_id",
              "gift_state",
              "operation_id",
              "outcome",
              "payment_intent",
              "provider_account",
              "tenant_id",
            ].sort(),
          );
          expect(answer.begun).not.toContain(known.party!);
          expect(answer.begun).not.toContain(known.donor!);
          expect(answer.begun).not.toMatch(/party|match|donor|linked/i);
        }
        await role(db, null);
        const after = (
          await db.query(
            `SELECT (SELECT count(*)::int FROM public.account_links WHERE user_id = $1) AS links,
                    (SELECT count(*)::int FROM authz.memberships WHERE user_id = $1) AS memberships`,
            [known.user],
          )
        ).rows[0];
        expect(after).toEqual(before);
      }));

    it("T1: an event on the organization's second account, or in live mode on its first, naming the first entity's payment, request and intake is unmatched, and the intake stays as it was", () =>
      inTx(db, async () => {
        const w = await world();
        const second = await secondEntityBinding(db, w.A);
        const r = begun(
          await begin(db, {
            host: w.hostsA.site,
            lines: [{ fund: w.A.fund, amount: 3000 }],
          }),
        );
        const pi = paymentIntent();
        const claimed = await claim(db, r.operation_id);
        await report(db, r.operation_id, claimed.attempt as number, {
          result: "succeeded",
          provider_object_id: pi,
        });
        const metadata = {
          asym_operation: r.operation_id,
          asym_intake: r.donation_id,
        };
        const moneyOnly = async () => {
          const { tasks: _tasks, ...money } = await moneyRows(db, w.A.tenant);
          return digest(money);
        };
        const before = await moneyOnly();
        const onSecond = await storeEvent(
          db,
          { ...w.A, account: second.account },
          { pi, amount: 3000, metadata },
        );
        expect(await work(db, onSecond.id)).toMatchObject({
          outcome: "unmatched",
        });
        await role(db, null);
        const live = randomUUID();
        await db.query(
          `INSERT INTO public.payment_onboarding_intents
             (id, tenant_id, legal_entity_id, livemode, version, status, reason, created_by, assignment_id,
              provider_account_id, confirmed_at, confirmed_by_event)
           VALUES ($1, $2, $3, true, 1, 'confirmed', 'Live twin', gen_random_uuid(), gen_random_uuid(), $4, now(), 'evt_rest2a_live')`,
          [live, w.A.tenant, w.A.entity, w.A.account],
        );
        await db.query(
          `INSERT INTO public.payment_provider_accounts
             (tenant_id, legal_entity_id, provider_account_id, livemode, onboarding_intent_id, confirmed_at)
           VALUES ($1, $2, $3, true, $4, now())`,
          [w.A.tenant, w.A.entity, w.A.account, live],
        );
        const inLive = await storeEvent(db, w.A, {
          pi,
          amount: 3000,
          metadata,
          livemode: true,
        });
        expect(await work(db, inLive.id)).toMatchObject({
          outcome: "unmatched",
        });
        expect(await moneyOnly()).toBe(before);
        await role(db, null);
        expect(
          (
            await db.query(
              "SELECT status, stripe_payment_intent_id FROM public.donations WHERE id = $1",
              [r.donation_id],
            )
          ).rows[0],
        ).toEqual({ status: "pending", stripe_payment_intent_id: pi });
      }));

    describe("connected refunds and disputes are deferred to WP8c (ruling 2)", () => {
      it("a refund and a dispute of one paid gift are stored deferred, with one task for the gift and no money row changed", () =>
        inTx(db, async () => {
          const w = await world();
          const gift = await paidGift(w);
          const moneyOnly = async () => {
            const { tasks: _tasks, ...money } = await moneyRows(db, w.A.tenant);
            return digest(money);
          };
          const before = await moneyOnly();
          const refund = await storeEvent(db, w.A, {
            type: "charge.refunded",
            payload: (e) => ({
              ...e,
              data: {
                object: {
                  id: `ch_${randomUUID().replaceAll("-", "").slice(0, 20)}`,
                  object: "charge",
                  amount: 4000,
                  amount_refunded: 4000,
                  currency: "usd",
                  payment_intent: gift.pi,
                  livemode: false,
                },
              },
            }),
          });
          const dispute = await storeEvent(db, w.A, {
            type: "charge.dispute.created",
            payload: (e) => ({
              ...e,
              data: {
                object: {
                  id: `dp_${randomUUID().replaceAll("-", "").slice(0, 20)}`,
                  object: "dispute",
                  amount: 4000,
                  currency: "usd",
                  payment_intent: gift.pi,
                  livemode: false,
                },
              },
            }),
          });
          for (const event of [refund, dispute]) {
            const claimed = await claimEvent(db, event.id);
            const d = await defer(event.id, claimed.attempt as number);
            expect(d).toMatchObject({
              ok: true,
              r: { outcome: "deferred", donation_id: gift.donation_id },
            });
          }
          expect(await moneyOnly()).toBe(before);
          await role(db, null);
          const statuses = (
            await db.query(
              "SELECT processing_status, processing_outcome->>'outcome' AS outcome FROM public.stripe_connect_events WHERE id = ANY($1::uuid[]) ORDER BY event_type",
              [[refund.id, dispute.id]],
            )
          ).rows;
          expect(statuses).toEqual([
            { processing_status: "deferred", outcome: "deferred_to_wp8c" },
            { processing_status: "deferred", outcome: "deferred_to_wp8c" },
          ]);
          const tasks = await deferredTasks(w.A.tenant);
          expect(tasks).toHaveLength(1);
          expect(tasks[0]!.links).toEqual(
            [
              `donation:${gift.donation_id}`,
              `stripe_connect_event:${dispute.id}`,
              `stripe_connect_event:${refund.id}`,
            ].sort(),
          );
          const again = await claimEvent(db, refund.id);
          expect(again).toMatchObject({
            claimed: false,
            terminal: true,
            outcome: "deferred",
          });
        }));

      it("a refund naming no known intake is deferred with its own task; a payment event and an unclaimed attempt are refused", () =>
        inTx(db, async () => {
          const w = await world();
          const stray = await storeEvent(db, w.A, {
            type: "charge.refund.updated",
            payload: (e) => ({
              ...e,
              data: {
                object: {
                  id: "re_stray1",
                  object: "refund",
                  amount: 100,
                  currency: "usd",
                  payment_intent: paymentIntent(),
                },
              },
            }),
          });
          const claimed = await claimEvent(db, stray.id);
          expect(
            await defer(stray.id, claimed.attempt as number),
          ).toMatchObject({
            ok: true,
            r: { outcome: "deferred", donation_id: null },
          });
          expect((await deferredTasks(w.A.tenant))[0]!.links).toEqual([
            `stripe_connect_event:${stray.id}`,
          ]);
          const payment = await storeEvent(db, w.A, { pi: paymentIntent() });
          const paymentClaim = await claimEvent(db, payment.id);
          expect(
            await defer(payment.id, paymentClaim.attempt as number),
          ).toEqual({
            ok: false,
            refusal: "22023 not_a_deferred_event",
          });
          const unclaimed = await storeEvent(db, w.A, {
            type: "charge.dispute.closed",
            payload: (e) => ({
              ...e,
              data: {
                object: {
                  id: "dp_x",
                  object: "dispute",
                  payment_intent: paymentIntent(),
                },
              },
            }),
          });
          expect(await defer(unclaimed.id, 1)).toEqual({
            ok: false,
            refusal: "55000 event_not_claimed",
          });
        }));

      it("F2: a worker whose event lease ran out, or whose account's lease names another event, is refused 55000 lease_lost and writes nothing", () =>
        inTx(db, async () => {
          const w = await world();
          const gift = await paidGift(w);
          const refund = await storeEvent(db, w.A, {
            type: "charge.refunded",
            payload: (e) => ({
              ...e,
              data: {
                object: {
                  id: `ch_${randomUUID().replaceAll("-", "").slice(0, 20)}`,
                  object: "charge",
                  amount: 4000,
                  amount_refunded: 4000,
                  currency: "usd",
                  payment_intent: gift.pi,
                  livemode: false,
                },
              },
            }),
          });
          const other = await storeEvent(db, w.A, { pi: paymentIntent() });
          const claimed = await claimEvent(db, refund.id);
          const asOwner = async (sql: string, params: unknown[]) => {
            await role(db, null);
            await db.query("SAVEPOINT rest2a_lease");
            await db.query("SET LOCAL session_replication_role = replica");
            await db.query(sql, params);
            await db.query("SET LOCAL session_replication_role = origin");
            await db.query("RELEASE SAVEPOINT rest2a_lease");
          };
          const state = async () =>
            (
              await db.query(
                `SELECT e.processing_status,
                        (SELECT count(*)::int FROM public.mission_control_tasks AS t
                          WHERE t.tenant_id = e.tenant_id AND t.issue_type = 'payment_event_deferred') AS tasks
                   FROM public.stripe_connect_events AS e WHERE e.id = $1`,
                [refund.id],
              )
            ).rows[0];
          await asOwner(
            "UPDATE public.stripe_connect_events SET lease_expires_at = clock_timestamp() - interval '1 second' WHERE id = $1",
            [refund.id],
          );
          expect(await defer(refund.id, claimed.attempt as number)).toEqual({
            ok: false,
            refusal: "55000 lease_lost",
          });
          await role(db, null);
          expect(await state()).toEqual({
            processing_status: "processing",
            tasks: 0,
          });
          await asOwner(
            "UPDATE public.stripe_connect_events SET lease_expires_at = clock_timestamp() + interval '5 minutes' WHERE id = $1",
            [refund.id],
          );
          await asOwner(
            `UPDATE public.payment_provider_accounts
                SET sync_lease_event_id = $3, sync_lease_expires_at = clock_timestamp() + interval '5 minutes'
              WHERE tenant_id = $1 AND provider_account_id = $2 AND livemode = false`,
            [w.A.tenant, w.A.account, other.id],
          );
          expect(await defer(refund.id, claimed.attempt as number)).toEqual({
            ok: false,
            refusal: "55000 lease_lost",
          });
          await role(db, null);
          expect(await state()).toEqual({
            processing_status: "processing",
            tasks: 0,
          });
        }));
    });
  },
);
