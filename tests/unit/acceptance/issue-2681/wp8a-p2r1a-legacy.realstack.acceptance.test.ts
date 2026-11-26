import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  PROVIDER_STATUSES,
  attempt,
  claim,
  enterAs,
  expireLease,
  grant,
  guardIntake,
  inTx,
  paymentIntent,
  pgQueryClient,
  refusal,
  replica,
  report,
  role,
  seedTwoTenants,
  type Fixture,
  type Intake,
} from "./wp8a-p2r1a-harness";
import { giftMismatches } from "../../../../packages/api/src/donations/select";
import { runDonationSagaRecoveryScan } from "../../../../packages/api/src/workflows/adapters/donations";
import { summarizeWorkflowRuns } from "../../../../packages/api/src/workflows/summaries";
import { runTenantRlsCatalogGate } from "../../../../scripts/verify/tenant-rls-catalog.mjs";

import type {
  CreateDispatchRequestInput,
  RequestWorkflowDispatchResult,
} from "../../../../packages/api/src/workflows/ledger";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R1a: the live build is blind to provider requests, and the new functions and table keep their lanes (real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function requestIn(
      fx: Fixture,
      status: string,
      older: string,
    ): Promise<Intake> {
      const intake = await guardIntake(db, fx.A, { maxAttempts: 1 });
      const sent = status !== "queued";
      if (status === "abandoned") {
        await enterAs(db, "tenant_guard", fx.A.tenant);
        await db.query(
          "UPDATE public.donation_saga_outbox SET status = 'abandoned' WHERE id = $1",
          [intake.operationId],
        );
        await role(db, null);
      } else if (sent) {
        await claim(db, intake.operationId);
        if (status === "linked")
          await report(db, intake.operationId, 1, {
            result: "succeeded",
            provider_object_id: paymentIntent(),
          });
        if (status === "refused")
          await report(db, intake.operationId, 1, { result: "refused" });
        if (status === "dead_letter")
          await report(db, intake.operationId, 1, {
            result: "not_performed",
            retry_delay_seconds: 30,
          });
        if (status === "parked" || status === "adopted")
          await report(db, intake.operationId, 1, {
            result: "unknown",
            retry_delay_seconds: 30,
          });
        if (status === "adopted") {
          await enterAs(db, "tenant_guard", fx.A.tenant);
          await db.query(
            "UPDATE public.donation_saga_outbox SET status = 'adopted', provider_object_id = $2, outcome_unknown = false WHERE id = $1",
            [intake.operationId, paymentIntent()],
          );
          await role(db, null);
        }
        if (status === "retry_wait") {
          await replica(
            db,
            "UPDATE public.donation_saga_outbox SET max_attempts = 5 WHERE id = $1",
            [intake.operationId],
          );
          await report(db, intake.operationId, 1, {
            result: "not_performed",
            retry_delay_seconds: 30,
          });
        }
      }
      await replica(
        db,
        `UPDATE public.donation_saga_outbox
            SET next_attempt_at = $2::timestamptz,
                created_at = $2::timestamptz,
                first_sent_at = CASE WHEN first_sent_at IS NULL THEN NULL ELSE $2::timestamptz END,
                send_deadline = CASE WHEN send_deadline IS NULL THEN NULL ELSE $2::timestamptz + interval '23 hours' END,
                lease_expires_at = CASE WHEN lease_expires_at IS NULL THEN NULL ELSE $2::timestamptz + interval '1 hour' END,
                parked_at = CASE WHEN parked_at IS NULL THEN NULL ELSE $2::timestamptz END
          WHERE id = $1`,
        [intake.operationId, older],
      );
      return intake;
    }

    it("E21 (F10): with 30 older provider requests in every new status and one due legacy row, the real recovery scanner dispatches only the legacy row; the legacy claims, completion and failure act on none of them; reconciliation reads none; the real summary reader reports the dispatched legacy subject (the positive control) and no provider request, dead_letter ones included; begin_donation_saga refuses a provider key (23505) and writes nothing (D-18, AL-2678 WP5 rest, ruling Q-C: its two idempotency lookups read only legacy_saga rows, so a provider request's key is never answered as a replay), and giftMismatches reports the provider intake as another person's gift, the mismatch on which POST /api/donations and GraphQL createDonation refuse a replay (their statuses are owned by tests/unit/donations/donations-embed-endpoints.test.ts and issue-2269/donations-embed.postgrest; no suite asserts the 409 of /api/donate)", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await grant(db, [
          ...HOSTED_SERVICE_GRANTS,
          "GRANT UPDATE ON TABLE public.donation_saga_outbox TO service_role",
        ]);
        const requests: Intake[] = [];
        for (let i = 0; i < 30; i += 1) {
          const status = PROVIDER_STATUSES[i % PROVIDER_STATUSES.length]!;
          requests.push(
            await requestIn(
              fx,
              status,
              `1999-12-${String((i % 28) + 1).padStart(2, "0")}T00:00:00Z`,
            ),
          );
        }
        await role(db, null);
        const statuses = (
          await db.query(
            "SELECT DISTINCT status FROM public.donation_saga_outbox WHERE id = ANY($1::uuid[]) ORDER BY status",
            [requests.map((r) => r.operationId)],
          )
        ).rows.map((r) => r.status);
        expect(statuses).toEqual([...PROVIDER_STATUSES].sort());
        const user = randomUUID();
        await db.query("INSERT INTO auth.users (id) VALUES ($1)", [user]);
        await role(db, "service_role");
        const legacy = (
          await db.query(
            `SELECT public.begin_donation_saga($1, $2, $2, 4000, 'usd', NULL, NULL, $3, NULL, NULL, '{}'::jsonb) AS r`,
            [fx.A.tenant, user, `legacy-${randomUUID()}`],
          )
        ).rows[0].r;
        await role(db, null);
        await db.query(
          "UPDATE public.donation_saga_outbox SET next_attempt_at = '2000-01-01T00:00:00Z' WHERE id = $1",
          [legacy.outbox_id],
        );
        const snapshot = async () =>
          (
            await db.query(
              "SELECT id, status, attempt_count, updated_at, lease_expires_at FROM public.donation_saga_outbox WHERE id = ANY($1::uuid[]) ORDER BY id",
              [requests.map((r) => r.operationId)],
            )
          ).rows;
        const before = await snapshot();
        const ids = new Set(requests.map((r) => r.operationId));

        const dispatched: CreateDispatchRequestInput[] = [];
        const scan = await runDonationSagaRecoveryScan(
          {
            client: pgQueryClient(db, "service_role") as unknown as Parameters<
              typeof runDonationSagaRecoveryScan
            >[0]["client"],
            requestDispatch: async (_deps, input) => {
              dispatched.push(input);
              if (input.tenantId === fx.A.tenant)
                await db.query(
                  `INSERT INTO public.workflow_dispatch_requests
                     (tenant_id, product_area, workflow_name, subject_type, subject_id, idempotency_key, status, dispatch_attempts, dispatched_at)
                   VALUES ($1, $2, $3, $4, $5, $6, 'dispatched', 1, now())`,
                  [
                    input.tenantId,
                    input.productArea,
                    input.workflowName,
                    input.subject.type,
                    input.subject.id,
                    input.idempotencyKey,
                  ],
                );
              return {
                outcome: "dispatched",
                reused: false,
                error: null,
              } as unknown as RequestWorkflowDispatchResult;
            },
          },
          { limit: 25, now: new Date() },
        );
        const scanned = dispatched.map((input) => input.subject.id);
        expect(scan.dispatched).toBe(dispatched.length);
        expect(scanned).toContain(legacy.outbox_id);
        expect(scanned.filter((id) => ids.has(id))).toEqual([]);
        await role(db, "service_role");

        const legacyClaims: unknown[] = [];
        for (const r of requests) {
          legacyClaims.push(
            (
              await db.query(
                "SELECT public.claim_donation_saga_event($1, $2) AS r",
                [r.operationId, randomUUID()],
              )
            ).rows[0].r,
            (
              await db.query(
                "SELECT public.claim_donation_saga_event_with_fee_quote($1, $2, '{}'::jsonb) AS r",
                [r.operationId, randomUUID()],
              )
            ).rows[0].r,
          );
        }
        expect(legacyClaims).toHaveLength(60);
        expect(
          legacyClaims.filter(
            (c) => JSON.stringify(c) !== JSON.stringify({ claimed: false }),
          ),
        ).toEqual([]);
        const due = (
          await db.query(
            "SELECT outbox_id FROM public.claim_due_donation_saga_events($1, 100, $2)",
            [fx.A.tenant, randomUUID()],
          )
        ).rows.map((r) => r.outbox_id);
        expect(due).toEqual([legacy.outbox_id]);
        const raised: string[] = [];
        for (const r of requests.slice(0, 9)) {
          raised.push(
            refusal(
              await attempt(
                db,
                "SELECT public.complete_donation_saga_event($1, $2, 'pi_x', NULL, '{}'::jsonb)",
                [r.operationId, randomUUID()],
              ),
            ),
            refusal(
              await attempt(
                db,
                "SELECT public.record_donation_saga_failure($1, $2, 'x', 'x', 60, 5, NULL)",
                [r.operationId, randomUUID()],
              ),
            ),
          );
        }
        expect(new Set(raised)).toEqual(
          new Set([
            "P0002 Outbox event is not locked for completion",
            "P0002 Outbox event is not locked for failure",
          ]),
        );
        const reconciliation = (
          await db.query(
            "SELECT id FROM public.donation_saga_outbox WHERE tenant_id = $1 AND status = 'completed' LIMIT 500",
            [fx.A.tenant],
          )
        ).rows.map((r) => r.id);
        expect(reconciliation.filter((id) => ids.has(id))).toEqual([]);
        await role(db, null);
        await db.query(
          "UPDATE public.donation_saga_outbox SET status = 'dead_letter' WHERE id = $1",
          [legacy.outbox_id],
        );
        const deadLetters = requests.filter(
          (_r, i) =>
            PROVIDER_STATUSES[i % PROVIDER_STATUSES.length] === "dead_letter",
        );
        expect(deadLetters.length).toBeGreaterThan(0);
        const summaries = await summarizeWorkflowRuns(
          pgQueryClient(db, "service_role") as unknown as Parameters<
            typeof summarizeWorkflowRuns
          >[0],
          fx.A.tenant,
          { limit: 50 },
        );
        expect(
          summaries
            .filter((s) => s.subjectType === "donation_saga_outbox")
            .map((s) => [s.subjectId, s.state]),
        ).toEqual([[legacy.outbox_id, "dead_letter"]]);
        expect(summaries.filter((s) => ids.has(s.subjectId))).toEqual([]);
        expect(await snapshot()).toEqual(before);

        const target = requests.find((r) => r.side === fx.A)!;
        await role(db, "service_role");
        const counts = async () =>
          (
            await db.query(
              "SELECT (SELECT count(*) FROM public.donations)::int AS d, (SELECT count(*) FROM public.donation_saga_outbox)::int AS o, (SELECT count(*) FROM public.audit_logs)::int AS a",
            )
          ).rows[0];
        const beforeCounts = await counts();
        const refused = await attempt(
          db,
          `SELECT public.begin_donation_saga($1, $2, $2, 10300, 'usd', NULL, NULL, $3, NULL, NULL, '{}'::jsonb) AS r`,
          [fx.A.tenant, user, `gift:${target.donationId}:create_payment`],
        );
        expect(refused.ok).toBe(false);
        expect(refused.code).toBe("23505");
        expect(await counts()).toEqual(beforeCounts);
        const stored = (
          await db.query(
            "SELECT amount, currency, missionary_id, fund_id, donor_id FROM public.donations WHERE id = $1",
            [target.donationId],
          )
        ).rows[0];
        await role(db, null);
        expect(stored.donor_id).toBeNull();
        const row = { ...stored, donor: null };
        const requested = {
          profileId: user,
          amountCents: Number(stored.amount),
          currency: "usd",
          missionaryId: null,
          fundId: null,
        };
        const mismatches = giftMismatches(row, requested);
        expect(mismatches).toEqual(["profile"]);
        expect(mismatches.some((field) => field !== "amount")).toBe(true);
      }));

    it("F25: each new function has its owner, security, search path and grants; anon and authenticated cannot run a wrapper (42501); a guard command with another tenant is 42501 not_found; a wrapper given a legacy_saga id answers unknown_anchor", () =>
      inTx(db, async () => {
        const table = (
          await db.query(
            `SELECT p.oid::regprocedure::text AS f, pg_get_userbyid(p.proowner) AS owner, p.prosecdef AS definer,
                    p.proconfig AS config,
                    (SELECT coalesce(string_agg(DISTINCT CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END, '+' ORDER BY CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END), '-')
                       FROM aclexplode(p.proacl) AS a WHERE a.privilege_type = 'EXECUTE' AND a.grantee <> p.proowner) AS execute
               FROM pg_proc AS p
              WHERE p.oid IN (
                'tenant_guard.claim_provider_operation(uuid,uuid,integer)'::regprocedure,
                'tenant_guard.record_provider_operation_result(uuid,uuid,integer,jsonb)'::regprocedure,
                'tenant_guard.money_park_operation(uuid,text,text)'::regprocedure,
                'public.claim_provider_operation(uuid,integer)'::regprocedure,
                'public.record_provider_operation_result(uuid,integer,jsonb)'::regprocedure,
                'private.donations_intake_generation()'::regprocedure,
                'private.donation_saga_outbox_kind()'::regprocedure,
                'private.donation_saga_outbox_provider_rules()'::regprocedure,
                'private.payment_repair_cases_rules()'::regprocedure)
              ORDER BY 1`,
          )
        ).rows;
        const sp = ['search_path=""'];
        expect(table).toEqual([
          {
            f: "claim_provider_operation(uuid,integer)",
            owner: "postgres",
            definer: false,
            config: sp,
            execute: "service_role",
          },
          {
            f: "private.donation_saga_outbox_kind()",
            owner: "postgres",
            definer: false,
            config: sp,
            execute: "-",
          },
          {
            f: "private.donation_saga_outbox_provider_rules()",
            owner: "postgres",
            definer: false,
            config: sp,
            execute: "-",
          },
          {
            f: "private.donations_intake_generation()",
            owner: "postgres",
            definer: false,
            config: sp,
            execute: "-",
          },
          {
            f: "private.payment_repair_cases_rules()",
            owner: "postgres",
            definer: false,
            config: sp,
            execute: "-",
          },
          {
            f: "record_provider_operation_result(uuid,integer,jsonb)",
            owner: "postgres",
            definer: false,
            config: sp,
            execute: "service_role",
          },
          {
            f: "tenant_guard.claim_provider_operation(uuid,uuid,integer)",
            owner: "tenant_guard",
            definer: true,
            config: sp,
            execute: "service_role",
          },
          {
            f: "tenant_guard.money_park_operation(uuid,text,text)",
            owner: "postgres",
            definer: false,
            config: sp,
            execute: "tenant_guard",
          },
          {
            f: "tenant_guard.record_provider_operation_result(uuid,uuid,integer,jsonb)",
            owner: "tenant_guard",
            definer: true,
            config: sp,
            execute: "service_role",
          },
        ]);

        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A);
        const denied: string[] = [];
        for (const who of ["anon", "authenticated"]) {
          await role(db, who);
          denied.push(
            `${who} claim: ${(await attempt(db, "SELECT public.claim_provider_operation($1, 60)", [intake.operationId])).code}`,
            `${who} report: ${(await attempt(db, "SELECT public.record_provider_operation_result($1, 1, '{}'::jsonb)", [intake.operationId])).code}`,
            `${who} guard claim: ${(await attempt(db, "SELECT tenant_guard.claim_provider_operation($1, $2, 60)", [fx.A.tenant, intake.operationId])).code}`,
          );
          await role(db, null);
        }
        expect(denied).toEqual([
          "anon claim: 42501",
          "anon report: 42501",
          "anon guard claim: 42501",
          "authenticated claim: 42501",
          "authenticated report: 42501",
          "authenticated guard claim: 42501",
        ]);
        await role(db, null);
        await db.query(
          "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
        );
        await role(db, "service_role");
        const wrongTenant = [
          refusal(
            await attempt(
              db,
              "SELECT tenant_guard.claim_provider_operation($1, $2, 60)",
              [fx.B.tenant, intake.operationId],
            ),
          ),
          refusal(
            await attempt(
              db,
              'SELECT tenant_guard.record_provider_operation_result($1, $2, 0, \'{"result":"refused"}\'::jsonb)',
              [fx.B.tenant, intake.operationId],
            ),
          ),
        ];
        await role(db, null);
        expect(wrongTenant).toEqual(["42501 not_found", "42501 not_found"]);

        await grant(db, HOSTED_SERVICE_GRANTS);
        const user = randomUUID();
        await db.query("INSERT INTO auth.users (id) VALUES ($1)", [user]);
        await role(db, "service_role");
        const legacy = (
          await db.query(
            `SELECT public.begin_donation_saga($1, $2, $2, 4000, 'usd', NULL, NULL, $3, NULL, NULL, '{}'::jsonb) AS r`,
            [fx.A.tenant, user, `legacy-${randomUUID()}`],
          )
        ).rows[0].r;
        const anchors = [
          (
            await db.query(
              "SELECT public.claim_provider_operation($1, 60) AS r",
              [legacy.outbox_id],
            )
          ).rows[0].r,
          (
            await db.query(
              'SELECT public.record_provider_operation_result($1, 1, \'{"result":"refused"}\'::jsonb) AS r',
              [legacy.outbox_id],
            )
          ).rows[0].r,
        ];
        await role(db, null);
        expect(anchors).toEqual([
          { outcome: "unknown_anchor", operation_id: legacy.outbox_id },
          { outcome: "unknown_anchor", operation_id: legacy.outbox_id },
        ]);
        await role(db, "service_role");
        const direct = refusal(
          await attempt(
            db,
            "SELECT tenant_guard.claim_provider_operation($1, $2, 60)",
            [fx.A.tenant, legacy.outbox_id],
          ),
        );
        await role(db, null);
        expect(direct).toBe("42501 not_found");
      }));

    it("F26: the guard's policies hide every legacy row: on donations it sees only line-based intakes, on the outbox only provider requests, of the entered tenant", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        // D-18 (AL-2678, WP5 rest): the legacy gift is begun before the
        // guard's intakes enter tenant B in this transaction, because the
        // Party writer it now calls writes only in the tenant a transaction
        // entered.
        await grant(db, HOSTED_SERVICE_GRANTS);
        const user = randomUUID();
        await db.query("INSERT INTO auth.users (id) VALUES ($1)", [user]);
        await role(db, "service_role");
        const legacy = (
          await db.query(
            `SELECT public.begin_donation_saga($1, $2, $2, 4000, 'usd', NULL, NULL, $3, NULL, NULL, '{}'::jsonb) AS r`,
            [fx.A.tenant, user, `legacy-${randomUUID()}`],
          )
        ).rows[0].r;
        await role(db, null);
        const a = await guardIntake(db, fx.A);
        const b = await guardIntake(db, fx.B);
        await enterAs(db, "tenant_guard", fx.A.tenant);
        const intakes = (
          await db.query("SELECT id, intake_format FROM public.donations")
        ).rows;
        const requests = (
          await db.query("SELECT id, kind FROM public.donation_saga_outbox")
        ).rows;
        const legacyByUpdate = await attempt(
          db,
          "UPDATE public.donation_saga_outbox SET status = status WHERE id = $1 RETURNING id",
          [legacy.outbox_id],
        );
        await role(db, null);
        expect(intakes).toEqual([
          { id: a.donationId, intake_format: "line_based" },
        ]);
        expect(requests).toEqual([
          { id: a.operationId, kind: "provider_request" },
        ]);
        expect([legacyByUpdate.ok, legacyByUpdate.rows]).toEqual([true, []]);
        expect(b.side.tenant).toBe(fx.B.tenant);
        const policies = (
          await db.query(
            `SELECT polrelid::regclass::text AS t, polcmd, polroles::regrole[]::text AS roles,
                    pg_get_expr(polqual, polrelid) AS using_expr, pg_get_expr(polwithcheck, polrelid) AS check_expr
               FROM pg_policy
              WHERE polname = 'tenant_guard_isolation'
                AND polrelid IN ('public.donations'::regclass, 'public.donation_saga_outbox'::regclass)
              ORDER BY 1`,
          )
        ).rows;
        expect(policies).toEqual([
          {
            t: "donation_saga_outbox",
            polcmd: "*",
            roles: "{tenant_guard}",
            using_expr:
              "((tenant_id = ( SELECT tenant_guard.current_tenant_id() AS current_tenant_id)) AND (kind = 'provider_request'::text))",
            check_expr:
              "((tenant_id = ( SELECT tenant_guard.current_tenant_id() AS current_tenant_id)) AND (kind = 'provider_request'::text))",
          },
          {
            t: "donations",
            polcmd: "*",
            roles: "{tenant_guard}",
            using_expr:
              "((tenant_id = ( SELECT tenant_guard.current_tenant_id() AS current_tenant_id)) AND (intake_format = 'line_based'::text))",
            check_expr:
              "((tenant_id = ( SELECT tenant_guard.current_tenant_id() AS current_tenant_id)) AND (intake_format = 'line_based'::text))",
          },
        ]);
      }));

    it("F27: payment_repair_cases has forced row security, nothing for PUBLIC, anon, authenticated or service_role, SELECT and, since R1b's rule on inserted cases (D-18), INSERT of (tenant_id, kind, operation_id, donation_id) only for tenant_guard behind its isolation policy; the catalog gate passes", () =>
      inTx(db, async () => {
        const row = (
          await db.query(
            `SELECT c.relrowsecurity, c.relforcerowsecurity, pg_get_userbyid(c.relowner) AS owner,
                    (SELECT string_agg(a.grantee::regrole::text || ':' || a.privilege_type, ',' ORDER BY a.grantee::regrole::text, a.privilege_type)
                       FROM aclexplode(c.relacl) AS a WHERE a.grantee <> c.relowner) AS grants,
                    (SELECT string_agg(polname || ' ' || polcmd::text || ' ' || polroles::regrole[]::text, ',') FROM pg_policy WHERE polrelid = c.oid) AS policies,
                    (SELECT count(*)::int FROM pg_attribute AS t WHERE t.attrelid = c.oid AND t.attacl IS NOT NULL) AS column_grants
               FROM pg_class AS c WHERE c.oid = 'public.payment_repair_cases'::regclass`,
          )
        ).rows[0];
        expect(row).toEqual({
          relrowsecurity: true,
          relforcerowsecurity: true,
          owner: "postgres",
          grants: "tenant_guard:SELECT",
          policies: "tenant_guard_isolation * {tenant_guard}",
          column_grants: 4,
        });
        const denied = (
          await db.query(
            `SELECT r AS role, bool_or(has_table_privilege(r, 'public.payment_repair_cases', p)) AS any
               FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r,
                    unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p
              GROUP BY r ORDER BY r`,
          )
        ).rows;
        expect(denied).toEqual([
          { role: "anon", any: false },
          { role: "authenticated", any: false },
          { role: "service_role", any: false },
        ]);
        const gate = runTenantRlsCatalogGate({ databaseUrl: ADMIN_URL });
        expect(gate.failures).toEqual([]);
        expect(gate.ok).toBe(true);
        const fx = await seedTwoTenants(db);
        const intake = await guardIntake(db, fx.A, { maxAttempts: 1 });
        await claim(db, intake.operationId);
        await expireLease(db, intake.operationId);
        expect(await claim(db, intake.operationId)).toMatchObject({
          outcome: "parked",
        });
        await enterAs(db, "tenant_guard", fx.B.tenant);
        const hidden = (
          await db.query("SELECT id FROM public.payment_repair_cases")
        ).rows;
        await role(db, null);
        expect(hidden).toEqual([]);
      }));
  },
);
