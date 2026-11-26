import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

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
import { Replay } from "../issue-2674/privileges-harness";
import {
  ADMIN_URL,
  GUARD_TEST_REVOKES,
  IN_MIGRATE_JOB,
  enqueue,
  lineIntake,
  paymentIntent,
  recordReference,
  removeTwoTenants,
  role,
  seedTwoTenants,
  storeEvent,
  work,
  type Fixture,
} from "./wp8a-p2r2a-harness";

const BUILD_TIMEOUT = 900_000;
const SEALED = [
  "staged_gifts",
  "staged_gift_allocations",
  "donations",
  "donation_intake_lines",
  "payment_observations",
] as const;
const FOUR = ["TRUNCATE", "REFERENCES", "TRIGGER", "MAINTAIN"] as const;

type Answer = { code: string | null; message?: string; detail?: string };

const readJson = (file: string) =>
  JSON.parse(readFileSync(file, "utf8")) as unknown;

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2, issue 2841: service_role loses TRUNCATE, REFERENCES, TRIGGER, MAINTAIN in public and CREATE on authz, and the five sealed tables refuse TRUNCATE (a replay with the hosted defaults; each table holds a committed line-based row)",
  () => {
    let replay: Replay;
    let db: pg.Client;
    let fx: Fixture;

    const rows = async (sql: string, params: unknown[] = []) =>
      (await db.query(sql, params)).rows as Record<string, unknown>[];

    const answer = async (
      who: "service_role" | null,
      sql: string,
      replica = false,
    ): Promise<Answer> => {
      await db.query("BEGIN");
      try {
        if (replica)
          await db.query("SET LOCAL session_replication_role = replica");
        await role(db, who);
        await db.query(sql);
        return { code: null };
      } catch (error) {
        const e = error as { code?: string; message?: string; detail?: string };
        return {
          code: e.code ?? "error",
          message: e.message,
          detail: e.detail,
        };
      } finally {
        await db.query("ROLLBACK");
      }
    };

    const lineRows = async () =>
      (
        await rows(
          `SELECT (SELECT count(*) FROM public.staged_gifts WHERE tenant_id = $1 AND intake_format = 'line_based')::int AS staged_gifts,
                  (SELECT count(*) FROM public.staged_gift_allocations WHERE tenant_id = $1 AND intake_format = 'line_based')::int AS staged_gift_allocations,
                  (SELECT count(*) FROM public.donations WHERE tenant_id = $1 AND intake_format = 'line_based')::int AS donations,
                  (SELECT count(*) FROM public.donation_intake_lines WHERE tenant_id = $1)::int AS donation_intake_lines,
                  (SELECT count(*) FROM public.payment_observations WHERE tenant_id = $1)::int AS payment_observations`,
          [fx.A.tenant],
        )
      )[0];

    beforeAll(async () => {
      replay = await new Replay(ADMIN_URL, true).build();
      db = new pg.Client({ connectionString: replay.url });
      await db.connect();
      await db.query("set lock_timeout = '10s'; set statement_timeout = '60s'");
      await db.query("BEGIN");
      fx = await seedTwoTenants(db);
      const intake = await lineIntake(db, fx.A, {
        lines: [{ amount: 7000 }, { amount: 3300 }],
      });
      const queued = await enqueue(db, fx.A, intake.donationId);
      if (!queued.ok)
        throw new Error(`enqueue refused: ${queued.code} ${queued.message}`);
      const pi = paymentIntent();
      await recordReference(db, intake.donationId, pi);
      const event = await storeEvent(db, fx.A, { pi, amount: intake.amount });
      const applied = await work(db, event.id);
      if (applied.outcome !== "applied")
        throw new Error(`apply answered ${JSON.stringify(applied)}`);
      await role(db, null);
      for (const revoke of GUARD_TEST_REVOKES) await db.query(revoke);
      await db.query("COMMIT");
    }, BUILD_TIMEOUT);

    afterAll(async () => {
      await db?.end().catch(() => undefined);
      await replay?.close();
    }, 120_000);

    it("the fixture (guard): each of the five sealed tables holds a committed line-based row of organization A", async () => {
      expect(await lineRows()).toEqual({
        staged_gifts: 1,
        staged_gift_allocations: 2,
        donations: 1,
        donation_intake_lines: 2,
        payment_observations: 1,
      });
    });

    it("service_role: TRUNCATE public.staged_gift_allocations, public.donation_crm_links is refused 42501, and every allocation stays", async () => {
      const a = await answer(
        "service_role",
        "TRUNCATE public.staged_gift_allocations, public.donation_crm_links",
      );
      expect([a.code, a.message]).toEqual([
        "42501",
        "permission denied for table staged_gift_allocations",
      ]);
      expect((await lineRows()).staged_gift_allocations).toBe(2);
    });

    it("service_role: TRUNCATE public.staged_gifts CASCADE is refused 42501, and the gift stays", async () => {
      const a = await answer(
        "service_role",
        "TRUNCATE public.staged_gifts CASCADE",
      );
      expect([a.code, a.message]).toEqual([
        "42501",
        "permission denied for table staged_gifts",
      ]);
      expect((await lineRows()).staged_gifts).toBe(1);
    });

    it.each(["staged_gifts", "staged_gift_allocations"])(
      "service_role: CREATE TRIGGER on public.%s is refused 42501 for the table, with a trigger function it may execute",
      async (table) => {
        const a = await answer(
          "service_role",
          `CREATE TRIGGER acc2841_later BEFORE UPDATE ON public.${table} FOR EACH ROW EXECUTE FUNCTION public.normalize_money_currency()`,
        );
        expect([a.code, a.message]).toEqual([
          "42501",
          `permission denied for table ${table}`,
        ]);
      },
    );

    it("service_role: CREATE FUNCTION authz.acc2841_probe() is refused 42501 for the schema", async () => {
      const a = await answer(
        "service_role",
        "CREATE FUNCTION authz.acc2841_probe() RETURNS integer LANGUAGE sql AS 'SELECT 1'",
      );
      expect([a.code, a.message]).toEqual([
        "42501",
        "permission denied for schema authz",
      ]);
    });

    it.each([
      [
        "staged_gift_allocations",
        "TRUNCATE public.staged_gift_allocations, public.donation_crm_links",
      ],
      ["staged_gifts", "TRUNCATE public.staged_gifts CASCADE"],
      ["donations", "TRUNCATE public.donations CASCADE"],
      ["donation_intake_lines", "TRUNCATE public.donation_intake_lines"],
      ["payment_observations", "TRUNCATE public.payment_observations"],
    ])(
      "postgres, origin mode: the TRUNCATE that reaches public.%s first is refused 23514 by that table's trigger, and its rows stay",
      async (table, sql) => {
        const a = await answer(null, sql);
        expect(a).toEqual({
          code: "23514",
          message: "sealed_table_truncate_refused",
          detail: `public.${table} keeps rows that are never deleted; TRUNCATE fires no row trigger, so it is refused for the whole table.`,
        });
        expect(
          Object.values(await lineRows()).every((n) => Number(n) > 0),
        ).toBe(true);
      },
    );

    it("postgres, origin mode: TRUNCATE public.tenants CASCADE, which reaches all five, is refused 23514", async () => {
      const a = await answer(null, "TRUNCATE public.tenants CASCADE");
      expect(a.code).toBe("23514");
      expect(a.message).toBe("sealed_table_truncate_refused");
    });

    it("postgres, replica mode (the owner's deliberate way out, kept): a TRUNCATE of payment_observations runs, rolled back", async () => {
      expect(
        await answer(null, "TRUNCATE public.payment_observations", true),
      ).toEqual({ code: null });
      expect((await lineRows()).payment_observations).toBe(1);
    });

    it("the five triggers are statement-level BEFORE TRUNCATE, in origin mode, owned with their tables by postgres, and are the only TRUNCATE triggers in public", async () => {
      expect(
        await rows(
          `SELECT c.relname AS table, t.tgname AS trigger, t.tgenabled::text AS enabled,
                  (t.tgtype::int & 1) = 0 AS statement_level, (t.tgtype::int & 2) = 2 AS before,
                  (t.tgtype::int & 32) = 32 AS on_truncate, (t.tgtype::int & 28) = 0 AS only_truncate,
                  p.oid::regprocedure::text AS function, pg_get_userbyid(c.relowner) AS owner,
                  p.prosecdef AS definer
             FROM pg_trigger t
             JOIN pg_class c ON c.oid = t.tgrelid
             JOIN pg_namespace n ON n.oid = c.relnamespace
             JOIN pg_proc p ON p.oid = t.tgfoid
            WHERE n.nspname = 'public' AND NOT t.tgisinternal AND (t.tgtype::int & 32) = 32
            ORDER BY 1`,
        ),
      ).toEqual(
        [...SEALED].sort().map((table) => ({
          table,
          trigger: `${table}_no_truncate`,
          enabled: "O",
          statement_level: true,
          before: true,
          on_truncate: true,
          only_truncate: true,
          function: "private.refuse_sealed_truncate()",
          owner: "postgres",
          definer: false,
        })),
      );
    });

    it("service_role holds none of the four on any relation in public, on the table or on a column, directly or through a role, and CREATE on no schema at all", async () => {
      expect(
        await rows(
          `SELECT c.relname AS relation, p AS privilege
             FROM pg_class c
             JOIN pg_namespace n ON n.oid = c.relnamespace
            CROSS JOIN unnest($1::text[]) AS p
            WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
              AND (has_table_privilege('service_role', c.oid, p)
                   OR (p = 'REFERENCES' AND has_any_column_privilege('service_role', c.oid, p)))
            ORDER BY 1, 2`,
          [FOUR],
        ),
      ).toEqual([]);
      expect(
        await rows(
          `SELECT nspname FROM pg_namespace
            WHERE nspname !~ '^(pg_|information_schema$)'
              AND has_schema_privilege('service_role', oid, 'CREATE')
            ORDER BY 1`,
        ),
      ).toEqual([]);
    });

    it("postgres's default privileges give service_role none of the four, in public or for every schema, and a table created after the migration gets the hosted defaults' DML only", async () => {
      expect(
        await rows(
          `SELECT coalesce(nullif(d.defaclnamespace, 0)::regnamespace::text, 'every schema') AS scope,
                  a.privilege_type AS privilege
             FROM pg_default_acl d
            CROSS JOIN LATERAL aclexplode(d.defaclacl) a
            WHERE d.defaclrole = 'postgres'::regrole
              AND a.grantee = 'service_role'::regrole
              AND a.privilege_type = ANY ($1::text[])`,
          [FOUR],
        ),
      ).toEqual([]);
      await db.query("BEGIN");
      try {
        await db.query("CREATE TABLE public.acc2841_later (id integer)");
        expect(
          await rows(
            `SELECT p AS privilege, has_table_privilege('service_role', 'public.acc2841_later', p) AS held
               FROM unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN']) AS p`,
          ),
        ).toEqual([
          { privilege: "SELECT", held: true },
          { privilege: "INSERT", held: true },
          { privilege: "UPDATE", held: true },
          { privilege: "DELETE", held: true },
          { privilege: "TRUNCATE", held: false },
          { privilege: "REFERENCES", held: false },
          { privilege: "TRIGGER", held: false },
          { privilege: "MAINTAIN", held: false },
        ]);
      } finally {
        await db.query("ROLLBACK");
      }
    });

    it("the catalog gate passes the replay, and names a planted TRUNCATE, a column REFERENCES, a TRIGGER held through a role, and CREATE on a schema", async () => {
      const clean = runTenantRlsCatalogGate({ databaseUrl: replay.url });
      expect(clean.failures).toEqual([]);
      expect(clean.ok).toBe(true);
      const holder = `acc2841_${randomUUID().replaceAll("-", "")}`;
      await db.query("BEGIN");
      try {
        await db.query(
          `GRANT TRUNCATE ON public.donations TO service_role;
           GRANT REFERENCES (name) ON public.funds TO service_role;
           CREATE ROLE ${holder} NOLOGIN;
           GRANT TRIGGER ON public.staged_gifts TO ${holder};
           GRANT ${holder} TO service_role;
           GRANT CREATE ON SCHEMA platform TO service_role;`,
        );
        const snapshot = JSON.parse(
          String(
            (await db.query({ text: TENANT_RLS_CATALOG_SQL, rowMode: "array" }))
              .rows[0][0],
          ),
        );
        const evaluated = evaluateTenantRlsCatalog(
          snapshot,
          readJson(TENANT_RLS_EXCEPTIONS_PATH),
          readJson(ANON_DEFINER_ALLOWLIST_PATH),
          readJson(TENANT_POLICY_EXCEPTIONS_PATH),
        );
        expect(
          evaluated.failures
            .filter((f: { code: string }) => f.code.startsWith("SERVICE_ROLE"))
            .map(
              (f: { code: string; table?: string; detail: string }) =>
                `${f.code} ${f.table} ${f.detail.split(":")[0]}`,
            ),
        ).toEqual([
          "SERVICE_ROLE_UNSAFE_PRIVILEGE donations service_role holds TRUNCATE",
          "SERVICE_ROLE_UNSAFE_PRIVILEGE funds service_role holds REFERENCES on column name",
          "SERVICE_ROLE_UNSAFE_PRIVILEGE staged_gifts service_role holds TRIGGER",
          "SERVICE_ROLE_SCHEMA_CREATE platform service_role holds CREATE on schema platform",
        ]);
      } finally {
        await db.query("ROLLBACK");
      }
    });

    it("no SECURITY INVOKER function service_role may execute locks or maintains a table, so none needs MAINTAIN (guard)", async () => {
      expect(
        await rows(
          `SELECT p.oid::regprocedure::text AS function
             FROM pg_proc p
             JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
              AND NOT p.prosecdef
              AND has_function_privilege('service_role', p.oid, 'EXECUTE')
              AND (p.prosrc || coalesce(pg_get_function_sqlbody(p.oid), ''))
                  ~* '(\\mlock\\M\\s+(table\\s+)?[a-z_."]+\\s+in\\s|\\mvacuum\\M|\\manalyze\\M|\\mcluster\\M|\\mreindex\\M|refresh\\s+materialized\\s+view)'
            ORDER BY 1`,
        ),
      ).toEqual([]);
    });

    it("postgres, replica mode: the existing removeTwoTenants cleanup still runs and removes both organizations' rows from the five tables (guard)", async () => {
      await removeTwoTenants(db, fx);
      expect(await lineRows()).toEqual({
        staged_gifts: 0,
        staged_gift_allocations: 0,
        donations: 0,
        donation_intake_lines: 0,
        payment_observations: 0,
      });
      expect(
        await rows(
          "SELECT id FROM public.tenants WHERE id = ANY ($1::uuid[])",
          [[fx.A.tenant, fx.B.tenant]],
        ),
      ).toEqual([]);
    });
  },
);
