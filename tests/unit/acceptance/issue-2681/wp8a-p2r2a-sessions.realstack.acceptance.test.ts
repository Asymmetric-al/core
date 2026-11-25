import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  GUARD_TEST_REVOKES,
  IN_MIGRATE_JOB,
  apply,
  claimEvent,
  inTx,
  lineIntake,
  moneyRows,
  paymentIntent,
  recordReference,
  removeTwoTenants,
  role,
  seedTwoTenants,
  storeEvent,
  syncLease,
  type Fixture,
  type Outcome,
} from "./wp8a-p2r2a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R2a: two applies on one payment (index 4.1, 4.8; real stack; C7 (b) commits and removes its own tenants)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const sessions: pg.Client[] = [];
    beforeAll(() => db.connect());
    afterAll(async () => {
      for (const s of sessions) await s.end().catch(() => {});
      await db.end();
    });

    async function openSession() {
      const s = new pg.Client({ connectionString: ADMIN_URL });
      s.on("error", () => {});
      await s.connect();
      sessions.push(s);
      return s;
    }

    it("C7 (a): while event 1 holds the account's sync lease, event 2's claim answers account_busy; after event 1 completes, event 2 claims and applies as no_change", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await lineIntake(db, fx.A);
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        const e1 = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        const e2 = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        expect(await claimEvent(db, e1.id)).toMatchObject({
          outcome: "claimed",
        });
        expect(await claimEvent(db, e2.id)).toMatchObject({
          claimed: false,
          outcome: "account_busy",
        });
        expect(await apply(db, e1.id, 1)).toMatchObject({ outcome: "applied" });
        expect(await syncLease(db, fx.A)).toBeNull();
        expect(await claimEvent(db, e2.id)).toMatchObject({
          outcome: "claimed",
          attempt: 1,
        });
        expect(await apply(db, e2.id, 1)).toMatchObject({
          outcome: "no_change",
          effect: "succeeded",
        });
        const rows = await moneyRows(db, fx.A.tenant);
        expect([
          rows.observations.length,
          rows.gifts.length,
          rows.audit.length,
        ]).toEqual([1, 1, 1]);
      }));

    it("C7 (b), the adoption race: two committed sessions call tenant_guard.money_apply_payment_event directly, after tenant_guard.enter, on two success events of one payment; the intake's lock serializes them: one applied, one no_change; one terminal observation, one staged gift, one audit row", async () => {
      await db.query("BEGIN");
      const fx: Fixture = await seedTwoTenants(db);
      await db.query("COMMIT");
      try {
        await db.query("BEGIN");
        const intake = await lineIntake(db, fx.A, {
          lines: [{ amount: 7000 }, { amount: 3300 }],
        });
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        const e1 = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        const e2 = await storeEvent(db, fx.A, { pi, amount: intake.amount });
        await role(db, null);
        for (const revoke of GUARD_TEST_REVOKES) await db.query(revoke);
        await db.query("COMMIT");

        const [s1, s2, watcher] = [
          await openSession(),
          await openSession(),
          await openSession(),
        ];
        const pid2 = (await s2.query("SELECT pg_backend_pid() AS pid")).rows[0]
          .pid as number;
        const coreIn = async (s: pg.Client, eventId: string) => {
          await s.query("BEGIN");
          await s.query("SET LOCAL ROLE tenant_guard");
          await s.query("SELECT tenant_guard.enter($1)", [fx.A.tenant]);
          return s.query(
            "SELECT tenant_guard.money_apply_payment_event($1) AS r",
            [eventId],
          );
        };
        const first = (await coreIn(s1, e1.id)).rows[0].r as Outcome;
        const early: { settled?: { value: Outcome } | { error: unknown } } = {};
        const pending = coreIn(s2, e2.id).then(
          (r) => ({ value: r.rows[0].r as Outcome }),
          (error: unknown) => ({ error }),
        );
        void pending.then((settled) => {
          early.settled = settled;
        });
        let waited = false;
        for (let i = 0; i < 200 && !waited; i += 1) {
          if (early.settled !== undefined) break;
          const r = await watcher.query(
            "SELECT wait_event_type FROM pg_stat_activity WHERE pid = $1",
            [pid2],
          );
          waited = r.rows[0]?.wait_event_type === "Lock";
          if (!waited) await new Promise((done) => setTimeout(done, 25));
        }
        expect(waited).toBe(true);
        expect(early.settled).toBeUndefined();
        await s1.query("COMMIT");
        const settled = await pending;
        if ("error" in settled) throw settled.error;
        await s2.query("COMMIT");
        expect(first).toMatchObject({
          outcome: "applied",
          status: "completed",
        });
        expect(settled.value).toMatchObject({
          outcome: "no_change",
          effect: "succeeded",
        });
        const rows = await moneyRows(db, fx.A.tenant);
        expect(rows.observations.map((o) => o.effect_kind)).toEqual([
          "succeeded",
        ]);
        expect(rows.gifts).toHaveLength(1);
        expect(rows.allocations).toHaveLength(2);
        expect(rows.audit).toHaveLength(1);
        await role(db, null);
        expect(
          (
            await db.query(
              `SELECT has_table_privilege('tenant_guard', 'public.donations', 'INSERT') AS donations,
                      has_table_privilege('tenant_guard', 'public.donation_intake_lines', 'INSERT') AS lines`,
            )
          ).rows[0],
        ).toEqual({ donations: false, lines: false });
      } finally {
        const open = sessions.splice(0);
        await Promise.all(open.map((s) => s.end().catch(() => {})));
        await db.query("ROLLBACK").catch(() => {});
        await removeTwoTenants(db, fx);
      }
    });
  },
);
