import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  claim,
  expireLease,
  guardIntake,
  makeDue,
  paymentIntent,
  removeTwoTenants,
  report,
  role,
  rowOf,
  seedTwoTenants,
  windowEndsIn,
  type Fixture,
  type Outcome,
} from "./wp8a-p2r1a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const notPerformed = (delay = 30) => ({
  result: "not_performed",
  retry_delay_seconds: delay,
});
const succeeded = (object = paymentIntent()) => ({
  result: "succeeded",
  provider_object_id: object,
});

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R1a: the provider-request machine, two committed sessions (real stack; the races commit and remove their own tenants)",
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

    async function releaseSessionsThenRemove(fx: Fixture) {
      const open = sessions.splice(0);
      await Promise.all(open.map((s) => s.end().catch(() => {})));
      await db.query("ROLLBACK").catch(() => {});
      await removeTwoTenants(db, fx);
    }

    async function committed<T>(fn: () => Promise<T>) {
      await db.query("BEGIN");
      try {
        const out = await fn();
        await role(db, null);
        await db.query(
          "REVOKE INSERT ON TABLE public.donations, public.donation_saga_outbox FROM tenant_guard",
        );
        await db.query(
          "REVOKE EXECUTE ON FUNCTION public.normalize_currency_code(text) FROM tenant_guard",
        );
        await db.query("COMMIT");
        return out;
      } catch (error) {
        await db.query("ROLLBACK");
        throw error;
      }
    }

    async function asService(s: pg.Client, sql: string, params: unknown[]) {
      await s.query("SET LOCAL ROLE service_role");
      return (await s.query(sql, params)).rows[0].r as Outcome;
    }

    async function race(
      first: (s: pg.Client) => Promise<Outcome>,
      second: (s: pg.Client) => Promise<Outcome>,
    ) {
      const [s1, s2, watcher] = [
        await openSession(),
        await openSession(),
        await openSession(),
      ];
      const pid2 = (await s2.query("SELECT pg_backend_pid() AS pid")).rows[0]
        .pid;
      await s1.query("BEGIN");
      const out1 = await first(s1);
      await s2.query("BEGIN");
      const early: { settled?: { value: Outcome } | { error: unknown } } = {};
      const pending = second(s2).then(
        (value) => ({ value }),
        (error: unknown) => ({ error }),
      );
      void pending.then((settled) => {
        early.settled = settled;
      });
      for (let i = 0; i < 200; i += 1) {
        const settledEarly = early.settled;
        if (settledEarly !== undefined) {
          if ("error" in settledEarly) throw settledEarly.error;
          throw new Error(
            "the second session finished before it waited on the row lock",
          );
        }
        const r = await watcher.query(
          "SELECT wait_event_type FROM pg_stat_activity WHERE pid = $1",
          [pid2],
        );
        if (r.rows[0]?.wait_event_type === "Lock") break;
        if (i === 199)
          throw new Error("the second session never waited on the row lock");
        await new Promise((done) => setTimeout(done, 50));
      }
      await s1.query("COMMIT");
      const settled = await pending;
      if ("error" in settled) throw settled.error;
      const out2 = settled.value;
      await s2.query("COMMIT");
      return [out1, out2] as const;
    }

    const claimIn =
      (operationId: string, lease = 300) =>
      (s: pg.Client) =>
        asService(s, "SELECT public.claim_provider_operation($1, $2) AS r", [
          operationId,
          lease,
        ]);
    const reportIn =
      (operationId: string, n: number, result: object) => (s: pg.Client) =>
        asService(
          s,
          "SELECT public.record_provider_operation_result($1, $2, $3::jsonb) AS r",
          [operationId, n, JSON.stringify(result)],
        );

    async function committedState(fx: Fixture) {
      await role(db, null);
      const count = async (sql: string) =>
        (await db.query(sql, [fx.A.tenant])).rows[0].n as number;
      return {
        tasks: await count(
          "SELECT count(*)::int AS n FROM public.mission_control_tasks WHERE tenant_id = $1",
        ),
        links: await count(
          "SELECT count(*)::int AS n FROM public.mission_control_task_links WHERE tenant_id = $1",
        ),
        cases: await count(
          "SELECT count(*)::int AS n FROM public.payment_repair_cases WHERE tenant_id = $1",
        ),
      };
    }

    it("T6 (bot round): race() stops at once when the second session finishes before it waits on the lock: an early rejection fails with its own SQL error, an early success fails explicitly", async () => {
      const quick = async (s: pg.Client) =>
        (await s.query("SELECT 1 AS r")).rows[0].r as Outcome;
      const started = Date.now();
      try {
        const rejected = await race(
          quick,
          async (s) =>
            (await s.query("SELECT 1 / 0 AS r")).rows[0].r as Outcome,
        ).then(
          () => "no error",
          (e: { code?: string }) => e.code,
        );
        expect(rejected).toBe("22012");
        const succeededEarly = await race(quick, quick).then(
          () => "no error",
          (e: Error) => e.message,
        );
        expect(succeededEarly).toBe(
          "the second session finished before it waited on the row lock",
        );
        expect(Date.now() - started).toBeLessThan(5_000);
      } finally {
        const open = sessions.splice(0);
        await Promise.all(open.map((s) => s.end().catch(() => {})));
      }
    });

    it("D20: money idempotency across two committed sessions: two claims (one held); two claims past the window on a known retry_wait row (one dead_letter, one closed); a report-path dead-letter racing a claim; two claims parking an expired sending row (one case, one task, one link)", async () => {
      await db.query("BEGIN");
      const fx = await seedTwoTenants(db);
      await db.query("COMMIT");
      try {
        const [held, deadOnClaim, deadOnReport, parkTwice] = await committed(
          async () => {
            const a = await guardIntake(db, fx.A);
            const b = await guardIntake(db, fx.A);
            const c = await guardIntake(db, fx.A, { maxAttempts: 1 });
            const d = await guardIntake(db, fx.A, { maxAttempts: 1 });
            return [a, b, c, d];
          },
        );
        for (const i of [deadOnClaim, deadOnReport, parkTwice]) {
          await db.query("BEGIN");
          await claim(db, i.operationId);
          await db.query("COMMIT");
        }
        await db.query("BEGIN");
        await report(db, deadOnClaim.operationId, 1, notPerformed());
        await makeDue(db, deadOnClaim.operationId);
        await windowEndsIn(db, deadOnClaim.operationId, 60);
        await expireLease(db, parkTwice.operationId);
        await db.query("COMMIT");

        const [c1, c2] = await race(
          claimIn(held.operationId),
          claimIn(held.operationId),
        );
        expect([c1.outcome, c2.outcome, c2.attempt]).toEqual([
          "claimed",
          "held",
          1,
        ]);

        const before = await committedState(fx);
        const [d1, d2] = await race(
          claimIn(deadOnClaim.operationId),
          claimIn(deadOnClaim.operationId),
        );
        expect([d1.outcome, d2.outcome, d2.status]).toEqual([
          "dead_letter",
          "closed",
          "dead_letter",
        ]);
        const afterDead = await committedState(fx);
        expect(afterDead).toEqual({
          ...before,
          tasks: before.tasks + 1,
          links: before.links + 1,
        });

        const [e1, e2] = await race(
          reportIn(deadOnReport.operationId, 1, notPerformed()),
          claimIn(deadOnReport.operationId),
        );
        expect([e1.outcome, e2.outcome, e2.status]).toEqual([
          "dead_letter",
          "closed",
          "dead_letter",
        ]);
        const afterReport = await committedState(fx);
        expect(afterReport).toEqual({
          ...afterDead,
          tasks: afterDead.tasks + 1,
          links: afterDead.links + 1,
        });

        const [p1, p2] = await race(
          claimIn(parkTwice.operationId),
          claimIn(parkTwice.operationId),
        );
        expect([p1.outcome, p2.outcome, p2.case_id]).toEqual([
          "parked",
          "parked",
          p1.case_id,
        ]);
        expect(await committedState(fx)).toEqual({
          tasks: afterReport.tasks + 1,
          links: afterReport.links + 1,
          cases: afterReport.cases + 1,
        });
        await role(db, null);
        const grants = (
          await db.query(
            `SELECT has_table_privilege('tenant_guard', 'public.donations', 'INSERT') AS donations,
                    has_table_privilege('tenant_guard', 'public.donation_saga_outbox', 'INSERT') AS outbox,
                    has_function_privilege('tenant_guard', 'public.normalize_currency_code(text)', 'EXECUTE') AS normalize`,
          )
        ).rows[0];
        expect(grants).toEqual({
          donations: false,
          outbox: false,
          normalize: false,
        });
      } finally {
        await releaseSessionsThenRemove(fx);
      }
    });

    const intakeRow = async (donationId: string) => {
      await role(db, null);
      return (
        await db.query(
          "SELECT ctid::text AS ctid, stripe_payment_intent_id, updated_at FROM public.donations WHERE id = $1",
          [donationId],
        )
      ).rows[0] as Record<string, unknown>;
    };

    it("F2: the report locks the intake row after the request row: while another session holds the intake, the report waits (55P03 under a short lock_timeout); when that session commits another payment reference, the report is 23514 intake_names_another_object", async () => {
      await db.query("BEGIN");
      const fx = await seedTwoTenants(db);
      await db.query("COMMIT");
      let holder: pg.Client | undefined;
      try {
        const intake = await committed(() => guardIntake(db, fx.A));
        await db.query("BEGIN");
        await claim(db, intake.operationId, 900);
        await db.query("COMMIT");
        const [opened, reporter, watcher] = [
          await openSession(),
          await openSession(),
          await openSession(),
        ];
        holder = opened;
        await holder.query("BEGIN");
        await holder.query(
          "SELECT id FROM public.donations WHERE id = $1 FOR NO KEY UPDATE",
          [intake.donationId],
        );
        const object = paymentIntent();
        const call =
          "SELECT public.record_provider_operation_result($1, 1, $2::jsonb) AS r";
        await reporter.query("BEGIN");
        await reporter.query("SET LOCAL lock_timeout = '300ms'");
        await reporter.query("SET LOCAL ROLE service_role");
        const timedOut = await reporter
          .query(call, [intake.operationId, JSON.stringify(succeeded(object))])
          .then(
            () => "no error",
            (e: { code?: string }) => e.code,
          );
        await reporter.query("ROLLBACK");
        expect(timedOut).toBe("55P03");

        const pid = (await reporter.query("SELECT pg_backend_pid() AS pid"))
          .rows[0].pid;
        await reporter.query("BEGIN");
        await reporter.query("SET LOCAL ROLE service_role");
        const pending = reporter
          .query(call, [intake.operationId, JSON.stringify(succeeded(object))])
          .then(
            () => "no error",
            (e: { code?: string; message?: string }) =>
              `${e.code} ${e.message}`,
          );
        for (let i = 0; i < 200; i += 1) {
          const r = await watcher.query(
            "SELECT wait_event_type FROM pg_stat_activity WHERE pid = $1",
            [pid],
          );
          if (r.rows[0]?.wait_event_type === "Lock") break;
          if (i === 199)
            throw new Error("the report never waited on the intake");
          await new Promise((done) => setTimeout(done, 50));
        }
        const requestRowLock = await watcher
          .query(
            "SELECT id FROM public.donation_saga_outbox WHERE id = $1 FOR UPDATE NOWAIT",
            [intake.operationId],
          )
          .then(
            () => "no error",
            (e: { code?: string }) => e.code,
          );
        expect(requestRowLock).toBe("55P03");
        const other = paymentIntent();
        await holder.query(
          "UPDATE public.donations SET stripe_payment_intent_id = $2 WHERE id = $1",
          [intake.donationId, other],
        );
        await holder.query("COMMIT");
        expect(await pending).toBe("23514 intake_names_another_object");
        await reporter.query("ROLLBACK");
        await role(db, null);
        expect(
          (await intakeRow(intake.donationId)).stripe_payment_intent_id,
        ).toBe(other);
        expect((await rowOf(db, intake.operationId)).status).toBe("sending");
      } finally {
        await holder?.query("ROLLBACK").catch(() => {});
        await releaseSessionsThenRemove(fx);
      }
    });
  },
);
