import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  PROVIDER_STATUSES,
  attempt,
  auditOf,
  casesOf,
  claim,
  enterAs,
  expireLease,
  guardIntake,
  guardUpdate,
  inTx,
  keysOf,
  makeDue,
  paymentIntent,
  refusal,
  removeTwoTenants,
  report,
  resolveCase,
  role,
  rowOf,
  seedTwoTenants,
  tasksOf,
  tryClaim,
  tryReport,
  windowEndsIn,
  type Fixture,
  type Intake,
  type Outcome,
  type ProviderStatus,
} from "./wp8a-p2r1a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const unknown = (delay = 30) => ({
  result: "unknown",
  retry_delay_seconds: delay,
});
const notPerformed = (delay = 30) => ({
  result: "not_performed",
  retry_delay_seconds: delay,
});
const succeeded = (object = paymentIntent()) => ({
  result: "succeeded",
  provider_object_id: object,
});

const DEAD_LETTER_LINK = (operationId: string) => ({
  issue_type: "provider_request_dead_letter",
  urgency: "high",
  source_module: "payments",
  record_type: "donation_saga_outbox",
  record_id: operationId,
  relationship: "provider_request_dead_letter",
});
const PARKED_LINK = (caseId: string) => ({
  issue_type: "provider_request_parked",
  urgency: "high",
  source_module: "payments",
  record_type: "payment_repair_case",
  record_id: caseId,
  relationship: "provider_request_parked",
});

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R1a: the provider-request machine (real stack; rolls back, except the two-session races, which commit and remove their own tenants)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const sessions: pg.Client[] = [];
    beforeAll(() => db.connect());
    afterAll(async () => {
      for (const s of sessions) await s.end().catch(() => {});
      await db.end();
    });

    const verdict = (a: { ok: boolean }) =>
      a.ok ? "ok" : refusal(a as Parameters<typeof refusal>[0]);

    async function retried(
      intake: Intake,
      outcome: object,
      attemptNumber: number,
    ) {
      expect(
        await report(db, intake.operationId, attemptNumber, outcome),
      ).toMatchObject({
        outcome: "retry_scheduled",
        attempt: attemptNumber,
      });
      await makeDue(db, intake.operationId);
    }

    it("D14 (plan :1154): a definite not_performed up to max_attempts dead-letters on the final report with one task and one link in that transaction, none in the other tenant; a further claim is closed and adds nothing", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A, { maxAttempts: 3 });
        for (const n of [1, 2]) {
          expect(await claim(db, intake.operationId)).toMatchObject({
            outcome: "claimed",
            attempt: n,
          });
          await retried(intake, notPerformed(), n);
        }
        expect(await claim(db, intake.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 3,
        });
        expect(await tasksOf(db, fx.A.tenant)).toEqual([]);
        await role(db, null);
        await db.query("SAVEPOINT d14");
        const final = await report(db, intake.operationId, 3, notPerformed());
        expect(final).toMatchObject({ outcome: "dead_letter", attempt: 3 });
        expect(await tasksOf(db, fx.A.tenant)).toEqual([
          DEAD_LETTER_LINK(intake.operationId),
        ]);
        await db.query("ROLLBACK TO SAVEPOINT d14");
        expect(await tasksOf(db, fx.A.tenant)).toEqual([]);
        expect(
          await report(db, intake.operationId, 3, notPerformed()),
        ).toMatchObject({
          outcome: "dead_letter",
        });
        const row = await rowOf(db, intake.operationId);
        expect([row.status, row.outcome_unknown, row.lease_expires_at]).toEqual(
          ["dead_letter", false, null],
        );
        expect(await casesOf(db, intake.operationId)).toEqual([]);
        expect(await tasksOf(db, fx.A.tenant)).toEqual([
          DEAD_LETTER_LINK(intake.operationId),
        ]);
        expect(await tasksOf(db, fx.B.tenant)).toEqual([]);
        expect(await claim(db, intake.operationId)).toEqual({
          outcome: "closed",
          operation_id: intake.operationId,
          tenant_id: fx.A.tenant,
          status: "dead_letter",
        });
        expect(await tasksOf(db, fx.A.tenant)).toHaveLength(1);
      }));

    it("D14 (plan :1154): a known retry_wait request claimed past its window dead-letters on the claim (row 7) with one task and one link, none in the other tenant; a further claim is closed", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        expect(await claim(db, intake.operationId)).toMatchObject({
          outcome: "claimed",
        });
        await retried(intake, notPerformed(), 1);
        await windowEndsIn(db, intake.operationId, 60);
        const before = await rowOf(db, intake.operationId);
        const dead = await claim(db, intake.operationId, 300);
        expect(dead).toMatchObject({ outcome: "dead_letter" });
        const row = await rowOf(db, intake.operationId);
        expect([row.status, row.outcome_unknown, row.attempt_count]).toEqual([
          "dead_letter",
          false,
          before.attempt_count,
        ]);
        expect(await casesOf(db, intake.operationId)).toEqual([]);
        expect(await tasksOf(db, fx.A.tenant)).toEqual([
          DEAD_LETTER_LINK(intake.operationId),
        ]);
        expect(await tasksOf(db, fx.B.tenant)).toEqual([]);
        expect(await claim(db, intake.operationId)).toMatchObject({
          outcome: "closed",
          status: "dead_letter",
        });
        expect(await tasksOf(db, fx.A.tenant)).toHaveLength(1);
      }));

    it("D15 (plan :1173): on a request parked on its budget, parked -> retry_wait past the deadline is 23514 provider_request_retry_outside_window and a claim sends nothing; before the deadline the same move is accepted", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const before = await guardIntake(db, fx.A, { maxAttempts: 1 });
        const after = await guardIntake(db, fx.A, { maxAttempts: 1 });
        for (const i of [before, after]) {
          expect(await claim(db, i.operationId)).toMatchObject({
            outcome: "claimed",
          });
          expect(await report(db, i.operationId, 1, unknown())).toMatchObject({
            outcome: "parked",
          });
          expect((await auditOf(db, i.operationId))[0]?.details).toMatchObject({
            reason: "attempts_exhausted",
          });
        }
        await windowEndsIn(db, after.operationId, -1);
        const retryNow =
          "UPDATE public.donation_saga_outbox SET status = 'retry_wait', next_attempt_at = clock_timestamp() WHERE id = $1";
        const late = await guardUpdate(db, fx.A.tenant, retryNow, [
          after.operationId,
        ]);
        expect(refusal(late)).toBe(
          "23514 provider_request_retry_outside_window",
        );
        const stillParked = await rowOf(db, after.operationId);
        expect(await claim(db, after.operationId)).toMatchObject({
          outcome: "parked",
        });
        expect(await rowOf(db, after.operationId)).toEqual(stillParked);
        const inTime = await guardUpdate(db, fx.A.tenant, retryNow, [
          before.operationId,
        ]);
        expect(inTime.ok, refusal(inTime)).toBe(true);
        const row = await rowOf(db, before.operationId);
        expect([row.status, row.parked_at, row.outcome_unknown]).toEqual([
          "retry_wait",
          null,
          true,
        ]);
      }));

    it("D16: a reclaim after an expired lease is attempt 2 with the outcome unknown; the attempt-1 report is 55000 stale_attempt; a report after its own lease expired, before any reclaim, is 55000 lease_lost", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        expect(await claim(db, intake.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 1,
        });
        await expireLease(db, intake.operationId);
        expect(await claim(db, intake.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 2,
        });
        expect((await rowOf(db, intake.operationId)).outcome_unknown).toBe(
          true,
        );
        expect(
          refusal(await tryReport(db, intake.operationId, 1, succeeded())),
        ).toBe("55000 stale_attempt");
        const lone = await guardIntake(db, fx.A);
        expect(await claim(db, lone.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 1,
        });
        await expireLease(db, lone.operationId);
        expect(
          refusal(await tryReport(db, lone.operationId, 1, succeeded())),
        ).toBe("55000 lease_lost");
      }));

    it("D17 (Q3): unknown, then not_performed to the budget, parks with one case; attempt 1 not_performed and attempt 2 dying at max_attempts 2 parks on the reclaim, never dead-letters", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const first = await guardIntake(db, fx.A, { maxAttempts: 3 });
        expect(await claim(db, first.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 1,
        });
        await retried(first, unknown(), 1);
        expect(await claim(db, first.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 2,
        });
        await retried(first, notPerformed(), 2);
        expect((await rowOf(db, first.operationId)).outcome_unknown).toBe(true);
        expect(await claim(db, first.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 3,
        });
        const parked = await report(db, first.operationId, 3, notPerformed());
        expect(parked).toMatchObject({ outcome: "parked", attempt: 3 });
        expect((await casesOf(db, first.operationId)).map((c) => c.id)).toEqual(
          [parked.case_id],
        );

        const second = await guardIntake(db, fx.A, { maxAttempts: 2 });
        expect(await claim(db, second.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 1,
        });
        await retried(second, notPerformed(), 1);
        expect((await rowOf(db, second.operationId)).outcome_unknown).toBe(
          false,
        );
        expect(await claim(db, second.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 2,
        });
        await expireLease(db, second.operationId);
        const reclaimed = await claim(db, second.operationId);
        expect(reclaimed).toMatchObject({ outcome: "parked" });
        const row = await rowOf(db, second.operationId);
        expect([row.status, row.outcome_unknown, row.attempt_count]).toEqual([
          "parked",
          true,
          2,
        ]);
        expect(
          (await casesOf(db, second.operationId)).map((c) => c.id),
        ).toEqual([reclaimed.case_id]);
        expect(
          (await tasksOf(db, fx.A.tenant)).map((t) => t.relationship),
        ).toEqual(["provider_request_parked", "provider_request_parked"]);
      }));

    it("D18 (Q5): past the window on a restricted binding a sent request parks (K5 before K6); within it the claim is binding_inactive and writes nothing", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        expect(await claim(db, intake.operationId)).toMatchObject({
          outcome: "claimed",
        });
        await retried(intake, unknown(), 1);
        await role(db, null);
        await db.query(
          "UPDATE public.payment_account_bindings SET status = 'restricted', restricted_at = now() WHERE id = $1",
          [fx.A.binding],
        );
        const before = await rowOf(db, intake.operationId);
        expect(await claim(db, intake.operationId)).toEqual({
          outcome: "binding_inactive",
          operation_id: intake.operationId,
          tenant_id: fx.A.tenant,
          binding_status: "restricted",
        });
        expect(await rowOf(db, intake.operationId)).toEqual(before);
        expect(await casesOf(db, intake.operationId)).toEqual([]);
        expect(await tasksOf(db, fx.A.tenant)).toEqual([]);
        const queued = await guardIntake(db, fx.A);
        expect(await claim(db, queued.operationId)).toMatchObject({
          outcome: "binding_inactive",
          binding_status: "restricted",
        });
        expect((await rowOf(db, queued.operationId)).status).toBe("queued");
        await windowEndsIn(db, intake.operationId, 60);
        const parked = await claim(db, intake.operationId, 300);
        expect(parked).toMatchObject({ outcome: "parked" });
        expect(await tasksOf(db, fx.A.tenant)).toEqual([
          PARKED_LINK(parked.case_id as string),
        ]);
      }));

    it("D19: rows 1-19 of section 3.3, once each, store and return what the table says; every other move is 23514 provider_request_bad_move", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const t = fx.A.tenant;
        const rows: Record<number, unknown> = {};

        const r1 = await guardIntake(db, fx.A);
        const stored1 = await rowOf(db, r1.operationId);
        rows[1] = [
          stored1.status,
          stored1.attempt_count,
          stored1.outcome_unknown,
          stored1.first_sent_at,
          stored1.max_attempts,
        ];

        const r9 = await claim(db, r1.operationId, 120);
        const stored9 = await rowOf(db, r1.operationId);
        rows[9] = [
          r9.outcome,
          r9.attempt,
          stored9.status,
          stored9.attempt_count,
          (stored9.send_deadline as Date).getTime() -
            (stored9.first_sent_at as Date).getTime(),
          (stored9.lease_expires_at as Date).toISOString() ===
            new Date(r9.lease_expires_at as string).toISOString(),
        ];

        rows[4] = (await claim(db, r1.operationId)).outcome;

        const object = paymentIntent();
        const r11 = await report(db, r1.operationId, 1, succeeded(object));
        await role(db, null);
        const intakeRef = (
          await db.query(
            "SELECT stripe_payment_intent_id FROM public.donations WHERE id = $1",
            [r1.donationId],
          )
        ).rows[0].stripe_payment_intent_id;
        const stored11 = await rowOf(db, r1.operationId);
        rows[11] = [
          r11.outcome,
          stored11.status,
          stored11.provider_object_id,
          stored11.lease_expires_at,
          intakeRef === object,
        ];
        rows[10] = (
          await report(db, r1.operationId, 1, succeeded(object))
        ).outcome;
        rows[2] = (await claim(db, r1.operationId)).status;

        const r12 = await guardIntake(db, fx.A);
        await claim(db, r12.operationId);
        const refused = await report(db, r12.operationId, 1, {
          result: "refused",
          error_code: "card_declined",
        });
        const stored12 = await rowOf(db, r12.operationId);
        rows[12] = [
          refused.outcome,
          stored12.status,
          stored12.outcome_unknown,
          stored12.last_error_code,
        ];

        const r13 = await guardIntake(db, fx.A);
        await claim(db, r13.operationId);
        const scheduled = await report(db, r13.operationId, 1, {
          ...unknown(60),
          error_code: "timeout",
        });
        const stored13 = await rowOf(db, r13.operationId);
        rows[13] = [
          scheduled.outcome,
          stored13.status,
          stored13.outcome_unknown,
          stored13.last_error_code,
          new Date(scheduled.next_attempt_at as string).getTime() ===
            (stored13.next_attempt_at as Date).getTime(),
        ];
        rows[5] = (await claim(db, r13.operationId)).outcome;

        const r6 = await guardIntake(db, fx.A);
        await claim(db, r6.operationId);
        await expireLease(db, r6.operationId);
        await windowEndsIn(db, r6.operationId, -1);
        const r6parked = await claim(db, r6.operationId);
        const stored6 = await rowOf(db, r6.operationId);
        rows[6] = [
          r6parked.outcome,
          stored6.status,
          stored6.outcome_unknown,
          stored6.parked_at instanceof Date,
          stored6.lease_expires_at,
          (await casesOf(db, r6.operationId)).length,
          (await auditOf(db, r6.operationId)).map((a) => a.action),
        ];
        rows[3] =
          (await claim(db, r6.operationId)).case_id === r6parked.case_id;

        const r7 = await guardIntake(db, fx.A);
        await claim(db, r7.operationId);
        await retried(r7, notPerformed(), 1);
        await windowEndsIn(db, r7.operationId, 30);
        rows[7] = (await claim(db, r7.operationId)).outcome;

        const r8 = await guardIntake(db, fx.B);
        await role(db, null);
        await db.query(
          "UPDATE public.payment_account_bindings SET status = 'pending' WHERE id = $1",
          [fx.B.binding],
        );
        rows[8] = (await claim(db, r8.operationId)).outcome;

        const r14 = await guardIntake(db, fx.A, { maxAttempts: 1 });
        await claim(db, r14.operationId);
        const parked14 = await report(db, r14.operationId, 1, {
          ...notPerformed(),
          error_code: "network_lost",
        });
        expect(parked14.outcome).toBe("dead_letter");
        const r14b = await guardIntake(db, fx.A, { maxAttempts: 1 });
        await claim(db, r14b.operationId);
        const parked14b = await report(db, r14b.operationId, 1, {
          ...unknown(),
          error_code: "network_lost",
        });
        const stored14 = await rowOf(db, r14b.operationId);
        rows[14] = [
          parked14b.outcome,
          stored14.status,
          stored14.outcome_unknown,
          stored14.last_error_code,
          stored14.parked_at instanceof Date,
        ];
        rows[15] = [
          parked14.outcome,
          (await rowOf(db, r14.operationId)).last_error_code,
        ];

        const r16 = await guardIntake(db, fx.A);
        rows[16] =
          verdict(
            await guardUpdate(
              db,
              t,
              "UPDATE public.donation_saga_outbox SET status = 'abandoned' WHERE id = $1",
              [r16.operationId],
            ),
          ) + ` ${(await rowOf(db, r16.operationId)).status}`;

        const parkedRow = async () => {
          const p = await guardIntake(db, fx.A, { maxAttempts: 1 });
          await claim(db, p.operationId);
          const out = await report(db, p.operationId, 1, unknown());
          return { ...p, caseId: out.case_id as string };
        };
        const p17 = await parkedRow();
        const adopted = await guardUpdate(
          db,
          t,
          "UPDATE public.donation_saga_outbox SET status = 'adopted', provider_object_id = $2, outcome_unknown = false WHERE id = $1",
          [p17.operationId, paymentIntent()],
        );
        await resolveCase(db, p17.caseId, "adopted");
        const s17 = await rowOf(db, p17.operationId);
        rows[17] = [
          verdict(adopted),
          s17.status,
          s17.outcome_unknown,
          s17.parked_at instanceof Date,
          (await casesOf(db, p17.operationId))[0]?.resolution,
        ];

        const p18 = await parkedRow();
        const abandoned = await guardUpdate(
          db,
          t,
          "UPDATE public.donation_saga_outbox SET status = 'abandoned', outcome_unknown = false WHERE id = $1",
          [p18.operationId],
        );
        await resolveCase(db, p18.caseId, "abandoned");
        const s18 = await rowOf(db, p18.operationId);
        rows[18] = [
          verdict(abandoned),
          s18.status,
          s18.parked_at instanceof Date,
          (await casesOf(db, p18.operationId))[0]?.resolution,
        ];

        const p19 = await parkedRow();
        const back = await guardUpdate(
          db,
          t,
          "UPDATE public.donation_saga_outbox SET status = 'retry_wait', next_attempt_at = clock_timestamp() WHERE id = $1",
          [p19.operationId],
        );
        await resolveCase(db, p19.caseId, "retried");
        const s19 = await rowOf(db, p19.operationId);
        rows[19] = [
          verdict(back),
          s19.status,
          s19.parked_at,
          s19.outcome_unknown,
          (await casesOf(db, p19.operationId))[0]?.resolution,
        ];

        expect(rows).toEqual({
          1: ["queued", 0, false, null, 5],
          2: "linked",
          3: true,
          4: "held",
          5: "not_due",
          6: [
            "parked",
            "parked",
            true,
            true,
            null,
            1,
            ["provider_request_parked"],
          ],
          7: "dead_letter",
          8: "binding_inactive",
          9: ["claimed", 1, "sending", 1, 23 * 3600 * 1000, true],
          10: "already_linked",
          11: ["linked", "linked", object, null, true],
          12: ["refused", "refused", false, "card_declined"],
          13: ["retry_scheduled", "retry_wait", true, "timeout", true],
          14: ["parked", "parked", true, "network_lost", true],
          15: ["dead_letter", "network_lost"],
          16: "ok abandoned",
          17: ["ok", "adopted", false, true, "adopted"],
          18: ["ok", "abandoned", true, "abandoned"],
          19: ["ok", "retry_wait", null, true, "retried"],
        });

        const edges = new Set([
          "sending>linked",
          "sending>refused",
          "sending>retry_wait",
          "sending>parked",
          "sending>dead_letter",
          "retry_wait>parked",
          "retry_wait>dead_letter",
          "queued>abandoned",
          "parked>adopted",
          "parked>abandoned",
          "parked>retry_wait",
        ]);
        const inStatus: Record<ProviderStatus, string> = {
          queued: (await guardIntake(db, fx.A)).operationId,
          sending: await (async () => {
            const s = await guardIntake(db, fx.A);
            await claim(db, s.operationId);
            return s.operationId;
          })(),
          retry_wait: r13.operationId,
          parked: r6.operationId,
          linked: r1.operationId,
          refused: r12.operationId,
          dead_letter: r7.operationId,
          adopted: p17.operationId,
          abandoned: r16.operationId,
        };
        const others: string[] = [];
        const expected: string[] = [];
        for (const from of PROVIDER_STATUSES)
          for (const to of PROVIDER_STATUSES) {
            if (edges.has(`${from}>${to}`)) continue;
            const r = await guardUpdate(
              db,
              t,
              "UPDATE public.donation_saga_outbox SET status = $2 WHERE id = $1",
              [inStatus[from], to],
            );
            others.push(`${from}>${to}: ${refusal(r)}`);
            expected.push(`${from}>${to}: 23514 provider_request_bad_move`);
          }
        expect(others).toHaveLength(81 - edges.size);
        expect(others).toEqual(expected);
      }));

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
      const pending = second(s2);
      for (let i = 0; i < 200; i += 1) {
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
      const out2 = await pending;
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

    it("D21 (Q-A): a refused report ends refused and known, with the given error code or 'refused', no task, no case and the intake untouched; a later claim is closed", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const plain = await guardIntake(db, fx.A);
        const wasUnknown = await guardIntake(db, fx.A);
        await claim(db, plain.operationId);
        await claim(db, wasUnknown.operationId);
        await retried(wasUnknown, unknown(), 1);
        await claim(db, wasUnknown.operationId);
        await role(db, null);
        const intakes = async () =>
          (
            await db.query(
              "SELECT * FROM public.donations WHERE id = ANY($1::uuid[]) ORDER BY id",
              [[plain.donationId, wasUnknown.donationId]],
            )
          ).rows;
        const before = await intakes();
        expect(
          await report(db, plain.operationId, 1, { result: "refused" }),
        ).toEqual({
          outcome: "refused",
          operation_id: plain.operationId,
          tenant_id: fx.A.tenant,
          attempt: 1,
        });
        expect(
          await report(db, wasUnknown.operationId, 2, {
            result: "refused",
            error_code: "do_not_honor",
          }),
        ).toMatchObject({ outcome: "refused", attempt: 2 });
        const got = [
          await rowOf(db, plain.operationId),
          await rowOf(db, wasUnknown.operationId),
        ].map((r) => [
          r.status,
          r.outcome_unknown,
          r.last_error_code,
          r.lease_expires_at,
        ]);
        expect(got).toEqual([
          ["refused", false, "refused", null],
          ["refused", false, "do_not_honor", null],
        ]);
        expect(await intakes()).toEqual(before);
        expect(await tasksOf(db, fx.A.tenant)).toEqual([]);
        expect([
          ...(await casesOf(db, plain.operationId)),
          ...(await casesOf(db, wasUnknown.operationId)),
        ]).toEqual([]);
        expect(await claim(db, plain.operationId)).toMatchObject({
          outcome: "closed",
          status: "refused",
        });
      }));

    it("D22 (Q-B): retry_delay_seconds 29, 3,601, missing with not_performed or present with succeeded is 22023 bad_result; a delay leaving under 900 seconds before the deadline does not fit (rows 14 and 15); a report at max_attempts never schedules a retry", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        await claim(db, intake.operationId);
        const breaches = [
          notPerformed(29),
          notPerformed(3601),
          { result: "not_performed" },
          { ...succeeded(), retry_delay_seconds: 60 },
        ];
        const got: string[] = [];
        for (const b of breaches)
          got.push(refusal(await tryReport(db, intake.operationId, 1, b)));
        expect(got).toEqual(breaches.map(() => "22023 bad_result"));
        for (const delay of [30, 3600]) {
          await role(db, null);
          await db.query("SAVEPOINT d22");
          expect(
            await report(db, intake.operationId, 1, notPerformed(delay)),
          ).toMatchObject({ outcome: "retry_scheduled" });
          await db.query("ROLLBACK TO SAVEPOINT d22");
        }
        await windowEndsIn(db, intake.operationId, 2000);
        await role(db, null);
        await db.query("SAVEPOINT d22");
        expect(
          await report(db, intake.operationId, 1, notPerformed(1101)),
        ).toMatchObject({ outcome: "dead_letter" });
        await db.query("ROLLBACK TO SAVEPOINT d22");
        expect(
          await report(db, intake.operationId, 1, unknown(1101)),
        ).toMatchObject({ outcome: "parked" });
        const fits = await guardIntake(db, fx.A);
        await claim(db, fits.operationId);
        await windowEndsIn(db, fits.operationId, 2000);
        expect(
          await report(db, fits.operationId, 1, notPerformed(1000)),
        ).toMatchObject({ outcome: "retry_scheduled" });
        const spent = await guardIntake(db, fx.A, { maxAttempts: 1 });
        await claim(db, spent.operationId);
        await role(db, null);
        await db.query("SAVEPOINT d22");
        expect(
          await report(db, spent.operationId, 1, notPerformed(30)),
        ).toMatchObject({ outcome: "dead_letter" });
        await db.query("ROLLBACK TO SAVEPOINT d22");
        expect(
          await report(db, spent.operationId, 1, unknown(30)),
        ).toMatchObject({ outcome: "parked" });
      }));

    it("D23 (U6): with the lease expired, a guard move out of sending to retry_wait, refused or dead_letter is 55000 provider_request_lease_expired; to parked or linked it is accepted", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const moves: [string, string][] = [
          [
            "retry_wait",
            "status = 'retry_wait', next_attempt_at = clock_timestamp() + interval '60 seconds', lease_expires_at = NULL",
          ],
          ["refused", "status = 'refused', lease_expires_at = NULL"],
          ["dead_letter", "status = 'dead_letter', lease_expires_at = NULL"],
          [
            "parked",
            "status = 'parked', outcome_unknown = true, lease_expires_at = NULL",
          ],
          [
            "linked",
            `status = 'linked', provider_object_id = '${paymentIntent()}', lease_expires_at = NULL`,
          ],
        ];
        const got: string[] = [];
        for (const [to, assignments] of moves) {
          const i = await guardIntake(db, fx.A);
          await claim(db, i.operationId);
          await expireLease(db, i.operationId);
          const r = await guardUpdate(
            db,
            fx.A.tenant,
            `UPDATE public.donation_saga_outbox SET ${assignments} WHERE id = $1`,
            [i.operationId],
          );
          got.push(
            `${to}: ${r.ok ? `ok ${(await rowOf(db, i.operationId)).status}` : refusal(r)}`,
          );
        }
        expect(got).toEqual([
          "retry_wait: 55000 provider_request_lease_expired",
          "refused: 55000 provider_request_lease_expired",
          "dead_letter: 55000 provider_request_lease_expired",
          "parked: ok parked",
          "linked: ok linked",
        ]);
      }));

    it("D24: each claim and report outcome carries exactly its keys (livemode and provider_account on claimed); each p_result breach and an out-of-range lease is 22023; the wrapper answers unknown_anchor", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const base = ["operation_id", "outcome", "tenant_id"];
        const keys: Record<string, string[]> = {};
        const types: Record<string, unknown> = {};

        const a = await guardIntake(db, fx.A);
        const claimed = await claim(db, a.operationId, 90);
        keys.claimed = keysOf(claimed);
        await role(db, null);
        const stored = (
          await db.query(
            "SELECT request_params, request_digest, idempotency_key FROM public.donation_saga_outbox WHERE id = $1",
            [a.operationId],
          )
        ).rows[0];
        types.claimed = [
          typeof claimed.lease_expires_at,
          typeof claimed.send_deadline,
          claimed.livemode,
          claimed.provider_account,
          claimed.request_kind,
          JSON.stringify(claimed.request) ===
            JSON.stringify(stored.request_params),
          claimed.request_digest === stored.request_digest,
          claimed.idempotency_key,
        ];
        keys.held = keysOf(await claim(db, a.operationId));
        const object = paymentIntent();
        keys.linked = keysOf(
          await report(db, a.operationId, 1, succeeded(object)),
        );
        keys.already_linked = keysOf(
          await report(db, a.operationId, 1, succeeded(object)),
        );
        keys.closed = keysOf(await claim(db, a.operationId));

        const b = await guardIntake(db, fx.A);
        await claim(db, b.operationId);
        const scheduled = await report(db, b.operationId, 1, unknown());
        keys.retry_scheduled = keysOf(scheduled);
        types.retry_scheduled = typeof scheduled.next_attempt_at;
        keys.not_due = keysOf(await claim(db, b.operationId));

        const c = await guardIntake(db, fx.A);
        await claim(db, c.operationId);
        keys.refused = keysOf(
          await report(db, c.operationId, 1, { result: "refused" }),
        );

        const d = await guardIntake(db, fx.A, { maxAttempts: 1 });
        await claim(db, d.operationId);
        keys.report_parked = keysOf(
          await report(db, d.operationId, 1, unknown()),
        );
        keys.claim_parked = keysOf(await claim(db, d.operationId));

        const e = await guardIntake(db, fx.A, { maxAttempts: 1 });
        await claim(db, e.operationId);
        keys.report_dead_letter = keysOf(
          await report(db, e.operationId, 1, notPerformed()),
        );

        const f = await guardIntake(db, fx.A);
        await claim(db, f.operationId);
        await retried(f, notPerformed(), 1);
        await windowEndsIn(db, f.operationId, 30);
        keys.claim_dead_letter = keysOf(await claim(db, f.operationId));

        const g = await guardIntake(db, fx.B);
        await role(db, null);
        await db.query(
          "UPDATE public.payment_account_bindings SET status = 'disconnected', disconnected_at = now() WHERE id = $1",
          [fx.B.binding],
        );
        keys.binding_inactive = keysOf(await claim(db, g.operationId));

        const unknownAnchor = await claim(db, randomUUID());
        keys.unknown_anchor = keysOf(unknownAnchor);
        await role(db, "service_role");
        keys.report_unknown_anchor = keysOf(
          (
            await db.query(
              'SELECT public.record_provider_operation_result($1, 1, \'{"result":"refused"}\'::jsonb) AS r',
              [randomUUID()],
            )
          ).rows[0].r,
        );
        await role(db, null);

        const k = (...extra: string[]) => [...base, ...extra].sort();
        expect(keys).toEqual({
          claimed: k(
            "attempt",
            "idempotency_key",
            "lease_expires_at",
            "livemode",
            "provider_account",
            "request",
            "request_digest",
            "request_kind",
            "send_deadline",
          ),
          held: k("attempt", "lease_expires_at"),
          linked: k("attempt", "donation_id", "provider_object_id"),
          already_linked: k("attempt", "provider_object_id"),
          closed: k("status"),
          retry_scheduled: k("attempt", "next_attempt_at"),
          not_due: k("next_attempt_at"),
          refused: k("attempt"),
          report_parked: k("attempt", "case_id"),
          claim_parked: k("case_id"),
          report_dead_letter: k("attempt", "task_id"),
          claim_dead_letter: k("task_id"),
          binding_inactive: k("binding_status"),
          unknown_anchor: ["operation_id", "outcome"],
          report_unknown_anchor: ["operation_id", "outcome"],
        });
        expect(types).toEqual({
          claimed: [
            "string",
            "string",
            false,
            fx.A.account,
            "create_payment",
            true,
            true,
            `gift:${a.donationId}:create_payment`,
          ],
          retry_scheduled: "string",
        });

        const h = await guardIntake(db, fx.A);
        await claim(db, h.operationId);
        const breaches: unknown[] = [
          null,
          "succeeded",
          [],
          {},
          { result: "maybe" },
          { result: 1 },
          { result: "succeeded" },
          { result: "succeeded", provider_object_id: "ch_123" },
          { result: "succeeded", provider_object_id: "pi_123 " },
          { result: "refused", provider_object_id: "pi_123" },
          { result: "unknown" },
          { result: "refused", retry_delay_seconds: 30 },
          { result: "unknown", retry_delay_seconds: 30.5 },
          { result: "unknown", retry_delay_seconds: "30" },
          {
            result: "succeeded",
            provider_object_id: "pi_123",
            error_code: "x",
          },
          { result: "refused", error_code: "Card_declined" },
          { result: "refused", error_code: `a${"b".repeat(64)}` },
          { result: "refused", error_code: 7 },
          { result: "refused", extra: true },
        ];
        const got: string[] = [];
        for (const breach of breaches)
          got.push(refusal(await tryReport(db, h.operationId, 1, breach)));
        expect(got).toEqual(breaches.map(() => "22023 bad_result"));
        const leases: string[] = [];
        for (const lease of [4, 901, null])
          leases.push(refusal(await tryClaim(db, h.operationId, lease)));
        expect(leases).toEqual([
          "22023 lease_out_of_range",
          "22023 lease_out_of_range",
          "22023 lease_out_of_range",
        ]);
        expect(await claim(db, h.operationId, 5)).toMatchObject({
          outcome: "held",
        });
        await expireLease(db, h.operationId);
        expect(await claim(db, h.operationId, 900)).toMatchObject({
          outcome: "claimed",
          attempt: 2,
        });
      }));

    const intakeRow = async (donationId: string) => {
      await role(db, null);
      return (
        await db.query(
          "SELECT ctid::text AS ctid, stripe_payment_intent_id, updated_at FROM public.donations WHERE id = $1",
          [donationId],
        )
      ).rows[0] as Record<string, unknown>;
    };
    const auditCount = async (tenantId: string) => {
      await role(db, null);
      return (
        await db.query(
          "SELECT count(*)::int AS n FROM public.audit_logs WHERE tenant_id = $1",
          [tenantId],
        )
      ).rows[0].n as number;
    };
    const parkedTaskText = async (caseId: string) => {
      await role(db, null);
      return (
        await db.query(
          `SELECT t.description FROM public.mission_control_tasks AS t
             JOIN public.mission_control_task_links AS l ON l.task_id = t.id AND l.tenant_id = t.tenant_id
            WHERE l.record_type = 'payment_repair_case' AND l.record_id = $1`,
          [caseId],
        )
      ).rows[0]?.description as string;
    };

    it("F1.1 (guard): transition 11 with an intake that already names another object is 23514 intake_names_another_object, leaving the request sending with its lease, the intake on its reference and no audit row; an intake that already names the same object links and its row is not written again", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const other = await guardIntake(db, fx.A);
        const same = await guardIntake(db, fx.A);
        for (const i of [other, same])
          expect(await claim(db, i.operationId)).toMatchObject({
            outcome: "claimed",
            attempt: 1,
          });
        const existing = paymentIntent();
        const sameObject = paymentIntent();
        await role(db, null);
        await db.query(
          "UPDATE public.donations SET stripe_payment_intent_id = $2 WHERE id = $1",
          [other.donationId, existing],
        );
        await db.query(
          "UPDATE public.donations SET stripe_payment_intent_id = $2 WHERE id = $1",
          [same.donationId, sameObject],
        );
        const requestBefore = await rowOf(db, other.operationId);
        const intakeBefore = await intakeRow(other.donationId);
        const auditsBefore = await auditCount(fx.A.tenant);
        const mismatch = await tryReport(
          db,
          other.operationId,
          1,
          succeeded(paymentIntent()),
        );
        expect(refusal(mismatch)).toBe("23514 intake_names_another_object");
        const requestAfter = await rowOf(db, other.operationId);
        expect(requestAfter).toEqual(requestBefore);
        expect([requestAfter.status, requestAfter.lease_expires_at]).toEqual([
          "sending",
          requestBefore.lease_expires_at,
        ]);
        expect(await intakeRow(other.donationId)).toEqual(intakeBefore);
        expect(
          (await intakeRow(other.donationId)).stripe_payment_intent_id,
        ).toBe(existing);
        expect(await auditCount(fx.A.tenant)).toBe(auditsBefore);

        const sameBefore = await intakeRow(same.donationId);
        expect(
          await report(db, same.operationId, 1, succeeded(sameObject)),
        ).toEqual({
          outcome: "linked",
          operation_id: same.operationId,
          tenant_id: fx.A.tenant,
          attempt: 1,
          provider_object_id: sameObject,
          donation_id: same.donationId,
        });
        expect(await intakeRow(same.donationId)).toEqual(sameBefore);
        expect((await rowOf(db, same.operationId)).status).toBe("linked");
      }));

    it("F1.2 (guard): tenant_guard.money_park_operation on a queued, parked or linked request, or on an id that does not exist, is 55000 not_parkable", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const queued = await guardIntake(db, fx.A);
        const parked = await guardIntake(db, fx.A, { maxAttempts: 1 });
        await claim(db, parked.operationId);
        expect(
          await report(db, parked.operationId, 1, unknown()),
        ).toMatchObject({
          outcome: "parked",
        });
        const linked = await guardIntake(db, fx.A);
        await claim(db, linked.operationId);
        expect(
          await report(db, linked.operationId, 1, succeeded()),
        ).toMatchObject({
          outcome: "linked",
        });
        const got: string[] = [];
        for (const [label, id] of [
          ["queued", queued.operationId],
          ["parked", parked.operationId],
          ["linked", linked.operationId],
          ["missing", randomUUID()],
        ] as const) {
          await enterAs(db, "tenant_guard", fx.A.tenant);
          const r = await attempt(
            db,
            "SELECT tenant_guard.money_park_operation($1, 'window_passed', NULL)",
            [id],
          );
          await role(db, null);
          got.push(`${label}: ${refusal(r)}`);
        }
        expect(got).toEqual([
          "queued: 55000 not_parkable",
          "parked: 55000 not_parkable",
          "linked: 55000 not_parkable",
          "missing: 55000 not_parkable",
        ]);
        expect((await casesOf(db, parked.operationId)).length).toBe(1);
      }));

    it("F1.3 (guard): parked, retried inside the window (row 19) and parked again holds two cases (one resolved, one open), two tasks and two links; a duplicate parked link and a duplicate dead-letter link are 23505 on mission_control_task_links_provider_request_key (the links are inserted as the owner, which needs no grant)", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A, { maxAttempts: 2 });
        expect(await claim(db, intake.operationId, 60)).toMatchObject({
          outcome: "claimed",
          attempt: 1,
        });
        await windowEndsIn(db, intake.operationId, 1200);
        const first = await report(db, intake.operationId, 1, unknown(600));
        expect(first).toMatchObject({ outcome: "parked", attempt: 1 });
        await resolveCase(db, first.case_id as string, "retried");
        const back = await guardUpdate(
          db,
          fx.A.tenant,
          "UPDATE public.donation_saga_outbox SET status = 'retry_wait', next_attempt_at = clock_timestamp() WHERE id = $1",
          [intake.operationId],
        );
        expect(back.ok, refusal(back)).toBe(true);
        expect(await claim(db, intake.operationId, 60)).toMatchObject({
          outcome: "claimed",
          attempt: 2,
        });
        const second = await report(db, intake.operationId, 2, unknown());
        expect(second).toMatchObject({ outcome: "parked", attempt: 2 });
        expect(second.case_id).not.toBe(first.case_id);
        const cases = await casesOf(db, intake.operationId);
        expect(cases).toHaveLength(2);
        expect(
          cases.map((c) => [c.id, c.resolution, c.resolved_at === null]),
        ).toEqual(
          expect.arrayContaining([
            [first.case_id, "retried", false],
            [second.case_id, null, true],
          ]),
        );
        const tasks = await tasksOf(db, fx.A.tenant);
        expect(tasks).toHaveLength(2);
        expect(tasks).toEqual(
          expect.arrayContaining([
            PARKED_LINK(first.case_id as string),
            PARKED_LINK(second.case_id as string),
          ]),
        );
        await role(db, null);
        const taskIds = (
          await db.query(
            "SELECT DISTINCT task_id FROM public.mission_control_task_links WHERE record_id = ANY($1::text[])",
            [[first.case_id, second.case_id]],
          )
        ).rows.map((r) => r.task_id as string);
        expect(taskIds).toHaveLength(2);
        expect(taskIds[0]).not.toBe(taskIds[1]);

        const dead = await guardIntake(db, fx.A, { maxAttempts: 1 });
        await claim(db, dead.operationId);
        expect(
          await report(db, dead.operationId, 1, notPerformed()),
        ).toMatchObject({
          outcome: "dead_letter",
        });
        await role(db, null);
        const taskOf = async (recordId: string) =>
          (
            await db.query(
              "SELECT task_id FROM public.mission_control_task_links WHERE record_id = $1",
              [recordId],
            )
          ).rows[0].task_id as string;
        const duplicate = async (
          recordType: string,
          recordId: string,
          relationship: string,
        ) =>
          attempt(
            db,
            `INSERT INTO public.mission_control_task_links (tenant_id, task_id, record_type, record_id, relationship)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              fx.A.tenant,
              await taskOf(recordId),
              recordType,
              recordId,
              relationship,
            ],
          );
        const parkedDuplicate = await duplicate(
          "payment_repair_case",
          second.case_id as string,
          "provider_request_parked",
        );
        const deadDuplicate = await duplicate(
          "donation_saga_outbox",
          dead.operationId,
          "provider_request_dead_letter",
        );
        expect(
          [parkedDuplicate, deadDuplicate].map(
            (r) => `${r.code} ${r.constraint}`,
          ),
        ).toEqual([
          "23505 mission_control_task_links_provider_request_key",
          "23505 mission_control_task_links_provider_request_key",
        ]);
      }));

    it("F1.4 (guard): replays: succeeded with a different object on a linked request is 55000 lease_lost; attempt 1 replayed after attempt 2 linked is 55000 stale_attempt (R2 before R3); a refused and a not_performed winner replayed are 55000 lease_lost; each leaves the row unchanged", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const got: string[] = [];
        const unchanged = async (
          label: string,
          operationId: string,
          attemptNumber: number,
          result: object,
        ) => {
          const before = await rowOf(db, operationId);
          const r = await tryReport(db, operationId, attemptNumber, result);
          got.push(`${label}: ${refusal(r)}`);
          expect(await rowOf(db, operationId), label).toEqual(before);
        };

        const linked = await guardIntake(db, fx.A);
        await claim(db, linked.operationId);
        const object = paymentIntent();
        await report(db, linked.operationId, 1, succeeded(object));
        await unchanged(
          "another object on linked",
          linked.operationId,
          1,
          succeeded(paymentIntent()),
        );

        const late = await guardIntake(db, fx.A);
        await claim(db, late.operationId);
        await expireLease(db, late.operationId);
        expect(await claim(db, late.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 2,
        });
        const winner = paymentIntent();
        expect(
          await report(db, late.operationId, 2, succeeded(winner)),
        ).toMatchObject({
          outcome: "linked",
        });
        await unchanged(
          "attempt 1 after attempt 2 linked",
          late.operationId,
          1,
          succeeded(winner),
        );

        const refused = await guardIntake(db, fx.A);
        await claim(db, refused.operationId);
        await report(db, refused.operationId, 1, { result: "refused" });
        await unchanged("refused winner", refused.operationId, 1, {
          result: "refused",
        });

        const waiting = await guardIntake(db, fx.A);
        await claim(db, waiting.operationId);
        await report(db, waiting.operationId, 1, notPerformed());
        await unchanged(
          "not_performed winner",
          waiting.operationId,
          1,
          notPerformed(),
        );

        expect(got).toEqual([
          "another object on linked: 55000 lease_lost",
          "attempt 1 after attempt 2 linked: 55000 stale_attempt",
          "refused winner: 55000 lease_lost",
          "not_performed winner: 55000 lease_lost",
        ]);
      }));

    it("F1.5 (guard): when the clock crosses send_deadline while a request is sending, its report is 55000 lease_lost and the next claim parks it with reason window_passed", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        expect(await claim(db, intake.operationId)).toMatchObject({
          outcome: "claimed",
          attempt: 1,
        });
        await windowEndsIn(db, intake.operationId, -1);
        const row = await rowOf(db, intake.operationId);
        expect(row.status).toBe("sending");
        expect(
          refusal(await tryReport(db, intake.operationId, 1, succeeded())),
        ).toBe("55000 lease_lost");
        const parked = await claim(db, intake.operationId);
        expect(parked).toMatchObject({ outcome: "parked" });
        expect(
          (await auditOf(db, intake.operationId))[0]?.details,
        ).toMatchObject({
          reason: "window_passed",
          case_id: parked.case_id,
        });
      }));

    it("F5, B1: the parked task tells staff what window_passed means: the retry that was asked for does not fit before the send deadline; the repair case may retry only while a retry still leaves fifteen minutes, otherwise the request is adopted or abandoned", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        await claim(db, intake.operationId);
        await windowEndsIn(db, intake.operationId, -1);
        const parked = await claim(db, intake.operationId);
        expect(parked).toMatchObject({ outcome: "parked" });
        const text = await parkedTaskText(parked.case_id as string);
        expect(text).toMatch(
          new RegExp(
            `\\(window_passed\\)\\. The retry that was asked for does not fit before the send deadline .+\\. Repair case ${parked.case_id} may retry it only while a retry still leaves fifteen minutes before that deadline; otherwise the request is adopted or abandoned\\.$`,
          ),
        );
        expect(text).not.toContain("can only be");
        expect(text).not.toContain("needs a decision before");
      }));

    it("F5 (guard): the parked task tells staff what is left: with reason attempts_exhausted, that the repair case needs a decision before the send deadline", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A, { maxAttempts: 1 });
        await claim(db, intake.operationId);
        const parked = await report(db, intake.operationId, 1, unknown());
        expect(parked).toMatchObject({ outcome: "parked" });
        const text = await parkedTaskText(parked.case_id as string);
        expect(text).toMatch(
          new RegExp(
            `\\(attempts_exhausted\\); repair case ${parked.case_id} needs a decision before the send deadline .+\\.$`,
          ),
        );
      }));

    it("F2: the report locks the intake row after the request row: while another session holds the intake, the report waits (55P03 under a short lock_timeout); when that session commits another payment reference, the report is 23514 intake_names_another_object", async () => {
      await db.query("BEGIN");
      const fx = await seedTwoTenants(db);
      await db.query("COMMIT");
      try {
        const intake = await committed(() => guardIntake(db, fx.A));
        await db.query("BEGIN");
        await claim(db, intake.operationId, 900);
        await db.query("COMMIT");
        const [holder, reporter, watcher] = [
          await openSession(),
          await openSession(),
          await openSession(),
        ];
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
        await releaseSessionsThenRemove(fx);
      }
    });
  },
);
