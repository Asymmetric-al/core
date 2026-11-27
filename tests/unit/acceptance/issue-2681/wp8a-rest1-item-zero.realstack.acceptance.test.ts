import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  attempt,
  claim,
  core,
  coreOutcome,
  enqueue,
  giftIntake,
  grant,
  GUARD_TEST_REVOKES,
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  inTx,
  moneyRows,
  paymentIntent,
  removeTwoTenants,
  replica,
  report,
  role,
  seedTwoTenants,
  storeEvent,
  windowEndsIn,
} from "./wp8a-rest1-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 1: item zero, issues 2837, 2838 and 2842 (real stack; the isolation tests commit and remove two tenants, every other test is rolled back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    describe("2837: READ COMMITTED only", () => {
      it("the core and the worker entry refuse REPEATABLE READ and SERIALIZABLE with 25001 before any read, and run at READ COMMITTED", async () => {
        await db.query("BEGIN");
        const fx = await seedTwoTenants(db);
        const intake = await giftIntake(db, fx.A);
        const pi = paymentIntent();
        await role(db, null);
        await db.query(
          "UPDATE public.donations SET stripe_payment_intent_id = $2 WHERE id = $1",
          [intake.donationId, pi],
        );
        const event = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        await role(db, null);
        for (const statement of GUARD_TEST_REVOKES) await db.query(statement);
        await db.query("COMMIT");
        try {
          for (const level of ["REPEATABLE READ", "SERIALIZABLE"]) {
            await db.query(`BEGIN ISOLATION LEVEL ${level}`);
            try {
              await db.query("SET LOCAL ROLE tenant_guard");
              await db.query("SELECT tenant_guard.enter($1)", [fx.A.tenant]);
              const direct = await attempt(
                db,
                "SELECT tenant_guard.money_apply_payment_event($1) AS r",
                [event.id],
              );
              expect([level, direct.code, direct.message]).toEqual([
                level,
                "25001",
                "read_committed_required",
              ]);
            } finally {
              await db.query("ROLLBACK");
            }
            await db.query(`BEGIN ISOLATION LEVEL ${level}`);
            try {
              await db.query("SET LOCAL ROLE service_role");
              const entry = await attempt(
                db,
                "SELECT public.apply_payment_outcome($1, 1) AS r",
                [event.id],
              );
              expect([level, entry.code]).toEqual([level, "25001"]);
            } finally {
              await db.query("ROLLBACK");
            }
          }
          await db.query("BEGIN ISOLATION LEVEL READ COMMITTED");
          try {
            const r = await core(db, fx.A.tenant, event.id);
            expect(coreOutcome(r)).toMatchObject({ outcome: "applied" });
          } finally {
            await db.query("ROLLBACK");
          }
        } finally {
          await removeTwoTenants(db, fx);
        }
      });
    });

    describe("2837, its comment: an operation on another account, or in the other mode, is unknown", () => {
      async function mutantCore(filter: RegExp) {
        await role(db, null);
        const text = (
          await db.query(
            "SELECT pg_get_functiondef('tenant_guard.money_apply_payment_event(uuid)'::regprocedure) AS d",
          )
        ).rows[0].d as string;
        expect(filter.test(text)).toBe(true);
        await db.query(text.replace(filter, ""));
      }

      for (const [label, column, value, filter] of [
        [
          "another provider account of the same organization",
          "provider_account_ref",
          "acct_SameOrgOther",
          /\n\s*AND o\.provider_account_ref = v_event\.provider_account_id/,
        ],
        [
          "the same account in the other mode",
          "livemode",
          true,
          /\n\s*AND o\.livemode = v_event\.livemode/,
        ],
      ] as const)
        it(`${label}: answered unknown_operation, and the answer turns red when its filter is removed`, () =>
          inTx(db, async () => {
            const fx = await seedTwoTenants(db);
            const intake = await giftIntake(db, fx.A);
            const op = (await enqueue(db, fx.A, intake.donationId)).rows[0]!
              .id as string;
            await replica(
              db,
              `UPDATE public.donation_saga_outbox SET ${column} = $2 WHERE id = $1`,
              [op, value],
            );
            const event = await storeEvent(db, fx.A, {
              pi: paymentIntent(),
              amount: intake.amount,
              metadata: { asym_operation: op, asym_intake: intake.donationId },
            });
            expect(
              coreOutcome(await core(db, fx.A.tenant, event.id)),
            ).toMatchObject({
              outcome: "unmatched",
              reason: "unknown_operation",
            });
            await mutantCore(filter);
            const mutant = await core(db, fx.A.tenant, event.id);
            expect(
              mutant.ok
                ? (mutant.rows[0]!.r as { reason?: string }).reason
                : mutant.code,
            ).not.toBe("unknown_operation");
          }));
    });

    describe("2838: an event for a parked request", () => {
      async function parkedRequest() {
        const fx = await seedTwoTenants(db);
        const intake = await giftIntake(db, fx.A);
        const op = (await enqueue(db, fx.A, intake.donationId)).rows[0]!
          .id as string;
        await claim(db, op);
        await report(db, op, 1, {
          result: "unknown",
          retry_delay_seconds: 30,
          error_code: "stripe_timeout",
        });
        await windowEndsIn(db, op, 60);
        expect(await claim(db, op)).toMatchObject({ outcome: "parked" });
        return { fx, intake, op };
      }

      it("disagreeing in amount, currency or received amount is the contradiction amount_mismatch: one task, one link, no money row; never the case's evidence", () =>
        inTx(db, async () => {
          const { fx, intake, op } = await parkedRequest();
          const before = await moneyRows(db, fx.A.tenant);
          for (const event of [
            { amount: intake.amount - 100 },
            { amount: intake.amount, received: intake.amount - 100 },
            { amount: intake.amount, currency: "cad" },
          ]) {
            const stored = await storeEvent(db, fx.A, {
              pi: paymentIntent(),
              ...event,
              metadata: { asym_operation: op, asym_intake: intake.donationId },
            });
            expect(
              coreOutcome(await core(db, fx.A.tenant, stored.id)),
            ).toMatchObject({
              outcome: "contradiction",
              reason: "amount_mismatch",
            });
          }
          const after = await moneyRows(db, fx.A.tenant);
          expect([after.intakes, after.gifts, after.observations]).toEqual([
            before.intakes,
            before.gifts,
            before.observations,
          ]);
          expect(
            after.tasks.filter(
              (t) => t.relationship === "payment_contradiction",
            ),
          ).toHaveLength(3);
        }));

      it("an agreeing event stays the case's evidence and writes nothing", () =>
        inTx(db, async () => {
          const { fx, intake, op } = await parkedRequest();
          const stored = await storeEvent(db, fx.A, {
            pi: paymentIntent(),
            amount: intake.amount,
            metadata: { asym_operation: op, asym_intake: intake.donationId },
          });
          expect(
            coreOutcome(await core(db, fx.A.tenant, stored.id)),
          ).toMatchObject({ outcome: "case_evidence" });
          expect((await moneyRows(db, fx.A.tenant)).gifts).toEqual([]);
        }));
    });

    describe("2842: a recorded organization never changes", () => {
      it("a legacy intake cannot be moved to another organization under its staged gift (accepted before, 23514 after); its other updates and its delete cascade are unchanged", () =>
        inTx(db, async () => {
          const fx = await seedTwoTenants(db);
          await role(db, null);
          const donation = (
            await db.query(
              "INSERT INTO public.donations (tenant_id, amount, currency, status) VALUES ($1, 500, 'usd', 'completed') RETURNING id",
              [fx.A.tenant],
            )
          ).rows[0].id as string;
          await db.query(
            "INSERT INTO public.staged_gifts (tenant_id, donation_id, amount, currency) VALUES ($1, $2, 500, 'usd')",
            [fx.A.tenant, donation],
          );
          await grant(db, HOSTED_SERVICE_GRANTS);
          await role(db, "service_role");
          const moved = await attempt(
            db,
            "UPDATE public.donations SET tenant_id = $2, donor_id = NULL, fund_id = NULL, missionary_id = NULL WHERE id = $1",
            [donation, fx.B.tenant],
          );
          expect([moved.code, moved.message]).toEqual([
            "23514",
            "donation_tenant_frozen",
          ]);
          const updated = await attempt(
            db,
            "UPDATE public.donations SET status = 'refunded' WHERE id = $1 RETURNING status",
            [donation],
          );
          expect(updated.rows).toEqual([{ status: "refunded" }]);
          const deleted = await attempt(
            db,
            "DELETE FROM public.donations WHERE id = $1",
            [donation],
          );
          expect(deleted.ok).toBe(true);
          await role(db, null);
          expect(
            (
              await db.query(
                "SELECT count(*)::int AS n FROM public.staged_gifts WHERE donation_id = $1",
                [donation],
              )
            ).rows[0].n,
          ).toBe(0);
        }));
    });
  },
);
