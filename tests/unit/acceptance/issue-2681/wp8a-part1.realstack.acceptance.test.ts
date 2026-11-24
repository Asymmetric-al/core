import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ANON_DEFINER_ALLOWLIST_PATH,
  TENANT_POLICY_EXCEPTIONS_PATH,
  TENANT_RLS_CATALOG_SQL,
  TENANT_RLS_EXCEPTIONS_PATH,
  evaluateTenantRlsCatalog,
  runTenantRlsCatalogGate,
} from "../../../../scripts/verify/tenant-rls-catalog.mjs";
import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2675/harness";

const REPO_ROOT = path.resolve(
  new URL("../../../../", import.meta.url).pathname,
);
const LEGAL_ENTITIES_MIGRATION = path.join(
  REPO_ROOT,
  "supabase/migrations/20261123030100_wp8a_legal_entities_and_funds_field_policies.sql",
);
const DEMO_TENANT_A = "00000000-0000-0000-0000-000000000001";
const DEMO_TENANT_B = "00000000-0000-0000-0000-000000000002";

const readJson = (relativePath: string) =>
  JSON.parse(readFileSync(path.join(REPO_ROOT, relativePath), "utf8"));
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
const account = () => `acct_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
const stripeEventId = () => `evt_${randomUUID().replaceAll("-", "")}`;

type Row = Record<string, unknown>;
type Outcome = Record<string, unknown>;

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 1 (real stack; needs a disposable database: it commits fixtures and deletes only the rows it created, by id)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const sessions: pg.Client[] = [];
    const created = {
      tenantlessConnectEvents: [] as string[],
      legacyEvents: [] as string[],
    };

    beforeAll(() => db.connect());
    afterAll(async () => {
      for (const client of sessions) await client.end().catch(() => {});
      await db.end();
    });

    async function openSession(): Promise<pg.Client> {
      const client = new pg.Client({ connectionString: ADMIN_URL });
      client.on("error", () => {});
      await client.connect();
      sessions.push(client);
      return client;
    }

    async function backendPid(client: pg.Client): Promise<number> {
      return (await client.query("SELECT pg_backend_pid() AS pid")).rows[0]
        .pid as number;
    }

    async function asService<T>(
      client: pg.Client,
      fn: () => Promise<T>,
    ): Promise<T> {
      await client.query("BEGIN");
      try {
        await client.query("SET LOCAL ROLE service_role");
        const result = await fn();
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
      }
    }

    async function asUser<T>(
      client: pg.Client,
      userId: string,
      tenantId: string,
      assignmentId: string,
      fn: () => Promise<T>,
    ): Promise<T> {
      await client.query("BEGIN");
      try {
        await client.query("SET LOCAL ROLE authenticated");
        await client.query(
          "SELECT set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true), set_config('request.headers', $3, true)",
          [
            userId,
            JSON.stringify({ sub: userId, role: "authenticated" }),
            JSON.stringify({
              "x-asym-tenant": tenantId,
              "x-asym-assignment": assignmentId,
            }),
          ],
        );
        const result = await fn();
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
      }
    }

    const svc = async (sql: string, params: unknown[] = [], client = db) =>
      (await asService(client, () => client.query(sql, params))).rows as Row[];
    const svcValue = async (sql: string, params: unknown[] = [], client = db) =>
      (await svc(sql, params, client))[0]?.res as Outcome;

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
         VALUES ($1, $5, 'staff', 'finance', true, true),
                ($2, $5, 'staff', 'finance', false, true),
                ($3, $5, 'donor', NULL, false, true),
                ($4, $6, 'staff', 'finance', true, true)
         RETURNING id, user_id`,
        [adminA, financeA, donorA, adminB, tenantA, tenantB],
      );
      const assignmentOf = (userId: string) =>
        memberships.rows.find((row) => row.user_id === userId)!.id as string;
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
        adminAssignA: assignmentOf(adminA),
        financeAssignA: assignmentOf(financeA),
        donorAssignA: assignmentOf(donorA),
        adminAssignB: assignmentOf(adminB),
      };
    }

    type Fixture = Awaited<ReturnType<typeof seedTwoTenants>>;

    async function removeFixture(fx: Fixture) {
      const tenants = [fx.tenantA, fx.tenantB];
      const users = [fx.adminA, fx.financeA, fx.donorA, fx.adminB];
      const byTenant = [
        "public.mission_control_task_links",
        "public.mission_control_tasks",
        "public.audit_logs",
        "public.stripe_connect_events",
        "public.stripe_raw_events",
        "public.workflow_dispatch_requests",
        "public.payment_account_bindings",
        "public.payment_provider_accounts",
        "public.payment_onboarding_intents",
        "public.giving_source_codes",
        "public.legal_entities",
        "authz.memberships",
      ];
      const present = async (table: string) =>
        (
          await db.query("SELECT to_regclass($1) IS NOT NULL AS present", [
            table,
          ])
        ).rows[0].present as boolean;
      if (await present("public.stripe_connect_events"))
        await db.query(
          "DELETE FROM public.stripe_connect_events WHERE id = ANY($1::uuid[])",
          [created.tenantlessConnectEvents],
        );
      await db.query(
        "DELETE FROM public.stripe_raw_events WHERE id = ANY($1::uuid[])",
        [created.legacyEvents],
      );
      for (const table of byTenant)
        if (await present(table))
          await db.query(
            `DELETE FROM ${table} WHERE tenant_id = ANY($1::uuid[])`,
            [tenants],
          );
      await db.query("DELETE FROM public.tenants WHERE id = ANY($1::uuid[])", [
        tenants,
      ]);
      await db.query("DELETE FROM auth.users WHERE id = ANY($1::uuid[])", [
        users,
      ]);
    }

    async function withTwoTenants<T>(
      fn: (fx: Fixture) => Promise<T>,
    ): Promise<T> {
      const fx = await seedTwoTenants();
      try {
        return await fn(fx);
      } finally {
        await removeFixture(fx);
      }
    }

    const adminA = (fx: Fixture, sql: string, params: unknown[] = []) =>
      asUser(db, fx.adminA, fx.tenantA, fx.adminAssignA, () =>
        db.query(sql, params),
      );
    const adminB = (fx: Fixture, sql: string, params: unknown[] = []) =>
      asUser(db, fx.adminB, fx.tenantB, fx.adminAssignB, () =>
        db.query(sql, params),
      );

    const snapshot = (
      accountId: string,
      intentId: string | null,
      card: string | null,
      extra: { closed?: boolean; livemode?: boolean } = {},
    ) => ({
      id: accountId,
      livemode: extra.livemode ?? false,
      closed: extra.closed ?? false,
      dashboard: "full",
      card_payments_status: card,
      metadata: { asym_onboarding_intent: intentId },
    });

    const beginOnboarding = async (
      run: typeof adminA,
      fx: Fixture,
      tenantId: string,
      entityId: string,
      reason = "Connect the issuer to Stripe",
    ) =>
      (
        await run(
          fx,
          "SELECT public.begin_payment_account_onboarding($1, $2, false, $3) AS res",
          [tenantId, entityId, reason],
        )
      ).rows[0].res as Outcome;

    const confirm = (snap: object, livemode = false) =>
      svcValue(
        "SELECT public.confirm_payment_account_onboarding($1, $2, $3::jsonb) AS res",
        [stripeEventId(), livemode, JSON.stringify(snap)],
      );

    async function onboard(
      fx: Fixture,
      side: "A" | "B",
      accountId: string,
      card: string | null = null,
    ) {
      const intent = await beginOnboarding(
        side === "A" ? adminA : adminB,
        fx,
        side === "A" ? fx.tenantA : fx.tenantB,
        side === "A" ? fx.entityA : fx.entityB,
      );
      const confirmed = await confirm(
        snapshot(accountId, intent.intent_id as string, card),
      );
      expect(confirmed).toMatchObject({ outcome: "confirmed" });
      return { intent, confirmed };
    }

    async function storeConnectEvent(opts: {
      tenantId: string | null;
      accountId: string | null;
      type?: string;
      livemode?: boolean;
      maxAttempts?: number;
      eventId?: string;
      createdAt?: string;
    }) {
      const id = opts.eventId ?? stripeEventId();
      const type =
        opts.type ??
        "v2.core.account[configuration.merchant].capability_status_updated";
      const livemode = opts.livemode ?? false;
      const payload = {
        id,
        object: "v2.core.event",
        type,
        created: opts.createdAt ?? new Date().toISOString(),
        livemode,
        related_object: opts.accountId
          ? {
              id: opts.accountId,
              type: "v2.core.account",
              url: `/v2/core/accounts/${opts.accountId}`,
            }
          : null,
      };
      const raw = JSON.stringify(payload);
      const row = (
        await svc(
          `INSERT INTO public.stripe_connect_events (
             tenant_id, stripe_event_id, event_type, livemode, provider_account_id,
             event_created_at, payload_sha256, raw_payload, processing_status, processing_outcome, max_attempts
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10::jsonb, $11)
           RETURNING id`,
          [
            opts.tenantId,
            id,
            type,
            livemode,
            opts.accountId,
            payload.created,
            createHash("sha256").update(raw).digest("hex"),
            raw,
            opts.tenantId ? "received" : "ignored",
            JSON.stringify(opts.tenantId ? {} : { outcome: "unknown_account" }),
            opts.maxAttempts ?? 8,
          ],
        )
      )[0];
      if (!opts.tenantId)
        created.tenantlessConnectEvents.push(row.id as string);
      return { id: row.id as string, stripeEventId: id };
    }

    const claim = (eventId: string, lease = 120, client = db) =>
      svcValue(
        "SELECT public.claim_provider_event($1, $2) AS res",
        [eventId, lease],
        client,
      );
    const applyEvent = (
      eventId: string,
      attempt: number,
      snap: object | null,
      client = db,
    ) =>
      svcValue(
        "SELECT public.apply_account_event($1, $2, $3::jsonb) AS res",
        [eventId, attempt, snap === null ? null : JSON.stringify(snap)],
        client,
      );
    const failEvent = (eventId: string, attempt: number, client = db) =>
      svcValue(
        "SELECT public.record_provider_event_failure($1, $2, 'test_error', 'worker failed', true, 0) AS res",
        [eventId, attempt],
        client,
      );

    async function cycle(
      tenantId: string,
      accountId: string,
      snap: object | null,
      type?: string,
    ) {
      const event = await storeConnectEvent({ tenantId, accountId, type });
      const claimed = await claim(event.id);
      expect(claimed).toMatchObject({ claimed: true, attempt: 1 });
      return applyEvent(event.id, 1, snap);
    }

    const bindingFor = async (accountId: string) =>
      (
        await db.query(
          "SELECT id, status, version, livemode FROM public.payment_account_bindings WHERE provider_account_ref = $1",
          [accountId],
        )
      ).rows[0] as Row;

    const tasksOf = async (tenantId: string) =>
      (
        await db.query(
          `SELECT t.issue_type, t.urgency, l.record_type, l.relationship
             FROM public.mission_control_tasks AS t
             JOIN public.mission_control_task_links AS l ON l.task_id = t.id AND l.tenant_id = t.tenant_id
            WHERE t.tenant_id = $1
            ORDER BY t.created_at, t.id`,
          [tenantId],
        )
      ).rows as Row[];

    async function waitForExpiry(table: string, id: string) {
      for (let i = 0; i < 200; i += 1) {
        const row = (
          await db.query(
            `SELECT lease_expires_at IS NOT NULL AND lease_expires_at <= clock_timestamp() AS expired FROM ${table} WHERE id = $1`,
            [id],
          )
        ).rows[0];
        if (row?.expired) return;
        await sleep(100);
      }
      throw new Error(`lease on ${table} ${id} did not expire`);
    }

    async function claimThenKill(
      sql: string,
      params: unknown[],
    ): Promise<Outcome> {
      const claimant = await openSession();
      const pid = await backendPid(claimant);
      const result = (
        await asService(claimant, () => claimant.query(sql, params))
      ).rows[0].res as Outcome;
      await db.query("SELECT pg_terminate_backend($1)", [pid]);
      return result;
    }

    async function underContention(opts: {
      holderSql: string;
      holderParams: unknown[];
      run: (client: pg.Client) => Promise<unknown>;
      restoreSql: string;
      restoreParams: unknown[];
    }) {
      const holder = await openSession();
      const caller = await openSession();
      const callerPid = await backendPid(caller);
      await holder.query("BEGIN");
      await holder.query(opts.holderSql, opts.holderParams);
      let settled = false;
      const pending = opts.run(caller).then(
        (value) => ({ ok: true as const, value }),
        (error: { code?: string }) => ({ ok: false as const, error }),
      );
      void pending.finally(() => {
        settled = true;
      });
      let blocked = false;
      for (let i = 0; i < 100 && !settled; i += 1) {
        const row = (
          await db.query(
            "SELECT cardinality(pg_blocking_pids($1)) > 0 AS blocked",
            [callerPid],
          )
        ).rows[0];
        if (row.blocked) {
          blocked = true;
          break;
        }
        await sleep(50);
      }
      await holder.query("COMMIT");
      const result = await pending;
      await db.query(opts.restoreSql, opts.restoreParams);
      return { blocked, result };
    }

    it("R35 / W8-R1: the preflight identifies demonstration issuers by their own identity and stops on anything else, with counts only", async () => {
      const sql = readFileSync(LEGAL_ENTITIES_MIGRATION, "utf8");
      const start = sql.indexOf("DO $$");
      const end = sql.indexOf("END $$;", start) + "END $$;".length;
      expect(start).toBeGreaterThan(-1);
      const schema = `acc2681_pf_${randomUUID().slice(0, 8)}`;
      const preflight = sql
        .slice(start, end)
        .replaceAll("public.", `${schema}.`);
      const tenantName = {
        [DEMO_TENANT_A]: "Demo A",
        [DEMO_TENANT_B]: "Demo B",
      };
      const seedId = (tenant: string) =>
        createHash("md5").update(`${tenant}:legal`).digest("hex");

      const scenario = async (
        entities: Array<{
          id?: string;
          tenant: string;
          name?: string;
          created?: string;
        }>,
        bindings = 0,
      ) => {
        await db.query("BEGIN");
        try {
          await db.query(`CREATE SCHEMA ${schema}`);
          await db.query(
            `CREATE TABLE ${schema}.tenants(id uuid PRIMARY KEY, name text NOT NULL);
             CREATE TABLE ${schema}.legal_entities(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
             CREATE TABLE ${schema}.payment_account_bindings(id uuid PRIMARY KEY DEFAULT gen_random_uuid());`,
          );
          const tenants = new Set(entities.map((e) => e.tenant));
          for (const tenant of tenants)
            await db.query(
              `INSERT INTO ${schema}.tenants(id, name) VALUES ($1, $2)`,
              [tenant, tenantName[tenant] ?? "Other"],
            );
          for (const e of entities)
            await db.query(
              `INSERT INTO ${schema}.legal_entities(id, tenant_id, name, created_at) VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, COALESCE($4::timestamptz, now()))`,
              [
                e.id ?? null,
                e.tenant,
                e.name ?? tenantName[e.tenant] ?? "Other",
                e.created ?? null,
              ],
            );
          for (let i = 0; i < bindings; i += 1)
            await db.query(
              `INSERT INTO ${schema}.payment_account_bindings DEFAULT VALUES`,
            );
          return await db.query(preflight).then(
            () => null,
            (error: { code?: string; message?: string }) => error,
          );
        } finally {
          await db.query("ROLLBACK");
        }
      };

      const batch = "2026-11-20T13:00:00Z";
      expect(
        await scenario([
          { id: seedId(DEMO_TENANT_A), tenant: DEMO_TENANT_A },
          { id: seedId(DEMO_TENANT_B), tenant: DEMO_TENANT_B },
        ]),
      ).toBeNull();
      expect(
        await scenario([
          { tenant: DEMO_TENANT_A, created: batch },
          { tenant: DEMO_TENANT_B, created: batch },
        ]),
      ).toBeNull();
      expect(await scenario([])).toBeNull();

      const outsider = randomUUID();
      const refusals = [
        await scenario([
          { tenant: DEMO_TENANT_A, created: batch },
          { tenant: DEMO_TENANT_B, created: "2026-11-21T09:00:00Z" },
        ]),
        await scenario([
          { id: seedId(DEMO_TENANT_A), tenant: DEMO_TENANT_A },
          { tenant: DEMO_TENANT_A, name: "Second issuer" },
        ]),
        await scenario([
          { id: seedId(DEMO_TENANT_A), tenant: DEMO_TENANT_A, name: "Renamed" },
        ]),
        await scenario([
          { id: seedId(DEMO_TENANT_A), tenant: DEMO_TENANT_A },
          { tenant: outsider, name: "Real Org" },
        ]),
        await scenario(
          [{ id: seedId(DEMO_TENANT_A), tenant: DEMO_TENANT_A }],
          1,
        ),
      ];
      expect(refusals.map((e) => e?.code)).toEqual([
        "22023",
        "22023",
        "22023",
        "22023",
        "22023",
      ]);
      expect(
        refusals.map((e) => (e?.message ?? "").replace(/^.*?: /, "")),
      ).toEqual([
        "issuers outside the demonstration tenants=0, demonstration-tenant issuers not identified as the demonstration rows=2, payment account bindings=0",
        "issuers outside the demonstration tenants=0, demonstration-tenant issuers not identified as the demonstration rows=2, payment account bindings=0",
        "issuers outside the demonstration tenants=0, demonstration-tenant issuers not identified as the demonstration rows=1, payment account bindings=0",
        "issuers outside the demonstration tenants=1, demonstration-tenant issuers not identified as the demonstration rows=0, payment account bindings=0",
        "issuers outside the demonstration tenants=0, demonstration-tenant issuers not identified as the demonstration rows=0, payment account bindings=1",
      ]);
      for (const refusal of refusals) {
        expect(refusal?.message).not.toContain(outsider);
        expect(refusal?.message).not.toContain(DEMO_TENANT_A);
      }

      const tenant = randomUUID();
      await db.query("BEGIN");
      try {
        await db.query(
          "INSERT INTO public.tenants(id, name, slug) VALUES ($1, 'Explicit', $1::uuid::text)",
          [tenant],
        );
        await db.query("SAVEPOINT s");
        await expect(
          db.query(
            "INSERT INTO public.legal_entities(tenant_id, name) VALUES ($1, 'Missing')",
            [tenant],
          ),
        ).rejects.toMatchObject({ code: "23502" });
        await db.query("ROLLBACK TO SAVEPOINT s");
        await expect(
          db.query(
            "INSERT INTO public.legal_entities(tenant_id, name, country_code, currency, legal_name) VALUES ($1, 'Bad', 'CA', 'usd', 'Bad Legal')",
            [tenant],
          ),
        ).rejects.toMatchObject({
          code: "23514",
          constraint: "legal_entities_country_code_check",
        });
      } finally {
        await db.query("ROLLBACK");
      }
      const keys = await db.query(
        "SELECT conname FROM pg_constraint WHERE conrelid = 'public.legal_entities'::regclass AND conname = 'legal_entities_tenant_id_id_currency_key'",
      );
      expect(keys.rowCount).toBe(1);
      const funds = await db.query(
        "SELECT count(*)::int AS n FROM public.field_policies WHERE record_type = 'funds' AND field_key IN ('legal_entity_id', 'system_purpose')",
      );
      expect(funds.rows[0].n).toBe(10);
    });

    it("R35: tax_id is not selectable through the table by staff; only the payments.manage_account read returns it", () =>
      withTwoTenants(async (fx) => {
        expect(
          (
            await db.query(
              "SELECT has_column_privilege('authenticated', 'public.legal_entities', 'tax_id', 'SELECT') AS tax, has_column_privilege('authenticated', 'public.legal_entities', 'legal_name', 'SELECT') AS name, has_table_privilege('authenticated', 'public.legal_entities', 'SELECT') AS whole",
            )
          ).rows[0],
        ).toEqual({ tax: false, name: true, whole: false });

        await expect(
          asUser(db, fx.financeA, fx.tenantA, fx.financeAssignA, () =>
            db.query("SELECT tax_id FROM public.legal_entities"),
          ),
        ).rejects.toMatchObject({ code: "42501" });
        const staffRows = await asUser(
          db,
          fx.financeA,
          fx.tenantA,
          fx.financeAssignA,
          () =>
            db.query(
              "SELECT id, legal_name, country_code, currency FROM public.legal_entities",
            ),
        );
        expect(staffRows.rows).toEqual([
          {
            id: fx.entityA,
            legal_name: "Alpha Legal Inc.",
            country_code: "US",
            currency: "usd",
          },
        ]);

        await expect(
          asUser(db, fx.financeA, fx.tenantA, fx.financeAssignA, () =>
            db.query("SELECT public.list_payment_legal_entities($1)", [
              fx.tenantA,
            ]),
          ),
        ).rejects.toMatchObject({ code: "42501" });
        const listed = (
          await adminA(
            fx,
            "SELECT public.list_payment_legal_entities($1) AS res",
            [fx.tenantA],
          )
        ).rows[0].res as Row[];
        expect(listed).toEqual([
          expect.objectContaining({
            id: fx.entityA,
            tax_id: "12-3456789",
            legal_name: "Alpha Legal Inc.",
          }),
        ]);
      }));

    it("R31: a person records an intent and names no provider account; a second submission returns the same intent", () =>
      withTwoTenants(async (fx) => {
        const accountArgs = await db.query(
          `SELECT p.oid::regprocedure::text AS fn
             FROM pg_proc AS p
             JOIN pg_namespace AS n ON n.oid = p.pronamespace
            WHERE n.nspname IN ('public', 'tenant_guard', 'private', 'authz')
              AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
              AND EXISTS (SELECT 1 FROM unnest(coalesce(p.proargnames, ARRAY[]::text[])) AS a(name) WHERE a.name ILIKE '%account%')
            ORDER BY 1`,
        );
        expect(accountArgs.rows).toEqual([]);
        expect(
          (
            await db.query(
              "SELECT to_regprocedure('public.begin_payment_account_onboarding(uuid,uuid,text,boolean,text)') AS old_signature",
            )
          ).rows[0].old_signature,
        ).toBeNull();
        await expect(
          adminA(
            fx,
            "SELECT public.begin_payment_account_onboarding($1, $2, $3, false, 'Claim someone else''s account')",
            [fx.tenantA, fx.entityA, "acct_someoneelse"],
          ),
        ).rejects.toMatchObject({ code: "42883" });

        const privileges = (
          await db.query(
            `SELECT
               has_table_privilege('authenticated', 'public.payment_provider_accounts', 'INSERT') OR has_table_privilege('authenticated', 'public.payment_provider_accounts', 'UPDATE') AS auth_mapping,
               has_table_privilege('authenticated', 'public.payment_account_bindings', 'INSERT') OR has_table_privilege('authenticated', 'public.payment_account_bindings', 'UPDATE') AS auth_bindings,
               has_table_privilege('authenticated', 'public.payment_onboarding_intents', 'INSERT') OR has_table_privilege('authenticated', 'public.payment_onboarding_intents', 'UPDATE') AS auth_intents,
               has_table_privilege('service_role', 'public.payment_provider_accounts', 'INSERT') OR has_table_privilege('service_role', 'public.payment_provider_accounts', 'UPDATE') AS service_mapping,
               has_table_privilege('service_role', 'public.payment_account_bindings', 'INSERT') OR has_table_privilege('service_role', 'public.payment_account_bindings', 'UPDATE') AS service_bindings,
               has_function_privilege('authenticated', 'public.confirm_payment_account_onboarding(text, boolean, jsonb)', 'EXECUTE') AS auth_confirm,
               has_function_privilege('anon', 'public.confirm_payment_account_onboarding(text, boolean, jsonb)', 'EXECUTE') AS anon_confirm,
               has_function_privilege('service_role', 'public.confirm_payment_account_onboarding(text, boolean, jsonb)', 'EXECUTE') AS service_confirm`,
          )
        ).rows[0];
        expect(privileges).toEqual({
          auth_mapping: false,
          auth_bindings: false,
          auth_intents: false,
          service_mapping: false,
          service_bindings: false,
          auth_confirm: false,
          anon_confirm: false,
          service_confirm: true,
        });

        await expect(
          asUser(db, fx.financeA, fx.tenantA, fx.financeAssignA, () =>
            db.query(
              "SELECT public.begin_payment_account_onboarding($1, $2, false, 'No capability')",
              [fx.tenantA, fx.entityA],
            ),
          ),
        ).rejects.toMatchObject({ code: "42501" });
        await expect(
          adminA(
            fx,
            "SELECT public.begin_payment_account_onboarding($1, $2, false, '   ')",
            [fx.tenantA, fx.entityA],
          ),
        ).rejects.toMatchObject({ code: "22023" });
        await expect(
          adminA(
            fx,
            "SELECT public.begin_payment_account_onboarding($1, $2, false, 'Foreign entity')",
            [fx.tenantA, fx.entityB],
          ),
        ).rejects.toMatchObject({ code: "P0002" });

        const first = await beginOnboarding(adminA, fx, fx.tenantA, fx.entityA);
        expect(first).toMatchObject({
          status: "open",
          version: 1,
          replayed: false,
          provider_account_id: null,
          binding_id: null,
        });
        const second = await beginOnboarding(
          adminA,
          fx,
          fx.tenantA,
          fx.entityA,
          "A second click with another reason",
        );
        expect(second).toMatchObject({
          intent_id: first.intent_id,
          status: "open",
          replayed: true,
        });
        const audits = await db.query(
          "SELECT action, user_id, details->>'reason' AS reason FROM public.audit_logs WHERE tenant_id = $1 AND resource_id = $2",
          [fx.tenantA, first.intent_id],
        );
        expect(audits.rows).toEqual([
          {
            action: "payment_account_onboarding_intent_recorded",
            user_id: fx.adminA,
            reason: "Connect the issuer to Stripe",
          },
        ]);
        expect(
          (
            await db.query(
              "SELECT count(*)::int AS n FROM public.payment_provider_accounts WHERE tenant_id = $1",
              [fx.tenantA],
            )
          ).rows[0].n,
        ).toBe(0);
      }));

    it("R31: only the service-role confirmation writes the mapping, once; a refusal leaves the intent open so a retry reuses it", () =>
      withTwoTenants(async (fx) => {
        const acct = account();
        const intent = await beginOnboarding(
          adminA,
          fx,
          fx.tenantA,
          fx.entityA,
        );
        const intentId = intent.intent_id as string;

        expect(
          await confirm(
            snapshot(acct, intentId, null, { livemode: true }),
            true,
          ),
        ).toMatchObject({ outcome: "mode_mismatch" });
        await expect(
          confirm({ ...snapshot(acct, intentId, null), metadata: {} }),
        ).resolves.toMatchObject({ outcome: "no_intent_reference" });
        await expect(
          confirm(snapshot(acct, randomUUID(), null)),
        ).resolves.toMatchObject({ outcome: "unknown_intent" });

        const confirmed = await confirm(snapshot(acct, intentId, null));
        expect(confirmed).toMatchObject({
          outcome: "confirmed",
          status: "pending",
          version: 1,
          tenant_id: fx.tenantA,
        });
        expect(await confirm(snapshot(acct, intentId, null))).toMatchObject({
          outcome: "already_confirmed",
        });
        expect(
          await confirm(snapshot(account(), intentId, "active")),
        ).toMatchObject({ outcome: "intent_confirmed_for_another_account" });

        const counts = (
          await db.query(
            `SELECT (SELECT count(*)::int FROM public.payment_provider_accounts WHERE tenant_id = $1) AS accounts,
                    (SELECT count(*)::int FROM public.payment_account_bindings WHERE tenant_id = $1) AS bindings,
                    (SELECT status FROM public.payment_onboarding_intents WHERE id = $2) AS intent_status`,
            [fx.tenantA, intentId],
          )
        ).rows[0];
        expect(counts).toEqual({
          accounts: 1,
          bindings: 1,
          intent_status: "confirmed",
        });

        const again = await beginOnboarding(adminA, fx, fx.tenantA, fx.entityA);
        expect(again).toMatchObject({
          intent_id: intentId,
          status: "confirmed",
          provider_account_id: acct,
          binding_status: "pending",
          replayed: true,
        });

        const intentB = await beginOnboarding(
          adminB,
          fx,
          fx.tenantB,
          fx.entityB,
        );
        expect(
          await confirm(snapshot(acct, intentB.intent_id as string, null)),
        ).toMatchObject({ outcome: "account_already_mapped" });
        const retryB = await beginOnboarding(
          adminB,
          fx,
          fx.tenantB,
          fx.entityB,
        );
        expect(retryB).toMatchObject({
          intent_id: intentB.intent_id,
          status: "open",
          replayed: true,
        });
        expect(
          (
            await db.query(
              "SELECT count(*)::int AS n FROM public.payment_provider_accounts WHERE tenant_id = $1",
              [fx.tenantB],
            )
          ).rows[0].n,
        ).toBe(0);

        const staffView = await asUser(
          db,
          fx.financeA,
          fx.tenantA,
          fx.financeAssignA,
          () =>
            db.query(
              "SELECT provider_account_ref, status, version FROM public.payment_account_bindings",
            ),
        );
        expect(staffView.rows).toEqual([
          { provider_account_ref: acct, status: "pending", version: 1 },
        ]);
      }));

    it.each([
      {
        name: "suspension of the tenant",
        holder: "UPDATE public.tenants SET status = 'suspended' WHERE id = $1",
        holderArg: "tenant",
        restore: "UPDATE public.tenants SET status = 'active' WHERE id = $1",
      },
      {
        name: "revocation of the caller's assignment",
        holder: "UPDATE authz.memberships SET revoked_at = now() WHERE id = $1",
        holderArg: "assignment",
        restore:
          "UPDATE authz.memberships SET is_active = true, is_tenant_admin = true WHERE id = $1",
      },
      {
        name: "loss of the capability",
        holder:
          "UPDATE authz.memberships SET is_tenant_admin = false WHERE id = $1",
        holderArg: "assignment",
        restore:
          "UPDATE authz.memberships SET is_tenant_admin = true WHERE id = $1",
      },
    ])(
      "R32: a command that waited behind $name re-checks authority under its locks and refuses with 42501",
      ({ holder, holderArg, restore }) =>
        withTwoTenants(async (fx) => {
          const code = (
            await adminA(
              fx,
              "SELECT public.create_giving_source_code($1, 'contention', 'Contention', 'Seed a target') AS res",
              [fx.tenantA],
            )
          ).rows[0].res as Outcome;
          const commands: Array<[string, string, unknown[]]> = [
            [
              "begin_payment_account_onboarding",
              "SELECT public.begin_payment_account_onboarding($1, $2, false, 'Under contention')",
              [fx.tenantA, fx.entityA],
            ],
            [
              "create_giving_source_code",
              "SELECT public.create_giving_source_code($1, 'late_code', 'Late', 'Under contention')",
              [fx.tenantA],
            ],
            [
              "update_giving_source_code",
              "SELECT public.update_giving_source_code($1, $2, 'Renamed late', NULL, 'Under contention')",
              [fx.tenantA, code.source_code_id],
            ],
          ];
          const target = holderArg === "tenant" ? fx.tenantA : fx.adminAssignA;
          const results: Array<[string, boolean, string | undefined]> = [];
          for (const [name, sql, params] of commands) {
            const { blocked, result } = await underContention({
              holderSql: holder,
              holderParams: [target],
              run: (client) =>
                asUser(client, fx.adminA, fx.tenantA, fx.adminAssignA, () =>
                  client.query(sql, params),
                ),
              restoreSql: restore,
              restoreParams: [target],
            });
            results.push([
              name,
              blocked,
              result.ok ? "committed" : result.error.code,
            ]);
          }
          expect(results).toEqual([
            ["begin_payment_account_onboarding", true, "42501"],
            ["create_giving_source_code", true, "42501"],
            ["update_giving_source_code", true, "42501"],
          ]);
          const writes = (
            await db.query(
              `SELECT (SELECT count(*)::int FROM public.payment_onboarding_intents WHERE tenant_id = $1) AS intents,
                      (SELECT count(*)::int FROM public.giving_source_codes WHERE tenant_id = $1 AND code = 'late_code') AS late_codes,
                      (SELECT label FROM public.giving_source_codes WHERE id = $2) AS label`,
              [fx.tenantA, code.source_code_id],
            )
          ).rows[0];
          expect(writes).toEqual({
            intents: 0,
            late_codes: 0,
            label: "Contention",
          });
        }),
    );

    const legacyInsert = (
      tenantId: string,
      accountId: string | null,
      id: string,
    ) =>
      svc(
        `INSERT INTO public.stripe_raw_events (
           tenant_id, donation_id, stripe_event_id, event_type, api_version, livemode, stripe_account,
           payment_intent_id, charge_id, payload_sha256, signature_header_present, signature_header_sha256,
           raw_payload, processing_status
         ) VALUES ($1, NULL, $2, 'payment_intent.succeeded', '2026-05-27.dahlia', false, $3,
           'pi_legacy', NULL, $4, true, $4, $5::jsonb, 'received')
         RETURNING *`,
        [
          tenantId,
          id,
          accountId,
          createHash("sha256").update(id).digest("hex"),
          JSON.stringify({ id, object: "event", account: accountId }),
        ],
      );

    it("R30 (finding 2): the deployed legacy insert carrying a provider account and a resolved tenant succeeds, mapped or not", () =>
      withTwoTenants(async (fx) => {
        const acct = account();
        const unmapped = (
          await legacyInsert(fx.tenantA, account(), stripeEventId())
        )[0];
        expect(unmapped).toMatchObject({
          tenant_id: fx.tenantA,
          processing_status: "received",
        });
        await onboard(fx, "A", acct);
        const mappedElsewhere = (
          await legacyInsert(fx.tenantB, acct, stripeEventId())
        )[0];
        expect(mappedElsewhere.tenant_id).toBe(fx.tenantB);
      }));

    it("R30 (finding 3): the deployed operator requeue after one attempt succeeds and resets the attempt count", () =>
      withTwoTenants(async (fx) => {
        const legacy = (
          await legacyInsert(fx.tenantA, null, stripeEventId())
        )[0];
        const legacyClaim = (
          await svc("SELECT public.claim_stripe_raw_event($1, $2) AS res", [
            legacy.id,
            randomUUID(),
          ])
        )[0].res as Outcome;
        expect(legacyClaim).toMatchObject({ claimed: true });
        expect(
          (
            await db.query(
              "SELECT process_attempts FROM public.stripe_raw_events WHERE id = $1",
              [legacy.id],
            )
          ).rows[0].process_attempts,
        ).toBe(1);
        await svc(
          `UPDATE public.stripe_raw_events
              SET processing_status = 'received', process_attempts = 0, next_attempt_at = $2,
                  lock_id = NULL, locked_at = NULL, processed_at = NULL, failed_at = NULL,
                  dead_letter_at = NULL, last_error_code = NULL, last_error_message = NULL,
                  retryable = NULL, processing_outcome = '{}'::jsonb, updated_at = $2
            WHERE id = $1`,
          [legacy.id, new Date().toISOString()],
        );
        expect(
          (
            await db.query(
              "SELECT process_attempts, processing_status FROM public.stripe_raw_events WHERE id = $1",
              [legacy.id],
            )
          ).rows[0],
        ).toEqual({ process_attempts: 0, processing_status: "received" });
      }));

    it("R30 (finding 5): the deployed scanner and worker never see the connected-accounts lane, the lanes de-duplicate apart in both arrival orders, and the live tables keep their shape", () =>
      withTwoTenants(async (fx) => {
        const acct = account();

        const legacyColumns = (
          await db.query(
            "SELECT string_agg(column_name, ',' ORDER BY ordinal_position) AS cols FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'stripe_raw_events'",
          )
        ).rows[0].cols as string;
        expect(legacyColumns).not.toMatch(
          /lease_expires_at|max_attempts|endpoint_kind/,
        );
        const legacyObjects = (
          await db.query(
            `SELECT
               (SELECT count(*)::int FROM pg_constraint WHERE conrelid = 'public.stripe_raw_events'::regclass AND conname LIKE '%account_same_tenant%') AS fks,
               (SELECT count(*)::int FROM pg_trigger WHERE tgrelid = 'public.stripe_raw_events'::regclass AND NOT tgisinternal) AS triggers,
               has_table_privilege('tenant_guard', 'public.stripe_raw_events', 'SELECT') AS guard_events,
               has_table_privilege('tenant_guard', 'public.donation_saga_outbox', 'SELECT') AS guard_outbox,
               (SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.donation_saga_outbox'::regclass AND conname = 'donation_saga_outbox_status_check') AS outbox_statuses,
               (SELECT count(*)::int FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'donation_saga_outbox' AND column_name IN ('payment_account_binding_id', 'lease_expires_at')) AS outbox_new_columns,
               (SELECT count(*)::int FROM pg_trigger WHERE tgrelid = 'public.workflow_dispatch_requests'::regclass AND NOT tgisinternal AND tgname LIKE '%monotonic%') AS dispatch_triggers`,
          )
        ).rows[0];
        expect(legacyObjects).toEqual({
          fks: 0,
          triggers: 0,
          guard_events: false,
          guard_outbox: false,
          outbox_statuses: expect.not.stringContaining("parked"),
          outbox_new_columns: 0,
          dispatch_triggers: 0,
        });

        await onboard(fx, "A", acct);

        const sharedId = stripeEventId();
        const legacyFirst = (await legacyInsert(fx.tenantA, acct, sharedId))[0];
        const connectSecond = await storeConnectEvent({
          tenantId: fx.tenantA,
          accountId: acct,
          eventId: sharedId,
        });
        const otherId = stripeEventId();
        const connectFirst = await storeConnectEvent({
          tenantId: fx.tenantA,
          accountId: acct,
          eventId: otherId,
        });
        const legacySecond = (await legacyInsert(fx.tenantA, acct, otherId))[0];
        await svc(
          "UPDATE public.stripe_raw_events SET processing_status = 'failed', next_attempt_at = now() - interval '1 minute' WHERE id = ANY($1::uuid[])",
          [[legacyFirst.id, legacySecond.id]],
        );
        expect(await claim(connectSecond.id)).toMatchObject({ claimed: true });
        expect(await failEvent(connectSecond.id, 1)).toMatchObject({
          outcome: "failed",
        });

        const due = await svc(
          `SELECT id, tenant_id, process_attempts FROM public.stripe_raw_events
            WHERE processing_status = 'failed' AND tenant_id IS NOT NULL AND next_attempt_at <= $1
            ORDER BY next_attempt_at ASC LIMIT 25`,
          [new Date(Date.now() + 1000).toISOString()],
        );
        const dueIds = due.map((row) => row.id);
        expect(dueIds).toEqual(
          expect.arrayContaining([legacyFirst.id, legacySecond.id]),
        );
        expect(dueIds).not.toContain(connectSecond.id);
        expect(dueIds).not.toContain(connectFirst.id);

        const oldWorkerOnConnectRow = (
          await svc("SELECT public.claim_stripe_raw_event($1, $2) AS res", [
            connectFirst.id,
            randomUUID(),
          ])
        )[0].res as Outcome;
        expect(oldWorkerOnConnectRow).not.toMatchObject({ claimed: true });
        const legacyLookup = await svc(
          "SELECT id FROM public.stripe_raw_events WHERE stripe_event_id = $1",
          [sharedId],
        );
        expect(legacyLookup.map((row) => row.id)).toEqual([legacyFirst.id]);
        const legacyStill = (
          await db.query(
            "SELECT processing_status, process_attempts FROM public.stripe_raw_events WHERE id = ANY($1::uuid[]) ORDER BY id",
            [[legacyFirst.id, legacySecond.id]],
          )
        ).rows;
        expect(legacyStill).toEqual([
          { processing_status: "failed", process_attempts: 0 },
          { processing_status: "failed", process_attempts: 0 },
        ]);

        const dispatchId = (
          await svc(
            `INSERT INTO public.workflow_dispatch_requests (
               tenant_id, product_area, workflow_name, subject_type, subject_id, idempotency_key
             ) VALUES ($1, 'giving', 'wp8a-compat', 'stripe_raw_event', $2, $3)
             RETURNING id`,
            [fx.tenantA, randomUUID(), randomUUID()],
          )
        )[0].id as string;
        expect(
          await svcValue(
            "SELECT public.claim_workflow_dispatch_request($1, 60) AS res",
            [dispatchId],
          ),
        ).toMatchObject({ claimed: true, attempt: 1 });
        const scan = await svc(
          "SELECT id FROM public.workflow_dispatch_requests WHERE tenant_id = $1 AND status IN ('pending', 'failed')",
          [fx.tenantA],
        );
        expect(scan.map((row) => row.id)).not.toContain(dispatchId);
        await svcValue(
          "SELECT public.record_workflow_dispatch_failure($1, 1, 'e', 'm', true, 0) AS res",
          [dispatchId],
        );
        expect(
          await svcValue(
            "SELECT public.claim_workflow_dispatch_request($1, 60) AS res",
            [dispatchId],
          ),
        ).toMatchObject({ claimed: true, attempt: 2 });
        await svcValue(
          "SELECT public.record_workflow_dispatch_failure($1, 2, 'e', 'm', true, 0) AS res",
          [dispatchId],
        );
        await svc(
          `UPDATE public.workflow_dispatch_requests
              SET status = 'failed', dispatch_attempts = 1, last_error_code = 'workflow_dispatch_failed',
                  last_error_message = 'stale', next_attempt_at = now()
            WHERE id = $1 AND status IN ('pending', 'failed')`,
          [dispatchId],
        );
        expect(
          (
            await db.query(
              "SELECT dispatch_attempts FROM public.workflow_dispatch_requests WHERE id = $1",
              [dispatchId],
            )
          ).rows[0].dispatch_attempts,
        ).toBe(1);

        const legacyTask = await svc(
          `INSERT INTO public.mission_control_tasks(tenant_id, title, source_module, issue_type)
           VALUES ($1, 'Legacy service task', 'contributions', 'legacy_check') RETURNING id`,
          [fx.tenantA],
        );
        await svc(
          `INSERT INTO public.mission_control_task_links(tenant_id, task_id, record_type, record_id)
           VALUES ($1, $2, 'donation', $3)`,
          [fx.tenantA, legacyTask[0].id, randomUUID()],
        );
      }));

    it("Connected-account events: stored tenant is the account's, transitions follow Stripe's state, restriction and disconnect raise a linked task, re-onboarding opens the next version", () =>
      withTwoTenants(async (fx) => {
        const acctA = account();
        const acctB = account();
        const { intent } = await onboard(fx, "A", acctA);
        await onboard(fx, "B", acctB);

        await expect(
          storeConnectEvent({ tenantId: fx.tenantA, accountId: acctB }),
        ).rejects.toMatchObject({
          code: "23503",
          constraint: "stripe_connect_events_account_same_tenant_fk",
        });
        await expect(
          storeConnectEvent({ tenantId: fx.tenantA, accountId: null }),
        ).rejects.toMatchObject({
          code: "23514",
          constraint: "stripe_connect_events_tenant_requires_account",
        });
        await expect(
          storeConnectEvent({
            tenantId: fx.tenantA,
            accountId: acctA,
            livemode: true,
          }),
        ).rejects.toMatchObject({
          code: "23503",
          constraint: "stripe_connect_events_account_same_tenant_fk",
        });
        const unknown = await storeConnectEvent({
          tenantId: null,
          accountId: account(),
        });
        expect(await claim(unknown.id)).toMatchObject({
          outcome: "unknown_anchor",
          terminal: true,
        });

        expect(
          await cycle(fx.tenantA, acctA, snapshot(acctA, null, "active")),
        ).toMatchObject({
          outcome: "applied",
          previous_status: "pending",
          status: "active",
        });
        expect(await tasksOf(fx.tenantA)).toEqual([]);

        expect(
          await cycle(fx.tenantA, acctA, snapshot(acctA, null, "restricted")),
        ).toMatchObject({ status: "restricted" });
        expect(
          await cycle(fx.tenantA, acctA, snapshot(acctA, null, "active")),
        ).toMatchObject({ status: "active" });

        const foreign = await cycle(
          fx.tenantB,
          acctB,
          snapshot(acctB, intent.intent_id as string, "restricted"),
        );
        expect(foreign).toMatchObject({
          status: "pending",
          tenant_id: fx.tenantB,
        });
        expect(await bindingFor(acctA)).toMatchObject({ status: "active" });

        const mismatched = await storeConnectEvent({
          tenantId: fx.tenantA,
          accountId: acctA,
        });
        expect(await claim(mismatched.id)).toMatchObject({ claimed: true });
        await expect(
          applyEvent(mismatched.id, 1, snapshot(acctB, null, "active")),
        ).rejects.toMatchObject({ code: "22023" });
        expect(await failEvent(mismatched.id, 1)).toMatchObject({
          outcome: "failed",
        });
        expect(await bindingFor(acctA)).toMatchObject({ status: "active" });

        expect(
          await cycle(fx.tenantA, acctA, null, "v2.core.account.closed"),
        ).toMatchObject({ status: "disconnected" });
        expect(
          await cycle(fx.tenantA, acctA, snapshot(acctA, null, "active")),
        ).toMatchObject({ outcome: "unchanged", status: "disconnected" });
        expect(await tasksOf(fx.tenantA)).toEqual([
          {
            issue_type: "payment_account_restricted",
            urgency: "high",
            record_type: "payment_account_binding",
            relationship: "restricted_binding",
          },
          {
            issue_type: "payment_account_disconnected",
            urgency: "critical",
            record_type: "payment_account_binding",
            relationship: "disconnected_binding",
          },
        ]);

        const next = await beginOnboarding(adminA, fx, fx.tenantA, fx.entityA);
        expect(next).toMatchObject({
          status: "open",
          version: 2,
          replayed: false,
        });
        const acctA2 = account();
        expect(
          await confirm(snapshot(acctA2, next.intent_id as string, null)),
        ).toMatchObject({
          outcome: "confirmed",
          version: 2,
          status: "pending",
        });
        expect(
          await cycle(fx.tenantA, acctA2, snapshot(acctA2, null, "active")),
        ).toMatchObject({ status: "active" });
        expect(await bindingFor(acctA2)).toMatchObject({
          status: "active",
          version: 2,
        });
        expect(await bindingFor(acctA)).toMatchObject({
          status: "disconnected",
          version: 1,
        });
      }));

    it("R33: a stale attempt is refused before the winner's replay; the winner replays idempotently; one account works one event at a time", () =>
      withTwoTenants(async (fx) => {
        const acct = account();
        await onboard(fx, "A", acct);

        const first = await storeConnectEvent({
          tenantId: fx.tenantA,
          accountId: acct,
        });
        const second = await storeConnectEvent({
          tenantId: fx.tenantA,
          accountId: acct,
        });
        expect(await claim(first.id, 60)).toMatchObject({
          claimed: true,
          attempt: 1,
        });
        expect(await claim(second.id, 60)).toMatchObject({
          claimed: false,
          terminal: false,
          outcome: "account_busy",
        });
        expect(await claim(first.id, 60)).toMatchObject({
          claimed: false,
          terminal: false,
          outcome: "lease_active",
        });
        const won = await applyEvent(
          first.id,
          1,
          snapshot(acct, null, "active"),
        );
        expect(won).toMatchObject({ status: "active", replayed: false });
        expect(
          await applyEvent(first.id, 1, snapshot(acct, null, "active")),
        ).toMatchObject({ status: "active", replayed: true });
        await expect(
          applyEvent(first.id, 0, snapshot(acct, null, "active")),
        ).rejects.toMatchObject({ code: "55000" });
        expect(await claim(first.id)).toMatchObject({
          terminal: true,
          outcome: "processed",
        });
        expect(await claim(second.id, 60)).toMatchObject({ claimed: true });
        expect(
          await applyEvent(second.id, 1, snapshot(acct, null, "restricted")),
        ).toMatchObject({ status: "restricted" });

        const sameSecond = new Date().toISOString();
        const stripeSays = "restricted";
        const finalStatuses: string[] = [];
        for (const order of [
          ["reported_enabled", "reported_restricted"],
          ["reported_restricted", "reported_enabled"],
        ]) {
          for (const label of order) {
            const event = await storeConnectEvent({
              tenantId: fx.tenantA,
              accountId: acct,
              createdAt: sameSecond,
              eventId: `${stripeEventId()}_${label}`,
            });
            expect(await claim(event.id)).toMatchObject({ claimed: true });
            await applyEvent(event.id, 1, snapshot(acct, null, stripeSays));
          }
          finalStatuses.push(String((await bindingFor(acct)).status));
        }
        expect(finalStatuses).toEqual(["restricted", "restricted"]);
        expect(
          await cycle(fx.tenantA, acct, snapshot(acct, null, "active")),
        ).toMatchObject({ previous_status: "restricted", status: "active" });
      }));

    it("R36: leases expire on the database clock; a killed claimant is reclaimed with no edit, a late stale report is refused in both orders, and the last killed claimant exhausts into a dead letter with its task", () =>
      withTwoTenants(async (fx) => {
        const acct = account();
        await onboard(fx, "A", acct);

        const event = await storeConnectEvent({
          tenantId: fx.tenantA,
          accountId: acct,
        });
        expect(
          await claimThenKill(
            "SELECT public.claim_provider_event($1, 1) AS res",
            [event.id],
          ),
        ).toMatchObject({ claimed: true, attempt: 1 });
        await waitForExpiry("public.stripe_connect_events", event.id);
        const winner = await openSession();
        const late = await openSession();
        expect(await claim(event.id, 60, winner)).toMatchObject({
          claimed: true,
          attempt: 2,
        });
        await expect(
          applyEvent(event.id, 1, snapshot(acct, null, "active"), late),
        ).rejects.toMatchObject({ code: "55000" });
        await expect(failEvent(event.id, 1, late)).rejects.toMatchObject({
          code: "55000",
        });
        expect(
          (
            await db.query(
              "SELECT processing_status, process_attempts FROM public.stripe_connect_events WHERE id = $1",
              [event.id],
            )
          ).rows[0],
        ).toEqual({ processing_status: "processing", process_attempts: 2 });
        expect(
          await applyEvent(event.id, 2, snapshot(acct, null, "active"), winner),
        ).toMatchObject({ status: "active" });
        await expect(
          applyEvent(event.id, 1, snapshot(acct, null, "restricted"), late),
        ).rejects.toMatchObject({ code: "55000" });
        expect(await bindingFor(acct)).toMatchObject({ status: "active" });

        const doomed = await storeConnectEvent({
          tenantId: fx.tenantA,
          accountId: acct,
          maxAttempts: 2,
        });
        for (const attempt of [1, 2]) {
          expect(
            await claimThenKill(
              "SELECT public.claim_provider_event($1, 1) AS res",
              [doomed.id],
            ),
          ).toMatchObject({ claimed: true, attempt });
          await waitForExpiry("public.stripe_connect_events", doomed.id);
        }
        expect(await claim(doomed.id)).toMatchObject({
          terminal: true,
          outcome: "dead_letter",
        });
        expect(
          (
            await db.query(
              `SELECT e.processing_status, e.dead_letter_at IS NOT NULL AS stamped, a.sync_lease_event_id
                 FROM public.stripe_connect_events AS e
                 JOIN public.payment_provider_accounts AS a ON a.provider_account_id = e.provider_account_id
                WHERE e.id = $1`,
              [doomed.id],
            )
          ).rows[0],
        ).toEqual({
          processing_status: "dead_letter",
          stamped: true,
          sync_lease_event_id: null,
        });

        const dispatchId = (
          await svc(
            `INSERT INTO public.workflow_dispatch_requests (
               tenant_id, product_area, workflow_name, subject_type, subject_id, idempotency_key, max_attempts
             ) VALUES ($1, 'giving', 'wp8a-lease', 'stripe_raw_event', $2, $3, 2)
             RETURNING id`,
            [fx.tenantA, randomUUID(), randomUUID()],
          )
        )[0].id as string;
        expect(
          await claimThenKill(
            "SELECT public.claim_workflow_dispatch_request($1, 1) AS res",
            [dispatchId],
          ),
        ).toMatchObject({ claimed: true, attempt: 1 });
        await waitForExpiry("public.workflow_dispatch_requests", dispatchId);
        expect(
          await svcValue(
            "SELECT public.claim_workflow_dispatch_request($1, 60) AS res",
            [dispatchId],
            winner,
          ),
        ).toMatchObject({ claimed: true, attempt: 2 });
        await expect(
          svcValue(
            "SELECT public.complete_workflow_dispatch_request($1, 1) AS res",
            [dispatchId],
            late,
          ),
        ).rejects.toMatchObject({ code: "55000" });
        expect(
          await svcValue(
            "SELECT public.complete_workflow_dispatch_request($1, 2) AS res",
            [dispatchId],
            winner,
          ),
        ).toMatchObject({ outcome: "dispatched" });
        await expect(
          svcValue(
            "SELECT public.record_workflow_dispatch_failure($1, 1, 'e', 'm', true, 0) AS res",
            [dispatchId],
            late,
          ),
        ).rejects.toMatchObject({ code: "55000" });

        const doomedDispatch = (
          await svc(
            `INSERT INTO public.workflow_dispatch_requests (
               tenant_id, product_area, workflow_name, subject_type, subject_id, idempotency_key, max_attempts
             ) VALUES ($1, 'giving', 'wp8a-exhaust', 'stripe_raw_event', $2, $3, 2)
             RETURNING id`,
            [fx.tenantA, randomUUID(), randomUUID()],
          )
        )[0].id as string;
        for (const attempt of [1, 2]) {
          expect(
            await claimThenKill(
              "SELECT public.claim_workflow_dispatch_request($1, 1) AS res",
              [doomedDispatch],
            ),
          ).toMatchObject({ claimed: true, attempt });
          await waitForExpiry(
            "public.workflow_dispatch_requests",
            doomedDispatch,
          );
        }
        expect(
          await svcValue(
            "SELECT public.claim_workflow_dispatch_request($1, 60) AS res",
            [doomedDispatch],
          ),
        ).toMatchObject({ claimed: false, outcome: "dead_letter" });

        expect(await tasksOf(fx.tenantA)).toEqual([
          {
            issue_type: "provider_event_dead_letter",
            urgency: "high",
            record_type: "stripe_connect_event",
            relationship: "dead_lettered_event",
          },
          {
            issue_type: "workflow_dispatch_dead_letter",
            urgency: "high",
            record_type: "workflow_dispatch_request",
            relationship: "dead_lettered_dispatch",
          },
        ]);
      }));

    it("Item 8: giving_source_codes CRUD enforces contributions.manage_settings, reason, normalization, uniqueness, audit, and cross-tenant isolation", () =>
      withTwoTenants(async (fx) => {
        await expect(
          asUser(db, fx.donorA, fx.tenantA, fx.donorAssignA, () =>
            db.query(
              "SELECT public.create_giving_source_code($1, 'spring-2026', 'Spring Appeal', 'Add code')",
              [fx.tenantA],
            ),
          ),
        ).rejects.toMatchObject({ code: "42501" });
        await expect(
          adminA(
            fx,
            "SELECT public.create_giving_source_code($1, 'spring-2026', 'Spring Appeal', '   ')",
            [fx.tenantA],
          ),
        ).rejects.toMatchObject({ code: "22023" });
        const createdCode = (
          await adminA(
            fx,
            "SELECT public.create_giving_source_code($1, '  Spring_2026  ', 'Spring Appeal', 'Launch campaign') AS res",
            [fx.tenantA],
          )
        ).rows[0].res as Outcome;
        expect(createdCode).toMatchObject({
          tenant_id: fx.tenantA,
          code: "spring_2026",
          label: "Spring Appeal",
          is_active: true,
        });
        await expect(
          adminA(
            fx,
            "SELECT public.create_giving_source_code($1, 'SPRING_2026', 'Dup', 'Duplicate check')",
            [fx.tenantA],
          ),
        ).rejects.toMatchObject({ code: "23505" });
        const createdB = (
          await adminB(
            fx,
            "SELECT public.create_giving_source_code($1, 'spring_2026', 'Beta Spring', 'Same code in tenant B') AS res",
            [fx.tenantB],
          )
        ).rows[0].res as Outcome;
        expect(createdB.code).toBe("spring_2026");
        expect(
          (
            await adminA(
              fx,
              "SELECT public.update_giving_source_code($1, $2, 'Spring Mailer', NULL, 'Clarify label') AS res",
              [fx.tenantA, createdCode.source_code_id],
            )
          ).rows[0].res,
        ).toMatchObject({
          changed: true,
          label: "Spring Mailer",
          is_active: true,
        });
        expect(
          (
            await adminA(
              fx,
              "SELECT public.update_giving_source_code($1, $2, NULL, false, 'Retire appeal') AS res",
              [fx.tenantA, createdCode.source_code_id],
            )
          ).rows[0].res,
        ).toMatchObject({ changed: true, is_active: false });
        expect(
          (
            await adminA(
              fx,
              "SELECT public.update_giving_source_code($1, $2, NULL, true, 'Reopen appeal') AS res",
              [fx.tenantA, createdCode.source_code_id],
            )
          ).rows[0].res,
        ).toMatchObject({ changed: true, is_active: true });
        await expect(
          adminB(
            fx,
            "SELECT public.update_giving_source_code($1, $2, 'Hijack', false, 'Cross-tenant')",
            [fx.tenantB, createdCode.source_code_id],
          ),
        ).rejects.toMatchObject({ code: "P0002" });
        const staffRead = await asUser(
          db,
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
            id: createdCode.source_code_id,
            code: "spring_2026",
            label: "Spring Mailer",
            is_active: true,
          },
        ]);
      }));

    it("Item 7 / R36: the catalog gate passes the migrated database and rejects planted wrappers it cannot verify", async () => {
      const clean = runTenantRlsCatalogGate({ databaseUrl: ADMIN_URL });
      expect(clean.failures).toEqual([]);
      expect(clean.ok).toBe(true);

      await db.query("BEGIN");
      try {
        const suffix = randomUUID().replaceAll("-", "");
        const name = (kind: string) => `public.acc2681_${kind}_${suffix}`;
        const plant = async (kind: string, args: string, body: string) => {
          await db.query(
            `CREATE FUNCTION ${name(kind)}(${args}) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $f$ ${body} $f$`,
          );
          await db.query(
            `REVOKE ALL ON FUNCTION ${name(kind)} FROM PUBLIC, anon, authenticated, service_role; GRANT EXECUTE ON FUNCTION ${name(kind)} TO service_role`,
          );
        };
        const stored =
          "SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id;";
        await plant(
          "arg",
          "p_tenant_id uuid, p_event_id uuid",
          "BEGIN RETURN tenant_guard.apply_account_event(p_tenant_id, p_event_id, 1, NULL); END",
        );
        await plant(
          "selected",
          "p_owner uuid, p_event_id uuid",
          "BEGIN RETURN tenant_guard.apply_account_event((SELECT p_owner), p_event_id, 1, NULL); END",
        );
        await plant(
          "copied",
          "p_owner uuid, p_event_id uuid",
          `DECLARE v_tenant uuid; BEGIN ${stored} v_tenant := p_owner; RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, 1, NULL); END`,
        );
        await plant(
          "update",
          "p_event_id uuid",
          `DECLARE v_tenant uuid; BEGIN ${stored} UPDATE public.stripe_connect_events SET updated_at = now() WHERE id = p_event_id; RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, 1, NULL); END`,
        );
        await plant(
          "truncate",
          "p_event_id uuid",
          `DECLARE v_tenant uuid; BEGIN ${stored} TRUNCATE public.giving_source_codes; RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, 1, NULL); END`,
        );
        await plant(
          "call",
          "p_event_id uuid",
          `DECLARE v_tenant uuid; BEGIN ${stored} PERFORM public.acc2681_rebuild(p_event_id); RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, 1, NULL); END`,
        );
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
              `${f.code} ${String(f.function).replace(`_${suffix}`, "").replace(/\(.*$/, "")}`,
          )
          .sort();
        expect(planted).toEqual([
          "WORKER_WRAPPER_TENANT_ARGUMENT public.acc2681_arg",
          "WORKER_WRAPPER_TENANT_ARGUMENT public.acc2681_copied",
          "WORKER_WRAPPER_TENANT_ARGUMENT public.acc2681_selected",
          "WORKER_WRAPPER_WRITES public.acc2681_call",
          "WORKER_WRAPPER_WRITES public.acc2681_truncate",
          "WORKER_WRAPPER_WRITES public.acc2681_update",
        ]);
      } finally {
        await db.query("ROLLBACK");
      }
    });
  },
);
