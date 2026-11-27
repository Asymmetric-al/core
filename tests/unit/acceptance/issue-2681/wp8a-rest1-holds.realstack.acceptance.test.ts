import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asCaller,
  attempt,
  enterAs,
  existingDonor,
  feeFund,
  giftIntake,
  giftOf,
  grant,
  holdsOf,
  inTx,
  outcomeOf,
  pay,
  reasons,
  role,
  seedTwoTenants,
  setThreshold,
  staff,
  uniqueEmail,
  worker,
  type GiftIntake,
} from "./wp8a-rest1-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const ADDRESS = { street: "1 Main St", city: "Springfield", zip: "11111" };

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 1: the holds on a paid line-based gift, the threshold, and the one command that clears a hold (plan :1156, :1170; W8-R13, W8-R19, W8-R23, F4, ruling 4; real stack, every test rolled back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function paidGift(intake: GiftIntake) {
      await pay(db, intake);
      const gift = await giftOf(db, intake.donationId);
      return { gift: gift!, holds: await holdsOf(db, gift!.id as string) };
    }

    describe("which gifts wait", () => {
      it("name mismatch: the email's one donor has another name; the gift waits, attribution kept, donor match needs review", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const email = uniqueEmail();
          const donorId = await existingDonor(db, fx.A, {
            name: "Ann Lee",
            email,
          });
          const { gift, holds } = await paidGift(
            await giftIntake(db, fx.A, {
              contact: { email, first: "Bob", last: "Lee" },
            }),
          );
          expect(reasons(holds)).toEqual(["name_mismatch"]);
          expect(holds[0]!.details).toEqual({ donor_id: donorId });
          expect(gift).toMatchObject({
            donor_id: donorId,
            donor_match_status: "needs_review",
            review_reason: "held",
          });
        }));

      it("rule 13: the same name with a no-break space, an ideographic space and other case is the same; a doubled inner space is not", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const email = uniqueEmail();
          await existingDonor(db, fx.A, { name: "Ann Lee", email });
          const same = await paidGift(
            await giftIntake(db, fx.A, {
              contact: { email, first: " ANN　", last: " lee﻿" },
            }),
          );
          expect(same.holds).toEqual([]);
          const email2 = uniqueEmail();
          await existingDonor(db, fx.A, { name: "Ann  Lee", email: email2 });
          const doubled = await paidGift(
            await giftIntake(db, fx.A, {
              contact: { email: email2, first: "Ann", last: "Lee" },
            }),
          );
          expect(reasons(doubled.holds)).toEqual(["name_mismatch"]);
        }));

      it("possible duplicate on a miss, by street and city and by street and postal code; the new donor is still written, with the intake's own address, and the gift points to it, not to the twin (D-18, AL-2681 fix round F14: the assertion now tells a new donor from the twin); a weak signal alone never holds", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const twin = await existingDonor(db, fx.A, {
            name: "Ann Lee",
            email: uniqueEmail("other"),
            address: ADDRESS,
          });
          const ownAddress = {
            street: " 1 main st",
            city: "SPRINGFIELD",
            zip: "22222",
          };
          const cityIntake = await giftIntake(db, fx.A, {
            contact: { first: "Ann", last: "Lee", address: ownAddress },
          });
          const byCity = await paidGift(cityIntake);
          expect(reasons(byCity.holds)).toEqual(["possible_duplicate"]);
          expect(byCity.holds[0]!.details).toMatchObject({
            candidates: [twin],
          });
          await role(db, null);
          const stored = (
            await db.query(
              `SELECT dn.id, dn.address, d.donor_id AS intake_donor
                 FROM public.donations AS d
                 JOIN public.donors AS dn ON dn.id = d.donor_id
                WHERE d.id = $1`,
              [cityIntake.donationId],
            )
          ).rows[0] as { id: string; address: unknown; intake_donor: string };
          expect(stored.id).not.toBe(twin);
          expect(stored.address).toEqual(ownAddress);
          expect(byCity.gift.donor_id).toBe(stored.id);
          const byZip = await paidGift(
            await giftIntake(db, fx.A, {
              contact: {
                first: "Ann",
                last: "Lee",
                address: {
                  street: "1 Main St",
                  city: "Elsewhere",
                  zip: "11111",
                },
              },
            }),
          );
          expect(reasons(byZip.holds)).toEqual(["possible_duplicate"]);
          for (const contact of [
            { first: "Ann", last: "Lee" },
            {
              first: "Ann",
              last: "Lee",
              address: { street: "1 Main St", city: "", zip: "" },
            },
            { first: "Ann", last: "Other", address: ADDRESS },
            { first: "", last: "Lee", address: ADDRESS },
            { first: "Pat", last: "Smith", address: ADDRESS },
          ])
            expect(
              (await paidGift(await giftIntake(db, fx.A, { contact }))).holds,
            ).toEqual([]);
        }));

      it("a line for a restricted or high-risk worker waits; standard and sensitive do not", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          for (const [level, held] of [
            ["standard", false],
            ["sensitive", false],
            ["restricted", true],
            ["high_risk", true],
          ] as const) {
            const w = await worker(db, fx.A, level);
            const { holds } = await paidGift(
              await giftIntake(db, fx.A, {
                lines: [{ missionary: w, amount: 5000 }],
              }),
            );
            expect([level, reasons(holds)]).toEqual([
              level,
              held ? ["restricted_worker"] : [],
            ]);
          }
        }));

      it("the threshold: no policy row and NULL hold nothing; one cent below holds nothing; equal and one cent above hold", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const held = async () =>
            reasons(
              (
                await paidGift(
                  await giftIntake(db, fx.A, { lines: [{ amount: 10000 }] }),
                )
              ).holds,
            );
          await role(db, null);
          await db.query(
            "DELETE FROM public.contribution_approval_policies WHERE tenant_id = $1",
            [fx.A.tenant],
          );
          expect(await held()).toEqual([]);
          await setThreshold(db, fx.A, null);
          expect(await held()).toEqual([]);
          await setThreshold(db, fx.A, 10001);
          expect(await held()).toEqual([]);
          await setThreshold(db, fx.A, 10000);
          expect(await held()).toEqual(["large_gift"]);
          await setThreshold(db, fx.A, 9999);
          expect(await held()).toEqual(["large_gift"]);
        }));

      it("a currency other than usd holds as threshold_currency_unknown when a threshold is set (no entity can be non-usd today, so the rule is read on its helper)", () =>
        inTx(db, async () => {
          await role(db, null);
          const r = await db.query(
            `SELECT private.money_large_gift_hold(100, 'eur', 50) AS eur,
                    private.money_large_gift_hold(100, 'eur', NULL) AS eur_unset,
                    private.money_large_gift_hold(49, 'usd', 50) AS below,
                    private.money_large_gift_hold(50, 'usd', 50) AS equal,
                    private.money_large_gift_hold(50, NULL, 50) AS no_currency`,
          );
          expect(r.rows[0]).toEqual({
            eur: "threshold_currency_unknown",
            eur_unset: null,
            below: null,
            equal: "large_gift",
            no_currency: "threshold_currency_unknown",
          });
        }));
    });

    describe("what a hold refuses", () => {
      async function heldGift() {
        const fx = await seedTwoTenants(db);
        const w = await worker(db, fx.A, "restricted");
        const intake = await giftIntake(db, fx.A, {
          lines: [{ missionary: w, amount: 5000 }],
        });
        const { gift, holds } = await paidGift(intake);
        return { fx, intake, gift, hold: holds[0]! };
      }

      it("deleting, truncating, editing anchors of or clearing a hold outside the command is refused for every role, each with its SQLSTATE", () =>
        inTx(db, async () => {
          const { fx, hold } = await heldGift();
          await role(db, null);
          const asOwner = (sql: string) => attempt(db, sql, [hold.id]);
          expect(
            (
              await asOwner(
                "DELETE FROM public.staged_gift_holds WHERE id = $1",
              )
            ).code,
          ).toBe("23514");
          expect(
            (await attempt(db, "TRUNCATE public.staged_gift_holds")).code,
          ).toBe("23514");
          expect(
            (
              await asOwner(
                "UPDATE public.staged_gift_holds SET resolved_at = now(), resolved_by = gen_random_uuid(), resolved_assignment_id = gen_random_uuid(), resolution_reason = 'owner', resolution_details = '{}' WHERE id = $1",
              )
            ).code,
          ).toBe("42501");
          await role(db, "service_role");
          expect(
            (
              await attempt(
                db,
                "DELETE FROM public.staged_gift_holds WHERE id = $1",
                [hold.id],
              )
            ).code,
          ).toBe("42501");
          expect(
            (
              await attempt(
                db,
                "UPDATE public.staged_gift_holds SET resolved_at = now() WHERE id = $1",
                [hold.id],
              )
            ).code,
          ).toBe("42501");
          await enterAs(db, "tenant_guard", fx.A.tenant);
          expect(
            (
              await attempt(
                db,
                "UPDATE public.staged_gift_holds SET resolved_at = now(), resolved_by = gen_random_uuid(), resolved_assignment_id = gen_random_uuid(), resolution_reason = 'guard', resolution_details = '{}' WHERE id = $1",
                [hold.id],
              )
            ).code,
          ).toBe("42501");
          await role(db, null);
          await db.query(
            "GRANT UPDATE (reason) ON public.staged_gift_holds TO tenant_guard",
          );
          await enterAs(db, "tenant_guard", fx.A.tenant);
          expect(
            (
              await attempt(
                db,
                "UPDATE public.staged_gift_holds SET reason = 'large_gift' WHERE id = $1",
                [hold.id],
              )
            ).code,
          ).toBe("23514");
          await role(db, null);
        }));

      it("promotion and posting markers of a held gift are refused whoever writes (the legacy approve's statement, the staff patch's, the owner); a full refund closes it", () =>
        inTx(db, async () => {
          const { gift } = await heldGift();
          await grant(db, [
            "GRANT UPDATE ON TABLE public.staged_gifts TO service_role",
          ]);
          for (const roleName of ["service_role", null]) {
            await role(db, roleName);
            for (const set of [
              "status = 'ready_to_post', reviewed_at = now(), crm_post_status = 'not_required'",
              "status = 'posted'",
              "posted_at = now()",
              "posted_by_profile_id = gen_random_uuid()",
            ]) {
              const r = await attempt(
                db,
                `UPDATE public.staged_gifts SET ${set} WHERE id = $1 AND status = 'needs_review'`,
                [gift.id],
              );
              expect([set, r.code, r.message]).toEqual([
                set,
                "23514",
                "staged_gift_held",
              ]);
            }
          }
          await role(db, "service_role");
          const refunded = await attempt(
            db,
            "UPDATE public.staged_gifts SET status = 'refunded' WHERE id = $1 RETURNING status",
            [gift.id],
          );
          expect(refunded.rows).toEqual([{ status: "refunded" }]);
          await role(db, null);
        }));

      it("resolution: refused without contributions.apply_corrections, without x-asym-tenant, from organization B, with a reason blank after the trim or outside 3 to 500 characters; then the command clears it, audits it, records the re-check, and the gift may move on", () =>
        inTx(db, async () => {
          const { fx, gift, hold } = await heldGift();
          const resolve = (
            who: Awaited<ReturnType<typeof staff>>,
            reason: string,
            headers?: Record<string, string> | null,
          ) =>
            asCaller(
              db,
              who,
              "SELECT public.resolve_gift_hold($1, $2, $3) AS r",
              [fx.A.tenant, hold.id, reason],
              headers,
            );
          const finance = await staff(db, fx.A, "finance");
          const developer = await staff(db, fx.A, "development");
          const other = await staff(db, fx.B, "finance");
          expect((await resolve(developer, "Checked the worker")).code).toBe(
            "42501",
          );
          expect(
            (await resolve(finance, "Checked the worker", null)).code,
          ).toBe("42501");
          expect(
            (
              await asCaller(
                db,
                other,
                "SELECT public.resolve_gift_hold($1, $2, $3) AS r",
                [fx.B.tenant, hold.id, "Checked the worker"],
              )
            ).code,
          ).toBe("42501");
          expect(
            (
              await asCaller(
                db,
                other,
                "SELECT public.resolve_gift_hold($1, $2, $3) AS r",
                [fx.A.tenant, hold.id, "Checked the worker"],
              )
            ).code,
          ).toBe("42501");
          for (const bad of ["", "  ", " 　ab﻿", "x".repeat(501)])
            expect((await resolve(finance, bad)).code).toBe("22023");
          const done = outcomeOf(
            await resolve(finance, " Checked the worker's file "),
          );
          expect(done).toMatchObject({
            hold_id: hold.id,
            open_holds: 0,
            hold_reason: "restricted_worker",
          });
          const [after] = await holdsOf(db, gift.id as string);
          expect(after).toMatchObject({
            resolution_reason: "Checked the worker's file",
          });
          expect(after!.resolved_at).not.toBeNull();
          await role(db, null);
          const audit = await db.query(
            "SELECT user_id, details FROM public.audit_logs WHERE tenant_id = $1 AND action = 'gift_hold_resolved'",
            [fx.A.tenant],
          );
          expect(audit.rows).toHaveLength(1);
          expect(audit.rows[0].user_id).toBe(finance.user);
          expect((await resolve(finance, "Again please")).code).toBe("55000");
          await enterAs(db, "tenant_guard", fx.A.tenant);
          expect(
            (
              await attempt(
                db,
                "UPDATE public.staged_gift_holds SET resolution_reason = 'changed' WHERE id = $1",
                [hold.id],
              )
            ).code,
          ).toBe("23514");
          await role(db, null);
          await grant(db, [
            "GRANT UPDATE ON TABLE public.staged_gifts TO service_role",
          ]);
          await role(db, "service_role");
          const promoted = await attempt(
            db,
            "UPDATE public.staged_gifts SET status = 'ready_to_post' WHERE id = $1 RETURNING status",
            [gift.id],
          );
          expect(promoted.rows).toEqual([{ status: "ready_to_post" }]);
          await role(db, null);
        }));

      it("an attribution hold's resolution re-runs the predicate on the current rows and records it", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          const email = uniqueEmail();
          const donorId = await existingDonor(db, fx.A, {
            name: "Ann Lee",
            email,
          });
          const { holds } = await paidGift(
            await giftIntake(db, fx.A, {
              contact: { email, first: "Bob", last: "Lee" },
            }),
          );
          await role(db, null);
          await db.query(
            "UPDATE public.donors SET name = 'Bob Lee' WHERE id = $1",
            [donorId],
          );
          const finance = await staff(db, fx.A, "finance");
          const done = outcomeOf(
            await asCaller(
              db,
              finance,
              "SELECT public.resolve_gift_hold($1, $2, $3) AS r",
              [fx.A.tenant, holds[0]!.id, "The donor's name was corrected"],
            ),
          );
          expect(done.recheck).toEqual({ rechecked: true, holds: false });
        }));
    });

    describe("the threshold command", () => {
      it("refuses a member without contributions.manage_settings, zero or less, and organization B; NULL clears; it writes the first policy row and an audit row", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          await role(db, null);
          await db.query(
            "DELETE FROM public.contribution_approval_policies WHERE tenant_id = $1",
            [fx.A.tenant],
          );
          const set = (
            who: Awaited<ReturnType<typeof staff>>,
            cents: number | null,
            tenant = fx.A.tenant,
          ) =>
            asCaller(
              db,
              who,
              "SELECT public.set_large_gift_threshold($1, $2, $3) AS r",
              [tenant, cents, "Board policy"],
            );
          const admin = await staff(db, fx.A, "admin");
          const finance = await staff(db, fx.A, "finance");
          const otherAdmin = await staff(db, fx.B, "admin");
          expect((await set(finance, 100000)).code).toBe("42501");
          expect((await set(admin, 0)).code).toBe("22023");
          expect((await set(admin, -5)).code).toBe("22023");
          expect((await set(otherAdmin, 100000)).code).toBe("42501");
          expect(outcomeOf(await set(admin, 100000))).toMatchObject({
            large_gift_threshold_cents: 100000,
          });
          expect(outcomeOf(await set(admin, null))).toMatchObject({
            large_gift_threshold_cents: null,
          });
          await role(db, null);
          const rows = await db.query(
            "SELECT large_gift_threshold_cents, ownership_mode FROM public.contribution_approval_policies WHERE tenant_id = $1",
            [fx.A.tenant],
          );
          expect(rows.rows).toEqual([
            {
              large_gift_threshold_cents: null,
              ownership_mode: "separation_of_duties",
            },
          ]);
          expect(
            (
              await db.query(
                "SELECT count(*)::int AS n FROM public.audit_logs WHERE tenant_id = $1 AND action = 'large_gift_threshold_set'",
                [fx.A.tenant],
              )
            ).rows[0].n,
          ).toBe(2);
          expect(
            (
              await attempt(
                db,
                "UPDATE public.contribution_approval_policies SET large_gift_threshold_cents = 0 WHERE tenant_id = $1",
                [fx.A.tenant],
              )
            ).code,
          ).toBe("23514");
        }));
    });

    it("a fee-cover line is never a restricted worker's: a gift with a fee line and a standard worker stays clean", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const w = await worker(db, fx.A, "standard");
        const fee = await feeFund(db, fx.A);
        const { holds } = await paidGift(
          await giftIntake(db, fx.A, {
            lines: [
              { missionary: w, amount: 10000 },
              { fund: fee, fee: true, amount: 300 },
            ],
          }),
        );
        expect(holds).toEqual([]);
      }));
  },
);
