import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  PROVIDER_STATUSES,
  auditOf,
  casesOf,
  claim,
  expireLease,
  guardIntake,
  guardUpdate,
  inTx,
  makeDue,
  paymentIntent,
  refusal,
  report,
  resolveCase,
  role,
  rowOf,
  seedTwoTenants,
  tasksOf,
  tryReport,
  windowEndsIn,
  type Intake,
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
  "AL-2681 WP8a part 2 R1a: the provider-request machine, claims and moves (real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

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
  },
);
