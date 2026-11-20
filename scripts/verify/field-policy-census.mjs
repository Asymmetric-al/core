// Field-policy classification gate (AL-2674). The manifest at
// docs/security/field-policies/manifest.json is the classification of record:
// one entry per column of each classified record type, with its category and
// its flags on the five surfaces. It replaces the AL-491 census, which asserted
// a dated capture of the hosted schema by checksum and so let no column be
// added or dropped. The gate checks:
//   1. the manifest alone: shape, the five surfaces, the six categories,
//      same-name category floors, processor-identifier locks, reserved receipt
//      record types and the pinned source migrations;
//   2. the migrated schema: the columns of every classified table equal the
//      manifest's entries (name, type, nullability, generation, pinned
//      defaults), and canonical receipts do not exist;
//   3. the seed: every row of public.field_policies equals a manifest flag.
// A later package that adds a column to a classified table adds its manifest
// entry and its five field_policies rows in the same change; one that drops a
// column deletes both. See docs/security/field-policies/README.md.
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isLoopbackDatabaseUrl, runPsqlQuery } from "../lib/psql.mjs";

export const MANIFEST_PATH = "docs/security/field-policies/manifest.json";
export const SURFACES = [
  "mission_control",
  "donor",
  "missionary",
  "public",
  "export",
];
export const CATEGORIES = [
  "public",
  "contact",
  "internal",
  "financial",
  "care",
  "security",
];
const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;
const FLAGS = /^[v-][e-][x-]$/;
const COLUMN_KEYS = new Set([
  "type",
  "nullable",
  "generated",
  "default",
  "category",
  "semantic_category",
  "processor_identifier",
  ...SURFACES,
]);
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export function loadManifest(root = repoRoot) {
  return JSON.parse(readFileSync(path.join(root, MANIFEST_PATH), "utf8"));
}

/** The manifest's columns, flattened: { recordType, name, ...entry }. */
export function manifestColumns(manifest) {
  return Object.entries(manifest.record_types ?? {}).flatMap(
    ([recordType, columns]) =>
      Object.entries(columns ?? {}).map(([name, entry]) => ({
        recordType,
        name,
        ...entry,
      })),
  );
}

const flagsOf = (value) => ({
  visible: value[0] === "v",
  editable: value[1] === "e",
  exportable: value[2] === "x",
});

/** The baseline public.field_policies rows the manifest requires. */
export function expectedFieldPolicyRows(manifest) {
  return manifestColumns(manifest).flatMap((column) =>
    SURFACES.map((surface) => ({
      record_type: column.recordType,
      field_key: column.name,
      surface,
      tenant_id: null,
      ...flagsOf(column[surface]),
      sensitivity_category: column.category,
    })),
  );
}

// D-18, 2026-11-21 council: only the anonymous resolver's tenant projection
// (plan 5.4) may differ from the same-name floor; C6 still admits no exception.
export const HOST_PROJECTION_FLOORS = Object.freeze({
  "site_domains.tenant_id": { category: "public", floor: "internal" },
});

