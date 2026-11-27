import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

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
import {
  ANON_DEFINER_ALLOWLIST_PATH,
  TENANT_POLICY_EXCEPTIONS_PATH,
  TENANT_RLS_CATALOG_SQL,
  TENANT_RLS_EXCEPTIONS_PATH,
  evaluateTenantRlsCatalog,
  runTenantRlsCatalogGate,
} from "../../../../scripts/verify/tenant-rls-catalog.mjs";
import { postAssert } from "../issue-2674/harness";
import { Replay, migrationFile } from "../issue-2674/privileges-harness";

const BUILD_TIMEOUT = 900_000;
const SEALED = [
  "staged_gifts",
  "staged_gift_allocations",
  "donations",
  "donation_intake_lines",
  "payment_observations",
] as const;
const WRITERS_ORDER = [
  "donations",
  "donation_intake_lines",
  "payment_observations",
  "staged_gifts",
  "staged_gift_allocations",
];
const FOUR = ["TRUNCATE", "REFERENCES", "TRIGGER", "MAINTAIN"] as const;
const MIGRATION = migrationFile("wp8a2_service_role_privileges");
const POST_ASSERT_TAG = "service_role privileges and sealed truncate";

type Answer = { code: string | null; message?: string; detail?: string };

const readJson = (file: string) =>
  JSON.parse(readFileSync(file, "utf8")) as unknown;

const migrationText = () => readFileSync(MIGRATION, "utf8");

const forwardBody = () => {
  const m = /^BEGIN;$([\s\S]*)^COMMIT;$/m.exec(migrationText());
  if (!m) throw new Error(`${MIGRATION} has no BEGIN; ... COMMIT; body`);
  return m[1]!;
};

const downStatements = () => {
  const lines = migrationText().split("\n");
  const start = lines.indexOf("--   BEGIN;");
  const end = lines.indexOf("--   COMMIT;", start);
  if (start < 0 || end < 0) throw new Error("the header's Down is missing");
  return lines
    .slice(start + 1, end)
    .map((line) => line.replace(/^-- {3}/, ""))
    .join("\n");
};

