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

import { afterEach, expect, it } from "vitest";

import { NEW_ROWS } from "../acceptance/issue-2254/harness";
import {
  MIGRATION,
  SEAMS,
  NEW_ROWS as V3_ROWS,
} from "../acceptance/issue-2256/harness";

const root = fileURLToPath(new URL("../../../", import.meta.url));
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
) {
  const temporary = mkdtempSync(path.join(os.tmpdir(), "migration-census-"));
  roots.push(temporary);
  const census = JSON.parse(
    readFileSync(
      path.join(root, "docs/security/field-policies/census-v1.json"),
      "utf8",
    ),
  );
  const supplement = JSON.parse(
    readFileSync(
      path.join(
        root,
        "docs/security/field-policies/repository-supplement-v1.json",
      ),
      "utf8",
    ),
  );
  const columns = [
    ...census.relations
      .filter(
        (relation: { disposition: string }) =>
          relation.disposition === "present",
      )
      .flatMap((relation: { record_type: string; columns: object[] }) =>
        relation.columns.map((column) => ({
          recordType: relation.record_type,
          ...column,
        })),
      ),
    supplement.column,
  ];
  const rows = [
    ...columns.flatMap((column) =>
      census.surfaces.map((surface: string) => ({
        record_type: column.recordType,
        field_key: column.name,
        surface,
        tenant_id: null,
        ...column.policies[surface],
        sensitivity_category: column.category,
      })),
    ),
    ...NEW_ROWS,
    ...V3_ROWS,
  ];
  const schema = [
    ...columns.map((column) => ({
      record_type: column.recordType,
      field_key: column.name,
    })),
    { record_type: "donors", field_key: "email_normalized" },
    { record_type: "donors", field_key: "email_verified_at" },
    ...SEAMS.map(([record_type]) => ({ record_type, field_key: "person_id" })),
  ];
  const catalogs = Object.fromEntries(
    census.repository_supplements.flatMap((ref: { artifact: string }) => {
      const found: [string, unknown][] = [];
      const walk = (value: unknown): void => {
        if (!value || typeof value !== "object") return;
        const item = value as { query?: unknown; result?: unknown };
        if (typeof item.query === "string" && "result" in item)
          found.push([item.query, item.result]);
        Object.values(value).forEach(walk);
      };
      walk(
        JSON.parse(
          readFileSync(
            path.join(root, "docs/security/field-policies", ref.artifact),
            "utf8",
          ),
        ),
      );
      return found;
    }),
  );
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
    definers: [],
  };
  const psql = path.join(temporary, "psql.cjs");
  const calls = path.join(temporary, "calls.jsonl");
  writeFileSync(
    psql,
    `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
const stdinSql = args.includes("-f") || args.includes("-c") ? null : fs.readFileSync(0, "utf8");
fs.appendFileSync(${JSON.stringify(calls)}, JSON.stringify({ args, stdinSql }) + "\\n");
const data = ${JSON.stringify({ rows, schema, catalogs, gate })};
const mode = ${JSON.stringify(mode)};
if (!args.includes("-c")) process.exit(0);
const sql = args[args.indexOf("-c") + 1];
if (mode === "query-failure") {
  console.error("Injected census query failure"); process.exit(9);
}
if (sql.startsWith("-- tenant-rls-catalog-gate:v1"))
  console.log(mode === "rls-gate-malformed" ? "{" : JSON.stringify(data.gate));
else if (sql in data.catalogs) console.log(JSON.stringify(data.catalogs[sql]));
else if (sql.includes("public.field_policies")) {
  if (mode === "policy-drift") data.rows.find(row => row.record_type === "donations" && row.field_key === "stripe_refund_ids" && row.surface !== "mission_control").exportable = true;
  const v3 = (row, table, surface) => row.record_type === table && row.field_key === "person_id" && row.surface === surface;
  if (mode === "v3-row-missing") data.rows = data.rows.filter(row => !v3(row, "profiles", "export"));
  if (mode === "v3-row-drift") data.rows.find(row => v3(row, "missionaries", "public")).visible = true;
  console.log(JSON.stringify(data.rows));
} else if (sql.includes("jsonb_agg(jsonb_build_object")) {
  if (mode === "column-drift") data.schema.push({ record_type: "donors", field_key: "uncensused_test_column" });
  if (mode === "v3-third-column") data.schema.push({ record_type: "donors", field_key: "person_id" });
  if (mode === "v3-column-missing") data.schema = data.schema.filter(column => !(column.record_type === "profiles" && column.field_key === "person_id"));
  console.log(JSON.stringify(data.schema));
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
      "supabase/migrations",
      // #2400: the PG17 readiness probe runs before the census.
      "tests/integration/supabase/postgres17-upgrade-readiness-verification.sql",
    ])
      cpSync(path.join(root, rel), path.join(repo, rel), { recursive: true });
    appendFileSync(path.join(repo, MIGRATION), "-");
  }
  const result = spawnSync(
    process.execPath,
    [path.join(repo, "scripts/verify/supabase-migrations.mjs")],
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
        DATABASE_URL: databaseUrl,
        ALLOW_NONLOCAL_MIGRATION_VERIFY: allowNonlocal ? "1" : "",
        PSQL_BIN: psql,
      },
    },
  );
  const capturedCalls: Array<{ args: string[]; stdinSql: string | null }> =
    existsSync(calls)
      ? readFileSync(calls, "utf8")
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line))
      : [];
  return {
    ...result,
    calls: capturedCalls.map(({ args }) => args),
    inputs: capturedCalls.map(({ stdinSql }) => stdinSql),
  };
}

itPosix(
  "requires the reviewed census after applying the complete migration sequence",
  () => {
    const result = runVerifier("clean");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("171 exact whole columns");
    expect(result.stdout).toContain("all 880 database seed rows exactly equal");
    expect(result.stdout).toContain("exactly 176 candidate columns");
    const gateLine = result.stdout.indexOf(
      "PASS: tenant RLS catalog gate: 86 tenant tables enabled and forced (1 with policies, 85 listed deny-by-default, 0 stale)",
    );
    expect(result.stdout.indexOf("exactly 176 candidate columns")).toBeLessThan(
      gateLine,
    );
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
          args[0] === "postgresql://postgres@127.0.0.1:5432/disposable_test",
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
])("fails the #2256 v3 census for %s", (mode) => {
  const clean = runVerifier("clean");
  expect(clean.status, "clean baseline must pass first").toBe(0);
  const result = runVerifier(mode);
  expect(result.status).not.toBe(0);
  expect(result.stdout).not.toContain("forward Supabase migrations");
  // #2400 criterion 7: the failure is the census source-hash check itself.
  if (mode === "v3-source-edited") {
    const mismatch = `field-policy census: v3 source_sha256 mismatch for ${MIGRATION}`;
    expect(clean.stderr).not.toContain(mismatch);
    expect(result.stderr).toContain(mismatch);
  }
});

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

itPosix("accepts IPv6 loopback under the same census locality contract", () => {
  const result = runVerifier(
    "clean",
    "postgresql://postgres@[::1]:5432/disposable_test",
  );
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("all 880 database seed rows exactly equal");
});