/** Problems found in the manifest alone, without a database. */
export function manifestProblems(manifest, { root = repoRoot } = {}) {
  const problems = [];
  const fail = (code, detail) => problems.push(`${code} ${detail}`);
  if (JSON.stringify(manifest.surfaces) !== JSON.stringify(SURFACES))
    fail("SURFACES", `must be exactly ${SURFACES.join(", ")}`);
  if (JSON.stringify(manifest.categories) !== JSON.stringify(CATEGORIES))
    fail("CATEGORIES", `must be exactly ${CATEGORIES.join(", ")}`);
  const processors = new Set(manifest.processor_identifiers ?? []);
  if (processors.size !== 6)
    fail("PROCESSORS", "processor_identifiers must list the six Stripe fields");
  const reserved = manifest.reserved_record_types ?? {};
  if (!reserved.receipts?.physically_absent)
    fail("RESERVED", "receipts must stay reserved and physically absent");
  const recordTypes = Object.keys(manifest.record_types ?? {});
  if (recordTypes.length === 0) fail("EMPTY", "no record types classified");
  for (const recordType of recordTypes) {
    if (!IDENTIFIER.test(recordType))
      fail("NAME", `record type ${JSON.stringify(recordType)}`);
    if (recordType in reserved)
      fail("RESERVED", `${recordType} is reserved and may not be classified`);
  }
  const floors = new Map();
  for (const column of manifestColumns(manifest)) {
    const key = `${column.recordType}.${column.name}`;
    if (!IDENTIFIER.test(column.name))
      fail("NAME", `column ${JSON.stringify(key)}`);
    for (const field of Object.keys(column))
      if (field !== "recordType" && field !== "name" && !COLUMN_KEYS.has(field))
        fail("FIELD", `${key} has unknown key ${JSON.stringify(field)}`);
    if (typeof column.type !== "string" || column.type === "")
      fail("FIELD", `${key} needs a type`);
    if (typeof column.nullable !== "boolean")
      fail("FIELD", `${key} needs nullable true or false`);
    if ("generated" in column && typeof column.generated !== "string")
      fail("FIELD", `${key} generated must be the expression text`);
    if (
      "default" in column &&
      column.default !== null &&
      typeof column.default !== "string"
    )
      fail("FIELD", `${key} default must be text or null`);
    if (!CATEGORIES.includes(column.category))
      fail(
        "CATEGORY",
        `${key} has category ${JSON.stringify(column.category)}`,
      );
    if (
      "semantic_category" in column &&
      !CATEGORIES.includes(column.semantic_category)
    )
      fail(
        "CATEGORY",
        `${key} has semantic_category ${column.semantic_category}`,
      );
    for (const surface of SURFACES)
      if (typeof column[surface] !== "string" || !FLAGS.test(column[surface]))
        fail("FLAGS", `${key} ${surface} must match [v-][e-][x-]`);
    const prior = floors.get(column.name);
    if (
      !Object.hasOwn(HOST_PROJECTION_FLOORS, key) &&
      prior &&
      prior.category !== column.category
    )
      fail(
        "FLOOR",
        `${key} is ${column.category} but ${prior.key} is ${prior.category}; one column name has one category`,
      );
    if (!Object.hasOwn(HOST_PROJECTION_FLOORS, key) && !prior)
      floors.set(column.name, { key, category: column.category });
    const processor = column.processor_identifier === true;
    if ("processor_identifier" in column && !processor)
      fail("PROCESSOR", `${key} processor_identifier may only be true`);
    if (processor !== processors.has(column.name))
      fail(
        "PROCESSOR",
        `${key} must ${processors.has(column.name) ? "" : "not "}be flagged processor_identifier`,
      );
    if (processor)
      for (const surface of SURFACES) {
        const value = column[surface] ?? "";
        if (value[2] !== "-")
          fail("PROCESSOR", `${key} is never exportable (${surface})`);
        if (surface !== "mission_control" && value !== "---")
          fail("PROCESSOR", `${key} is denied on ${surface}`);
      }
  }
  for (const [key, reviewed] of Object.entries(HOST_PROJECTION_FLOORS)) {
    const [record, field] = key.split(".");
    if (
      manifest.record_types[record]?.[field]?.category !== reviewed.category ||
      floors.get(field)?.category !== reviewed.floor
    )
      fail(
        "FLOOR",
        `${key} override is stale or no longer matches its reviewed categories`,
      );
  }
  for (const source of manifest.pinned_sources ?? []) {
    if (!/^supabase\/migrations\/[^/]+\.sql$/.test(source.path ?? "")) {
      fail("PINNED", `${JSON.stringify(source.path)} is not a migration`);
      continue;
    }
    let digest = "";
    try {
      digest = createHash("sha256")
        .update(readFileSync(path.join(root, source.path)))
        .digest("hex");
    } catch {
      fail("PINNED", `${source.path} is missing`);
      continue;
    }
    if (digest !== source.sha256)
      fail("PINNED", `${source.path} changed (sha256 ${digest})`);
  }
  return problems;
}

