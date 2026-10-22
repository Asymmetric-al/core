/**
 * Real-stack integration test for GitHub issue #2067 addendum 4 — the
 * `document_cutover_reader` role and the private `document_cutover`
 * functions on a real Postgres with the repo's migrations applied.
 * Addendum 4 (Blake-approved 2026-10-20 10:31 PM PT), criterion 10 last item,
 * plus the database half of criteria 5 and 6:
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * ## Running it
 *
 * Skipped unless `DOCUMENT_CUTOVER_IT_ADMIN_DATABASE_URL` is set. Set it to
 * an admin connection for a disposable database with every migration
 * applied.
 *
 * Ruling 7 (Samson, 2026-10-20 11:03 PM PT): the CI Integration job runs it
 * on the existing `postgres:15` service container with
 * scripts/sql/supabase-compat-bootstrap.sql applied first and the migrations
 * applied by scripts/verify/supabase-migrations.mjs — NOT `supabase start`.
 * The bootstrap must provide the roles anon, authenticated, service_role and
 * authenticator and the supabase_migrations schema (schema_migrations with a
 * version column); Builder extends it. The "CI bootstrap" test below checks
 * that precondition. Locally the same layout works on any Postgres 15+:
 *
 *   DOCUMENT_CUTOVER_IT_ADMIN_DATABASE_URL=postgresql://postgres:<local-db-password>@127.0.0.1:5432/<disposable-db> \
 *     bun x vitest run tests/unit/acceptance/issue-2067/reader-role.integration.acceptance.test.ts
 *
 * The admin role must be able to ALTER ROLE document_cutover_reader (CREATEROLE
 * with admin option, or superuser), SET ROLE anon / authenticated /
 * service_role, and own public.pdf_templates. `psql` must be on PATH, or set
 * `PSQL_BIN` (the CI Integration job installs it with
 * scripts/github/install-postgresql-client.sh).
 *
 * ## What it does
 *
 * 1. Sets a random test-only password at test time
 *    (`ALTER ROLE document_cutover_reader WITH LOGIN PASSWORD ...`) and logs in
 *    as the reader over TCP. Afterwards it restores `NOLOGIN PASSWORD NULL`.
 * 2. Proves the reader CAN execute each `document_cutover` function and
 *    CANNOT select from any table directly (auth.users,
 *    supabase_migrations.schema_migrations, storage.objects, every detector
 *    table; and no table/sequence privilege anywhere beyond PUBLIC's).
 * 3. Proves anon, authenticated and service_role get SQLSTATE 42501 calling
 *    each function, and checks the catalog lockdown (owner postgres,
 *    SECURITY DEFINER, search_path '', row_security off, ACLs, default
 *    privileges via a rolled-back probe object).
 * 4. Criterion 6: inside a rolled-back transaction, inserts rows into
 *    public.pdf_templates, turns on ENABLE + FORCE ROW LEVEL SECURITY, switches
 *    to the reader role and requires the table-census function to count every
 *    row (Supabase's `postgres` owns the functions and has BYPASSRLS).
 *
 * Function names, arguments and result columns come from the pinned
 * contract in ./document-cutover-contract.ts (ruling 2); the census is
 * `document_cutover.table_census(p_table text)`. Ruling 9 (idempotent,
 * never-dropped role), ruling 10 option (b) (every function in pg_proc is
 * executable only by the reader and its owner, PUBLIC included; schema USAGE
 * only for the reader and owner) and ruling 11 (numeric result columns only)
 * are checked against the catalog. The static half of ruling 10 is in
 * ./migration-lockdown.acceptance.test.ts: the explicit per-function
 * REVOKE ... FROM PUBLIC, anon, authenticated, service_role, GRANT EXECUTE
 * only to the reader and no schema grant to anyone else are exactly the
 * statements that produce the ACLs checked here.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { REPO_ROOT } from "./command-harness";
import {
  DOCUMENT_CUTOVER_FUNCTIONS,
  NUMERIC_RESULT_TYPES,
  contractFunction,
} from "./document-cutover-contract";
import { PHASE_18_PROTOTYPE_DOCUMENT_TABLES } from "../../../../packages/api/src/document-cutover";

const ADMIN_URL = process.env.DOCUMENT_CUTOVER_IT_ADMIN_DATABASE_URL ?? "";
const PSQL = process.env.PSQL_BIN || "psql";
const READER = "document_cutover_reader";
const LOCKED_OUT_ROLES = ["anon", "authenticated", "service_role"];
const DIRECT_READ_TARGETS = [
  "auth.users",
  "supabase_migrations.schema_migrations",
  "storage.objects",
  ...PHASE_18_PROTOTYPE_DOCUMENT_TABLES.map((table) => `public.${table}`),
];

interface PsqlResult {
  status: number | null;
  stdout: string;
  stderr: string;
  sqlstate: string | undefined;
}

function psql(url: string, script: string, password?: string): PsqlResult {
  const env: Record<string, string | undefined> = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    PGCONNECT_TIMEOUT: "10",
  };
  if (password !== undefined) env.PGPASSWORD = password;
  const child = spawnSync(
    PSQL,
    [
      "--no-psqlrc",
      "-X",
      "-q",
      "-A",
      "-t",
      "-F",
      "\t",
      "-v",
      "ON_ERROR_STOP=1",
      "-v",
      "VERBOSITY=verbose",
      "-d",
      url,
      "-f",
      "-",
    ],
    { input: script, encoding: "utf8", env, timeout: 60_000 },
  );
  if (child.error) throw child.error;
  return {
    status: child.status,
    stdout: child.stdout,
    stderr: child.stderr,
    sqlstate: /ERROR:\s+([0-9A-Z]{5}):/.exec(child.stderr)?.[1],
  };
}

function admin(script: string): PsqlResult {
  return psql(ADMIN_URL, script);
}

function adminOk(script: string): string[] {
  const result = admin(script);
  if (result.status !== 0) {
    throw new Error(`admin psql failed (${result.sqlstate}): ${result.stderr}`);
  }
  return result.stdout.split("\n").filter((line) => line.length > 0);
}

function quoteLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

/** The admin URL with the reader as user and no inline password. */
function readerUrl(): string {
  const url = new URL(ADMIN_URL);
  url.username = READER;
  url.password = "";
  if (!url.hostname || url.hostname.startsWith("/")) url.hostname = "127.0.0.1";
  return url.toString();
}

