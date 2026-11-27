import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  admitHosts,
  attempt,
  begin,
  beginArgs,
  BEGIN_SQL,
  begun,
  configFor,
  feeFund,
  guestContact,
  inTx,
  intakeCounts,
  missionary,
  readyOnlyHost,
  removeRest2aTenants,
  role,
  secondEntityBinding,
  seedTwoTenants,
  type Fixture,
  type GiftRequest,
  type Hosts,
  type Side,
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

    async function world() {
      const fx = await seedTwoTenants(db);
      const hostsA = await admitHosts(db, fx.A);
      const hostsB = await admitHosts(db, fx.B);
      const feeA = await feeFund(db, fx.A);
      await feeFund(db, fx.B);
      return { fx, A: fx.A, B: fx.B, hostsA, hostsB, feeA };
    }

    async function intake(donationId: string) {
      await role(db, null);
      return (
        await db.query(
          `SELECT intake_format, status, amount::int, currency, donor_id, site_id, entry_surface,
                  source_code_id, unlisted_source_code, is_anonymous, payment_method,
                  payment_account_binding_id, provider_account_ref, livemode, legal_entity_id
             FROM public.donations WHERE id = $1`,
          [donationId],
        )
      ).rows[0] as Record<string, unknown>;
    }

    async function linesOf(donationId: string) {
      await role(db, null);
      return (
        await db.query(
          `SELECT line_number, fund_id, missionary_id, is_fee_cover, amount::int
             FROM public.donation_intake_lines WHERE donation_id = $1 ORDER BY line_number`,
          [donationId],
        )
      ).rows as Record<string, unknown>[];
    }

    async function contactOf(donationId: string) {
      await role(db, null);
      return (
        await db.query(
          `SELECT email, first_name, last_name, actor_user_id, actor_email, actor_email_confirmed
             FROM public.donation_intake_contacts WHERE donation_id = $1`,
          [donationId],
        )
      ).rows[0] as Record<string, unknown>;
    }

    async function requestsOf(donationId: string) {
      await role(db, null);
      return (
        await db.query(
          `SELECT id, kind, request_kind, status, amount::int, donor_id, missionary_id, fund_id,
                  provider_account_ref, livemode, request_params, idempotency_key
             FROM public.donation_saga_outbox WHERE donation_id = $1`,
          [donationId],
        )
      ).rows as Record<string, unknown>[];
    }

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

    it("a wallet gift is sent as a card payment, an anonymous choice is frozen on the intake", () =>
      inTx(db, async () => {
        const w = await world();
        const r = begun(
          await begin(db, {
            host: w.hostsA.site,
            lines: [{ fund: w.A.fund, amount: 2500 }],
            method: "wallet",
            anonymous: true,
          }),
        );
        expect(await intake(r.donation_id)).toMatchObject({
          payment_method: "wallet",
          is_anonymous: true,
          amount: 2500,
        });
        expect(
          (await requestsOf(r.donation_id))[0]!.request_params,
        ).toMatchObject({
          payment_method_types: ["card"],
          metadata: { payment_method: "wallet", cover_fees: "false" },
        });
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
        await role(db, null);
        const otherEntityFund = (
          await db.query(
            "INSERT INTO public.funds (tenant_id, legal_entity_id, name) VALUES ($1, $2, 'Second entity fund') RETURNING id",
            [w.A.tenant, w.A.otherEntity],
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
            "an actor on a Site (while private.site_checkout_serves_guests() holds)",
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

    async function guardDirect(
      tenant: string,
      host: string,
      surface: string,
      request: GiftRequest,
    ) {
      const args = beginArgs({ ...request, host, surface });
      await role(db, null);
      await db.query(
        "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
      );
      await role(db, "service_role");
      const a = await attempt(
        db,
        "SELECT tenant_guard.begin_line_gift($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12::uuid) AS r",
        [tenant, ...args],
      );
      await role(db, null);
      return a;
    }

    it("a forged or foreign host is refused 42501 host_not_admitted and writes nothing: claimed, ready, Unicode, overlong, Site as account area, home as Site", () =>
      inTx(db, async () => {
        const w = await world();
        await role(db, null);
        const claimedHost = `claimed-${randomUUID().slice(0, 8)}.give.example.test`;
        await db.query(
          `INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project, control_proved_at)
           VALUES ($1, $2, $3, ARRAY['website'], 'donor', now())`,
          [claimedHost, w.A.tenant, w.hostsA.siteId],
        );
        const readyHost = await readyOnlyHost(db, w.A);
        const ok: GiftRequest = {
          host: w.hostsA.site,
          lines: [{ fund: w.A.fund, amount: 1000 }],
        };
        const actor = {
          user_id: randomUUID(),
          email: "a@example.test",
          email_confirmed: true,
        };
        const before = [
          await intakeCounts(db, w.A.tenant),
          await intakeCounts(db, w.B.tenant),
        ];
        for (const [label, request] of [
          ["claimed", { ...ok, host: claimedHost }],
          ["ready", { ...ok, host: readyHost }],
          ["Unicode", { ...ok, host: w.hostsA.site.replace("site-", "sité-") }],
          ["overlong", { ...ok, host: `${"a".repeat(320)}.give.example.test` }],
          ["Site as account area", { ...ok, surface: "donor_account", actor }],
          ["home as Site", { ...ok, host: w.hostsA.home }],
        ] as Array<[string, GiftRequest]>) {
          const a = await begin(db, request);
          expect(`${a.code} ${a.message}`, label).toBe(
            "42501 host_not_admitted",
          );
        }
        expect([
          await intakeCounts(db, w.A.tenant),
          await intakeCounts(db, w.B.tenant),
        ]).toEqual(before);
      }));

    it("another organization's host with this organization's fund is target_not_found, and neither organization changes", () =>
      inTx(db, async () => {
        const w = await world();
        const before = [
          await intakeCounts(db, w.A.tenant),
          await intakeCounts(db, w.B.tenant),
        ];
        const a = await begin(db, {
          host: w.hostsB.site,
          lines: [{ fund: w.A.fund, amount: 1000 }],
        });
        expect(`${a.code} ${a.message}`).toBe("22023 target_not_found");
        expect([
          await intakeCounts(db, w.A.tenant),
          await intakeCounts(db, w.B.tenant),
        ]).toEqual(before);
      }));

    it("a direct call naming another organization than the host's is refused 42501 host_not_admitted, before its own status is read", () =>
      inTx(db, async () => {
        const w = await world();
        const lines = [{ fund: w.A.fund, amount: 1000 }];
        const actor = {
          user_id: randomUUID(),
          email: "a@example.test",
          email_confirmed: true,
        };
        const before = [
          await intakeCounts(db, w.A.tenant),
          await intakeCounts(db, w.B.tenant),
        ];
        const site = await guardDirect(w.B.tenant, w.hostsA.site, "website", {
          host: "",
          lines,
        });
        expect(`${site.code} ${site.message}`).toBe("42501 host_not_admitted");
        const home = await guardDirect(
          w.B.tenant,
          w.hostsA.home,
          "donor_account",
          { host: "", lines, actor },
        );
        expect(`${home.code} ${home.message}`).toBe("42501 host_not_admitted");
        await role(db, null);
        await db.query(
          "UPDATE public.tenants SET status = 'suspended' WHERE id = $1",
          [w.B.tenant],
        );
        const suspended = await guardDirect(
          w.B.tenant,
          w.hostsA.site,
          "website",
          { host: "", lines },
        );
        expect(`${suspended.code} ${suspended.message}`).toBe(
          "42501 host_not_admitted",
        );
        expect([
          await intakeCounts(db, w.A.tenant),
          await intakeCounts(db, w.B.tenant),
        ]).toEqual(before);
      }));

    describe("the Site-to-home hand-off: a signed-in gift keeps its Site when the Site is the home organization's (amendment of 27 November, plan :179, :1152, :1179)", () => {
      async function signedIn(
        w: Awaited<ReturnType<typeof world>>,
        sourceSite: string | null,
        more: Partial<GiftRequest> = {},
      ) {
        return begin(db, {
          host: w.hostsA.home,
          surface: "donor_account",
          lines: [{ fund: w.A.fund, amount: 2000 }],
          actor: {
            user_id: randomUUID(),
            email: "handoff@example.test",
            email_confirmed: true,
          },
          sourceSite,
          ...more,
        });
      }

      it("a current Site of the home organization is kept as the gift's Site; the entry surface stays the donor portal's", () =>
        inTx(db, async () => {
          const w = await world();
          const r = begun(await signedIn(w, w.hostsA.siteId));
          expect(await intake(r.donation_id)).toMatchObject({
            site_id: w.hostsA.siteId,
            entry_surface: "donor_account",
          });
        }));

      it("another organization's Site, an inactive Site or an unknown one gives a gift of the home organization with no Site, and the other organization is untouched", () =>
        inTx(db, async () => {
          const w = await world();
          const beforeB = await intakeCounts(db, w.B.tenant);
          const foreign = begun(await signedIn(w, w.hostsB.siteId));
          expect(foreign).not.toHaveProperty("site_id");
          expect(JSON.stringify(foreign)).not.toContain(w.hostsB.siteId);
          expect(JSON.stringify(foreign)).not.toContain(w.B.tenant);
          expect(await intake(foreign.donation_id)).toMatchObject({
            site_id: null,
            entry_surface: "donor_account",
          });
          expect(foreign.tenant_id).toBe(w.A.tenant);
          const unknown = begun(await signedIn(w, randomUUID()));
          expect(await intake(unknown.donation_id)).toMatchObject({
            site_id: null,
            entry_surface: "donor_account",
          });
          await role(db, null);
          await db.query(
            "UPDATE public.sites SET status = 'inactive' WHERE id = $1",
            [w.hostsA.siteId],
          );
          const inactive = begun(await signedIn(w, w.hostsA.siteId));
          expect(await intake(inactive.donation_id)).toMatchObject({
            site_id: null,
            entry_surface: "donor_account",
          });
          expect(await intakeCounts(db, w.B.tenant)).toEqual(beforeB);
        }));

      it("a guest gift on a Site's checkout and a signed-in gift that kept that Site stay distinguishable by entry surface (:1152)", () =>
        inTx(db, async () => {
          const w = await world();
          const guest = begun(
            await begin(db, {
              host: w.hostsA.site,
              lines: [{ fund: w.A.fund, amount: 2000 }],
            }),
          );
          const signed = begun(await signedIn(w, w.hostsA.siteId));
          expect(
            [
              await intake(guest.donation_id),
              await intake(signed.donation_id),
            ].map((r) => [r.site_id, r.entry_surface]),
          ).toEqual([
            [w.hostsA.siteId, "website"],
            [w.hostsA.siteId, "donor_account"],
          ]);
        }));

      it("a hand-off's targets and amounts are judged as for any gift; a source Site on a Site's own checkout is refused", () =>
        inTx(db, async () => {
          const w = await world();
          const reserved = await signedIn(w, w.hostsA.siteId, {
            lines: [{ fund: w.feeA, amount: 2000 }],
          });
          expect(`${reserved.code} ${reserved.message}`).toBe(
            "22023 reserved_fund_line",
          );
          const foreignFund = await signedIn(w, w.hostsA.siteId, {
            lines: [{ fund: w.B.fund, amount: 2000 }],
          });
          expect(`${foreignFund.code} ${foreignFund.message}`).toBe(
            "22023 target_not_found",
          );
          const zero = await signedIn(w, w.hostsA.siteId, {
            lines: [{ fund: w.A.fund, amount: 0 }],
          });
          expect(`${zero.code} ${zero.message}`).toBe("22023 lines_invalid");
          const onSite = await begin(db, {
            host: w.hostsA.site,
            lines: [{ fund: w.A.fund, amount: 2000 }],
            sourceSite: w.hostsA.siteId,
          });
          expect(`${onSite.code} ${onSite.message}`).toBe(
            "22023 source_site_not_admitted",
          );
        }));
    });

    describe("a signed-in giver on a Site's checkout: one named check, private.site_checkout_serves_guests(), under the owner's review (outcome 3 of 27 November)", () => {
      async function homeServesSite(w: Awaited<ReturnType<typeof world>>) {
        await role(db, null);
        const host = `both-${randomUUID().slice(0, 8)}.give.example.test`;
        await db.query(
          `INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project,
             control_proved_at, attached_at, routing_proved_at, https_proved_at, sign_in_ready_at, activation_proved_at)
           VALUES ($1, $2, $3, ARRAY['website', 'donor_account'], 'donor', now(), now(), now(), now(), now(), now())`,
          [host, w.A.tenant, w.hostsA.siteId],
        );
        await db.query(
          "UPDATE public.donor_portal_hosts SET primary_domain = $2 WHERE tenant_id = $1",
          [w.A.tenant, host],
        );
        return host;
      }

      async function checkOff() {
        await role(db, null);
        await db.query(
          "CREATE OR REPLACE FUNCTION private.site_checkout_serves_guests() RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = '' AS 'SELECT false'",
        );
      }

      const actor = () => ({
        user_id: randomUUID(),
        email: "inplace@example.test",
        email_confirmed: true,
      });

      it("the check is one postgres-owned function that answers true today, which only tenant_guard executes", () =>
        inTx(db, async () => {
          await role(db, null);
          const row = (
            await db.query(
              `SELECT private.site_checkout_serves_guests() AS on,
                      pg_get_userbyid(p.proowner) AS owner,
                      has_function_privilege('tenant_guard', p.oid, 'EXECUTE') AS guard,
                      has_function_privilege('service_role', p.oid, 'EXECUTE') AS service,
                      has_function_privilege('authenticated', p.oid, 'EXECUTE') AS signed_in
                 FROM pg_proc AS p WHERE p.oid = 'private.site_checkout_serves_guests()'::regprocedure`,
            )
          ).rows[0];
          expect(row).toEqual({
            on: true,
            owner: "postgres",
            guard: true,
            service: false,
            signed_in: false,
          });
        }));

      it("while the check holds, a verified actor is refused on a Site's checkout even when that name is also the home domain", () =>
        inTx(db, async () => {
          const w = await world();
          const host = await homeServesSite(w);
          const a = await begin(db, {
            host,
            lines: [{ fund: w.A.fund, amount: 1500 }],
            actor: actor(),
          });
          expect(`${a.code} ${a.message}`).toBe("22023 actor_not_admitted");
        }));

      it("with the check off, a verified actor on the home domain that serves the Site gives in place: the Site frozen from the host, the website as entry surface, the actor recorded", () =>
        inTx(db, async () => {
          const w = await world();
          const host = await homeServesSite(w);
          await checkOff();
          const giver = actor();
          const r = begun(
            await begin(db, {
              host,
              lines: [{ fund: w.A.fund, amount: 1500 }],
              actor: giver,
            }),
          );
          expect(await intake(r.donation_id)).toMatchObject({
            site_id: w.hostsA.siteId,
            entry_surface: "website",
          });
          expect(await contactOf(r.donation_id)).toMatchObject({
            actor_user_id: giver.user_id,
            actor_email_confirmed: true,
          });
          const guest = begun(
            await begin(db, {
              host,
              lines: [{ fund: w.A.fund, amount: 1500 }],
            }),
          );
          expect(await intake(guest.donation_id)).toMatchObject({
            site_id: w.hostsA.siteId,
            entry_surface: "website",
          });
        }));

      it("with the check off, an actor on a Site's name that is not the home domain is still refused, and an unverified one is required", () =>
        inTx(db, async () => {
          const w = await world();
          const host = await homeServesSite(w);
          await checkOff();
          const elsewhere = await begin(db, {
            host: w.hostsA.site,
            lines: [{ fund: w.A.fund, amount: 1500 }],
            actor: actor(),
          });
          expect(`${elsewhere.code} ${elsewhere.message}`).toBe(
            "22023 actor_not_admitted",
          );
          const unverified = await begin(db, {
            host,
            lines: [{ fund: w.A.fund, amount: 1500 }],
            actor: { user_id: randomUUID(), email: "x@example.test" },
          });
          expect(`${unverified.code} ${unverified.message}`).toBe(
            "22023 actor_required",
          );
        }));
    });

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

    describe("a change committed while the command waits on its lock (two sessions, committed, removed in finally)", () => {
      async function race(
        change: (fx: Fixture, hosts: Hosts, s1: pg.Client) => Promise<void>,
      ) {
        const s1 = new pg.Client({ connectionString: ADMIN_URL });
        const s2 = new pg.Client({ connectionString: ADMIN_URL });
        await s1.connect();
        await s2.connect();
        let fx: Fixture | undefined;
        try {
          fx = await seedTwoTenants(db);
          const hosts = await admitHosts(db, fx.A);
          const pid2 = (await s2.query("SELECT pg_backend_pid() AS p")).rows[0]
            .p as number;
          await s1.query("BEGIN");
          await change(fx, hosts, s1);
          await s2.query("BEGIN");
          await s2.query("SET LOCAL ROLE service_role");
          const pending = s2
            .query(
              BEGIN_SQL,
              beginArgs({
                host: hosts.site,
                lines: [{ fund: fx.A.fund, amount: 1000 }],
              }),
            )
            .then(() => "committed")
            .catch(
              (e: { code?: string; message?: string }) =>
                `${e.code} ${e.message}`,
            );
          let waited = false;
          for (let i = 0; i < 100 && !waited; i += 1) {
            const blockers = (
              await db.query("SELECT pg_blocking_pids($1) AS b", [pid2])
            ).rows[0].b as number[];
            waited = blockers.length > 0;
            if (!waited) await new Promise((r) => setTimeout(r, 50));
          }
          await s1.query("COMMIT");
          const outcome = await pending;
          await s2.query("ROLLBACK");
          const counts = await intakeCounts(db, fx.A.tenant);
          return { waited, outcome, counts };
        } finally {
          await s1.query("ROLLBACK").catch(() => undefined);
          await s2.query("ROLLBACK").catch(() => undefined);
          await s1.end();
          await s2.end();
          if (fx) await removeRest2aTenants(db, fx);
        }
      }

      it("(a) the name loses its activation while the command waits on the name: host_not_admitted, nothing written", async () => {
        const r = await race((_fx, hosts, s1) =>
          s1
            .query(
              "UPDATE public.site_domains SET activation_proved_at = NULL WHERE host = $1",
              [hosts.site],
            )
            .then(() => undefined),
        );
        expect(r).toMatchObject({
          waited: true,
          outcome: "42501 host_not_admitted",
          counts: { intakes: 0, keys: 0 },
        });
      });

      it("(b) the Site turns inactive while the command waits on the Site: host_not_admitted, nothing written", async () => {
        const r = await race((_fx, hosts, s1) =>
          s1
            .query(
              "UPDATE public.sites SET status = 'inactive' WHERE id = $1",
              [hosts.siteId],
            )
            .then(() => undefined),
        );
        expect(r).toMatchObject({
          waited: true,
          outcome: "42501 host_not_admitted",
          counts: { intakes: 0, keys: 0 },
        });
      });

      it("(c) the organization is suspended while the command waits on it: organization_inactive, nothing written", async () => {
        const r = await race((fx, _hosts, s1) =>
          s1
            .query(
              "UPDATE public.tenants SET status = 'suspended' WHERE id = $1",
              [fx.A.tenant],
            )
            .then(() => undefined),
        );
        expect(r).toMatchObject({
          waited: true,
          outcome: "55000 organization_inactive",
          counts: { intakes: 0, keys: 0 },
        });
      });
    });

    describe("two sessions posting one key (committed, removed in finally)", () => {
      it("the second waits for the first and answers its intake: one intake, one request", async () => {
        const s1 = new pg.Client({ connectionString: ADMIN_URL });
        const s2 = new pg.Client({ connectionString: ADMIN_URL });
        await s1.connect();
        await s2.connect();
        let fx: Fixture | undefined;
        try {
          fx = await seedTwoTenants(db);
          const hosts: Hosts = await admitHosts(db, fx.A);
          const side: Side = fx.A;
          const request: GiftRequest = {
            host: hosts.site,
            key: randomUUID(),
            lines: [{ fund: side.fund, amount: 2000 }],
            contact: guestContact(),
          };
          const pid2 = (await s2.query("SELECT pg_backend_pid() AS p")).rows[0]
            .p as number;
          await s1.query("BEGIN");
          await s1.query("SET LOCAL ROLE service_role");
          const first = (await s1.query(BEGIN_SQL, beginArgs(request))).rows[0]
            .r as Record<string, unknown>;
          await s2.query("BEGIN");
          await s2.query("SET LOCAL ROLE service_role");
          const second = s2.query(BEGIN_SQL, beginArgs(request));
          let waited = false;
          for (let i = 0; i < 100 && !waited; i += 1) {
            const blockers = (
              await db.query("SELECT pg_blocking_pids($1) AS b", [pid2])
            ).rows[0].b as number[];
            waited = blockers.length > 0;
            if (!waited) await new Promise((r) => setTimeout(r, 50));
          }
          expect(waited).toBe(true);
          await s1.query("COMMIT");
          const answer = (await second).rows[0].r as Record<string, unknown>;
          await s2.query("COMMIT");
          expect(answer).toEqual({ ...first, outcome: "replayed" });
          expect(await intakeCounts(db, side.tenant)).toMatchObject({
            intakes: 1,
            requests: 1,
            keys: 1,
          });
        } finally {
          await s1.query("ROLLBACK").catch(() => undefined);
          await s2.query("ROLLBACK").catch(() => undefined);
          await s1.end();
          await s2.end();
          if (fx) await removeRest2aTenants(db, fx);
        }
      });
    });
  },
);
