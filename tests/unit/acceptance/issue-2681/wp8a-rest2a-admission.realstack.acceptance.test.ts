import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  attempt,
  begin,
  beginArgs,
  begun,
  dualHost,
  intakeContactOf,
  intakeCounts,
  intakeOf,
  inTx,
  readyOnlyHost,
  rest2aWorld,
  role,
  verifiedActor,
  type GiftRequest,
} from "./wp8a-rest2a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 2a: the intake's organization and who may give where (ruling W8-R41; the six admission cases of the ruling of 27 November; real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const world = () => rest2aWorld(db);
    const intake = (id: string) => intakeOf(db, id);
    const contactOf = (id: string) => intakeContactOf(db, id);

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

    describe("the six admission cases of the ruling of 27 November (decision-signed-in-giving, section 3), under the guard's locks", () => {
      it("the guest-only constant is retired: no private.site_checkout_serves_guests() remains", () =>
        inTx(db, async () => {
          await role(db, null);
          const left = (
            await db.query(
              "SELECT to_regprocedure('private.site_checkout_serves_guests()') AS f",
            )
          ).rows[0].f;
          expect(left).toBeNull();
        }));

      it("row 1: a verified actor on the name that is both a Site's and the organization's home gives in place: the host's Site, the website as entry surface, the actor recorded", () =>
        inTx(db, async () => {
          const w = await world();
          const host = await dualHost(db, w.A, w.hostsA);
          const giver = verifiedActor();
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
            actor_email: giver.email,
            actor_email_confirmed: true,
          });
        }));

      it("row 5: a guest on that shared name, and on a website-only name, gets the host's Site and the website as entry surface, with no actor", () =>
        inTx(db, async () => {
          const w = await world();
          const host = await dualHost(db, w.A, w.hostsA);
          for (const name of [host, w.hostsA.site]) {
            const r = begun(
              await begin(db, {
                host: name,
                lines: [{ fund: w.A.fund, amount: 1500 }],
              }),
            );
            expect(await intake(r.donation_id), name).toMatchObject({
              site_id: w.hostsA.siteId,
              entry_surface: "website",
            });
            expect(await contactOf(r.donation_id), name).toMatchObject({
              actor_user_id: null,
              actor_email_confirmed: null,
            });
          }
        }));

      it("rows 2 to 4 on the shared name: the account area there keeps a current source Site, drops another organization's, and a gift started inside the account carries none", () =>
        inTx(db, async () => {
          const w = await world();
          const host = await dualHost(db, w.A, w.hostsA);
          const account = async (sourceSite: string | null) =>
            intake(
              begun(
                await begin(db, {
                  host,
                  surface: "donor_account",
                  lines: [{ fund: w.A.fund, amount: 1500 }],
                  actor: verifiedActor(),
                  sourceSite,
                }),
              ).donation_id,
            );
          expect(await account(w.hostsA.siteId)).toMatchObject({
            site_id: w.hostsA.siteId,
            entry_surface: "donor_account",
          });
          expect(await account(w.hostsB.siteId)).toMatchObject({
            site_id: null,
            entry_surface: "donor_account",
          });
          expect(await account(null)).toMatchObject({
            site_id: null,
            entry_surface: "donor_account",
          });
        }));

      it("row 6: an actor on a Site's name that is not the home is refused 22023 actor_not_admitted and writes nothing, also once the organization has a shared home", () =>
        inTx(db, async () => {
          const w = await world();
          await dualHost(db, w.A, w.hostsA);
          const before = await intakeCounts(db, w.A.tenant);
          const elsewhere = await begin(db, {
            host: w.hostsA.site,
            lines: [{ fund: w.A.fund, amount: 1500 }],
            actor: verifiedActor(),
          });
          expect(`${elsewhere.code} ${elsewhere.message}`).toBe(
            "22023 actor_not_admitted",
          );
          expect(await intakeCounts(db, w.A.tenant)).toEqual(before);
        }));

      it("an actor named on the shared name with no confirmation flag, or malformed, is 22023 actor_required; a source Site there is 22023 source_site_not_admitted; nothing is written", () =>
        inTx(db, async () => {
          const w = await world();
          const host = await dualHost(db, w.A, w.hostsA);
          const before = await intakeCounts(db, w.A.tenant);
          for (const actor of [
            { user_id: randomUUID(), email: "x@example.test" },
            {
              user_id: "forged",
              email: "x@example.test",
              email_confirmed: true,
            },
            { email: "x@example.test", email_confirmed: true },
          ]) {
            const a = await begin(db, {
              host,
              lines: [{ fund: w.A.fund, amount: 1500 }],
              actor,
            });
            expect(`${a.code} ${a.message}`, JSON.stringify(actor)).toBe(
              "22023 actor_required",
            );
          }
          const source = await begin(db, {
            host,
            lines: [{ fund: w.A.fund, amount: 1500 }],
            actor: verifiedActor(),
            sourceSite: w.hostsA.siteId,
          });
          expect(`${source.code} ${source.message}`).toBe(
            "22023 source_site_not_admitted",
          );
          expect(await intakeCounts(db, w.A.tenant)).toEqual(before);
        }));
    });
    describe("the fix round of 27 November: the home must serve the account area; an unconfirmed e-mail still gives signed in", () => {
      it("T2: a home name that does not serve donor_account refuses the account path 42501 host_not_admitted, before the organization's status, and writes nothing (AL-2681 PR 2b, issue 2857 item 39: the organization is suspended, so the order is proved)", () =>
        inTx(db, async () => {
          const w = await world();
          const host = await dualHost(db, w.A, w.hostsA);
          await role(db, null);
          await db.query(
            "UPDATE public.site_domains SET surfaces = ARRAY['website'] WHERE host = $1",
            [host],
          );
          await db.query(
            "UPDATE public.tenants SET status = 'suspended' WHERE id = $1",
            [w.A.tenant],
          );
          const before = await intakeCounts(db, w.A.tenant);
          const a = await begin(db, {
            host,
            surface: "donor_account",
            lines: [{ fund: w.A.fund, amount: 1500 }],
            actor: verifiedActor(),
          });
          expect(`${a.code} ${a.message}`).toBe("42501 host_not_admitted");
          expect(await intakeCounts(db, w.A.tenant)).toEqual(before);
        }));

      it("T8: an actor whose e-mail Auth has not confirmed is admitted on both paths and recorded with the flag false (the ruling: such a giver gives signed in; matching then follows guest rules)", () =>
        inTx(db, async () => {
          const w = await world();
          const host = await dualHost(db, w.A, w.hostsA);
          for (const surface of ["website", "donor_account"]) {
            const giver = { ...verifiedActor(), email_confirmed: false };
            const r = begun(
              await begin(db, {
                host,
                surface,
                lines: [{ fund: w.A.fund, amount: 1500 }],
                actor: giver,
              }),
            );
            expect(await contactOf(r.donation_id), surface).toMatchObject({
              actor_user_id: giver.user_id,
              actor_email_confirmed: false,
            });
          }
        }));
    });
  },
);
