import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  ageIntake,
  attempt,
  begin,
  begun,
  claim,
  configFor,
  grant,
  guestContact,
  intakeContactOf,
  intakeCounts,
  intakeLinesOf,
  intakeOf,
  intakeRequestsOf,
  inTx,
  missionary,
  paymentIntent,
  readyOnlyHost,
  report,
  rest2aWorld,
  role,
  secondEntityBinding,
  storeEvent,
  work,
  type GiftRequest,
} from "./wp8a-rest2a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 2a: the intake command (W8-R20, plan :426, :1141, :1152, :1158, :1171, :1175, :1178; real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const world = () => rest2aWorld(db);
    const intake = (id: string) => intakeOf(db, id);
    const linesOf = (id: string) => intakeLinesOf(db, id);
    const contactOf = (id: string) => intakeContactOf(db, id);
    const requestsOf = (id: string) => intakeRequestsOf(db, id);

    it("a guest on an admitted Site: the intake, its donor and fee lines, its contact row and one queued create request commit together, the amount the lines' sum, no donor anywhere and no worker's name sent", () =>
      inTx(db, async () => {
        const w = await world();
        const worker = await missionary(db, w.A);
        const r = begun(
          await begin(db, {
            host: w.hostsA.site,
            lines: [
              { fund: w.A.fund, amount: 6000 },
              { missionary: worker, amount: 4000 },
            ],
            fee: 330,
            contact: {
              email: "  Gail.Guest@Example.TEST ",
              first_name: "Gail",
              last_name: "Guest",
            },
          }),
        );
        expect(r).toMatchObject({
          outcome: "created",
          tenant_id: w.A.tenant,
          amount: 10330,
          currency: "usd",
          provider_account: w.A.account,
        });
        expect(await intake(r.donation_id)).toEqual({
          intake_format: "line_based",
          status: "pending",
          amount: 10330,
          currency: "usd",
          donor_id: null,
          site_id: w.hostsA.siteId,
          entry_surface: "website",
          source_code_id: null,
          unlisted_source_code: null,
          is_anonymous: false,
          payment_method: "card",
          payment_account_binding_id: w.A.binding,
          provider_account_ref: w.A.account,
          livemode: false,
          legal_entity_id: w.A.entity,
        });
        expect(await linesOf(r.donation_id)).toEqual([
          {
            line_number: 1,
            fund_id: w.A.fund,
            missionary_id: null,
            is_fee_cover: false,
            amount: 6000,
          },
          {
            line_number: 2,
            fund_id: null,
            missionary_id: worker,
            is_fee_cover: false,
            amount: 4000,
          },
          {
            line_number: 3,
            fund_id: w.feeA,
            missionary_id: null,
            is_fee_cover: true,
            amount: 330,
          },
        ]);
        expect(await contactOf(r.donation_id)).toEqual({
          email: "gail.guest@example.test",
          first_name: "Gail",
          last_name: "Guest",
          actor_user_id: null,
          actor_email: null,
          actor_email_confirmed: null,
        });
        const requests = await requestsOf(r.donation_id);
        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
          id: r.operation_id,
          kind: "provider_request",
          request_kind: "create_payment",
          status: "queued",
          amount: 10330,
          donor_id: null,
          missionary_id: null,
          fund_id: null,
          provider_account_ref: w.A.account,
          livemode: false,
          idempotency_key: `gift:${r.donation_id}:create_payment`,
        });
        const params = requests[0]!.request_params as Record<string, unknown>;
        expect(params).toMatchObject({
          amount: 10330,
          currency: "usd",
          payment_method_types: ["card"],
          metadata: {
            asym_operation: r.operation_id,
            asym_intake: r.donation_id,
            payment_method: "card",
            gift_amount_cents: "10000",
            cover_fees: "true",
            cover_amount_cents: "330",
          },
        });
        expect(JSON.stringify(params)).not.toMatch(
          /R2a worker|Gail|Guest|example\.test/i,
        );
      }));

    it("cards only (ruling of 27 November, section 3): a card gift's request names the card and never automatic payment methods; a wallet is refused and writes nothing; an anonymous choice is frozen on the intake", () =>
      inTx(db, async () => {
        const w = await world();
        const r = begun(
          await begin(db, {
            host: w.hostsA.site,
            lines: [{ fund: w.A.fund, amount: 2500 }],
            anonymous: true,
          }),
        );
        expect(await intake(r.donation_id)).toMatchObject({
          payment_method: "card",
          is_anonymous: true,
          amount: 2500,
        });
        const params = (await requestsOf(r.donation_id))[0]!
          .request_params as Record<string, unknown>;
        expect(params).toMatchObject({
          payment_method_types: ["card"],
          metadata: { payment_method: "card", cover_fees: "false" },
        });
        expect(params).not.toHaveProperty("automatic_payment_methods");
        const before = await intakeCounts(db, w.A.tenant);
        const wallet = await begin(db, {
          host: w.hostsA.site,
          lines: [{ fund: w.A.fund, amount: 2500 }],
          method: "wallet",
        });
        expect(`${wallet.code} ${wallet.message}`).toBe(
          "22023 payment_method_refused",
        );
        expect(await intakeCounts(db, w.A.tenant)).toEqual(before);
      }));

    it("a signed-in giver's account-area gift carries no Site, the donor portal as its entry surface and the verified actor; the home name serves no guest", () =>
      inTx(db, async () => {
        const w = await world();
        const user = randomUUID();
        const r = begun(
          await begin(db, {
            host: w.hostsA.home,
            surface: "donor_account",
            lines: [{ fund: w.A.fund, amount: 5000 }],
            actor: {
              user_id: user,
              email: "Signed.In@Example.TEST",
              email_confirmed: true,
            },
          }),
        );
        expect(await intake(r.donation_id)).toMatchObject({
          site_id: null,
          entry_surface: "donor_account",
          donor_id: null,
        });
        expect(await contactOf(r.donation_id)).toMatchObject({
          actor_user_id: user,
          actor_email: "signed.in@example.test",
          actor_email_confirmed: true,
        });
        const guestOnHome = await begin(db, {
          host: w.hostsA.home,
          lines: [{ fund: w.A.fund, amount: 5000 }],
        });
        expect(`${guestOnHome.code} ${guestOnHome.message}`).toBe(
          "42501 host_not_admitted",
        );
      }));

    it("each refusal writes nothing: host, organization, binding, lines, reserved fund, payment method, contact, actor, key", () =>
      inTx(db, async () => {
        const w = await world();
        const readyHost = await readyOnlyHost(db, w.A);
        const bFund = w.B.fund;
        const bWorker = await missionary(db, w.B);
        await role(db, null);
        const otherEntityFund = (
          await db.query(
            "INSERT INTO public.funds (tenant_id, legal_entity_id, name) VALUES ($1, $2, 'Second entity fund') RETURNING id",
            [w.A.tenant, w.A.otherEntity],
          )
        ).rows[0].id as string;
        const inactiveFund = (
          await db.query(
            "INSERT INTO public.funds (tenant_id, legal_entity_id, name, is_active) VALUES ($1, $2, 'Closed fund', false) RETURNING id",
            [w.A.tenant, w.A.entity],
          )
        ).rows[0].id as string;
        const ok: GiftRequest = {
          host: w.hostsA.site,
          lines: [{ fund: w.A.fund, amount: 1000 }],
        };
        const cases: Array<[string, GiftRequest, string]> = [
          [
            "an unclaimed host",
            { ...ok, host: "nowhere.give.example.test" },
            "42501 host_not_admitted",
          ],
          [
            "a host not yet active",
            { ...ok, host: readyHost },
            "42501 host_not_admitted",
          ],
          [
            "a Site name as the account area",
            {
              ...ok,
              surface: "donor_account",
              actor: {
                user_id: randomUUID(),
                email: "a@example.test",
                email_confirmed: true,
              },
            },
            "42501 host_not_admitted",
          ],
          [
            "an unknown entry surface",
            { ...ok, surface: "kiosk" },
            "42501 host_not_admitted",
          ],
          [
            "lines of two legal entities",
            {
              ...ok,
              lines: [
                { fund: w.A.fund, amount: 500 },
                { fund: otherEntityFund, amount: 500 },
              ],
            },
            "22023 lines_span_entities",
          ],
          [
            "a donor line on the reserved fund",
            { ...ok, lines: [{ fund: w.feeA, amount: 1000 }] },
            "22023 reserved_fund_line",
          ],
          [
            "another organization's fund",
            { ...ok, lines: [{ fund: bFund, amount: 1000 }] },
            "22023 target_not_found",
          ],
          [
            "another organization's worker",
            { ...ok, lines: [{ missionary: bWorker, amount: 1000 }] },
            "22023 target_not_found",
          ],
          [
            "an inactive fund",
            { ...ok, lines: [{ fund: inactiveFund, amount: 1000 }] },
            "22023 target_not_found",
          ],
          ["no lines", { ...ok, lines: [] }, "22023 lines_invalid"],
          [
            "a zero line",
            { ...ok, lines: [{ fund: w.A.fund, amount: 0 }] },
            "22023 lines_invalid",
          ],
          [
            "a fractional line",
            { ...ok, lines: [{ fund: w.A.fund, amount: 10.5 }] },
            "22023 lines_invalid",
          ],
          ["a negative fee", { ...ok, fee: -1 }, "22023 lines_invalid"],
          [
            "bank debit",
            { ...ok, method: "ach" },
            "22023 payment_method_refused",
          ],
          [
            "a wallet",
            { ...ok, method: "wallet" },
            "22023 payment_method_refused",
          ],
          [
            "no payment method",
            { ...ok, method: null },
            "22023 payment_method_refused",
          ],
          [
            "no anonymity choice",
            { ...ok, anonymous: null },
            "22023 anonymity_required",
          ],
          ["no contact", { ...ok, contact: null }, "22023 contact_required"],
          [
            "a contact without an address to write to",
            { ...ok, contact: { first_name: "No", last_name: "Mail" } },
            "22023 contact_required",
          ],
          [
            "an actor on a Site's name that is not the organization's home (row 6)",
            {
              ...ok,
              actor: {
                user_id: randomUUID(),
                email: "a@example.test",
                email_confirmed: true,
              },
            },
            "22023 actor_not_admitted",
          ],
          [
            "no actor in the account area",
            { ...ok, host: w.hostsA.home, surface: "donor_account" },
            "22023 actor_required",
          ],
          [
            "a malformed actor in the account area",
            {
              ...ok,
              host: w.hostsA.home,
              surface: "donor_account",
              actor: {
                user_id: "forged",
                email: "a@example.test",
                email_confirmed: true,
              },
            },
            "22023 actor_required",
          ],
          ["an empty key", { ...ok, key: "" }, "22023 client_key_invalid"],
          [
            "an overlong key",
            { ...ok, key: "k".repeat(201) },
            "22023 client_key_invalid",
          ],
        ];
        const before = await intakeCounts(db, w.A.tenant);
        const seen: Record<string, string> = {};
        for (const [label, request, expected] of cases) {
          const a = await begin(db, request);
          seen[label] = `${a.code} ${a.message}`;
          expect(seen[label], label).toBe(expected);
        }
        expect(await intakeCounts(db, w.A.tenant)).toEqual(before);

        await role(db, null);
        await db.query(
          "UPDATE public.tenants SET status = 'suspended' WHERE id = $1",
          [w.A.tenant],
        );
        const suspended = await begin(db, ok);
        expect(`${suspended.code} ${suspended.message}`).toBe(
          "55000 organization_inactive",
        );
        await db.query(
          "UPDATE public.tenants SET status = 'active' WHERE id = $1",
          [w.A.tenant],
        );

        await db.query(
          "UPDATE public.payment_account_bindings SET status = 'pending' WHERE id = $1",
          [w.A.binding],
        );
        const pending = await begin(db, ok);
        expect(`${pending.code} ${pending.message}`).toBe(
          "55000 binding_unavailable",
        );
        await db.query(
          "UPDATE public.payment_account_bindings SET status = 'active' WHERE id = $1",
          [w.A.binding],
        );
        await db.query(
          "UPDATE public.sites SET status = 'inactive' WHERE id = $1",
          [w.hostsA.siteId],
        );
        const siteOff = await begin(db, ok);
        expect(`${siteOff.code} ${siteOff.message}`).toBe(
          "42501 host_not_admitted",
        );
        expect(await intakeCounts(db, w.A.tenant)).toEqual(before);
      }));

    it("a source code on the organization's list reaches the intake; one off the list is kept apart for triage; a malformed one and a missing one stay absent", () =>
      inTx(db, async () => {
        const w = await world();
        await role(db, null);
        const listed = (
          await db.query(
            "INSERT INTO public.giving_source_codes (tenant_id, code, label) VALUES ($1, 'spring-appeal', 'Spring appeal') RETURNING id",
            [w.A.tenant],
          )
        ).rows[0].id as string;
        await db.query(
          "INSERT INTO public.giving_source_codes (tenant_id, code, label, is_active) VALUES ($1, 'old-appeal', 'Old appeal', false)",
          [w.A.tenant],
        );
        await db.query(
          "INSERT INTO public.giving_source_codes (tenant_id, code, label) VALUES ($1, 'b-only', 'B only')",
          [w.B.tenant],
        );
        const gift = async (source: string | null) => {
          const r = begun(
            await begin(db, {
              host: w.hostsA.site,
              lines: [{ fund: w.A.fund, amount: 1000 }],
              source,
            }),
          );
          const row = await intake(r.donation_id);
          return [row.source_code_id, row.unlisted_source_code];
        };
        expect(await gift("  Spring-Appeal ")).toEqual([listed, null]);
        expect(await gift("old-appeal")).toEqual([null, "old-appeal"]);
        expect(await gift("b-only")).toEqual([null, "b-only"]);
        expect(await gift("radio_ad")).toEqual([null, "radio_ad"]);
        expect(await gift("utm_source=x&y=1")).toEqual([null, null]);
        expect(await gift(null)).toEqual([null, null]);
      }));

    it("a replay with the same key and body answers the first intake and writes nothing; the same key with another body is refused; another organization's same key is its own", () =>
      inTx(db, async () => {
        const w = await world();
        const key = randomUUID();
        const request: GiftRequest = {
          host: w.hostsA.site,
          key,
          lines: [{ fund: w.A.fund, amount: 1500 }],
          contact: guestContact(),
        };
        const first = begun(await begin(db, request));
        const counts = await intakeCounts(db, w.A.tenant);
        const again = begun(await begin(db, request));
        expect(again).toEqual({ ...first, outcome: "replayed" });
        expect(await intakeCounts(db, w.A.tenant)).toEqual(counts);
        const other = await begin(db, {
          ...request,
          lines: [{ fund: w.A.fund, amount: 1600 }],
        });
        expect(`${other.code} ${other.message}`).toBe(
          "23505 idempotency_key_reused",
        );
        expect(await intakeCounts(db, w.A.tenant)).toEqual(counts);
        const inB = begun(
          await begin(db, {
            ...request,
            host: w.hostsB.site,
            lines: [{ fund: w.B.fund, amount: 1500 }],
          }),
        );
        expect(inB.outcome).toBe("created");
        expect(inB.donation_id).not.toBe(first.donation_id);
        await role(db, null);
        const logged = (
          await db.query(
            "SELECT key_digest, request_digest FROM public.donation_intake_requests WHERE donation_id = $1",
            [first.donation_id],
          )
        ).rows[0] as Record<string, string>;
        expect(logged.key_digest).toMatch(/^[0-9a-f]{64}$/);
        expect(logged.request_digest).toMatch(/^[0-9a-f]{64}$/);
        expect(logged.key_digest).not.toContain(key);
      }));

    it("service_role is the only caller: anon and authenticated cannot execute the command", () =>
      inTx(db, async () => {
        await role(db, null);
        const rows = (
          await db.query(
            `SELECT r, has_function_privilege(r, 'public.begin_line_gift(text,text,text,jsonb,bigint,text,boolean,text,jsonb,jsonb,uuid)', 'EXECUTE') AS can
               FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r ORDER BY r`,
          )
        ).rows;
        expect(rows).toEqual([
          { r: "anon", can: false },
          { r: "authenticated", can: false },
          { r: "service_role", can: true },
        ]);
      }));

    describe("an organization with two legal entities, each with its own active test binding (plan :1141; the contract's Legal Entity section)", () => {
      it("a target of each entity gets that entity's connected account from the config read, and an intake on that entity's binding", () =>
        inTx(db, async () => {
          const w = await world();
          const second = await secondEntityBinding(db, w.A);
          expect(
            await configFor(db, w.hostsA.site, [{ fund: w.A.fund }]),
          ).toEqual([{ connected_account_id: w.A.account }]);
          expect(
            await configFor(db, w.hostsA.site, [{ fund: second.fund }]),
          ).toEqual([{ connected_account_id: second.account }]);
          const first = begun(
            await begin(db, {
              host: w.hostsA.site,
              lines: [{ fund: w.A.fund, amount: 1000 }],
            }),
          );
          const other = begun(
            await begin(db, {
              host: w.hostsA.site,
              lines: [{ fund: second.fund, amount: 1200 }],
            }),
          );
          expect(first.provider_account).toBe(w.A.account);
          expect(other.provider_account).toBe(second.account);
          expect(await intake(first.donation_id)).toMatchObject({
            legal_entity_id: w.A.entity,
            payment_account_binding_id: w.A.binding,
            provider_account_ref: w.A.account,
          });
          expect(await intake(other.donation_id)).toMatchObject({
            legal_entity_id: w.A.otherEntity,
            payment_account_binding_id: second.binding,
            provider_account_ref: second.account,
          });
          expect((await requestsOf(other.donation_id))[0]).toMatchObject({
            provider_account_ref: second.account,
          });
        }));

      it("a gift with one line of each entity is refused with nothing written, and the config read answers nothing for the pair", () =>
        inTx(db, async () => {
          const w = await world();
          const second = await secondEntityBinding(db, w.A);
          const before = await intakeCounts(db, w.A.tenant);
          const mixed = await begin(db, {
            host: w.hostsA.site,
            lines: [
              { fund: w.A.fund, amount: 1000 },
              { fund: second.fund, amount: 1000 },
            ],
          });
          expect(`${mixed.code} ${mixed.message}`).toBe(
            "22023 lines_span_entities",
          );
          expect(await intakeCounts(db, w.A.tenant)).toEqual(before);
          expect(
            await configFor(db, w.hostsA.site, [
              { fund: w.A.fund },
              { fund: second.fund },
            ]),
          ).toEqual([]);
        }));

      it("the second entity's binding pending refuses its targets and leaves the first entity's working", () =>
        inTx(db, async () => {
          const w = await world();
          const second = await secondEntityBinding(db, w.A);
          await role(db, null);
          await db.query(
            "UPDATE public.payment_account_bindings SET status = 'pending' WHERE id = $1",
            [second.binding],
          );
          expect(
            await configFor(db, w.hostsA.site, [{ fund: second.fund }]),
          ).toEqual([]);
          const refused = await begin(db, {
            host: w.hostsA.site,
            lines: [{ fund: second.fund, amount: 1000 }],
          });
          expect(`${refused.code} ${refused.message}`).toBe(
            "55000 binding_unavailable",
          );
          expect(
            await configFor(db, w.hostsA.site, [{ fund: w.A.fund }]),
          ).toEqual([{ connected_account_id: w.A.account }]);
          expect(
            begun(
              await begin(db, {
                host: w.hostsA.site,
                lines: [{ fund: w.A.fund, amount: 1000 }],
              }),
            ).provider_account,
          ).toBe(w.A.account);
        }));
    });
    describe("the fix round of 27 November: amounts Stripe will take, the fee cover's bound, a gift that can no longer be paid, the sealed attribution, a line naming two targets", () => {
      it("F6 (c): a total under 50 cents or over 99,999,999 cents is refused 22023 amount_out_of_range before any write", () =>
        inTx(db, async () => {
          const w = await world();
          const before = await intakeCounts(db, w.A.tenant);
          for (const lines of [
            [{ fund: w.A.fund, amount: 1 }],
            [
              { fund: w.A.fund, amount: 60_000_000 },
              { fund: w.A.fund, amount: 50_000_000 },
            ],
          ]) {
            const a = await begin(db, { host: w.hostsA.site, lines });
            expect(`${a.code} ${a.message}`, JSON.stringify(lines)).toBe(
              "22023 amount_out_of_range",
            );
          }
          expect(await intakeCounts(db, w.A.tenant)).toEqual(before);
          expect(
            begun(
              await begin(db, {
                host: w.hostsA.site,
                lines: [{ fund: w.A.fund, amount: 50 }],
              }),
            ).amount,
          ).toBe(50);
        }));

      it("F6 (d): a fee cover above five percent of the donor's lines plus 100 cents is refused 22023 fee_cover_out_of_range before any write", () =>
        inTx(db, async () => {
          const w = await world();
          const before = await intakeCounts(db, w.A.tenant);
          const over = await begin(db, {
            host: w.hostsA.site,
            lines: [{ fund: w.A.fund, amount: 100 }],
            fee: 1_000_000,
          });
          expect(`${over.code} ${over.message}`).toBe(
            "22023 fee_cover_out_of_range",
          );
          const justOver = await begin(db, {
            host: w.hostsA.site,
            lines: [{ fund: w.A.fund, amount: 10_000 }],
            fee: 601,
          });
          expect(`${justOver.code} ${justOver.message}`).toBe(
            "22023 fee_cover_out_of_range",
          );
          expect(await intakeCounts(db, w.A.tenant)).toEqual(before);
          expect(
            begun(
              await begin(db, {
                host: w.hostsA.site,
                lines: [{ fund: w.A.fund, amount: 10_000 }],
                fee: 600,
              }),
            ).amount,
          ).toBe(10_600);
        }));

      it("F6 (b): the answer says whether the gift can still be paid: a new gift can; a replay after the sweep abandoned it cannot; a replay after a declined card can, with its PaymentIntent", () =>
        inTx(db, async () => {
          const w = await world();
          const request = (key: string): GiftRequest => ({
            host: w.hostsA.site,
            key,
            lines: [{ fund: w.A.fund, amount: 2100 }],
            contact: { email: `same-${key}@example.test` },
          });
          const fresh = begun(await begin(db, request("fresh-key")));
          expect(fresh).toMatchObject({ outcome: "created", payable: true });

          const swept = begun(await begin(db, request("swept-key")));
          await ageIntake(db, swept.donation_id, 8);
          await role(db, "service_role");
          const abandoned = await attempt(
            db,
            "SELECT public.abandon_unpaid_intake($1) AS r",
            [swept.donation_id],
          );
          await role(db, null);
          expect(abandoned.ok && abandoned.rows[0]!.r).toMatchObject({
            outcome: "abandoned",
          });
          expect(begun(await begin(db, request("swept-key")))).toMatchObject({
            outcome: "replayed",
            payable: false,
          });

          const declined = begun(await begin(db, request("declined-key")));
          const pi = paymentIntent();
          const claimed = await claim(db, declined.operation_id);
          await report(db, declined.operation_id, claimed.attempt as number, {
            result: "succeeded",
            provider_object_id: pi,
          });
          const failed = await storeEvent(db, w.A, {
            type: "payment_intent.payment_failed",
            pi,
            amount: 2100,
            metadata: {
              asym_operation: declined.operation_id,
              asym_intake: declined.donation_id,
            },
          });
          expect(await work(db, failed.id)).toMatchObject({ status: "failed" });
          expect(begun(await begin(db, request("declined-key")))).toMatchObject(
            {
              outcome: "replayed",
              payable: true,
              payment_intent: pi,
            },
          );
        }));

      it("T4: the Site, entry surface, source code and unlisted code of a line-based intake are sealed: 23514 donation_line_intake_sealed for the owner and service_role", () =>
        inTx(db, async () => {
          const w = await world();
          const r = begun(
            await begin(db, {
              host: w.hostsA.site,
              lines: [{ fund: w.A.fund, amount: 1000 }],
            }),
          );
          await role(db, null);
          const otherSite = (
            await db.query(
              "INSERT INTO public.sites (tenant_id, name) VALUES ($1, 'Other Site') RETURNING id",
              [w.A.tenant],
            )
          ).rows[0].id as string;
          const code = (
            await db.query(
              "INSERT INTO public.giving_source_codes (tenant_id, code, label) VALUES ($1, 'sealed-code', 'Sealed') RETURNING id",
              [w.A.tenant],
            )
          ).rows[0].id as string;
          await grant(db, HOSTED_SERVICE_GRANTS);
          const seen: Record<string, string> = {};
          for (const [column, value] of [
            ["site_id", otherSite],
            ["entry_surface", "donor_account"],
            ["source_code_id", code],
            ["unlisted_source_code", "x"],
          ] as const) {
            for (const who of [null, "service_role"] as const) {
              await role(db, who);
              const a = await attempt(
                db,
                `UPDATE public.donations SET ${column} = $2 WHERE id = $1`,
                [r.donation_id, value],
              );
              await role(db, null);
              seen[`${column} as ${who ?? "owner"}`] = `${a.code} ${a.message}`;
            }
          }
          expect(new Set(Object.values(seen))).toEqual(
            new Set(["23514 donation_line_intake_sealed"]),
          );
          expect(Object.keys(seen)).toHaveLength(8);
        }));

      it("T7: a line naming both a fund and a worker reaches the command as written and is refused 22023 lines_invalid; the config read answers nothing for such a target", () =>
        inTx(db, async () => {
          const w = await world();
          const worker = await missionary(db, w.A);
          const before = await intakeCounts(db, w.A.tenant);
          const both = await begin(db, {
            host: w.hostsA.site,
            lines: [{ fund: w.A.fund, missionary: worker, amount: 1000 }],
          });
          expect(`${both.code} ${both.message}`).toBe("22023 lines_invalid");
          expect(await intakeCounts(db, w.A.tenant)).toEqual(before);
          expect(
            await configFor(db, w.hostsA.site, [
              { fund: w.A.fund, missionary: worker },
            ]),
          ).toEqual([]);
        }));
    });
  },
);
