import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const artifactRoot = path.join(root, "docs/security/field-policies");
const census = JSON.parse(
  readFileSync(path.join(artifactRoot, "census-v1.json"), "utf8"),
);
const hash = (file) =>
  createHash("sha256")
    .update(readFileSync(path.join(artifactRoot, file)))
    .digest("hex");
assert.equal(
  hash("live-schema-response.json"),
  census.provenance.live_capture_sha256,
);
assert.equal(
  hash("live-tables-response.json"),
  census.provenance.relation_capture_sha256,
);
const capture = JSON.parse(
  readFileSync(path.join(artifactRoot, "live-schema-response.json"), "utf8"),
);
const payload = JSON.parse(capture.result.content[0].text).result;
const metadata = JSON.parse(
  payload.slice(
    payload.indexOf("\n[") + 1,
    payload.indexOf("\n</untrusted-data-"),
  ),
)[0];
assert.equal(metadata.captured_at, census.provenance.captured_at);
assert.equal(
  metadata.latest_migration,
  census.provenance.latest_live_migration,
);
assert.equal(capture.repository_sha, census.provenance.repository_base_sha);
assert.equal(capture.query, census.provenance.query);
const present = census.relations.filter(
  (relation) => relation.disposition === "present",
);
const columns = present.flatMap((relation) =>
  relation.columns.map((column) => ({
    recordType: relation.record_type,
    ...column,
  })),
);
assert.equal(columns.length, 171);
assert.deepEqual(
  present.map((relation) => ({
    schema: relation.schema,
    relation: relation.record_type,
    kind: relation.kind,
    columns: relation.columns.map(({ name, ordinal, type, nullable }) => ({
      name,
      ordinal,
      type,
      nullable,
    })),
  })),
  metadata.inventory,
);
const receipts = census.relations.find(
  (relation) => relation.record_type === "receipts",
);
assert.equal(receipts.disposition, "absent/reserved");
assert.deepEqual(receipts.columns, []);
assert.equal(receipts.positive_seed_rows, 0);
assert.equal(census.repository_supplements.length, 1);
const supplementRef = census.repository_supplements[0];
assert.equal(supplementRef.artifact, "repository-supplement-v1.json");
assert.equal(hash(supplementRef.artifact), supplementRef.sha256);
const supplement = JSON.parse(
  readFileSync(path.join(artifactRoot, supplementRef.artifact), "utf8"),
);
assert.equal(
  supplement.source_path,
  "supabase/migrations/20260702090000_donation_stripe_refund_ids.sql",
);
assert.equal(
  supplement.source_sha256,
  "2fd5fe0c396d9662e5595b1f24879c4b3dc5404b9ab24b7c0ff60c144d1b9bda",
);
assert.equal(
  supplement.repository_base_sha,
  census.provenance.repository_base_sha,
);
const source = readFileSync(path.join(root, supplement.source_path));
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  supplement.source_sha256,
);
const baseSource = spawnSync(
  "git",
  ["show", `${supplement.repository_base_sha}:${supplement.source_path}`],
  { cwd: root, shell: false },
);
if (baseSource.error) throw baseSource.error;
assert.equal(baseSource.status, 0);
assert.deepEqual(baseSource.stdout, source);
assert.deepEqual(supplement.column, {
  recordType: "donations",
  name: "stripe_refund_ids",
  ordinal: 29,
  type: "text[]",
  nullable: false,
  default: "'{}'::text[]",
  semantic_category: "financial",
  category: "financial",
  processor_identifier: true,
  policies: Object.fromEntries(
    census.surfaces.map((surface) => [
      surface,
      {
        visible: surface === "mission_control",
        editable: false,
        exportable: false,
      },
    ]),
  ),
});
const candidateExpectedColumns = [...columns, supplement.column];
assert.equal(census.column_count, 171);
assert.equal(census.candidate_column_count, 172);
assert.equal(candidateExpectedColumns.length, 172);
assert.equal(census.baseline_row_count, 860);
const floors = new Map();
for (const column of candidateExpectedColumns) {
  const prior = floors.get(column.name);
  if (prior)
    assert.equal(
      column.category,
      prior,
      `Same-name category mismatch: ${column.name}`,
    );
  floors.set(column.name, column.category);
  assert.deepEqual(Object.keys(column.policies), census.surfaces);
  for (const [surface, operations] of Object.entries(column.policies)) {
    assert.equal(typeof operations.visible, "boolean");
    assert.equal(typeof operations.editable, "boolean");
    assert.equal(typeof operations.exportable, "boolean");
    if (column.processor_identifier) {
      assert.equal(operations.exportable, false);
      if (surface !== "mission_control")
        assert.deepEqual(operations, {
          visible: false,
          editable: false,
          exportable: false,
        });
    }
  }
}
console.log(
  "PASS: immutable live provenance, 171 exact whole columns, same-name floors, five explicit surfaces, reserved receipts and processor locks.",
);

