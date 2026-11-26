import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  attempt,
  claim,
  enterAs,
  grant,
  guardIntake,
  guardUpdate,
  inTx,
  makeDue,
  paymentIntent,
  refusal,
  report,
  role,
  rowOf,
  seedTwoTenants,
  windowEndsIn,
  type Fixture,
} from "./wp8a-p2r1a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R1a: the provider-operation record, fence, repair cases and grants (real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const unknown = { result: "unknown", retry_delay_seconds: 30 };
    const notPerformed = { result: "not_performed", retry_delay_seconds: 30 };

    async function parkedRow(fx: Fixture) {
      const intake = await guardIntake(db, fx.A, { maxAttempts: 1 });
      expect(await claim(db, intake.operationId)).toMatchObject({
        outcome: "claimed",
      });
      expect(await report(db, intake.operationId, 1, unknown)).toMatchObject({
        outcome: "parked",
      });
      return intake;
    }

    it("C11: the fence: a service_role or owner UPDATE of each guard column of a provider request is 42501 provider_request_guard_only; a service_role INSERT naming provider_request is 42501", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await grant(db, HOSTED_SERVICE_GRANTS);
        const intake = await guardIntake(db, fx.A);
        const assignments = [
          "status = 'abandoned'",
          "attempt_count = attempt_count",
          "next_attempt_at = now()",
          "lease_expires_at = NULL",
          "outcome_unknown = false",
          "provider_object_id = NULL",
          "last_error_code = 'x'",
          "updated_at = now()",
        ];
        const got: string[] = [];
        for (const who of ["service_role", "postgres"])
          for (const assignment of assignments) {
            await role(db, who === "postgres" ? null : who);
            got.push(
              `${who} ${assignment}: ${refusal(
                await attempt(
                  db,
                  `UPDATE public.donation_saga_outbox SET ${assignment} WHERE id = $1`,
                  [intake.operationId],
                ),
              )}`,
            );
            await role(db, null);
          }
        expect(got).toEqual(
          ["service_role", "postgres"].flatMap((who) =>
            assignments.map(
              (assignment) =>
                `${who} ${assignment}: 42501 provider_request_guard_only`,
            ),
          ),
        );
        await role(db, "service_role");
        const inserted = await attempt(
          db,
          `INSERT INTO public.donation_saga_outbox (tenant_id, donation_id, amount, currency, idempotency_key, status, kind)
           VALUES ($1, $2, 10300, 'usd', $3, 'queued', 'provider_request')`,
          [fx.A.tenant, intake.donationId, `key-${randomUUID()}`],
        );
        await role(db, null);
        expect(refusal(inserted)).toBe(
          "42501 donation_saga_outbox_kind_mismatch",
        );
      }));

    it("C12: repair cases: a second open case is 23505; a partial resolution or a reason blank, of 2 or of 501 characters is 23514; changed anchors, a changed resolved case and any delete are 23514", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const parked = await parkedRow(fx);
        const other = await parkedRow(fx);
        await role(db, null);
        const caseId = (
          await db.query(
            "SELECT id FROM public.payment_repair_cases WHERE operation_id = $1",
            [parked.operationId],
          )
        ).rows[0].id as string;
        const run = (sql: string, params: unknown[] = []) =>
          attempt(db, sql, params);
        const got: Record<string, string> = {};
        const second = await run(
          "INSERT INTO public.payment_repair_cases (tenant_id, kind, operation_id, donation_id) VALUES ($1, 'outcome_unknown', $2, $3)",
          [fx.A.tenant, parked.operationId, parked.donationId],
        );
        got["a second open case"] = `${second.code} ${second.constraint}`;
        const partial = await run(
          "UPDATE public.payment_repair_cases SET resolution = 'abandoned' WHERE id = $1",
          [caseId],
        );
        got["a partial resolution"] = `${partial.code} ${partial.constraint}`;
        const resolveWith = (reason: string) =>
          run(
            `UPDATE public.payment_repair_cases
                SET resolution = 'abandoned', resolution_reason = $2, resolved_by = gen_random_uuid(),
                    resolved_assignment_id = gen_random_uuid(), resolved_at = now(), resolution_details = '{}'::jsonb
              WHERE id = $1`,
            [caseId, reason],
          );
        for (const [label, reason] of [
          [
            "a blank reason",
            `  \t${String.fromCharCode(160)}${String.fromCharCode(65279)} `,
          ],
          ["a reason of 2 characters", "ab"],
          [
            "a padded reason of 2 characters",
            `${String.fromCharCode(12288)}ab${String.fromCharCode(8239)}`,
          ],
          ["a reason of 501 characters", "x".repeat(501)],
        ] as const) {
          const r = await resolveWith(reason);
          got[label] = `${r.code} ${r.constraint}`;
        }
        for (const [column, value] of [
          ["operation_id", other.operationId],
          ["donation_id", other.donationId],
          ["tenant_id", fx.B.tenant],
          ["kind", "outcome_unknown "],
          ["created_at", "2020-01-01"],
        ] as const) {
          const r = await run(
            `UPDATE public.payment_repair_cases SET ${column} = $2 WHERE id = $1`,
            [caseId, value],
          );
          got[`changed ${column}`] = refusal(r);
        }
        got["delete an open case"] = refusal(
          await run("DELETE FROM public.payment_repair_cases WHERE id = $1", [
            caseId,
          ]),
        );
        const three = await resolveWith("abc");
        expect(three.ok, refusal(three)).toBe(true);
        got["change a resolved case"] = refusal(
          await run(
            "UPDATE public.payment_repair_cases SET resolution_reason = 'abcd' WHERE id = $1",
            [caseId],
          ),
        );
        got["delete a resolved case"] = refusal(
          await run("DELETE FROM public.payment_repair_cases WHERE id = $1", [
            caseId,
          ]),
        );
        expect(got).toEqual({
          "a second open case":
            "23505 payment_repair_cases_one_open_per_operation",
          "a partial resolution":
            "23514 payment_repair_cases_resolution_complete_check",
          "a blank reason": "23514 payment_repair_cases_reason_check",
          "a reason of 2 characters": "23514 payment_repair_cases_reason_check",
          "a padded reason of 2 characters":
            "23514 payment_repair_cases_reason_check",
          "a reason of 501 characters":
            "23514 payment_repair_cases_reason_check",
          "changed operation_id": "23514 payment_repair_case_anchor_fixed",
          "changed donation_id": "23514 payment_repair_case_anchor_fixed",
          "changed tenant_id": "23514 payment_repair_case_anchor_fixed",
          "changed kind": "23514 payment_repair_case_anchor_fixed",
          "changed created_at": "23514 payment_repair_case_anchor_fixed",
          "delete an open case": "23514 payment_repair_case_sealed",
          "change a resolved case": "23514 payment_repair_case_resolved",
          "delete a resolved case": "23514 payment_repair_case_sealed",
        });
        const fiveHundred = await run(
          `UPDATE public.payment_repair_cases
              SET resolution = 'retried', resolution_reason = $2, resolved_by = gen_random_uuid(),
                  resolved_assignment_id = gen_random_uuid(), resolved_at = now(), resolution_details = '{}'::jsonb
            WHERE operation_id = $1`,
          [
            other.operationId,
            `${" ".repeat(9)}${"y".repeat(500)}${" ".repeat(9)}`,
          ],
        );
        expect(fiveHundred.ok, refusal(fiveHundred)).toBe(true);
      }));

    it("C15: the guard holds no UPDATE of first_sent_at, send_deadline or parked_at (42501 by privilege); a claim still sets the first two and a park the third", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A, { maxAttempts: 1 });
        await role(db, null);
        await db.query(
          "REVOKE INSERT ON TABLE public.donations, public.donation_saga_outbox FROM tenant_guard",
        );
        await db.query(
          "REVOKE EXECUTE ON FUNCTION public.normalize_currency_code(text) FROM tenant_guard",
        );
        const got: string[] = [];
        for (const column of ["first_sent_at", "send_deadline", "parked_at"]) {
          const r = await guardUpdate(
            db,
            fx.A.tenant,
            `UPDATE public.donation_saga_outbox SET ${column} = now() WHERE id = $1`,
            [intake.operationId],
          );
          got.push(`${column}: ${r.code} ${r.message}`);
        }
        expect(got).toEqual(
          ["first_sent_at", "send_deadline", "parked_at"].map(
            (column) =>
              `${column}: 42501 permission denied for table donation_saga_outbox`,
          ),
        );
        const claimed = await claim(db, intake.operationId);
        expect(claimed).toMatchObject({ outcome: "claimed", attempt: 1 });
        const sent = await rowOf(db, intake.operationId);
        expect(sent.first_sent_at).toBeInstanceOf(Date);
        expect(
          (sent.send_deadline as Date).getTime() -
            (sent.first_sent_at as Date).getTime(),
        ).toBe(23 * 3600 * 1000);
        expect(await report(db, intake.operationId, 1, unknown)).toMatchObject({
          outcome: "parked",
        });
        expect((await rowOf(db, intake.operationId)).parked_at).toBeInstanceOf(
          Date,
        );
      }));

    it("C16: every command runs as the guard under column-only grants (a * read is 42501), and no command body selects or returns * or fetches a %ROWTYPE", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const linked = await guardIntake(db, fx.A);
        const parked = await guardIntake(db, fx.A, { maxAttempts: 1 });
        const dead = await guardIntake(db, fx.A, { maxAttempts: 1 });
        const refused = await guardIntake(db, fx.A);
        const waiting = await guardIntake(db, fx.A);
        await role(db, null);
        await db.query(
          "REVOKE INSERT ON TABLE public.donations, public.donation_saga_outbox FROM tenant_guard",
        );
        await db.query(
          "REVOKE EXECUTE ON FUNCTION public.normalize_currency_code(text) FROM tenant_guard",
        );
        for (const i of [linked, parked, dead, refused, waiting])
          expect(await claim(db, i.operationId)).toMatchObject({
            outcome: "claimed",
          });
        const outcomes = [
          (
            await report(db, linked.operationId, 1, {
              result: "succeeded",
              provider_object_id: paymentIntent(),
            })
          ).outcome,
          (await report(db, parked.operationId, 1, unknown)).outcome,
          (await report(db, dead.operationId, 1, notPerformed)).outcome,
          (await report(db, refused.operationId, 1, { result: "refused" }))
            .outcome,
          (await report(db, waiting.operationId, 1, notPerformed)).outcome,
        ];
        await makeDue(db, waiting.operationId);
        await windowEndsIn(db, waiting.operationId, 60);
        outcomes.push((await claim(db, waiting.operationId)).outcome);
        outcomes.push((await claim(db, parked.operationId)).outcome);
        outcomes.push((await claim(db, linked.operationId)).outcome);
        expect(outcomes).toEqual([
          "linked",
          "parked",
          "dead_letter",
          "refused",
          "retry_scheduled",
          "dead_letter",
          "parked",
          "closed",
        ]);
        const star: string[] = [];
        for (const table of [
          "public.donation_saga_outbox",
          "public.donations",
        ]) {
          await enterAs(db, "tenant_guard", fx.A.tenant);
          const r = await attempt(db, `SELECT * FROM ${table}`);
          star.push(`${table}: ${r.code}`);
          await role(db, null);
        }
        expect(star).toEqual([
          "public.donation_saga_outbox: 42501",
          "public.donations: 42501",
        ]);
        const bodies = (
          await db.query(
            `SELECT p.oid::regprocedure::text AS f, pg_get_functiondef(p.oid) AS def
               FROM pg_proc AS p
              WHERE p.oid IN (
                'tenant_guard.claim_provider_operation(uuid,uuid,integer)'::regprocedure,
                'tenant_guard.record_provider_operation_result(uuid,uuid,integer,jsonb)'::regprocedure,
                'tenant_guard.money_park_operation(uuid,text,text)'::regprocedure,
                'public.claim_provider_operation(uuid,integer)'::regprocedure,
                'public.record_provider_operation_result(uuid,integer,jsonb)'::regprocedure)
              ORDER BY 1`,
          )
        ).rows as { f: string; def: string }[];
        expect(bodies).toHaveLength(5);
        const problems = bodies.flatMap(({ f, def }) => {
          const code = def.replace(/'(?:[^']|'')*'/g, "''");
          return [
            /\bSELECT\s+(?:[a-z_]+\.)?\*/i.test(code) ? `${f}: SELECT *` : null,
            /\bRETURNING\s+(?:[a-z_]+\.)?\*/i.test(code)
              ? `${f}: RETURNING *`
              : null,
            /%ROWTYPE/i.test(code) ? `${f}: %ROWTYPE` : null,
          ].filter(Boolean);
        });
        expect(problems).toEqual([]);
      }));

    it("F1.6 (guard): under the migrations' own grants, tenant_guard cannot DELETE a provider request, and authenticated can neither UPDATE nor DELETE one (42501 by privilege)", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        await role(db, null);
        await db.query(
          "REVOKE INSERT ON TABLE public.donations, public.donation_saga_outbox FROM tenant_guard",
        );
        await db.query(
          "REVOKE EXECUTE ON FUNCTION public.normalize_currency_code(text) FROM tenant_guard",
        );
        const got: string[] = [];
        await enterAs(db, "tenant_guard", fx.A.tenant);
        got.push(
          `tenant_guard delete: ${refusal(
            await attempt(
              db,
              "DELETE FROM public.donation_saga_outbox WHERE id = $1",
              [intake.operationId],
            ),
          )}`,
        );
        await role(db, null);
        for (const [label, sql] of [
          [
            "update",
            "UPDATE public.donation_saga_outbox SET status = 'abandoned' WHERE id = $1",
          ],
          ["delete", "DELETE FROM public.donation_saga_outbox WHERE id = $1"],
        ] as const) {
          await role(db, "authenticated");
          got.push(
            `authenticated ${label}: ${refusal(
              await attempt(db, sql, [intake.operationId]),
            )}`,
          );
          await role(db, null);
        }
        expect(got).toEqual([
          "tenant_guard delete: 42501 permission denied for table donation_saga_outbox",
          "authenticated update: 42501 permission denied for table donation_saga_outbox",
          "authenticated delete: 42501 permission denied for table donation_saga_outbox",
        ]);
        expect((await rowOf(db, intake.operationId)).status).toBe("queued");
      }));
  },
);