interface CutoverFunction {
  signature: string;
  name: string;
  argTypes: string[];
}

function listFunctions(): CutoverFunction[] {
  return adminOk(`
    select p.oid::regprocedure::text, p.proname,
           coalesce(array_to_string(array(select format_type(t, null) from unnest(p.proargtypes) t), ','), '')
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'document_cutover'
    order by 1;
  `).map((line) => {
    const [signature, name, types] = line.split("\t") as [
      string,
      string,
      string,
    ];
    return { signature, name, argTypes: types ? types.split(",") : [] };
  });
}

/** `select * from document_cutover.f(...)` with a detector table for text args. */
function callSql(fn: CutoverFunction): string {
  const args = fn.argTypes.map((type) =>
    /^(text|character varying|name)$/.test(type)
      ? "'pdf_templates'"
      : `NULL::${type}`,
  );
  return `select * from document_cutover.${fn.name}(${args.join(", ")});`;
}

interface ResultColumn {
  fn: string;
  name: string;
  type: string;
  retset: string;
}

/** Output columns (OUT/TABLE args) or the scalar return type of every function. */
function listResultColumns(): ResultColumn[] {
  return adminOk(`
    select p.proname, coalesce(u.n, ''), format_type(u.t, null), p.proretset::text
    from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace,
    lateral unnest(
      coalesce(p.proallargtypes, array[p.prorettype]),
      coalesce(p.proargmodes, array['o'::"char"]),
      case when p.proallargtypes is null then array[''::text] else p.proargnames end
    ) as u(t, m, n)
    where ns.nspname = 'document_cutover' and u.m in ('o', 't', 'b')
    order by 1, 2;
  `).map((line) => {
    const [fn, name, type, retset] = line.split("\t") as [
      string,
      string,
      string,
      string,
    ];
    return { fn, name, type, retset };
  });
}