const GUARD_SQL = `SELECT p.oid::regprocedure::text AS function
   FROM pg_proc p
   JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    AND NOT p.prosecdef
    AND (has_function_privilege('service_role', p.oid, 'EXECUTE')
         OR EXISTS (SELECT 1 FROM pg_trigger t
                      JOIN pg_class c ON c.oid = t.tgrelid
                      JOIN pg_namespace tn ON tn.oid = c.relnamespace
                     WHERE t.tgfoid = p.oid AND tn.nspname = 'public'))
    AND (p.prosrc || coalesce(pg_get_function_sqlbody(p.oid), ''))
        ~* '(\\mlock\\s+(table\\s+)?(only\\s+)?[a-z0-9_."]+\\s*\\*?\\s*(,|;|\\min\\M|\\mnowait\\M|$)|\\mvacuum\\M|\\manalyze\\M|\\mcluster\\M|\\mreindex\\M|refresh\\s+materialized\\s+view)'
  ORDER BY 1`;

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe("AL-2681 WP8a part 2, issue 2841: the migration's text (fix round)", () => {
  it("R6: the forward file takes SHARE ROW EXCLUSIVE on the five sealed tables first, in the writers' order (donations, intake lines, observations, staged gifts, allocations), and creates their triggers in that order", () => {
    const body = forwardBody();
    const locks = [
      ...body.matchAll(
        /^LOCK TABLE public\.(\w+) IN SHARE ROW EXCLUSIVE MODE;$/gm,
      ),
    ];
    expect(locks.map((m) => m[1])).toEqual(WRITERS_ORDER);
    const triggers = [...body.matchAll(/^CREATE TRIGGER (\w+)_no_truncate$/gm)];
    expect(triggers.map((m) => m[1])).toEqual(WRITERS_ORDER);
    expect(locks.at(-1)!.index!).toBeLessThan(
      body.indexOf("REVOKE TRUNCATE, REFERENCES, TRIGGER"),
    );
  });

  it("R3: the header's Down locks all five sealed tables before its check, and its check refuses a line-based row in any of the five", () => {
    const down = downStatements();
    const lock = /LOCK TABLE ([\w.,\s]+) IN ACCESS EXCLUSIVE MODE;/.exec(down);
    expect(lock).not.toBeNull();
    expect(
      lock![1]!
        .split(",")
        .map((t) => t.trim())
        .sort(),
    ).toEqual(SEALED.map((t) => `public.${t}`).sort());
    const check = down.indexOf("DO $$");
    expect(lock!.index).toBeLessThan(check);
    const guard = down.slice(check, down.indexOf("$$;", check));
    for (const table of SEALED)
      expect(guard, table).toContain(`FROM public.${table}`);
    expect(down.indexOf("DROP TRIGGER")).toBeGreaterThan(check);
  });
});

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

    it("the five triggers are statement-level BEFORE TRUNCATE, in origin mode, owned with their tables by postgres, and are the only TRUNCATE triggers on the five tables (D-18, AL-2681 rest PR 1: three more sealed tables, donation_intake_contacts, staged_gift_holds and payment_event_cases, refuse TRUNCATE through their own rule functions, so this pin reads issue 2841's five)", async () => {
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
              AND c.relname = ANY ($1::text[])
            ORDER BY 1`,
          [[...SEALED]],
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
              AND d.defaclnamespace IN ('public'::regnamespace, 0)
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

    it("R2: the gate and the post-assert name a TRIGGER on a sealed table and CREATE on authz that service_role reaches only by SET ROLE (WITH INHERIT FALSE, SET TRUE)", async () => {
      const holder = `acc2841_${randomUUID().replaceAll("-", "")}`;
      const plant = `CREATE ROLE ${holder} NOLOGIN;
         GRANT TRIGGER ON public.staged_gifts TO ${holder};
         GRANT USAGE, CREATE ON SCHEMA authz TO ${holder};
         GRANT ${holder} TO service_role WITH INHERIT FALSE, SET TRUE;`;
      await db.query("BEGIN");
      try {
        await db.query(plant);
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
              (f: { code: string; table?: string }) => `${f.code} ${f.table}`,
            ),
        ).toEqual([
          "SERVICE_ROLE_UNSAFE_PRIVILEGE staged_gifts",
          "SERVICE_ROLE_SCHEMA_CREATE authz",
        ]);
        await db.query("SAVEPOINT acc2841_assert");
        const refused = await db
          .query(postAssert(MIGRATION, POST_ASSERT_TAG))
          .then(
            () => null,
            (error: { code?: string; message?: string }) =>
              `${error.code} ${error.message}`,
          );
        await db.query("ROLLBACK TO SAVEPOINT acc2841_assert");
        expect(refused).toBe(
          "P0001 AL-2681: service_role still holds in public: staged_gifts TRIGGER",
        );
      } finally {
        await db.query("ROLLBACK");
      }
      await db.query("BEGIN");
      try {
        await db.query(
          `CREATE ROLE ${holder} NOLOGIN;
           GRANT USAGE, CREATE ON SCHEMA authz TO ${holder};
           GRANT ${holder} TO service_role WITH INHERIT FALSE, SET TRUE;`,
        );
        const refused = await db
          .query(postAssert(MIGRATION, POST_ASSERT_TAG))
          .then(
            () => null,
            (error: { code?: string; message?: string }) =>
              `${error.code} ${error.message}`,
          );
        expect(refused).toBe(
          "P0001 AL-2681: service_role still holds CREATE on schema: authz",
        );
      } finally {
        await db.query("ROLLBACK");
      }
    });

    it("no SECURITY INVOKER function that service_role may execute, nor any trigger function on a table in public, locks or maintains a table, so none needs MAINTAIN (guard)", async () => {
      expect(await rows(GUARD_SQL)).toEqual([]);
    });

    it("R5: that guard turns red on a SECURITY INVOKER trigger function on a table in public that service_role may not execute, with a bare LOCK TABLE, LOCK TABLE ONLY, two tables, a name with digits, and ANALYZE", async () => {
      await db.query("BEGIN");
      try {
        const bodies: Record<string, string> = {
          acc2841_bare: "LOCK TABLE public.acc2841_t2;",
          acc2841_only: "LOCK TABLE ONLY public.acc2841_t2 IN SHARE MODE;",
          acc2841_two: "LOCK public.funds, public.acc2841_t2 IN SHARE MODE;",
          acc2841_analyze: "ANALYZE public.acc2841_t2;",
        };
        await db.query("CREATE TABLE public.acc2841_t2 (id integer)");
        for (const [name, statement] of Object.entries(bodies))
          await db.query(
            `CREATE FUNCTION private.${name}() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $f$ BEGIN ${statement} RETURN NEW; END $f$;
             REVOKE ALL ON FUNCTION private.${name}() FROM PUBLIC;
             CREATE TRIGGER ${name} BEFORE INSERT ON public.acc2841_t2 FOR EACH ROW EXECUTE FUNCTION private.${name}();`,
          );
        expect(
          await rows(
            "SELECT bool_or(has_function_privilege('service_role', p.oid, 'EXECUTE')) AS any FROM pg_proc p WHERE p.proname LIKE 'acc2841\\_%'",
          ),
        ).toEqual([{ any: false }]);
        expect((await rows(GUARD_SQL)).map((r) => r.function)).toEqual(
          Object.keys(bodies)
            .sort()
            .map((name) => `private.${name}()`),
        );
      } finally {
        await db.query("ROLLBACK");
      }
    });

    it("R3: the header's Down refuses, 55000, while a line-based row exists, and changes nothing", async () => {
      await db.query("BEGIN");
      try {
        const refused = await db.query(downStatements()).then(
          () => null,
          (error: { code?: string; message?: string }) =>
            `${error.code} ${error.message}`,
        );
        expect(refused).toBe(
          "55000 Down of 20261126190000 refused: a line-based row exists",
        );
      } finally {
        await db.query("ROLLBACK");
      }
      expect(
        await rows(
          "SELECT count(*)::int AS n FROM pg_trigger WHERE tgname LIKE '%\\_no\\_truncate' AND tgrelid IN (SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relname IN ('staged_gifts', 'staged_gift_allocations', 'donations', 'donation_intake_lines', 'payment_observations'))",
        ),
      ).toEqual([{ n: 5 }]);
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

    it("R3: with no line-based row left, the Down drops the five triggers and the function and re-grants nothing (rolled back)", async () => {
      await db.query("BEGIN");
      try {
        await db.query(downStatements());
        expect(
          await rows(
            `SELECT (SELECT count(*)::int FROM pg_trigger WHERE tgname LIKE '%\\_no\\_truncate' AND tgrelid IN (SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relname IN ('staged_gifts', 'staged_gift_allocations', 'donations', 'donation_intake_lines', 'payment_observations'))) AS triggers,
                    to_regprocedure('private.refuse_sealed_truncate()') IS NULL AS function_gone,
                    has_table_privilege('service_role', 'public.donations', 'TRUNCATE') AS truncate,
                    has_schema_privilege('service_role', 'authz', 'CREATE') AS create_authz`,
          ),
        ).toEqual([
          {
            triggers: 0,
            function_gone: true,
            truncate: false,
            create_authz: false,
          },
        ]);
      } finally {
        await db.query("ROLLBACK");
      }
    });
  },
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2, issue 2841, F0: the migration on a replay with the hosted defaults whose postgres also holds default privileges in another schema (as on the platform's storage) and for every schema (D-18, AL-2681 fix round F8: the replay ends before this migration, since 20261127030000 now refuses to run until it is applied)",
  () => {
    let replay: Replay;
    let db: pg.Client;
    const rows = async (sql: string, params: unknown[] = []) =>
      (await db.query(sql, params)).rows as Record<string, unknown>[];
    let applied: string | null = "not run";

    beforeAll(async () => {
      replay = await new Replay(ADMIN_URL, true).build(
        (file) => file >= MIGRATION.slice(MIGRATION.lastIndexOf("/") + 1),
      );
      db = new pg.Client({ connectionString: replay.url });
      await db.connect();
      await db.query(
        `CREATE SCHEMA acc2841_platform;
         ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA acc2841_platform GRANT ALL ON TABLES TO service_role;
         ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT TRUNCATE, TRIGGER ON TABLES TO service_role;`,
      );
      applied = await db.query(migrationText()).then(
        () => null,
        async (error: { code?: string; message?: string }) => {
          await db.query("ROLLBACK").catch(() => undefined);
          return `${error.code} ${error.message}`;
        },
      );
    }, BUILD_TIMEOUT);

    afterAll(async () => {
      await db?.end().catch(() => undefined);
      await replay?.close();
    }, 120_000);

    it("the migration commits", () => {
      expect(applied).toBeNull();
    });

    it("a table postgres then creates in public gives service_role none of the four, the global entry no longer grants them, and the other schema's default privileges are as they were", async () => {
      expect(
        await rows(
          `SELECT coalesce(nullif(d.defaclnamespace, 0)::regnamespace::text, 'every schema') AS scope,
                  string_agg(a.privilege_type, ',' ORDER BY a.privilege_type) AS privileges
             FROM pg_default_acl d
            CROSS JOIN LATERAL aclexplode(d.defaclacl) a
            WHERE d.defaclrole = 'postgres'::regrole AND a.grantee = 'service_role'::regrole
              AND d.defaclobjtype = 'r'
            GROUP BY 1 ORDER BY 1`,
        ),
      ).toEqual([
        {
          scope: "acc2841_platform",
          privileges:
            "DELETE,INSERT,MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE",
        },
        { scope: "public", privileges: "DELETE,INSERT,SELECT,UPDATE" },
      ]);
      await db.query("BEGIN");
      try {
        await db.query(
          "CREATE TABLE public.acc2841_later (id integer); CREATE TABLE acc2841_platform.acc2841_later (id integer)",
        );
        expect(
          await rows(
            `SELECT t AS "table", string_agg(p, ',' ORDER BY p) FILTER (WHERE has_table_privilege('service_role', t, p)) AS held
               FROM unnest(array['public.acc2841_later', 'acc2841_platform.acc2841_later']) AS t
              CROSS JOIN unnest(array['TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN']) AS p
              GROUP BY t ORDER BY t`,
          ),
        ).toEqual([
          {
            table: "acc2841_platform.acc2841_later",
            held: "MAINTAIN,REFERENCES,TRIGGER,TRUNCATE",
          },
          { table: "public.acc2841_later", held: null },
        ]);
      } finally {
        await db.query("ROLLBACK");
      }
    });

    it("the catalog gate passes it: the gate reads no default privileges, the relations of public only, and CREATE on the schemas the release fingerprint covers, failing only on the super-admin branches, bare staff reads and field_policies_read pin that 20261127040000, later in the chain than this replay, closes (D-18, AL-2675: the gate holds WP2c rest B's rules since then), and on the allowlisted checkout config read, which a later file creates (D-18, AL-2681 PR 2a: 20261127050200 is after this replay's last file; D-18, AL-2681 PR 2b: named in its four-argument form, which 20261127080100 creates)", () => {
      const gate = runTenantRlsCatalogGate({ databaseUrl: replay.url });
      const wp2cFile = readdirSync("supabase/migrations").find((f) =>
        /^\d{14}_wp2c_rest_no_super_admin\.sql$/.test(f),
      );
      expect(wp2cFile).toBeDefined();
      const noSuperAdminBody = readFileSync(
        `supabase/migrations/${wp2cFile}`,
        "utf8",
      )
        .split("\n")
        .filter((line) => !/^\s*--/.test(line))
        .join("\n");
      const alteredByWp2cB = new Set(
        [
          ...noSuperAdminBody.matchAll(
            /^ALTER POLICY "([^"]+)" ON public\.([a-z_]+)$/gm,
          ),
        ].map((m) => `${m[2]}|${m[1]}`),
      );
      expect(alteredByWp2cB.size).toBe(62);
      const isAltered = (f: { table?: string; detail?: string }) => {
        const policy = /^policy "([^"]+)"/.exec(f.detail ?? "")?.[1];
        return (
          policy !== undefined && alteredByWp2cB.has(`${f.table}|${policy}`)
        );
      };
      const later = (f: {
        code: string;
        table?: string;
        detail?: string;
        function?: string;
      }) =>
        (f.code === "ANON_ALLOWLIST_STALE" &&
          f.function ===
            "public.checkout_giving_config(p_host text, p_targets jsonb, p_surface text, p_source_site uuid)") ||
        ((f.code === "POLICY_SUPER_ADMIN_BRANCH" ||
          f.code === "TENANT_CONDITION_MISSING" ||
          f.code === "STAFF_READ_ON_BARE_STAFF_CHECK") &&
          isAltered(f)) ||
        (f.code === "POLICY_EXCEPTION_CHANGED" &&
          f.table === "field_policies" &&
          /^policy "field_policies_read"/.test(f.detail ?? ""));
      expect(
        later({
          code: "TENANT_CONDITION_MISSING",
          table: "donations",
          detail: 'policy "planted" (SELECT) admits a row without tenant',
        }),
      ).toBe(false);
      expect(
        later({
          code: "STAFF_READ_ON_BARE_STAFF_CHECK",
          table: "profiles",
          detail: 'policy "planted" admits staff',
        }),
      ).toBe(false);
      expect(
        later({
          code: "POLICY_EXCEPTION_CHANGED",
          table: "field_policies",
          detail: 'policy "planted" differs',
        }),
      ).toBe(false);
      const remaining = gate.failures.filter((f) => !later(f));
      expect(remaining).toEqual([]);
      expect(gate.ok).toBe(gate.failures.length === 0);
    });
  },
);
