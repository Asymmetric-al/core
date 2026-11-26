import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  casesOf,
  claim,
  expireLease,
  guardIntake,
  guardUpdate,
  inTx,
  keysOf,
  makeDue,
  paymentIntent,
  refusal,
  report,
  role,
  rowOf,
  seedTwoTenants,
  tasksOf,
  tryClaim,
  tryReport,
  windowEndsIn,
  type Intake,
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

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R1a: the provider-request machine, reports and wire shapes (real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

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
  },
);
