import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  attempt,
  auditOf,
  casesOf,
  claim,
  enterAs,
  expireLease,
  guardIntake,
  guardUpdate,
  inTx,
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

const PARKED_LINK = (caseId: string) => ({
  issue_type: "provider_request_parked",
  urgency: "high",
  source_module: "payments",
  record_type: "payment_repair_case",
  record_id: caseId,
  relationship: "provider_request_parked",
});

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R1a: the provider-request machine, guards (real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

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
  },
);