const databaseUrl = process.env.DATABASE_URL;
if (
  !databaseUrl ||
  !new Set(["localhost", "127.0.0.1", "[::1]"]).has(
    new URL(databaseUrl).hostname,
  )
) {
  throw new Error(
    "DATABASE_URL must identify a disposable local database for census verification.",
  );
}
function query(sql) {
  const result = spawnSync(
    process.env.PSQL_BIN || "psql",
    [databaseUrl, "-X", "-v", "ON_ERROR_STOP=1", "-At", "-c", sql],
    { cwd: root, encoding: "utf8", shell: false },
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(result.stderr || "Census database query failed");
  return JSON.parse(result.stdout.trim());
}
const expectedRows = candidateExpectedColumns.flatMap((column) =>
  census.surfaces.map((surface) => ({
    record_type: column.recordType,
    field_key: column.name,
    surface,
    tenant_id: null,
    ...column.policies[surface],
    sensitivity_category: column.category,
  })),
);
const actualRows = query(
  "select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from public.field_policies p",
);
const sortRows = (rows) =>
  rows.sort((a, b) =>
    JSON.stringify([a.record_type, a.field_key, a.surface]).localeCompare(
      JSON.stringify([b.record_type, b.field_key, b.surface]),
    ),
  );
assert.deepEqual(sortRows(actualRows), sortRows(expectedRows));
console.log(
  "PASS: all 860 database seed rows exactly equal the reviewed census categories and explicit flags.",
);
const names = present.map((relation) => `'${relation.record_type}'`).join(",");
const candidateColumns = query(
  `select jsonb_agg(jsonb_build_object('record_type', table_name, 'field_key', column_name) order by table_name, ordinal_position) from information_schema.columns where table_schema='public' and table_name in (${names})`,
);
const sortColumns = (rows) =>
  rows.sort((a, b) =>
    JSON.stringify([a.record_type, a.field_key]).localeCompare(
      JSON.stringify([b.record_type, b.field_key]),
    ),
  );
assert.deepEqual(
  sortColumns(candidateColumns),
  sortColumns(
    candidateExpectedColumns.map((column) => ({
      record_type: column.recordType,
      field_key: column.name,
    })),
  ),
  "Candidate schema must equal the 171 live columns plus the exact single source supplement; arbitrary drift is forbidden.",
);
console.log(
  "PASS: exactly 172 candidate columns equal immutable live171 plus the sole source-bound supplement.",
);

assert.deepEqual(
  query(supplement.local_catalog.query),
  supplement.local_catalog.result,
);
assert.deepEqual(supplement.local_catalog.result, {
  schema: "public",
  record_type: "donations",
  field_key: "stripe_refund_ids",
  ordinal: 29,
  data_type: "ARRAY",
  udt_name: "_text",
  nullable: false,
  default: "'{}'::text[]",
});
console.log(
  "PASS: supplement base source hash and exact local TEXT[]/NOT NULL/default metadata.",
);
