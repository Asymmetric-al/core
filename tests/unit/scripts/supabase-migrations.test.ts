import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  chmodSync,
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { ownMinistryCommandRows } from "../../fixtures/own-ministry-commands";
import { preMembershipCommandRows } from "../../fixtures/pre-membership-commands";
import { MIGRATION } from "../acceptance/issue-2256/harness";

const root = fileURLToPath(new URL("../../../", import.meta.url));
// AL-2674 council round 1 (F1): the totals the gate prints come from the
// manifest, so a package that adds or drops a classified column touches no test.
const MANIFEST = JSON.parse(
  readFileSync(
    path.join(root, "docs/security/field-policies/manifest.json"),
    "utf8",
  ),
) as {
  surfaces: string[];
  record_types: Record<string, object>;
  derived_record_types: Record<string, object>;
};
const PHYSICAL_TYPES = Object.keys(MANIFEST.record_types).length;
const DERIVED_TYPES = Object.keys(MANIFEST.derived_record_types).length;
const COLUMNS = Object.values(MANIFEST.record_types).reduce(
  (n, columns) => n + Object.keys(columns).length,
  0,
);
const DERIVED_FIELDS = Object.values(MANIFEST.derived_record_types).reduce(
  (count, fields) => count + Object.keys(fields).length,
  0,
);
const ROWS = (COLUMNS + DERIVED_FIELDS) * MANIFEST.surfaces.length;
const LISTED = (
  JSON.parse(
    readFileSync(
      path.join(root, "docs/security/rls-deny-by-default-exceptions.json"),
      "utf8",
    ),
  ) as { entries: unknown[] }
).entries.length;
const roots: string[] = [];
const itPosix = process.platform === "win32" ? it.skip : it;
afterEach(() => {
  for (const directory of roots.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

function runVerifier(
  mode: string,
  databaseUrl = "postgresql://postgres@127.0.0.1:5432/disposable_test",
  allowNonlocal = false,
  ambient: Record<string, string> = {},
  cliArgs: string[] = [],
) {
  const temporary = mkdtempSync(path.join(os.tmpdir(), "migration-census-"));
  roots.push(temporary);
  // AL-2674 (plan 7.1): the census became the field-policy manifest gate,
  // which reads one marked catalog snapshot. The fake database answers it from
  // the committed manifest (the gate's own suites prove the manifest against
  // the census oracles and a real replay); the modes below mutate that answer.
  const manifest = JSON.parse(
    readFileSync(
      path.join(root, "docs/security/field-policies/manifest.json"),
      "utf8",
    ),
  );
  const surfaces: string[] = manifest.surfaces;
  const entries = Object.entries({
    ...manifest.record_types,
    ...manifest.derived_record_types,
  } as Record<string, Record<string, Record<string, unknown>>>).flatMap(
    ([recordType, columns]) =>
      Object.entries(columns).map(([name, entry]) => ({
        recordType,
        name,
        ...entry,
      })),
  );
  const catalog = {
    relations: Object.keys(manifest.record_types).sort(),
    columns: entries
      .filter((column) =>
        Object.hasOwn(manifest.record_types, column.recordType),
      )
      .map((column) => ({
        record_type: column.recordType,
        field_key: column.name,
        type: column.type,
        nullable: column.nullable,
        generated: column.generated ?? null,
        default: "default" in column ? column.default : null,
      })),
    reserved_present: [],
    rows: entries.flatMap((column) =>
      surfaces.map((surface) => {
        const flags = String(column[surface]);
        return {
          record_type: column.recordType,
          field_key: column.name,
          surface,
          tenant_id: null,
          visible: flags[0] === "v",
          editable: flags[1] === "e",
          exportable: flags[2] === "x",
          sensitivity_category: column.category,
        };
      }),
    ),
  };
  const listed = JSON.parse(
    readFileSync(
      path.join(root, "docs/security/rls-deny-by-default-exceptions.json"),
      "utf8",
    ),
  ).entries.map((entry: { table: string }) => entry.table);
  const tenantTable = (table: string, policies: number) => ({
    table,
    tenant: true,
    rls: true,
    force: mode !== "rls-gate-drift" || table !== "donors",
    policies,
    owner: "postgres",
    owner_bypass: true,
  });
  const gate = {
    tables: [
      ...listed.map((table: string) => tenantTable(table, 0)),
      tenantTable("donors", 2),
    ],
    tenant_delete_violations: [],
    tenant_keys: [],
    tenant_update_violations: [],
    definers: [
      {
        function: "public.resolve_verified_host(p_host text)",
        schema: "public",
        owner: "postgres",
        owner_bypass: true,
        search_path: '""',
        volatility: "s",
        public_execute: false,
        anon_execute: true,
      },
      {
        function: "public.resolve_home_host(p_host text)",
        schema: "public",
        owner: "postgres",
        owner_bypass: true,
        search_path: '""',
        volatility: "s",
        public_execute: false,
        anon_execute: true,
      },
    ],
    // AL-2674: the gate also reads the command-schema functions, the
    // wrappers that call into them and the unadmitted table grants.
    commands: [...preMembershipCommandRows(), ...ownMinistryCommandRows()],
    wrappers: [],
    grants: [],
    service_role_grants: [],
    service_role_schemas: [],
    // AL-2675 (WP2b, second release; record D-18): the gate also reads every
    // signed-in policy in public, the request-tenant helpers and the published
    // tables. The fake catalog holds the reviewed exceptions as they stand and
    // the four helpers, so a clean run stays clean.
    policies: JSON.parse(
      readFileSync(
        path.join(root, "docs/security/tenant-policy-exceptions.json"),
        "utf8",
      ),
    ).entries.map(
      (entry: {
        table: string;
        policy: string;
        cmd: string;
        roles: string[];
        permissive: boolean;
        using: string;
        check: string;
      }) => ({
        table: entry.table,
        policy: entry.policy,
        // Council R3: each pin names its command, roles and kind.
        cmd: entry.cmd,
        roles: entry.roles,
        permissive: entry.permissive,
        using: entry.using,
        check: entry.check,
        // Signed-in users hold SELECT on each excepted table.
        granted: true,
        writable: true,
      }),
    ),
    tenant_helpers: [
      "current_tenant_id",
      "request_tenant_id",
      "request_assignment_id",
      "request_assignment",
    ].map((name) => ({
      function: `authz.${name}()`,
      body: "SELECT a.tenant_id FROM authz.request_assignment() AS a",
      // Amended by fixcheck F4 (record D-18): the gate reads each helper's
      // search path, which the migrated helpers fix empty.
      search_path: '""',
      // Council R12 (a): the helpers themselves, not functions they call.
      root: true,
    })),
    published: [],
  };
  const psql = path.join(temporary, "psql.cjs");
  const calls = path.join(temporary, "calls.jsonl");
  writeFileSync(
    psql,
    `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
const stdinSql = args.includes("-f") || args.includes("-c") ? null : fs.readFileSync(0, "utf8");
const pg = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("PG")));
fs.appendFileSync(${JSON.stringify(calls)}, JSON.stringify({ args, stdinSql, pg }) + "\\n");
const data = ${JSON.stringify({ catalog, gate })};
const mode = ${JSON.stringify(mode)};
if (!args.includes("-c")) process.exit(0);
const sql = args[args.indexOf("-c") + 1];
if (mode === "query-failure") {
  console.error("Injected census query failure"); process.exit(9);
}
if (sql.startsWith("-- tenant-rls-catalog-gate:v1"))
  console.log(mode === "rls-gate-malformed" ? "{" : JSON.stringify(data.gate));
else if (sql.startsWith("-- field-policy-manifest-gate:v1")) {
  const c = data.catalog;
  const v3 = (row, table, surface) => row.record_type === table && row.field_key === "party_id" && row.surface === surface;
  const column = (record_type, field_key, type) => ({ record_type, field_key, type, nullable: true, generated: null, default: null });
  if (mode === "policy-drift") c.rows.find(row => row.record_type === "donations" && row.field_key === "stripe_refund_ids" && row.surface !== "mission_control").exportable = true;
  if (mode === "v3-row-missing") c.rows = c.rows.filter(row => !v3(row, "donors", "export"));
  if (mode === "v3-row-drift") c.rows.find(row => v3(row, "missionaries", "public")).visible = true;
  if (mode === "column-drift") c.columns.push(column("donors", "uncensused_test_column", "text"));
  if (mode === "v3-third-column") c.columns.push(column("profiles", "party_id", "uuid"));
  if (mode === "v3-column-missing") c.columns = c.columns.filter(col => !(col.record_type === "donors" && col.field_key === "party_id"));
  console.log(JSON.stringify(c));
}
`,
  );
  chmodSync(psql, 0o755);
  // #2256 criterion 9: a one-byte forward-file edit runs on a temp repo copy.
  let repo = root;
  if (mode === "v3-source-edited") {
    repo = path.join(temporary, "repo");
    for (const rel of [
      "scripts",
      "docs/security/field-policies",
      "docs/security/tenant-key-exceptions.json",
      "supabase/migrations",
      // #2400: the PG17 readiness probe runs before the census.
      "tests/integration/supabase/postgres17-upgrade-readiness-verification.sql",
      // PR #2714 review (record D-18): the verifier's locality decision now
      // lives in the routing rule it shares with the admin app, so the copy
      // carries that file too. The case still fails only on the edited source.
      "packages/env/src/database-url.mjs",
    ])
      cpSync(path.join(root, rel), path.join(repo, rel), { recursive: true });
    appendFileSync(path.join(repo, MIGRATION), "-");
  }
  const result = spawnSync(
    process.execPath,
    [path.join(repo, "scripts/verify/supabase-migrations.mjs"), ...cliArgs],
    {
      cwd: repo,
      encoding: "utf8",
      env: {
        ...process.env,
        ...(repo === root
          ? {}
          : {
              GIT_DIR: spawnSync("git", ["rev-parse", "--absolute-git-dir"], {
                cwd: root,
                encoding: "utf8",
              }).stdout.trim(),
            }),
        ...ambient,
        DATABASE_URL: databaseUrl,
        ALLOW_NONLOCAL_MIGRATION_VERIFY: allowNonlocal ? "1" : "",
        PSQL_BIN: psql,
      },
    },
  );
  const capturedCalls: Array<{
    args: string[];
    stdinSql: string | null;
    pg: Record<string, string>;
  }> = existsSync(calls)
    ? readFileSync(calls, "utf8")
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line))
    : [];
  return {
    ...result,
    calls: capturedCalls.map(({ args }) => args),
    inputs: capturedCalls.map(({ stdinSql }) => stdinSql),
    environments: capturedCalls.map(({ pg }) => pg),
  };
}

describe("supabase migrations verifier", () => {
  itPosix(
    "requires the reviewed census after applying the complete migration sequence (D-18, AL-2678: the fake catalog carries the two reviewed pre-membership claim commands, which the gate now requires; D-18, AL-2676: and public.resolve_home_host, the second allowlisted anonymous read since WP3b part 2; AL-2680: and the two reviewed own-ministry commands)",
    () => {
      const result = runVerifier("clean");
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        `PASS: field-policy manifest: ${PHYSICAL_TYPES} physical types (${COLUMNS} columns), ${DERIVED_TYPES} derived types (${DERIVED_FIELDS} fields)`,
      );
      expect(result.stdout).toContain(
        `PASS: all ${ROWS} public.field_policies rows equal the manifest`,
      );
      expect(result.stdout).toContain(
        `equal the manifest's ${COLUMNS} physical columns`,
      );
      const gateLine = result.stdout.indexOf(
        `PASS: tenant RLS catalog gate: ${LISTED + 1} tenant tables enabled and forced (1 with policies, ${LISTED} listed deny-by-default, 0 stale)`,
      );
      expect(
        result.stdout.indexOf(
          `equal the manifest's ${COLUMNS} physical columns`,
        ),
      ).toBeLessThan(gateLine);
      expect(gateLine).toBeLessThan(
        result.stdout.indexOf("forward Supabase migrations"),
      );
      const probeIndex = result.calls.findIndex(
        (args: string[]) => !args.includes("-f") && !args.includes("-c"),
      );
      expect(probeIndex).toBeGreaterThan(1);
      expect(result.inputs[probeIndex]).toContain(
        "'storedPgpFunctionCandidates'",
      );
      expect(result.inputs[probeIndex]).toContain(
        "CREATE FUNCTION pg_temp.modernization_mixed_case_pgp_probe",
      );
      expect(result.inputs[probeIndex]).toContain(
        "CREATE FUNCTION pg_temp.modernization_sql_standard_pgp_probe",
      );
      expect(result.inputs[probeIndex]).toContain("BEGIN ATOMIC");
      expect(result.inputs[probeIndex]).not.toContain(
        "-- CORE_POSTGRES_UPGRADE_READINESS_QUERY",
      );
      const queryIndex = result.calls.findIndex((args: string[]) =>
        args.includes("-c"),
      );
      expect(queryIndex).toBeGreaterThan(probeIndex);
      expect(result.stdout).toContain(
        "verify PostgreSQL upgrade preflight detects mixed-case callers",
      );
      expect(
        result.calls
          .slice(0, probeIndex)
          .every((args: string[]) => args.includes("-f")),
      ).toBe(true);
      expect(
        result.calls.every(
          (args: string[]) =>
            args[0] ===
              "host='127.0.0.1' port='5432' dbname='disposable_test' user='postgres'" &&
            args[1] === "-X",
        ),
      ).toBe(true);
    },
  );

  itPosix.each([
    "policy-drift",
    "column-drift",
    "query-failure",
    "rls-gate-drift",
    "rls-gate-malformed",
  ])(
    "fails normal migration verification for %s without reporting success",
    (mode) => {
      const result = runVerifier(mode);
      expect(result.status).not.toBe(0);
      expect(result.stdout).not.toContain("forward Supabase migrations");
      if (mode === "query-failure")
        expect(result.stderr).toContain("Injected census query failure");
      if (mode === "rls-gate-drift")
        expect(result.stderr).toContain("FORCE_MISSING donors");
      if (mode === "rls-gate-malformed")
        expect(result.stderr).toContain("printed no snapshot");
    },
  );

  itPosix.each([
    "v3-row-missing",
    "v3-row-drift",
    "v3-column-missing",
    "v3-third-column",
    "v3-source-edited",
  ])(
    "fails the #2256 v3 census for %s (D-18, AL-2678: person_id is dropped, so each drift case now drifts party_id, the identity key that replaced it; the source case still edits the pinned person-anchor migration)",
    (mode) => {
      const clean = runVerifier("clean");
      expect(clean.status, "clean baseline must pass first").toBe(0);
      const result = runVerifier(mode);
      expect(result.status).not.toBe(0);
      expect(result.stdout).not.toContain("forward Supabase migrations");
      // #2400 criterion 7: the failure is the source-hash check itself, now the
      // manifest gate's pinned-source check (AL-2674).
      if (mode === "v3-source-edited") {
        const mismatch = `PINNED ${MIGRATION} changed`;
        expect(clean.stderr).not.toContain(mismatch);
        expect(result.stderr).toContain(mismatch);
      }
    },
  );

  itPosix(
    "refuses unsupported nonlocal targets before any SQL even with the old override",
    () => {
      const result = runVerifier(
        "clean",
        "postgresql://postgres@disposable.invalid/test",
        true,
      );
      expect(result.status).not.toBe(0);
      expect(result.calls).toEqual([]);
      expect(result.stdout).not.toContain("bootstrap Supabase");
    },
  );

  // PR #2714 review: a query key such as `host` wins over the authority, so this
  // URL names the hosted server however local its authority looks.
  itPosix(
    "refuses a loopback-looking URL with a routing override before any SQL",
    () => {
      const result = runVerifier(
        "clean",
        "postgresql://postgres@127.0.0.1:5432/disposable_test?host=db.example.supabase.co",
      );
      expect(result.status).not.toBe(0);
      expect(result.calls).toEqual([]);
      expect(result.stdout).not.toContain("bootstrap Supabase");
    },
  );

  // PR #2714 review: every psql the verifier starts goes through psqlConnection.
  // An ambient PGHOSTADDR overrides the URL's host, PGSERVICE and PGHOST fill in
  // a target and PGOPTIONS can choose a role, so none may reach psql; and the
  // password travels in PGPASSWORD, never in the argument list.
  itPosix(
    "starts every psql with the URL alone: no ambient PG* setting and no password in its arguments",
    () => {
      const result = runVerifier(
        "clean",
        "postgresql://postgres:s3cret-verify@127.0.0.1:5432/disposable_test",
        false,
        {
          PGHOSTADDR: "203.0.113.9",
          PGHOST: "db.example.supabase.co",
          PGPORT: "6543",
          PGSERVICE: "hosted",
          PGOPTIONS: "-c role=postgres",
        },
      );
      expect(result.status, result.stderr).toBe(0);
      expect(result.calls.length).toBeGreaterThan(3);
      for (const [index, args] of result.calls.entries()) {
        expect(result.environments[index]).toEqual({
          PGPASSWORD: "s3cret-verify",
        });
        // H11: the URL's parsed parts, never the raw string.
        expect(args[0]).toBe(
          "host='127.0.0.1' port='5432' dbname='disposable_test' user='postgres'",
        );
        expect(JSON.stringify(args)).not.toContain("s3cret-verify");
      }
    },
  );

  // WP1.6, joined with PR #2714's review: the hosted-defaults step of the
  // release replay starts psql like every other step, the URL first and once,
  // the password in PGPASSWORD only, after the bootstrap and before the first
  // migration.
  itPosix(
    "applies the hosted default privileges after the bootstrap and before the first migration, through the same psql start",
    () => {
      const result = runVerifier(
        "clean",
        "postgresql://postgres:s3cret-verify@127.0.0.1:5432/disposable_test",
        false,
        {},
        ["--hosted-defaults"],
      );
      expect(result.status, result.stderr).toBe(0);
      const files = result.calls.map((args) =>
        args.includes("-f") ? args[args.indexOf("-f") + 1]! : "",
      );
      const bootstrap = files.findIndex((file) =>
        file.endsWith("scripts/sql/supabase-compat-bootstrap.sql"),
      );
      const defaults = files.findIndex((file) =>
        file.endsWith("scripts/sql/hosted-default-privileges.sql"),
      );
      const firstMigration = files.findIndex((file) =>
        /supabase\/migrations\/\d{14}_/.test(file),
      );
      expect(bootstrap).toBeGreaterThanOrEqual(0);
      expect(defaults).toBe(bootstrap + 1);
      expect(firstMigration).toBe(defaults + 1);
      const call = result.calls[defaults]!;
      expect(call[0]).toBe(
        "host='127.0.0.1' port='5432' dbname='disposable_test' user='postgres'",
      );
      expect(call.filter((arg) => arg.startsWith("host="))).toHaveLength(1);
      expect(JSON.stringify(call)).not.toContain("s3cret-verify");
      expect(result.environments[defaults]).toEqual({
        PGPASSWORD: "s3cret-verify",
      });
    },
  );

  itPosix(
    "accepts IPv6 loopback under the same census locality contract",
    () => {
      const result = runVerifier(
        "clean",
        "postgresql://postgres@[::1]:5432/disposable_test",
      );
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        `PASS: all ${ROWS} public.field_policies rows equal the manifest`,
      );
    },
  );
});
