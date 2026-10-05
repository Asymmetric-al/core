import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const roots: string[] = [];
const itPosix = process.platform === "win32" ? it.skip : it;
afterEach(() => {
  for (const directory of roots.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

function runVerifier(mode: string) {
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
  const rows = columns.flatMap((column) =>
    census.surfaces.map((surface: string) => ({
      record_type: column.recordType,
      field_key: column.name,
      surface,
      tenant_id: null,
      ...column.policies[surface],
      sensitivity_category: column.category,
    })),
  );
  const schema = columns.map((column) => ({
    record_type: column.recordType,
    field_key: column.name,
  }));
  const psql = path.join(temporary, "psql.cjs");
  const calls = path.join(temporary, "calls.jsonl");
  writeFileSync(
    psql,
    `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(calls)}, JSON.stringify(args) + "\\n");
const data = ${JSON.stringify({ rows, schema, catalog: supplement.local_catalog.result })};
const mode = ${JSON.stringify(mode)};
if (!args.includes("-c")) process.exit(0);
const sql = args[args.indexOf("-c") + 1];
if (mode === "query-failure") {
  console.error("Injected census query failure"); process.exit(9);
}
if (sql.includes("public.field_policies")) {
  if (mode === "policy-drift") data.rows.find(row => row.record_type === "donations" && row.field_key === "stripe_refund_ids" && row.surface !== "mission_control").exportable = true;
  console.log(JSON.stringify(data.rows));
} else if (sql.includes("jsonb_agg(jsonb_build_object")) {
  if (mode === "column-drift") data.schema.push({ record_type: "donors", field_key: "uncensused_test_column" });
  console.log(JSON.stringify(data.schema));
} else console.log(JSON.stringify(data.catalog));
`,
  );
  chmodSync(psql, 0o755);
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts/verify/supabase-migrations.mjs")],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://postgres@127.0.0.1:5432/disposable_test",
        PSQL_BIN: psql,
      },
    },
  );
  return {
    ...result,
    calls: readFileSync(calls, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line)),
  };
}

itPosix(
  "requires the reviewed census after applying the complete migration sequence",
  () => {
    const result = runVerifier("clean");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("all 860 database seed rows exactly equal");
    expect(result.stdout).toContain("exactly 172 candidate columns");
    expect(result.stdout.indexOf("exactly 172 candidate columns")).toBeLessThan(
      result.stdout.indexOf("forward Supabase migrations"),
    );
    const queryIndex = result.calls.findIndex((args: string[]) =>
      args.includes("-c"),
    );
    expect(queryIndex).toBeGreaterThan(1);
    expect(
      result.calls
        .slice(0, queryIndex)
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

itPosix.each(["policy-drift", "column-drift", "query-failure"])(
  "fails normal migration verification for %s without reporting success",
  (mode) => {
    const result = runVerifier(mode);
    expect(result.status).not.toBe(0);
    expect(result.stdout).not.toContain("forward Supabase migrations");
    if (mode === "query-failure")
      expect(result.stderr).toContain("Injected census query failure");
  },
);