/** DO blocks in the document_cutover migration(s) that create the reader role. */
function readerRoleDoBlocks(): string[] {
  const dir = path.join(REPO_ROOT, "supabase", "migrations");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".sql") && !file.startsWith("rollback"))
    .map((file) => readFileSync(path.join(dir, file), "utf8"))
    .filter((sql) =>
      /create\s+schema\s+(if\s+not\s+exists\s+)?"?document_cutover"?/i.test(
        sql,
      ),
    )
    .flatMap((sql) => [
      ...sql.matchAll(
        /\bdo\s+(\$[a-z_]*\$)[\s\S]*?\1\s*(language\s+plpgsql\s*)?;/gi,
      ),
    ])
    .map((match) => match[0])
    .filter((block) =>
      new RegExp(`create\\s+role\\s+"?${READER}"?`, "i").test(block),
    );
}

const enabled = ADMIN_URL.length > 0;

describe.skipIf(!enabled)(
  "issue #2067 addendum 4 — real stack: document_cutover_reader and document_cutover functions",
  () => {
    const password = randomBytes(24).toString("hex");
    let functions: CutoverFunction[] = [];
    let loginSet = false;
    let initialLogin: string | undefined;

    function reader(script: string): PsqlResult {
      return psql(readerUrl(), script, password);
    }

    beforeAll(() => {
      const version = spawnSync(PSQL, ["--version"], { encoding: "utf8" });
      if (version.error || version.status !== 0) {
        throw new Error(
          `psql not found (${PSQL}); install a PostgreSQL client or set PSQL_BIN.`,
        );
      }
      functions = listFunctions();
      initialLogin = adminOk(
        `select rolcanlogin from pg_roles where rolname = '${READER}';`,
      )[0];
      if (initialLogin !== undefined) {
        adminOk(
          `alter role ${READER} with login password ${quoteLiteral(password)};`,
        );
        loginSet = true;
      }
    });

    afterAll(() => {
      if (loginSet) {
        adminOk(`alter role ${READER} with nologin password null;`);
      }
    });

    it("migration applied: document_cutover_reader exists as NOLOGIN, non-superuser, no BYPASSRLS, and the schema has functions", () => {
      // NOLOGIN as migrated (observed before this test turned LOGIN on).
      expect(initialLogin).toBe("f");
      const rows = adminOk(
        `select rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolreplication from pg_roles where rolname = '${READER}';`,
      );
      expect(rows).toEqual(["f\tf\tf\tf\tf"]);
      expect(functions.length).toBeGreaterThan(0);
    });

    it("ruling 7 (CI bootstrap): the database provides roles anon, authenticated, service_role, authenticator and supabase_migrations.schema_migrations(version)", () => {
      const roles = adminOk(`
        select rolname from pg_roles
        where rolname in ('anon', 'authenticated', 'service_role', 'authenticator')
        order by 1;
      `);
      expect(roles).toEqual([
        "anon",
        "authenticated",
        "authenticator",
        "service_role",
      ]);
      expect(
        adminOk(`
          select a.attname from pg_attribute a
          where a.attrelid = to_regclass('supabase_migrations.schema_migrations')
            and a.attname = 'version' and not a.attisdropped;
        `),
      ).toEqual(["version"]);
    });

    it("ruling 2: the database's document_cutover functions are exactly the pinned contract (names and argument types)", () => {
      expect(
        functions.map((fn) => `${fn.name}(${fn.argTypes.join(",")})`).sort(),
      ).toEqual(
        DOCUMENT_CUTOVER_FUNCTIONS.map(
          (fn) => `${fn.name}(${fn.args.map((arg) => arg.type).join(",")})`,
        ).sort(),
      );
    });

    it("ruling 11: every document_cutover function's result columns are numeric (pg_proc), single-row scalars or TABLE columns named as in the contract", () => {
      const columns = listResultColumns();
      const nonNumeric = columns
        .filter((column) => !NUMERIC_RESULT_TYPES.has(column.type))
        .map(
          (column) =>
            `${column.fn}.${column.name || "<return>"}: ${column.type}`,
        );
      expect(nonNumeric).toEqual([]);
      for (const fn of DOCUMENT_CUTOVER_FUNCTIONS) {
        const mine = columns.filter((column) => column.fn === fn.name);
        if (fn.columns.length > 1) {
          expect(
            mine.map((column) => column.name),
            fn.name,
          ).toEqual(fn.columns.map((column) => column.name).sort());
        } else {
          expect(mine, fn.name).toHaveLength(1);
          // A scalar SETOF would be a row stream, not a count.
          if (mine[0]?.name === "")
            expect(mine[0]?.retset, fn.name).toBe("false");
        }
      }
    });

    it("ruling 9: the migration's CREATE ROLE DO block is idempotent — re-running it with the role present succeeds (rolled back)", () => {
      const blocks = readerRoleDoBlocks();
      expect(
        blocks.length,
        "no DO block creating document_cutover_reader",
      ).toBeGreaterThan(0);
      const result = admin(`begin;\n${blocks.join("\n")}\nrollback;`);
      expect(result.stderr).toBe("");
      expect(result.status).toBe(0);
    });

    it("document_cutover_reader has no membership (direct or inherited) in postgres, service_role or authenticator", () => {
      const rows = adminOk(`
        select r.rolname from pg_roles r
        where r.rolname in ('postgres', 'service_role', 'authenticator', 'supabase_admin')
          and pg_has_role('${READER}', r.oid, 'member');
      `);
      expect(rows).toEqual([]);
    });

    it("the reader logs in with the test-only password and is current_user = document_cutover_reader", () => {
      const result = reader("select current_user;");
      expect(result.stderr).toBe("");
      expect(result.stdout.trim()).toBe(READER);
    });

    it("criterion 10: the reader CAN execute each document_cutover function", () => {
      expect(functions.length).toBeGreaterThan(0);
      const failures: string[] = [];
      for (const fn of functions) {
        const result = reader(callSql(fn));
        const allText = fn.argTypes.every((type) =>
          /^(text|character varying|name)$/.test(type),
        );
        if (allText ? result.status !== 0 : result.sqlstate === "42501") {
          failures.push(
            `${fn.signature}: ${result.sqlstate} ${result.stderr.trim()}`,
          );
        }
      }
      expect(failures).toEqual([]);
    });

    it.each(DIRECT_READ_TARGETS)(
      "criterion 10: the reader CANNOT select directly from %s (42501)",
      (relation) => {
        const result = reader(`select 1 from ${relation} limit 1;`);
        expect(result.status).not.toBe(0);
        expect(result.sqlstate).toBe("42501");
      },
    );

    it("criterion 10: the reader holds no table, view or sequence privilege anywhere beyond what PUBLIC holds", () => {
      const rows = adminOk(`
        select n.nspname || '.' || c.relname || ' (' || c.relkind::text || ')'
        from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where c.relkind in ('r', 'p', 'v', 'm', 'f', 'S')
          and n.nspname not in ('pg_catalog', 'information_schema')
          and n.nspname not like 'pg_toast%'
          and (
            (c.relkind <> 'S' and
              has_table_privilege('${READER}', c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER') and
              not has_table_privilege('public', c.oid, 'SELECT'))
            or (c.relkind = 'S' and
              has_sequence_privilege('${READER}', c.oid, 'USAGE, SELECT, UPDATE') and
              not has_sequence_privilege('public', c.oid, 'USAGE, SELECT, UPDATE'))
          )
        order by 1;
      `);
      expect(rows).toEqual([]);
    });

    it("criterion 5: the reader has USAGE but not CREATE on schema document_cutover, and EXECUTE on every function", () => {
      const rows = adminOk(`
        select has_schema_privilege('${READER}', 'document_cutover', 'USAGE'),
               has_schema_privilege('${READER}', 'document_cutover', 'CREATE');
      `);
      expect(rows).toEqual(["t\tf"]);
      const missing = adminOk(`
        select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'document_cutover' and not has_function_privilege('${READER}', p.oid, 'EXECUTE');
      `);
      expect(missing).toEqual([]);
    });

    it.each(LOCKED_OUT_ROLES)(
      "criterion 5 / 10: calling each document_cutover function as %s fails with SQLSTATE 42501",
      (role) => {
        expect(functions.length).toBeGreaterThan(0);
        const wrong: string[] = [];
        for (const fn of functions) {
          const result = admin(
            `begin;\nset local role ${role};\n${callSql(fn)}\nrollback;`,
          );
          if (result.sqlstate !== "42501") {
            wrong.push(
              `${fn.signature}: ${result.sqlstate ?? "succeeded"} ${result.stderr.trim()}`,
            );
          }
        }
        expect(wrong).toEqual([]);
      },
    );

    it("criterion 5: every function is owned by postgres, SECURITY DEFINER, with search_path '' and row_security off", () => {
      const rows = adminOk(`
        select p.oid::regprocedure::text, r.rolname, p.prosecdef,
               coalesce(array_to_string(p.proconfig, '|'), '')
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
        join pg_roles r on r.oid = p.proowner
        where n.nspname = 'document_cutover' order by 1;
      `);
      expect(rows.length).toBeGreaterThan(0);
      const bad = rows.filter((row) => {
        const [, owner, secdef, config] = row.split("\t") as [
          string,
          string,
          string,
          string,
        ];
        const settings = config.split("|");
        return (
          owner !== "postgres" ||
          secdef !== "t" ||
          !settings.some(
            (s) => s === 'search_path=""' || s === "search_path=''",
          ) ||
          !settings.includes("row_security=off")
        );
      });
      expect(bad).toEqual([]);
    });

    it("criterion 5: PUBLIC, anon, authenticated and service_role have no privilege on the schema or the functions (explicit ACLs, no PUBLIC default)", () => {
      const schemaAcl = adminOk(`
        select coalesce(a.grantee::regrole::text, 'PUBLIC') || ':' || a.privilege_type
        from pg_namespace n, aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) a
        where n.nspname = 'document_cutover'
          and (a.grantee = 0 or a.grantee::regrole::text in ('anon', 'authenticated', 'service_role'));
      `);
      expect(schemaAcl).toEqual([]);
      const functionAcl = adminOk(`
        select p.oid::regprocedure::text || ' -> ' || case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace,
             aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        where n.nspname = 'document_cutover'
          and (a.grantee = 0 or a.grantee::regrole::text in ('anon', 'authenticated', 'service_role'));
      `);
      expect(functionAcl).toEqual([]);
    });

    it("ruling 10 (b) / PR #2169 MINOR-1: every function actually in schema document_cutover (pg_proc.proacl) grants no EXECUTE to PUBLIC (grantee 0), anon, authenticated or service_role, and is executable only by document_cutover_reader and its owner", () => {
      // MINOR-1 ruling: https://github.com/Asymmetric-al/core/pull/2169#issuecomment-6311002194 item 3.
      const namedGrants = adminOk(`
        select p.oid::regprocedure::text || ' -> ' ||
               case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace,
        lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        where n.nspname = 'document_cutover'
          and a.privilege_type = 'EXECUTE'
          and (a.grantee = 0 or a.grantee::regrole::text in ('anon', 'authenticated', 'service_role'))
        order by 1;
      `);
      expect(namedGrants).toEqual([]);
      // Effective privilege (includes PUBLIC and inherited grants).
      const executable = adminOk(`
        select p.oid::regprocedure::text || ' -> ' || r.rolname
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        cross join pg_roles r
        where n.nspname = 'document_cutover'
          and r.rolname in ('anon', 'authenticated', 'service_role')
          and has_function_privilege(r.oid, p.oid, 'EXECUTE')
        order by 1;
      `);
      expect(executable).toEqual([]);
      const violations = adminOk(`
        select p.oid::regprocedure::text || ' -> ' ||
               case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace,
        lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        where n.nspname = 'document_cutover'
          and a.privilege_type = 'EXECUTE'
          and (a.grantee = 0 or a.grantee not in (p.proowner, '${READER}'::regrole))
        order by 1;
      `);
      expect(violations).toEqual([]);
      const missingReader = adminOk(`
        select p.oid::regprocedure::text
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'document_cutover'
          and not has_function_privilege('${READER}', p.oid, 'EXECUTE')
        order by 1;
      `);
      expect(missingReader).toEqual([]);
    });

    it("ruling 10 (b): no role other than document_cutover_reader and the schema owner has USAGE (or any privilege) on schema document_cutover", () => {
      const violations = adminOk(`
        select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end || ':' || a.privilege_type
        from pg_namespace n,
        lateral aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) a
        where n.nspname = 'document_cutover'
          and (a.grantee = 0 or a.grantee not in (n.nspowner, '${READER}'::regrole))
        order by 1;
      `);
      expect(violations).toEqual([]);
      expect(
        adminOk(
          `select has_schema_privilege('${READER}', 'document_cutover', 'USAGE')::text;`,
        ),
      ).toEqual(["true"]);
    });

    it("PR #2169 MINOR-1 / review 6326220905: PUBLIC (aclexplode grantee 0) has no EXECUTE on any existing document_cutover function", () => {
      // Existing functions only. Future-function defaults (pg_default_acl)
      // are out of scope under MINOR-1 (6311002194).
      const publicExecutable = adminOk(`
        select p.oid::regprocedure::text
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'document_cutover'
          and (
            has_function_privilege('public', p.oid, 'EXECUTE')
            or exists (
              select 1
              from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
              where a.grantee = 0 and a.privilege_type = 'EXECUTE'
            )
          )
        order by 1;
      `);
      expect(
        publicExecutable,
        `PUBLIC has EXECUTE on: ${publicExecutable.join(", ")}`,
      ).toEqual([]);
    });

    it("criterion 5 / ruling 10 (b): default privileges in document_cutover grant nothing to anon, authenticated or service_role (probe objects, rolled back)", () => {
      const result = admin(`
        begin;
        create function document_cutover.acceptance_2067_probe() returns integer language sql as 'select 1';
        create table document_cutover.acceptance_2067_probe_t (x integer);
        create sequence document_cutover.acceptance_2067_probe_s;
        select 'GRANTEE', 'function', a.grantee::regrole::text
          from pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
          where p.oid = 'document_cutover.acceptance_2067_probe()'::regprocedure
            and a.grantee <> 0 and a.grantee::regrole::text in ('anon', 'authenticated', 'service_role')
        union all
        select 'GRANTEE', c.relname, a.grantee::regrole::text
          from pg_class c, aclexplode(coalesce(c.relacl, acldefault(case when c.relkind = 'S' then 's' else 'r' end::"char", c.relowner))) a
          where c.oid in ('document_cutover.acceptance_2067_probe_t'::regclass, 'document_cutover.acceptance_2067_probe_s'::regclass)
            and a.grantee <> 0 and a.grantee::regrole::text in ('anon', 'authenticated', 'service_role');
        rollback;
      `);
      expect(result.stderr).toBe("");
      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBe("");
    });

    it("criterion 6: a forced-RLS detector table that has rows is still fully counted by its detector function (reader role, rolled back)", () => {
      const censusName =
        contractFunction("table_census")?.name ?? "table_census";
      const census = functions.find(
        (fn) =>
          fn.name === censusName &&
          fn.argTypes.length === 1 &&
          fn.argTypes[0] === "text",
      );
      expect(
        census,
        `no document_cutover.${censusName}(text) — see ./document-cutover-contract.ts`,
      ).toBeDefined();
      const marker = `acceptance-2067-rls-${randomBytes(6).toString("hex")}`;
      const result = admin(`
        begin;
        insert into public.pdf_templates (name, design)
          select ${quoteLiteral(marker)} || '-' || g, '{}'::jsonb from generate_series(1, 3) g;
        select 'TRUE_COUNT', count(*) from public.pdf_templates;
        select 'MARKED', count(*) from public.pdf_templates where name like ${quoteLiteral(`${marker}-%`)};
        set constraints all immediate;
        alter table public.pdf_templates enable row level security;
        alter table public.pdf_templates force row level security;
        select 'FORCED', relrowsecurity, relforcerowsecurity from pg_class where oid = 'public.pdf_templates'::regclass;
        grant ${READER} to current_user;
        set local role ${READER};
        select 'AS', current_user;
        select 'READER_COUNT', s.* from document_cutover.${census?.name ?? "missing"}('pdf_templates') s;
        rollback;
      `);
      expect(result.stderr, result.stderr).toBe("");
      const tagged = new Map(
        result.stdout
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            const [tag, ...rest] = line.split("\t");
            return [tag as string, rest];
          }),
      );
      expect(tagged.get("MARKED")).toEqual(["3"]);
      expect(tagged.get("FORCED")).toEqual(["t", "t"]);
      expect(tagged.get("AS")).toEqual([READER]);
      const trueCount = Number(tagged.get("TRUE_COUNT")?.[0]);
      expect(trueCount).toBeGreaterThanOrEqual(3);
      expect(Number(tagged.get("READER_COUNT")?.[0])).toBe(trueCount);
      // Ruling 11: the census row carries counts only.
      for (const value of tagged.get("READER_COUNT") ?? []) {
        expect(value).toMatch(/^\d+$/);
      }
    });

    it("criterion 3 (real connection): the gate run with DOCUMENT_CUTOVER_DATABASE_URL set to the admin connection exits non-zero with an identity blocker", () => {
      const child = spawnSync("bun", ["run", "cutover:assess:documents"], {
        cwd: REPO_ROOT,
        encoding: "utf8",
        timeout: 120_000,
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          SUPABASE_URL: "http://127.0.0.1:54321",
          DOCUMENT_CUTOVER_DATABASE_URL: ADMIN_URL,
        },
      });
      expect(child.error).toBeUndefined();
      expect(child.status).not.toBe(0);
      expect(`${child.stdout}\n${child.stderr}`).toMatch(
        /document_cutover_reader|rolsuper|rolbypassrls|superuser|bypass ?rls|member|privileged/i,
      );
    }, 150_000);

    it("PR #2169 MAJOR-1 (real connection): a URL whose text names document_cutover_reader but whose query switches the login to the admin role (?user=&password=&options=-c role=document_cutover_reader) is refused — no assessment runs", () => {
      // https://github.com/Asymmetric-al/core/pull/2169#issuecomment-6311002194 item 2:
      // pg honours ?user= / ?options=; the session would be the admin with
      // current_user = the reader (SET ROLE via startup options).
      const admin = new URL(ADMIN_URL);
      const url = new URL(readerUrl());
      url.password = password;
      url.searchParams.set("user", decodeURIComponent(admin.username));
      if (admin.password) {
        url.searchParams.set("password", decodeURIComponent(admin.password));
      }
      url.searchParams.set("options", `-c role=${READER}`);
      const child = spawnSync("bun", ["run", "cutover:assess:documents"], {
        cwd: REPO_ROOT,
        encoding: "utf8",
        timeout: 120_000,
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          SUPABASE_URL: "http://127.0.0.1:54321",
          DOCUMENT_CUTOVER_DATABASE_URL: url.toString(),
        },
      });
      expect(child.error).toBeUndefined();
      const output = `${child.stdout}\n${child.stderr}`;
      expect(child.status, output).not.toBe(0);
      expect(output).not.toMatch(/Status: complete|Proposed outcome:/);
      expect(output).toMatch(/STOP THE LINE/);
    }, 150_000);

    it("criterion 1 (real connection): the gate run as document_cutover_reader hits no permission error", () => {
      const url = new URL(readerUrl());
      url.password = password;
      const child = spawnSync("bun", ["run", "cutover:assess:documents"], {
        cwd: REPO_ROOT,
        encoding: "utf8",
        timeout: 120_000,
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          SUPABASE_URL: "http://127.0.0.1:54321",
          DOCUMENT_CUTOVER_DATABASE_URL: url.toString(),
        },
      });
      expect(child.error).toBeUndefined();
      const output = `${child.stdout}\n${child.stderr}`;
      expect(output).not.toMatch(/42501|permission denied/i);
      expect(output).not.toMatch(
        /DOCUMENT_CUTOVER_DATABASE_URL (is )?(missing|not set|required)/i,
      );
      expect(output).toMatch(/Proposed outcome:/);
    }, 150_000);
  },
);

describe.skipIf(enabled)(
  "issue #2067 addendum 4 — real stack (skipped)",
  () => {
    it.skip("set DOCUMENT_CUTOVER_IT_ADMIN_DATABASE_URL (admin URL of a disposable Postgres 15+ DB with scripts/sql/supabase-compat-bootstrap.sql and all migrations applied, as in CI Integration) to run the real-stack test", () => {});
  },
);