/** One catalog read: classified relations, their columns, reserved relations and the rows. */
export function catalogSql(manifest) {
  const names = Object.keys(manifest.record_types ?? {}).filter((name) =>
    IDENTIFIER.test(name),
  );
  const absent = Object.entries(manifest.reserved_record_types ?? {})
    .filter(
      ([name, entry]) => entry?.physically_absent && IDENTIFIER.test(name),
    )
    .map(([name]) => name);
  const list = (values) =>
    `array[${values.map((value) => `'${value}'`).join(",")}]::text[]`;
  return `-- field-policy-manifest-gate:v1
select jsonb_build_object(
  'relations', coalesce((
    select jsonb_agg(c.relname order by c.relname)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'f')
      and c.relname = any(${list(names)})), '[]'::jsonb),
  'columns', coalesce((
    select jsonb_agg(jsonb_build_object(
      'record_type', c.relname,
      'field_key', a.attname,
      'type', format_type(a.atttypid, a.atttypmod),
      'nullable', not a.attnotnull,
      'generated', case when a.attgenerated <> '' then pg_get_expr(d.adbin, d.adrelid) end,
      'default', case when a.attgenerated = '' then pg_get_expr(d.adbin, d.adrelid) end
    ) order by c.relname, a.attnum)
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
    left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
    where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'f')
      and c.relname = any(${list(names)})
      and a.attnum > 0 and not a.attisdropped), '[]'::jsonb),
  'reserved_present', coalesce((
    select jsonb_agg(c.relname order by c.relname)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = any(${list(absent)})), '[]'::jsonb),
  'rows', coalesce((
    select jsonb_agg(to_jsonb(p) order by p.record_type, p.field_key, p.surface)
    from public.field_policies p), '[]'::jsonb)
)::text;`;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Problems between the manifest and one catalog read. */
export function catalogProblems(manifest, catalog) {
  const problems = [];
  const fail = (code, detail) => problems.push(`${code} ${detail}`);
  const present = new Set(catalog.relations ?? []);
  for (const recordType of Object.keys(manifest.record_types ?? {}))
    if (!present.has(recordType))
      fail(
        "MISSING_TABLE",
        `${recordType}: no public relation; remove its manifest entries and field_policies rows if it was dropped`,
      );
  for (const name of catalog.reserved_present ?? [])
    fail(
      "RESERVED",
      `public.${name} exists but is reserved and must be absent`,
    );

  const actual = new Map(
    (catalog.columns ?? []).map((column) => [
      `${column.record_type}.${column.field_key}`,
      column,
    ]),
  );
  const expected = new Map(
    manifestColumns(manifest).map((column) => [
      `${column.recordType}.${column.name}`,
      column,
    ]),
  );
  for (const [key, column] of actual)
    if (!expected.has(key))
      fail(
        "UNCLASSIFIED",
        `${key} (${column.type}): add its entry to ${MANIFEST_PATH} and its five field_policies rows in the migration that adds it`,
      );
  for (const [key, entry] of expected) {
    const column = actual.get(key);
    if (!column) {
      if (present.has(entry.recordType))
        fail(
          "STALE",
          `${key}: the column does not exist; remove its manifest entry and its field_policies rows`,
        );
      continue;
    }
    const want = {
      type: entry.type,
      nullable: entry.nullable,
      generated: entry.generated ?? null,
      ...("default" in entry ? { default: entry.default } : {}),
    };
    const got = {
      type: column.type,
      nullable: column.nullable,
      generated: column.generated ?? null,
      ...("default" in entry ? { default: column.default ?? null } : {}),
    };
    if (!same(want, got))
      fail(
        "SHAPE",
        `${key}: manifest ${JSON.stringify(want)} but schema ${JSON.stringify(got)}; reclassify the column and update its entry`,
      );
  }

  const rowKey = (row) =>
    [row.record_type, row.field_key, row.surface, row.tenant_id ?? ""].join(
      "|",
    );
  const wantRows = new Map(
    expectedFieldPolicyRows(manifest).map((row) => [rowKey(row), row]),
  );
  const gotRows = new Map(
    (catalog.rows ?? []).map((row) => [rowKey(row), row]),
  );
  for (const [key, row] of gotRows) {
    const want = wantRows.get(key);
    if (!want)
      fail(
        "ROW_UNEXPECTED",
        `${key} is in public.field_policies but not in the manifest`,
      );
    else if (
      !same(
        [row.visible, row.editable, row.exportable, row.sensitivity_category],
        [
          want.visible,
          want.editable,
          want.exportable,
          want.sensitivity_category,
        ],
      )
    )
      fail(
        "ROW_DRIFT",
        `${key}: database ${JSON.stringify([row.visible, row.editable, row.exportable, row.sensitivity_category])} but manifest ${JSON.stringify([want.visible, want.editable, want.exportable, want.sensitivity_category])}`,
      );
  }
  for (const key of wantRows.keys())
    if (!gotRows.has(key))
      fail("ROW_MISSING", `${key} is not in public.field_policies`);
  return problems;
}

function readCatalog(manifest, { databaseUrl, psqlBin }) {
  return JSON.parse(
    runPsqlQuery({ databaseUrl, sql: catalogSql(manifest), psqlBin }).trim(),
  );
}

/** Whether a URL names a database on this machine (the one loopback list). */
export const isLocalDatabaseUrl = isLoopbackDatabaseUrl;

/** Runs all three checks; returns { ok, problems, lines }. */
export function runFieldPolicyGate({
  root = repoRoot,
  databaseUrl = process.env.DATABASE_URL,
  psqlBin = process.env.PSQL_BIN || "psql",
} = {}) {
  const manifest = loadManifest(root);
  const columns = manifestColumns(manifest);
  const recordTypes = Object.keys(manifest.record_types ?? {}).length;
  const lines = [];
  const staticProblems = manifestProblems(manifest, { root });
  if (staticProblems.length)
    return { ok: false, problems: staticProblems, lines };
  lines.push(
    `PASS: field-policy manifest: ${recordTypes} record types, ${columns.length} columns, five surfaces, same-name floors, processor locks, reserved receipts and pinned sources.`,
  );
  if (!databaseUrl || !isLocalDatabaseUrl(databaseUrl))
    throw new Error(
      "DATABASE_URL must identify a disposable local database for field-policy verification.",
    );
  const problems = catalogProblems(
    manifest,
    readCatalog(manifest, { databaseUrl, psqlBin }),
  );
  if (problems.length) return { ok: false, problems, lines };
  lines.push(
    `PASS: the migrated columns of the ${recordTypes} classified record types equal the manifest's ${columns.length} entries; canonical receipts are absent.`,
    `PASS: all ${columns.length * SURFACES.length} public.field_policies rows equal the manifest's flags and categories.`,
  );
  return { ok: true, problems, lines };
}

const invokedDirectly = () => {
  if (!process.argv[1]) return false;
  try {
    return (
      realpathSync(process.argv[1]) ===
      realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
};

if (invokedDirectly()) {
  let result;
  try {
    result = runFieldPolicyGate();
  } catch (error) {
    console.error(`error: field-policy gate: ${error.message}`);
    process.exit(1);
  }
  for (const line of result.lines) console.log(line);
  if (!result.ok) {
    for (const problem of result.problems) console.error(problem);
    console.error(
      `error: field-policy gate failed (${result.problems.length} problems). See docs/security/field-policies/README.md.`,
    );
    process.exit(1);
  }
}
