import { createHash, randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  admitHosts,
  ageIntake,
  begin,
  begun,
  claim,
  claimEvent,
  configFor,
  digest,
  expireLease,
  feeFund,
  inTx,
  moneyRows,
  paymentIntent,
  person,
  rateToken,
  report,
  role,
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
      expect((await work(db, event.id)).outcome).toBe("staged");
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
        expect((await work(db, event.id)).outcome).toBe("staged");
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
                    (SELECT count(*)::int FROM authz.memberships WHERE user_id = $1) AS memberships,
                    (SELECT profile_id FROM public.donors WHERE id = $2) AS profile`,
            [giver.user, gift.donor_id],
          )
        ).rows[0];
        expect(writes).toEqual({ links: 0, memberships: 0, profile: null });
      }));

    describe("connected refunds and disputes are deferred to WP8c (ruling 2)", () => {
      it("a refund and a dispute of one paid gift are stored deferred, with one task for the gift and no money row changed", () =>
        inTx(db, async () => {
          const w = await world();
          const gift = await paidGift(w);
          const before = digest(await moneyRows(db, w.A.tenant));
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
          expect(digest(await moneyRows(db, w.A.tenant))).toBe(before);
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
    });

    describe("the reconciliation reads each mapped account (record 1012, issue 2776)", () => {
      async function reconcile(
        accountRow: string,
        snapshot: Record<string, unknown>,
      ) {
        await role(db, "service_role");
        await db.query("SAVEPOINT rest2a_reconcile");
        try {
          const r = (
            await db.query(
              "SELECT public.reconcile_payment_account($1, $2::jsonb) AS r",
              [accountRow, JSON.stringify(snapshot)],
            )
          ).rows[0].r as Outcome;
          await db.query("RELEASE SAVEPOINT rest2a_reconcile");
          return r;
        } catch (e) {
          await db.query("ROLLBACK TO SAVEPOINT rest2a_reconcile");
          const err = e as { code?: string; message?: string };
          return { refusal: `${err.code} ${err.message}` } as Outcome;
        } finally {
          await role(db, null);
        }
      }

      it("a reading that agrees changes nothing; one that disagrees opens one drift task and never moves the binding", () =>
        inTx(db, async () => {
          const w = await world();
          await role(db, null);
          const accountRow = (
            await db.query(
              "SELECT id FROM public.payment_provider_accounts WHERE tenant_id = $1",
              [w.A.tenant],
            )
          ).rows[0].id as string;
          const reading = {
            id: w.A.account,
            livemode: false,
            closed: false,
            card_payments_status: "active",
          };
          expect(await reconcile(accountRow, reading)).toMatchObject({
            outcome: "in_line",
            binding_status: "active",
          });
          const closed = await reconcile(accountRow, {
            ...reading,
            closed: true,
          });
          expect(closed).toMatchObject({
            outcome: "drift_flagged",
            observed: "disconnected",
            binding_status: "active",
          });
          expect(
            await reconcile(accountRow, {
              ...reading,
              card_payments_status: "inactive",
            }),
          ).toMatchObject({
            outcome: "already_flagged",
            task_id: closed.task_id,
          });
          await role(db, null);
          const binding = (
            await db.query(
              "SELECT status FROM public.payment_account_bindings WHERE id = $1",
              [w.A.binding],
            )
          ).rows[0].status;
          expect(binding).toBe("active");
          const tasks = (
            await db.query(
              `SELECT t.id, array(SELECT l.record_type || ':' || l.record_id FROM public.mission_control_task_links AS l
                                   WHERE l.task_id = t.id) AS links
                 FROM public.mission_control_tasks AS t
                WHERE t.tenant_id = $1 AND t.issue_type = 'payment_account_drift'`,
              [w.A.tenant],
            )
          ).rows;
          expect(tasks).toEqual([
            {
              id: closed.task_id,
              links: [`payment_account_binding:${w.A.binding}`],
            },
          ]);
        }));

      it("a reading of another account or mode is refused; only service_role calls it", () =>
        inTx(db, async () => {
          const w = await world();
          await role(db, null);
          const accountRow = (
            await db.query(
              "SELECT id FROM public.payment_provider_accounts WHERE tenant_id = $1",
              [w.A.tenant],
            )
          ).rows[0].id as string;
          expect(
            await reconcile(accountRow, {
              id: w.B.account,
              livemode: false,
              closed: true,
            }),
          ).toEqual({
            refusal: "22023 snapshot_mismatch",
          });
          expect(
            await reconcile(accountRow, {
              id: w.A.account,
              livemode: true,
              closed: true,
            }),
          ).toEqual({
            refusal: "22023 snapshot_mismatch",
          });
          await role(db, null);
          const rows = (
            await db.query(
              `SELECT r, has_function_privilege(r, 'public.reconcile_payment_account(uuid,jsonb)', 'EXECUTE') AS can
                 FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r ORDER BY r`,
            )
          ).rows;
          expect(rows.map((r) => r.can)).toEqual([false, false, true]);
        }));
    });

    describe("the due work the schedule reads (one function, nothing to do leaves at once)", () => {
      async function due() {
        await role(db, "service_role");
        const rows = (
          await db.query(
            "SELECT kind, id, detail FROM public.money_due_work(50) ORDER BY kind, id",
          )
        ).rows as Array<{ kind: string; id: string; detail: string | null }>;
        await role(db, null);
        return rows;
      }

      async function backdate(table: string, column: string, id: string) {
        await role(db, null);
        await db.query("SAVEPOINT rest2a_backdate");
        await db.query("SET LOCAL session_replication_role = replica");
        await db.query(
          `UPDATE public.${table} SET ${column} = clock_timestamp() - interval '3 minutes' WHERE id = $1`,
          [id],
        );
        await db.query("SET LOCAL session_replication_role = origin");
        await db.query("RELEASE SAVEPOINT rest2a_backdate");
      }

      async function storeAccountEvent(side: {
        tenant: string;
        account: string;
      }) {
        await role(db, null);
        return (
          await db.query(
            `INSERT INTO public.stripe_connect_events
               (tenant_id, stripe_event_id, event_type, livemode, provider_account_id, event_created_at, payload_sha256, raw_payload)
             VALUES ($1, $2, 'v2.core.account.updated', false, $3, now(), repeat('a', 64), '{}'::jsonb)
             RETURNING id`,
            [
              side.tenant,
              `evt_${randomUUID().replaceAll("-", "")}`,
              side.account,
            ],
          )
        ).rows[0].id as string;
      }

      it("names a request due again, a request whose lease ran out, an intake unpaid for seven days, events no one finished and each mapped account; nothing the route is still doing", () =>
        inTx(db, async () => {
          const w = await world();
          const gift = async (amount: number) =>
            begun(
              await begin(db, {
                host: w.hostsA.site,
                lines: [{ fund: w.A.fund, amount }],
              }),
            );
          const fresh = await gift(1000);
          const queued = await gift(1100);
          await backdate(
            "donation_saga_outbox",
            "next_attempt_at",
            queued.operation_id,
          );
          const leased = await gift(1200);
          await claim(db, leased.operation_id);
          await expireLease(db, leased.operation_id);
          const old = await gift(1300);
          await ageIntake(db, old.donation_id, 8);
          const justStored = await storeEvent(db, w.A, { pi: paymentIntent() });
          const stale = await storeEvent(db, w.A, { pi: paymentIntent() });
          await backdate("stripe_connect_events", "received_at", stale.id);
          const accountEvent = await storeAccountEvent(w.A);
          await backdate("stripe_connect_events", "received_at", accountEvent);
          await role(db, null);
          const mapped = (
            await db.query(
              "SELECT id FROM public.payment_provider_accounts WHERE tenant_id = $1",
              [w.A.tenant],
            )
          ).rows[0].id as string;
          const watched = [
            fresh.operation_id,
            queued.operation_id,
            leased.operation_id,
            old.operation_id,
            old.donation_id,
            fresh.donation_id,
            justStored.id,
            stale.id,
            accountEvent,
            mapped,
          ];
          const mine = (await due()).filter((r) => watched.includes(r.id));
          const expected = [
            { kind: "account", id: mapped, detail: w.A.account },
            {
              kind: "account_event",
              id: accountEvent,
              detail: `v2.core.account.updated|${w.A.account}`,
            },
            {
              kind: "operation",
              id: queued.operation_id,
              detail: "create_payment",
            },
            {
              kind: "operation",
              id: leased.operation_id,
              detail: "create_payment",
            },
            {
              kind: "payment_event",
              id: stale.id,
              detail: "payment_intent.succeeded",
            },
            { kind: "unpaid", id: old.donation_id, detail: null },
          ];
          const order = (r: { kind: string; id: string }) =>
            `${r.kind}/${r.id}`;
          expect(mine.sort((a, b) => order(a).localeCompare(order(b)))).toEqual(
            expected.sort((a, b) => order(a).localeCompare(order(b))),
          );
          await role(db, null);
          await db.query(
            "UPDATE public.stripe_connect_events SET processing_status = 'failed', next_attempt_at = now() + interval '1 hour', failed_at = now(), process_attempts = 1 WHERE id = $1",
            [stale.id],
          );
          await db.query(
            "UPDATE public.payment_account_bindings SET status = 'disconnected', disconnected_at = now() WHERE id = $1",
            [w.A.binding],
          );
          const after = (await due()).map((r) => r.id);
          expect(after).not.toContain(stale.id);
          expect(after).not.toContain(mapped);
        }));

      it("only service_role reads it", () =>
        inTx(db, async () => {
          await role(db, null);
          const rows = (
            await db.query(
              `SELECT r, has_function_privilege(r, 'public.money_due_work(integer)', 'EXECUTE') AS can
                 FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r ORDER BY r`,
            )
          ).rows;
          expect(rows.map((r) => r.can)).toEqual([false, false, true]);
        }));
    });
  },
);
