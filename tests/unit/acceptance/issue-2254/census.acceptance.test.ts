/**
 * #2254 criterion 9 (spec r1 In 3/In 4): the field-policy census against a
 * fake psql whose database is the spec's oracle (171 live + v1 column + the
 * 10 In 4 rows), then mutation-proven: one flag, a dropped v2 supplement and
 * edited migration bytes each fail; v1's source binding still bites.
 * Runs on a temp copy of the repo files; git objects come from GIT_DIR.
 * Owned by Acceptance; implementers must not edit.
 */
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  chmodSync,
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { FP, MIGRATIONS, NEW_ROWS, ROOT, V2, migrationFile } from "./harness";

const temps: string[] = [];
afterAll(() =>
  temps.forEach((d) => rmSync(d, { recursive: true, force: true })),
);
const GIT_DIR = spawnSync("git", ["rev-parse", "--absolute-git-dir"], {
  encoding: "utf8",
}).stdout.trim();
const json = (file: string) => JSON.parse(readFileSync(file, "utf8"));

/** Oracle DB: live columns + v1 supplement column + In 4 rows (never read from v2). */
function oracle() {
  const census = json(path.join(ROOT, FP, "census-v1.json"));
  const v1 = json(path.join(ROOT, FP, "repository-supplement-v1.json")).column;
  const cols = [
    ...census.relations
      .filter((r: { disposition: string }) => r.disposition === "present")
      .flatMap((r: { record_type: string; columns: object[] }) =>
        r.columns.map((c) => ({ recordType: r.record_type, ...c })),
      ),
    v1,
  ];
  const rows = [
    ...cols.flatMap((c) =>
      census.surfaces.map((surface: string) => ({
        record_type: c.recordType,
        field_key: c.name,
        surface,
        tenant_id: null,
        ...c.policies[surface],
        sensitivity_category: c.category,
      })),
    ),
    ...NEW_ROWS.map((r) => ({ ...r })),
  ];
  const keys = (rs: { record_type: string; field_key: string }[]) => [
    ...new Map(
      rs.map((r) => [
        `${r.record_type}.${r.field_key}`,
        { record_type: r.record_type, field_key: r.field_key },
      ]),
    ).values(),
  ];
  return { rows, schema: keys(rows) };
}

/** Every {query,result} pair in any supplement artifact answers that exact SQL. */
function catalogs(dir: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const walk = (v: unknown): void => {
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    if (typeof o.query === "string" && "result" in o) out[o.query] = o.result;
    Object.values(o).forEach(walk);
  };
  for (const ref of json(path.join(dir, FP, "census-v1.json"))
    .repository_supplements ?? [])
    try {
      walk(json(path.join(dir, FP, ref.artifact)));
    } catch {
      /* missing artifact: the census must fail on its own */
    }
  return out;
}

type Mutate = (dir: string, db: ReturnType<typeof oracle>) => void;
function runCensus(mutate: Mutate = () => {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "acc-2254-census-"));
  temps.push(dir);
  for (const rel of ["scripts", FP, MIGRATIONS])
    cpSync(path.join(ROOT, rel), path.join(dir, rel), { recursive: true });
  const db = oracle();
  mutate(dir, db);
  const psql = path.join(dir, "psql.cjs");
  writeFileSync(
    psql,
    `#!/usr/bin/env node
const data = ${JSON.stringify({ ...db, catalogs: catalogs(dir) })};
const sql = process.argv[process.argv.indexOf("-c") + 1];
if (sql in data.catalogs) console.log(JSON.stringify(data.catalogs[sql]));
else if (sql.includes("public.field_policies")) console.log(JSON.stringify(data.rows));
else console.log(JSON.stringify(data.schema));
`,
  );
  chmodSync(psql, 0o755);
  return spawnSync(
    process.execPath,
    [path.join(dir, "scripts/verify/field-policy-census.mjs")],
    {
      cwd: dir,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_DIR,
        DATABASE_URL: "postgresql://postgres@127.0.0.1:5432/acc_2254",
        PSQL_BIN: psql,
      },
    },
  );
}
let clean: ReturnType<typeof runCensus> | undefined;
const cleanRun = () => (clean ??= runCensus());

describe("#2254 criterion 9: census", () => {
  it("passes on the In 4 oracle and reports 171 live / 176 candidate / 880 rows", () => {
    const r = cleanRun();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("171 exact whole columns");
    expect(r.stdout).toContain("all 880 database seed rows exactly equal");
    expect(r.stdout).toContain("exactly 176 candidate columns");
  });

  const flip: Mutate = (_d, db) => {
    const row = db.rows.find(
      (r) => r.field_key === "email_verified_at" && r.surface === "missionary",
    )!;
    row.visible = true;
  };
  const v2Ref: Mutate = (dir) => {
    const file = path.join(dir, FP, "census-v1.json");
    const census = json(file);
    census.repository_supplements = census.repository_supplements.filter(
      (s: { artifact: string }) => s.artifact !== V2,
    );
    writeFileSync(file, JSON.stringify(census, null, 2) + "\n");
  };
  it.each<[string, Mutate]>([
    ["one database flag flipped", flip],
    [
      "one v2 artifact flag flipped",
      (dir) => {
        const file = path.join(dir, FP, V2);
        writeFileSync(
          file,
          readFileSync(file, "utf8").replace(
            /("exportable"\s*:\s*)false/,
            "$1true",
          ),
        );
      },
    ],
    ["v2 supplement dropped from census-v1.json", v2Ref],
    ["v2 supplement artifact deleted", (dir) => rmSync(path.join(dir, FP, V2))],
    [
      "new migration bytes edited (hash mismatch)",
      (dir) =>
        appendFileSync(
          path.join(dir, MIGRATIONS, migrationFile()),
          "\n-- edited\n",
        ),
    ],
    [
      "v1 source bytes edited (v1 check kept)",
      (dir) =>
        appendFileSync(
          path.join(
            dir,
            MIGRATIONS,
            "20260702090000_donation_stripe_refund_ids.sql",
          ),
          "\n-- edited\n",
        ),
    ],
    [
      "an extra uncensused donors column",
      (_d, db) =>
        db.schema.push({ record_type: "donors", field_key: "uncensused_2254" }),
    ],
  ])("fails when %s", (_name, mutate) => {
    expect(cleanRun().status, "clean baseline must pass first").toBe(0);
    const r = runCensus(mutate);
    expect(r.status).not.toBe(0);
  });
});
