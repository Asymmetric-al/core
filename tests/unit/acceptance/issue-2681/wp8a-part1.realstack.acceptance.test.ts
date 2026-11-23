import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2675/harness";
import {
  ANON_DEFINER_ALLOWLIST_PATH,
  TENANT_POLICY_EXCEPTIONS_PATH,
  TENANT_RLS_CATALOG_SQL,
  TENANT_RLS_EXCEPTIONS_PATH,
  evaluateTenantRlsCatalog,
  runTenantRlsCatalogGate,
} from "../../../../scripts/verify/tenant-rls-catalog.mjs";

const REPO_ROOT = path.resolve(
  new URL("../../../../", import.meta.url).pathname,
);
const MIGRATION_LEGAL_ENTITIES = path.join(
  REPO_ROOT,
  "supabase/migrations/20261123030100_wp8a_legal_entities_and_funds_field_policies.sql",
);
const SEEDED_TENANT_A = "00000000-0000-0000-0000-000000000001";
const SEEDED_TENANT_B = "00000000-0000-0000-0000-000000000002";

const readJson = (relativePath: string) =>
  JSON.parse(readFileSync(path.join(REPO_ROOT, relativePath), "utf8"));

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 1 (real stack; needs a disposable database: it commits fixtures and deletes only the rows it created, by id)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const createdTenantlessEventIds: string[] = [];
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    let insideOuterTx = false;

    async function inTx<T>(fn: () => Promise<T>): Promise<T> {
      await db.query("BEGIN");
      insideOuterTx = true;
      try {
        return await fn();
      } finally {
        insideOuterTx = false;
        await db.query("ROLLBACK");
      }
    }

    async function withTwoTenants<T>(
      fn: (fx: Awaited<ReturnType<typeof seedTwoTenants>>) => Promise<T>,
    ): Promise<T> {
      const fx = await seedTwoTenants();
      const tenantIds = [fx.tenantA, fx.tenantB];
      const userIds = [fx.adminA, fx.financeA, fx.donorA, fx.adminB];
      try {
        return await fn(fx);
      } finally {
        await db.query("RESET ROLE").catch(() => {});
        await db.query(
          "DELETE FROM public.mission_control_task_links WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.mission_control_tasks WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.audit_logs WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.stripe_raw_events WHERE tenant_id = ANY($1::uuid[]) OR id = ANY($2::uuid[])",
          [tenantIds, createdTenantlessEventIds],
        );
        await db.query(
          "DELETE FROM public.donation_saga_outbox WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.donations WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.donors WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.workflow_dispatch_requests WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.payment_account_bindings WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.payment_provider_accounts WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.giving_source_codes WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.legal_entities WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM authz.memberships WHERE tenant_id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query(
          "DELETE FROM public.tenants WHERE id = ANY($1::uuid[])",
          [tenantIds],
        );
        await db.query("DELETE FROM auth.users WHERE id = ANY($1::uuid[])", [
          userIds,
        ]);
      }
    }

    async function asAuthenticated<T>(
      userId: string,
      tenantId: string,
      assignmentId: string | null,
      fn: () => Promise<T>,
    ): Promise<T> {
      if (insideOuterTx) {
        await db.query("SAVEPOINT auth_call");
      } else {
        await db.query("BEGIN");
      }
      try {
        await db.query("SET LOCAL ROLE authenticated");
        const headers: Record<string, string> = { "x-asym-tenant": tenantId };
        if (assignmentId) headers["x-asym-assignment"] = assignmentId;
        await db.query(
          "SELECT set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true), set_config('request.headers', $3, true)",
          [
            userId,
            JSON.stringify({ sub: userId, role: "authenticated" }),
            JSON.stringify(headers),
          ],
        );
        const result = await fn();
        if (insideOuterTx) {
          await db.query("RESET ROLE");
          await db.query(
            "SELECT set_config('request.jwt.claim.sub', '', true), set_config('request.jwt.claims', '', true), set_config('request.headers', '', true)",
          );
          await db.query("RELEASE SAVEPOINT auth_call");
        } else {
          await db.query("COMMIT");
        }
        return result;
      } catch (error) {
        if (insideOuterTx) {
          await db.query("ROLLBACK TO SAVEPOINT auth_call");
          await db.query("RELEASE SAVEPOINT auth_call");
        } else {
          await db.query("ROLLBACK");
        }
        throw error;
      }
    }

    async function asServiceRole<T>(fn: () => Promise<T>): Promise<T> {
      if (insideOuterTx) {
        await db.query("SAVEPOINT svc_call");
      } else {
        await db.query("BEGIN");
      }
      try {
        await db.query("SET LOCAL ROLE service_role");
        const result = await fn();
        if (insideOuterTx) {
          await db.query("RESET ROLE");
          await db.query("RELEASE SAVEPOINT svc_call");
        } else {
          await db.query("COMMIT");
        }
        return result;
      } catch (error) {
        if (insideOuterTx) {
          await db.query("ROLLBACK TO SAVEPOINT svc_call");
          await db.query("RELEASE SAVEPOINT svc_call");
        } else {
          await db.query("ROLLBACK");
        }
        throw error;
      }
    }

    async function seedTwoTenants() {
      const tenantA = randomUUID();
      const tenantB = randomUUID();
      const entityA = randomUUID();
      const entityB = randomUUID();
      const adminA = randomUUID();
      const financeA = randomUUID();
      const donorA = randomUUID();
      const adminB = randomUUID();
      await db.query(
        "INSERT INTO public.tenants(id, name, slug) VALUES ($1, 'WP8a Alpha', $1::uuid::text), ($2, 'WP8a Beta', $2::uuid::text)",
        [tenantA, tenantB],
      );
      await db.query(
        "INSERT INTO auth.users(id) VALUES ($1), ($2), ($3), ($4)",
        [adminA, financeA, donorA, adminB],
      );
      const memberships = await db.query(
        `INSERT INTO authz.memberships(user_id, tenant_id, role, staff_role, is_tenant_admin, is_active)
       VALUES
         ($1, $5, 'staff', 'finance', true, true),
         ($2, $5, 'staff', 'finance', false, true),
         ($3, $5, 'donor', NULL, false, true),
         ($4, $6, 'staff', 'finance', true, true)
       RETURNING id, user_id`,
        [adminA, financeA, donorA, adminB, tenantA, tenantB],
      );
      const assignmentFor = (uid: string) =>
        memberships.rows.find((r) => r.user_id === uid)!.id as string;
      await db.query(
        `INSERT INTO public.legal_entities(id, tenant_id, name, country_code, currency, legal_name, tax_id)
       VALUES ($1, $3, 'Alpha Entity', 'US', 'usd', 'Alpha Legal Inc.', '12-3456789'),
              ($2, $4, 'Beta Entity', 'US', 'usd', 'Beta Legal Inc.', NULL)`,
        [entityA, entityB, tenantA, tenantB],
      );
      return {
        tenantA,
        tenantB,
        entityA,
        entityB,
        adminA,
        financeA,
        donorA,
        adminB,
        adminAssignA: assignmentFor(adminA),
        financeAssignA: assignmentFor(financeA),
        donorAssignA: assignmentFor(donorA),
        adminAssignB: assignmentFor(adminB),
      };
    }

    it("W8-R1: legal_entities preflight refuses unknown rows with count only, backfills unseeded migrated-in-place demo rows, enforces explicit inserts and unique currency key", () =>
      inTx(async () => {
        expect(existsSync(MIGRATION_LEGAL_ENTITIES)).toBe(true);
        const sql = readFileSync(MIGRATION_LEGAL_ENTITIES, "utf8");
        const doStart = sql.indexOf("DO $$");
        const doEnd = sql.indexOf("END $$;", doStart) + "END $$;".length;
        expect(doStart).toBeGreaterThan(-1);
        const schema = `acc2681_pf_${randomUUID().slice(0, 8)}`;
        const preflight = sql
          .slice(doStart, doEnd)
          .replaceAll("public.", `${schema}.`);

        await db.query(
          `CREATE SCHEMA ${schema};
         CREATE TABLE ${schema}.legal_entities(
           id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
           tenant_id uuid NOT NULL,
           name text NOT NULL,
           created_at timestamptz NOT NULL DEFAULT now()
         );`,
        );
        await db.query(
          `INSERT INTO ${schema}.legal_entities(id, tenant_id, name)
         VALUES ($1, $2, 'Unseeded Alpha'), ($3, $4, 'Unseeded Beta')`,
          [randomUUID(), SEEDED_TENANT_A, randomUUID(), SEEDED_TENANT_B],
        );
        await db.query(preflight);

        const unknownTenant = randomUUID();
        const unknownEntity = randomUUID();
        await db.query(
          `INSERT INTO ${schema}.legal_entities(id, tenant_id, name) VALUES ($1, $2, 'Unknown Org')`,
          [unknownEntity, unknownTenant],
        );
        await db.query("SAVEPOINT pf_refuse");
        const refusal = await db.query(preflight).then(
          () => null,
          (err: { code?: string; message?: string; detail?: string }) => err,
        );
        await db.query("ROLLBACK TO SAVEPOINT pf_refuse");
        expect(refusal).not.toBeNull();
        expect(refusal?.code).toBe("22023");
        expect(refusal?.message).toContain("1 row(s)");
        expect(refusal?.message).not.toContain(unknownTenant);
        expect(refusal?.message).not.toContain(unknownEntity);
        expect(refusal?.detail ?? "").not.toContain(unknownTenant);

        const tenant = randomUUID();
        await db.query(
          "INSERT INTO public.tenants(id, name, slug) VALUES ($1, 'Explicit', $1::uuid::text)",
          [tenant],
        );
        await db.query("SAVEPOINT missing_cols");
        await expect(
          db.query(
            "INSERT INTO public.legal_entities(tenant_id, name) VALUES ($1, 'Missing')",
            [tenant],
          ),
        ).rejects.toMatchObject({ code: "23502" });
        await db.query("ROLLBACK TO SAVEPOINT missing_cols");

        await db.query("SAVEPOINT bad_country");
        await expect(
          db.query(
            "INSERT INTO public.legal_entities(tenant_id, name, country_code, currency, legal_name) VALUES ($1, 'Bad', 'CA', 'usd', 'Bad Legal')",
            [tenant],
          ),
        ).rejects.toMatchObject({ code: "23514" });
        await db.query("ROLLBACK TO SAVEPOINT bad_country");

        const uk = await db.query(
          `SELECT conname FROM pg_constraint
          WHERE conrelid = 'public.legal_entities'::regclass
            AND contype = 'u'
            AND conname = 'legal_entities_tenant_id_id_currency_key'`,
        );
        expect(uk.rowCount).toBe(1);

        const taxPolicy = await db.query(
          `SELECT surface, visible, editable, exportable, sensitivity_category
           FROM public.field_policies
          WHERE record_type = 'legal_entities' AND field_key = 'tax_id'
          ORDER BY surface`,
        );
        expect(taxPolicy.rows).toEqual([
          {
            surface: "donor",
            visible: false,
            editable: false,
            exportable: false,
            sensitivity_category: "financial",
          },
          {
            surface: "export",
            visible: false,
            editable: false,
            exportable: false,
            sensitivity_category: "financial",
          },
          {
            surface: "mission_control",
            visible: true,
            editable: true,
            exportable: false,
            sensitivity_category: "financial",
          },
          {
            surface: "missionary",
            visible: false,
            editable: false,
            exportable: false,
            sensitivity_category: "financial",
          },
          {
            surface: "public",
            visible: false,
            editable: false,
            exportable: false,
            sensitivity_category: "financial",
          },
        ]);

        const fundsPolicies = await db.query(
          `SELECT count(*)::int AS cnt FROM public.field_policies
          WHERE record_type = 'funds' AND field_key IN ('legal_entity_id', 'system_purpose')`,
        );
        expect(fundsPolicies.rows[0].cnt).toBe(10);
      }));

    it("Items 2 & 3: onboarding command enforces capability, reason, idempotent replay, single live binding per mode, cross-tenant account uniqueness, and caller-token staff reads", () =>
      withTwoTenants(async (fx) => {
        const acctA = `acct_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
        const acctOther = `acct_${randomUUID().replaceAll("-", "").slice(0, 16)}`;

        await expect(
          asAuthenticated(fx.financeA, fx.tenantA, fx.financeAssignA, () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Initial connect')",
              [fx.tenantA, fx.entityA, acctA],
            ),
          ),
        ).rejects.toMatchObject({ code: "42501" });

        await expect(
          asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, '   \t\n ')",
              [fx.tenantA, fx.entityA, acctA],
            ),
          ),
        ).rejects.toMatchObject({ code: "22023" });

        await expect(
          asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Cross-tenant attempt')",
              [fx.tenantA, fx.entityB, acctA],
            ),
          ),
        ).rejects.toMatchObject({ code: "P0002" });

        const first = await asAuthenticated(
          fx.adminA,
          fx.tenantA,
          fx.adminAssignA,
          () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Initial test-mode setup') AS res",
              [fx.tenantA, fx.entityA, acctA],
            ),
        );
        const binding1 = first.rows[0].res;
        expect(binding1).toMatchObject({
          tenant_id: fx.tenantA,
          legal_entity_id: fx.entityA,
          provider_account_id: acctA,
          livemode: false,
          version: 1,
          status: "pending",
          replayed: false,
        });

        const replay = await asAuthenticated(
          fx.adminA,
          fx.tenantA,
          fx.adminAssignA,
          () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Retry after lost response') AS res",
              [fx.tenantA, fx.entityA, acctA],
            ),
        );
        expect(replay.rows[0].res).toMatchObject({
          binding_id: binding1.binding_id,
          version: 1,
          status: "pending",
          replayed: true,
        });

        const auditCount = await db.query(
          "SELECT count(*)::int AS cnt FROM public.audit_logs WHERE tenant_id = $1 AND resource_id = $2",
          [fx.tenantA, binding1.binding_id],
        );
        expect(auditCount.rows[0].cnt).toBe(1);

        await expect(
          asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Duplicate binding attempt')",
              [fx.tenantA, fx.entityA, acctOther],
            ),
          ),
        ).rejects.toMatchObject({ code: "23505" });

        await expect(
          asAuthenticated(fx.adminB, fx.tenantB, fx.adminAssignB, () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Steal account id')",
              [fx.tenantB, fx.entityB, acctA],
            ),
          ),
        ).rejects.toMatchObject({ code: "23505" });

        const staffReads = await asAuthenticated(
          fx.adminA,
          fx.tenantA,
          fx.adminAssignA,
          async () => {
            const entities = await db.query(
              "SELECT id FROM public.legal_entities WHERE id IN ($1, $2)",
              [fx.entityA, fx.entityB],
            );
            const bindings = await db.query(
              "SELECT id, version, status FROM public.payment_account_bindings WHERE legal_entity_id IN ($1, $2)",
              [fx.entityA, fx.entityB],
            );
            const accounts = await db.query(
              "SELECT provider_account_id FROM public.payment_provider_accounts WHERE provider_account_id = $1",
              [acctA],
            );
            return {
              entities: entities.rows,
              bindings: bindings.rows,
              accounts: accounts.rows,
            };
          },
        );
        expect(staffReads.entities).toEqual([{ id: fx.entityA }]);
        expect(staffReads.bindings).toEqual([
          { id: binding1.binding_id, version: 1, status: "pending" },
        ]);
        expect(staffReads.accounts).toEqual([{ provider_account_id: acctA }]);

        const betaReads = await asAuthenticated(
          fx.adminB,
          fx.tenantB,
          fx.adminAssignB,
          () =>
            db.query(
              "SELECT id FROM public.payment_account_bindings WHERE id = $1",
              [binding1.binding_id],
            ),
        );
        expect(betaReads.rows).toEqual([]);
      }));

    it("Items 4, 5, 6 & W8-R7/R11/R12: connect constraints, account-event convergence, mode & tenant isolation, disconnect parks outbox + raises task, and version 2 onboarding", () =>
      withTwoTenants(async (fx) => {
        const acctA = `acct_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
        const acctA2 = `acct_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
        const acctB = `acct_${randomUUID().replaceAll("-", "").slice(0, 16)}`;

        const bA = (
          await asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Alpha test') AS res",
              [fx.tenantA, fx.entityA, acctA],
            ),
          )
        ).rows[0].res;
        const bALive = (
          await asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, $3, true, 'Alpha live') AS res",
              [fx.tenantA, fx.entityA, acctA],
            ),
          )
        ).rows[0].res;
        await asAuthenticated(fx.adminB, fx.tenantB, fx.adminAssignB, () =>
          db.query(
            "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Beta test') AS res",
            [fx.tenantB, fx.entityB, acctB],
          ),
        );

        await expect(
          db.query(
            `INSERT INTO public.stripe_raw_events(tenant_id, stripe_event_id, event_type, livemode, stripe_account, endpoint_kind, payload_sha256)
           VALUES ($1, $2, 'account.updated', false, NULL, 'connect', 'abc')`,
            [fx.tenantA, `evt_${randomUUID()}`],
          ),
        ).rejects.toMatchObject({ code: "23514" });

        await expect(
          db.query(
            `INSERT INTO public.stripe_raw_events(tenant_id, stripe_event_id, event_type, livemode, stripe_account, endpoint_kind, payload_sha256)
           VALUES ($1, $2, 'account.updated', false, $3, 'connect', 'abc')`,
            [fx.tenantA, `evt_${randomUUID()}`, acctB],
          ),
        ).rejects.toMatchObject({ code: "23503" });

        const unknownEvtId = (
          await db.query(
            `INSERT INTO public.stripe_raw_events(tenant_id, stripe_event_id, event_type, livemode, stripe_account, endpoint_kind, processing_status, payload_sha256)
           VALUES (NULL, $1, 'account.updated', false, 'acct_unknown_999', 'connect', 'ignored', 'abc') RETURNING id`,
            [`evt_${randomUUID()}`],
          )
        ).rows[0].id as string;
        createdTenantlessEventIds.push(unknownEvtId);
        const unknownRes = (
          await asServiceRole(() =>
            db.query("SELECT public.apply_account_event($1, 1) AS res", [
              unknownEvtId,
            ]),
          )
        ).rows[0].res;
        expect(unknownRes).toMatchObject({ outcome: "unknown_anchor" });

        const insertConnectEvent = async (opts: {
          tenantId: string;
          account: string;
          livemode: boolean;
          eventType: string;
          created: number;
          object: Record<string, unknown>;
        }) => {
          const res = await db.query(
            `INSERT INTO public.stripe_raw_events(
             tenant_id, stripe_event_id, event_type, livemode, stripe_account, endpoint_kind, payload_sha256, raw_payload
           ) VALUES ($1, $2, $3, $4, $5, 'connect', 'sha', $6::jsonb)
           RETURNING id`,
            [
              opts.tenantId,
              `evt_${randomUUID()}`,
              opts.eventType,
              opts.livemode,
              opts.account,
              JSON.stringify({
                id: `evt_payload_${randomUUID()}`,
                type: opts.eventType,
                created: opts.created,
                livemode: opts.livemode,
                account: opts.account,
                data: { object: opts.object },
              }),
            ],
          );
          return res.rows[0].id as string;
        };

        const runEvent = async (eventId: string) => {
          const claim = (
            await asServiceRole(() =>
              db.query("SELECT public.claim_provider_event($1, 300) AS res", [
                eventId,
              ]),
            )
          ).rows[0].res;
          expect(claim.claimed).toBe(true);
          return (
            await asServiceRole(() =>
              db.query("SELECT public.apply_account_event($1, $2) AS res", [
                eventId,
                claim.attempt,
              ]),
            )
          ).rows[0].res;
        };

        const evtActivate = await insertConnectEvent({
          tenantId: fx.tenantA,
          account: acctA,
          livemode: false,
          eventType: "account.updated",
          created: 1700000100,
          object: {
            id: acctA,
            charges_enabled: true,
            details_submitted: true,
            requirements: { disabled_reason: null },
          },
        });
        const actRes = await runEvent(evtActivate);
        expect(actRes).toMatchObject({
          outcome: "applied",
          binding_id: bA.binding_id,
          previous_status: "pending",
          status: "active",
        });

        const liveStillPending = await db.query(
          "SELECT status FROM public.payment_account_bindings WHERE id = $1",
          [bALive.binding_id],
        );
        expect(liveStillPending.rows[0].status).toBe("pending");

        const evtForgedFromB = await insertConnectEvent({
          tenantId: fx.tenantB,
          account: acctB,
          livemode: false,
          eventType: "account.updated",
          created: 1700000150,
          object: {
            id: acctB,
            charges_enabled: false,
            details_submitted: true,
            requirements: { disabled_reason: "requirements.past_due" },
            metadata: { tenant_id: fx.tenantA, binding_id: bA.binding_id },
          },
        });
        await runEvent(evtForgedFromB);
        expect(
          (
            await db.query(
              "SELECT status FROM public.payment_account_bindings WHERE id = $1",
              [bA.binding_id],
            )
          ).rows[0].status,
        ).toBe("active");

        const evtRestrict = await insertConnectEvent({
          tenantId: fx.tenantA,
          account: acctA,
          livemode: false,
          eventType: "account.updated",
          created: 1700000200,
          object: {
            id: acctA,
            charges_enabled: false,
            details_submitted: true,
            requirements: { disabled_reason: "requirements.past_due" },
          },
        });
        expect(await runEvent(evtRestrict)).toMatchObject({
          outcome: "applied",
          previous_status: "active",
          status: "restricted",
        });

        const evtReenable = await insertConnectEvent({
          tenantId: fx.tenantA,
          account: acctA,
          livemode: false,
          eventType: "account.updated",
          created: 1700000300,
          object: {
            id: acctA,
            charges_enabled: true,
            details_submitted: true,
            requirements: { disabled_reason: null },
          },
        });
        expect(await runEvent(evtReenable)).toMatchObject({
          outcome: "applied",
          previous_status: "restricted",
          status: "active",
        });

        const evtOutOfOrderOlder = await insertConnectEvent({
          tenantId: fx.tenantA,
          account: acctA,
          livemode: false,
          eventType: "account.updated",
          created: 1700000250,
          object: {
            id: acctA,
            charges_enabled: false,
            details_submitted: true,
            requirements: { disabled_reason: "requirements.past_due" },
          },
        });
        expect(await runEvent(evtOutOfOrderOlder)).toMatchObject({
          outcome: "stale_event_ignored",
          binding_status: "active",
        });

        const donorId = (
          await db.query(
            "INSERT INTO public.donors(tenant_id) VALUES ($1) RETURNING id",
            [fx.tenantA],
          )
        ).rows[0].id as string;
        const donationId = (
          await db.query(
            "INSERT INTO public.donations(tenant_id, donor_id, amount) VALUES ($1, $2, 2500) RETURNING id",
            [fx.tenantA, donorId],
          )
        ).rows[0].id as string;
        const outboxId = (
          await db.query(
            `INSERT INTO public.donation_saga_outbox(
             tenant_id, donation_id, donor_id, amount, idempotency_key, status, payment_account_binding_id
           ) VALUES ($1, $2, $3, 2500, $4, 'pending', $5) RETURNING id`,
            [fx.tenantA, donationId, donorId, randomUUID(), bA.binding_id],
          )
        ).rows[0].id as string;

        const evtDeauth = await insertConnectEvent({
          tenantId: fx.tenantA,
          account: acctA,
          livemode: false,
          eventType: "account.application.deauthorized",
          created: 1700000400,
          object: { id: acctA },
        });
        const deauthRes = await runEvent(evtDeauth);
        expect(deauthRes).toMatchObject({
          outcome: "applied",
          status: "disconnected",
          parked_outbox_count: 1,
        });
        expect(deauthRes.task_id).toBeTruthy();

        expect(
          (
            await db.query(
              "SELECT status FROM public.donation_saga_outbox WHERE id = $1",
              [outboxId],
            )
          ).rows[0].status,
        ).toBe("parked");

        const taskLink = await db.query(
          `SELECT t.tenant_id, t.issue_type, t.source_module, l.record_type, l.record_id
           FROM public.mission_control_tasks t
           JOIN public.mission_control_task_links l ON l.task_id = t.id
          WHERE t.id = $1`,
          [deauthRes.task_id],
        );
        expect(taskLink.rows).toEqual([
          {
            tenant_id: fx.tenantA,
            issue_type: "payment_account_disconnected",
            source_module: "payments",
            record_type: "payment_account_binding",
            record_id: bA.binding_id,
          },
        ]);

        const bA2 = (
          await asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Re-onboard after disconnect') AS res",
              [fx.tenantA, fx.entityA, acctA2],
            ),
          )
        ).rows[0].res;
        expect(bA2).toMatchObject({
          version: 2,
          status: "pending",
          provider_account_id: acctA2,
        });
      }));

    it("Item 5 & W8-R5/R7: lease expiry reclaim without manual edits, monotonic attempts, stale worker 55000, and dead_letter atomic Mission Control task on both ledgers", () =>
      inTx(async () => {
        const fx = await seedTwoTenants();
        const acctA = `acct_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
        await asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
          db.query(
            "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Lease test') AS res",
            [fx.tenantA, fx.entityA, acctA],
          ),
        );

        const evtId = (
          await db.query(
            `INSERT INTO public.stripe_raw_events(
             tenant_id, stripe_event_id, event_type, livemode, stripe_account, endpoint_kind, payload_sha256, max_attempts, raw_payload
           ) VALUES ($1, $2, 'account.updated', false, $3, 'connect', 'sha', 2, $4::jsonb) RETURNING id`,
            [
              fx.tenantA,
              `evt_${randomUUID()}`,
              acctA,
              JSON.stringify({
                created: 1700000100,
                data: {
                  object: { charges_enabled: true, details_submitted: true },
                },
              }),
            ],
          )
        ).rows[0].id as string;

        const claim1 = (
          await asServiceRole(() =>
            db.query("SELECT public.claim_provider_event($1, 60) AS res", [
              evtId,
            ]),
          )
        ).rows[0].res;
        expect(claim1).toMatchObject({ claimed: true, attempt: 1 });

        const activeReject = (
          await asServiceRole(() =>
            db.query("SELECT public.claim_provider_event($1, 60) AS res", [
              evtId,
            ]),
          )
        ).rows[0].res;
        expect(activeReject).toMatchObject({
          claimed: false,
          outcome: "lease_active",
        });

        await db.query("SAVEPOINT dec_evt");
        await expect(
          db.query(
            "UPDATE public.stripe_raw_events SET process_attempts = 0 WHERE id = $1",
            [evtId],
          ),
        ).rejects.toMatchObject({ code: "23514" });
        await db.query("ROLLBACK TO SAVEPOINT dec_evt");

        await db.query(
          "UPDATE public.stripe_raw_events SET lease_expires_at = pg_catalog.clock_timestamp() - interval '1 second' WHERE id = $1",
          [evtId],
        );
        const claim2 = (
          await asServiceRole(() =>
            db.query("SELECT public.claim_provider_event($1, 60) AS res", [
              evtId,
            ]),
          )
        ).rows[0].res;
        expect(claim2).toMatchObject({ claimed: true, attempt: 2 });

        await expect(
          asServiceRole(() =>
            db.query("SELECT public.apply_account_event($1, 1)", [evtId]),
          ),
        ).rejects.toMatchObject({ code: "55000" });

        await expect(
          asServiceRole(() =>
            db.query(
              "SELECT public.record_provider_event_failure($1, 1, 'err', 'stale', true, 10)",
              [evtId],
            ),
          ),
        ).rejects.toMatchObject({ code: "55000" });

        const deadEvt = (
          await asServiceRole(() =>
            db.query(
              "SELECT public.record_provider_event_failure($1, 2, 'boom', 'exhausted', true, 10) AS res",
              [evtId],
            ),
          )
        ).rows[0].res;
        expect(deadEvt).toMatchObject({ outcome: "dead_letter", attempt: 2 });
        expect(deadEvt.task_id).toBeTruthy();

        const deadEvtRow = await db.query(
          "SELECT processing_status, dead_letter_at FROM public.stripe_raw_events WHERE id = $1",
          [evtId],
        );
        expect(deadEvtRow.rows[0].processing_status).toBe("dead_letter");
        expect(deadEvtRow.rows[0].dead_letter_at).not.toBeNull();

        const reqId = (
          await db.query(
            `INSERT INTO public.workflow_dispatch_requests(
             tenant_id, product_area, workflow_name, subject_type, subject_id, idempotency_key, max_attempts
           ) VALUES ($1, 'giving', 'stripe-event', 'stripe_raw_event', $2, $3, 2) RETURNING id`,
            [fx.tenantA, randomUUID(), randomUUID()],
          )
        ).rows[0].id as string;

        const dClaim1 = (
          await asServiceRole(() =>
            db.query(
              "SELECT public.claim_workflow_dispatch_request($1, 60) AS res",
              [reqId],
            ),
          )
        ).rows[0].res;
        expect(dClaim1).toMatchObject({ claimed: true, attempt: 1 });

        await db.query("SAVEPOINT dec_req");
        await expect(
          db.query(
            "UPDATE public.workflow_dispatch_requests SET dispatch_attempts = 0 WHERE id = $1",
            [reqId],
          ),
        ).rejects.toMatchObject({ code: "23514" });
        await db.query("ROLLBACK TO SAVEPOINT dec_req");

        await db.query(
          "UPDATE public.workflow_dispatch_requests SET lease_expires_at = pg_catalog.clock_timestamp() - interval '1 second' WHERE id = $1",
          [reqId],
        );
        const dClaim2 = (
          await asServiceRole(() =>
            db.query(
              "SELECT public.claim_workflow_dispatch_request($1, 60) AS res",
              [reqId],
            ),
          )
        ).rows[0].res;
        expect(dClaim2).toMatchObject({ claimed: true, attempt: 2 });

        await expect(
          asServiceRole(() =>
            db.query(
              "SELECT public.complete_workflow_dispatch_request($1, 1, ARRAY['ev_1'])",
              [reqId],
            ),
          ),
        ).rejects.toMatchObject({ code: "55000" });

        const deadReq = (
          await asServiceRole(() =>
            db.query(
              "SELECT public.record_workflow_dispatch_failure($1, 2, 'dispatch_err', 'exhausted', true, 10) AS res",
              [reqId],
            ),
          )
        ).rows[0].res;
        expect(deadReq).toMatchObject({ outcome: "dead_letter", attempt: 2 });
        expect(deadReq.task_id).toBeTruthy();

        const deadReqRow = await db.query(
          "SELECT status, dead_letter_at FROM public.workflow_dispatch_requests WHERE id = $1",
          [reqId],
        );
        expect(deadReqRow.rows[0].status).toBe("dead_letter");
        expect(deadReqRow.rows[0].dead_letter_at).not.toBeNull();
      }));

    it("W8-R5(b): all five old-build compatibility contracts pass against the migrated schema", () =>
      inTx(async () => {
        const fx = await seedTwoTenants();

        const legacyEvtId = (
          await asServiceRole(() =>
            db.query(
              `INSERT INTO public.stripe_raw_events(
               tenant_id, stripe_event_id, event_type, livemode, stripe_account, payload_sha256, processing_status
             ) VALUES ($1, $2, 'payment_intent.succeeded', false, NULL, 'legacy_sha', 'received')
             RETURNING id, endpoint_kind`,
              [fx.tenantA, `evt_legacy_${randomUUID()}`],
            ),
          )
        ).rows[0];
        expect(legacyEvtId.endpoint_kind).toBe("legacy");

        const lockId = randomUUID();
        const legacyClaim = (
          await asServiceRole(() =>
            db.query("SELECT public.claim_stripe_raw_event($1, $2) AS res", [
              legacyEvtId.id,
              lockId,
            ]),
          )
        ).rows[0].res;
        expect(legacyClaim).toMatchObject({ claimed: true });

        const legacyFail = (
          await asServiceRole(() =>
            db.query(
              "SELECT public.record_stripe_raw_event_failure($1, $2, 'legacy_err', 'permanent', false, 1, 0) AS res",
              [legacyEvtId.id, lockId],
            ),
          )
        ).rows[0].res;
        expect(legacyFail).toMatchObject({
          processing_status: "dead_letter",
          dead_letter: true,
        });

        const reqId = (
          await asServiceRole(() =>
            db.query(
              `INSERT INTO public.workflow_dispatch_requests(
               tenant_id, product_area, workflow_name, subject_type, subject_id, idempotency_key
             ) VALUES ($1, 'giving', 'legacy-wf', 'stripe_raw_event', $2, $3) RETURNING id`,
              [fx.tenantA, randomUUID(), randomUUID()],
            ),
          )
        ).rows[0].id as string;
        const pendingRows = await asServiceRole(() =>
          db.query(
            "SELECT id FROM public.workflow_dispatch_requests WHERE id = $1 AND status IN ('pending', 'failed')",
            [reqId],
          ),
        );
        expect(pendingRows.rowCount).toBe(1);
        await asServiceRole(() =>
          db.query(
            "UPDATE public.workflow_dispatch_requests SET status = 'dead_letter', dead_letter_at = now() WHERE id = $1",
            [reqId],
          ),
        );
        const workClaim = (
          await asServiceRole(() =>
            db.query(
              "SELECT public.acquire_workflow_work_claim($1, 'dispatch', $2, 'legacy-worker', 60) AS res",
              [fx.tenantA, reqId],
            ),
          )
        ).rows[0].res;
        expect(workClaim.acquired).toBe(true);
        await asServiceRole(() =>
          db.query(
            "SELECT public.release_workflow_work_claim($1, $2, 'released')",
            [fx.tenantA, workClaim.claim_id],
          ),
        );

        const donorId = (
          await db.query(
            "INSERT INTO public.donors(tenant_id) VALUES ($1) RETURNING id",
            [fx.tenantA],
          )
        ).rows[0].id as string;
        const donationId = (
          await db.query(
            "INSERT INTO public.donations(tenant_id, donor_id, amount) VALUES ($1, $2, 1000) RETURNING id",
            [fx.tenantA, donorId],
          )
        ).rows[0].id as string;
        const outbox = await db.query(
          `INSERT INTO public.donation_saga_outbox(
           tenant_id, donation_id, donor_id, amount, idempotency_key
         ) VALUES ($1, $2, $3, 1000, $4) RETURNING id, lease_expires_at, payment_account_binding_id`,
          [fx.tenantA, donationId, donorId, randomUUID()],
        );
        expect(outbox.rows[0].lease_expires_at).toBeNull();
        expect(outbox.rows[0].payment_account_binding_id).toBeNull();
        const outboxRead = await asServiceRole(() =>
          db.query(
            "SELECT status, lease_expires_at, payment_account_binding_id FROM public.donation_saga_outbox WHERE id = $1",
            [outbox.rows[0].id],
          ),
        );
        expect(outboxRead.rows[0]).toEqual({
          status: "pending",
          lease_expires_at: null,
          payment_account_binding_id: null,
        });

        const legacyTask = await asServiceRole(() =>
          db.query(
            `INSERT INTO public.mission_control_tasks(tenant_id, title, source_module, issue_type)
           VALUES ($1, 'Legacy service task', 'contributions', 'legacy_check') RETURNING id`,
            [fx.tenantA],
          ),
        );
        await asServiceRole(() =>
          db.query(
            `INSERT INTO public.mission_control_task_links(tenant_id, task_id, record_type, record_id)
           VALUES ($1, $2, 'donation', $3)`,
            [fx.tenantA, legacyTask.rows[0].id, donationId],
          ),
        );
        expect(legacyTask.rowCount).toBe(1);
      }));

    it("Item 8: giving_source_codes CRUD enforces contributions.manage_settings, reason, normalization, uniqueness, audit, and cross-tenant isolation", () =>
      withTwoTenants(async (fx) => {
        await expect(
          asAuthenticated(fx.donorA, fx.tenantA, fx.donorAssignA, () =>
            db.query(
              "SELECT public.create_giving_source_code($1, 'spring-2026', 'Spring Appeal', 'Add code')",
              [fx.tenantA],
            ),
          ),
        ).rejects.toMatchObject({ code: "42501" });

        await expect(
          asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.create_giving_source_code($1, 'spring-2026', 'Spring Appeal', '   ')",
              [fx.tenantA],
            ),
          ),
        ).rejects.toMatchObject({ code: "22023" });

        const created = (
          await asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.create_giving_source_code($1, '  Spring_2026  ', 'Spring Appeal', 'Launch campaign') AS res",
              [fx.tenantA],
            ),
          )
        ).rows[0].res;
        expect(created).toMatchObject({
          tenant_id: fx.tenantA,
          code: "spring_2026",
          label: "Spring Appeal",
          is_active: true,
        });

        await expect(
          asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.create_giving_source_code($1, 'SPRING_2026', 'Dup', 'Duplicate check')",
              [fx.tenantA],
            ),
          ),
        ).rejects.toMatchObject({ code: "23505" });

        const createdB = (
          await asAuthenticated(fx.adminB, fx.tenantB, fx.adminAssignB, () =>
            db.query(
              "SELECT public.create_giving_source_code($1, 'spring_2026', 'Beta Spring', 'Same code in tenant B') AS res",
              [fx.tenantB],
            ),
          )
        ).rows[0].res;
        expect(createdB.code).toBe("spring_2026");

        const renamed = (
          await asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.update_giving_source_code($1, $2, 'Spring Mailer', NULL, 'Clarify label') AS res",
              [fx.tenantA, created.source_code_id],
            ),
          )
        ).rows[0].res;
        expect(renamed).toMatchObject({
          changed: true,
          label: "Spring Mailer",
          is_active: true,
        });

        const deactivated = (
          await asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.update_giving_source_code($1, $2, NULL, false, 'Retire appeal') AS res",
              [fx.tenantA, created.source_code_id],
            ),
          )
        ).rows[0].res;
        expect(deactivated).toMatchObject({ changed: true, is_active: false });

        const reactivated = (
          await asAuthenticated(fx.adminA, fx.tenantA, fx.adminAssignA, () =>
            db.query(
              "SELECT public.update_giving_source_code($1, $2, NULL, true, 'Reopen appeal') AS res",
              [fx.tenantA, created.source_code_id],
            ),
          )
        ).rows[0].res;
        expect(reactivated).toMatchObject({ changed: true, is_active: true });

        await expect(
          asAuthenticated(fx.adminB, fx.tenantB, fx.adminAssignB, () =>
            db.query(
              "SELECT public.update_giving_source_code($1, $2, 'Hijack', false, 'Cross-tenant')",
              [fx.tenantB, created.source_code_id],
            ),
          ),
        ).rejects.toMatchObject({ code: "P0002" });

        const staffRead = await asAuthenticated(
          fx.financeA,
          fx.tenantA,
          fx.financeAssignA,
          () =>
            db.query(
              "SELECT id, code, label, is_active FROM public.giving_source_codes WHERE code = 'spring_2026'",
            ),
        );
        expect(staffRead.rows).toEqual([
          {
            id: created.source_code_id,
            code: "spring_2026",
            label: "Spring Mailer",
            is_active: true,
          },
        ]);
      }));

    it("Item 7: catalog gate passes clean migrated database and catches planted WORKER_WRAPPER_TENANT_ARGUMENT and WORKER_WRAPPER_WRITES violations", async () => {
      const clean = runTenantRlsCatalogGate({ databaseUrl: ADMIN_URL });
      expect(clean.failures).toEqual([]);
      expect(clean.ok).toBe(true);

      await inTx(async () => {
        const suffix = randomUUID().replaceAll("-", "");
        const wArg = `public.acc2681_arg_${suffix}`;
        const wWrite = `public.acc2681_write_${suffix}`;
        await db.query(`
        CREATE FUNCTION ${wArg}(p_tenant_id uuid, p_event_id uuid) RETURNS jsonb
          LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
          BEGIN RETURN tenant_guard.apply_account_event(p_tenant_id, p_event_id, 1); END $$;
        REVOKE ALL ON FUNCTION ${wArg}(uuid, uuid) FROM PUBLIC, anon, authenticated, service_role;
        GRANT EXECUTE ON FUNCTION ${wArg}(uuid, uuid) TO service_role;

        CREATE FUNCTION ${wWrite}(p_event_id uuid) RETURNS jsonb
          LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
          DECLARE v_tenant uuid;
          BEGIN
            UPDATE public.stripe_raw_events SET processing_status = 'processing' WHERE id = p_event_id;
            SELECT tenant_id INTO v_tenant FROM public.stripe_raw_events WHERE id = p_event_id;
            RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, 1);
          END $$;
        REVOKE ALL ON FUNCTION ${wWrite}(uuid) FROM PUBLIC, anon, authenticated, service_role;
        GRANT EXECUTE ON FUNCTION ${wWrite}(uuid) TO service_role;
      `);
        const snap = JSON.parse(
          (await db.query({ text: TENANT_RLS_CATALOG_SQL, rowMode: "array" }))
            .rows[0][0],
        );
        const evaluated = evaluateTenantRlsCatalog(
          snap,
          readJson(TENANT_RLS_EXCEPTIONS_PATH),
          readJson(ANON_DEFINER_ALLOWLIST_PATH),
          readJson(TENANT_POLICY_EXCEPTIONS_PATH),
        );
        const planted = evaluated.failures
          .filter((f: { function?: string }) =>
            String(f.function ?? "").includes(suffix),
          )
          .map(
            (f: { code: string; function?: string }) =>
              `${f.code} ${f.function}`,
          )
          .sort();
        expect(planted).toEqual([
          `WORKER_WRAPPER_TENANT_ARGUMENT ${wArg}(p_tenant_id uuid, p_event_id uuid)`,
          `WORKER_WRAPPER_WRITES ${wWrite}(p_event_id uuid)`,
        ]);
      });
    });
  },
);
