#!/usr/bin/env node
// Deterministic fingerprint of a migrated database's schema (plan 7.4: "a
// schema fingerprint compared with CI's fresh replay"; WP1 acceptance:
// "Schema fingerprint equality between CI's replay and development").
//
// Scope: every schema the migrations own. Supabase-managed and system schemas
// are left out, and so is every object an extension owns, because those
// differ between a hosted project and CI's bootstrap without any migration
// causing it. Policies are read from every schema, because migrations write
// policies on Supabase's tables too (storage.objects). Rows are not read:
// ledgers, markers and data are not schema.
//
//   node scripts/release/schema-fingerprint.mjs capture \
//     --database-url-env DATABASE_URL --out fingerprint.json
//   node scripts/release/schema-fingerprint.mjs compare a.json b.json
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { queryJson } from "./lib/postgres.mjs";

export const FINGERPRINT_VERSION = 1;

export const EXCLUDED_SCHEMA_PATTERN =
  "^(pg_.*|information_schema|_.*|auth|storage|realtime|extensions|graphql|graphql_public|pgbouncer|pgsodium.*|vault|supabase_.*|net|cron|pgtle|repack|topology|tiger.*)$";

const acl = (column) =>
  `(SELECT array_agg(entry::text ORDER BY entry::text) FROM unnest(${column}) AS entry)`;

export const FINGERPRINT_SQL = `-- release schema fingerprint v${FINGERPRINT_VERSION}
WITH ns AS (
  SELECT oid, nspname, nspowner, nspacl FROM pg_namespace
  WHERE nspname !~ '${EXCLUDED_SCHEMA_PATTERN}'
),
ext AS (
  SELECT classid, objid FROM pg_depend WHERE deptype = 'e'
),
rel AS (
  SELECT c.*, n.nspname FROM pg_class c JOIN ns n ON n.oid = c.relnamespace
  WHERE NOT EXISTS (
    SELECT 1 FROM ext WHERE ext.classid = 'pg_class'::regclass AND ext.objid = c.oid)
),
items(key, def) AS (
  SELECT 'schema ' || nspname,
    json_build_object('owner', pg_get_userbyid(nspowner), 'acl', ${acl("nspacl")})::text
  FROM ns
  UNION ALL
  SELECT 'relation ' || r.nspname || '.' || r.relname,
    json_build_object(
      'kind', r.relkind, 'owner', pg_get_userbyid(r.relowner),
      'persistence', r.relpersistence, 'rls', r.relrowsecurity,
      'force_rls', r.relforcerowsecurity, 'options', r.reloptions,
      'acl', ${acl("r.relacl")},
      'partition_key', CASE WHEN r.relkind = 'p' THEN pg_get_partkeydef(r.oid) END,
      'partition_of', (SELECT i.inhparent::regclass::text FROM pg_inherits i
                        WHERE i.inhrelid = r.oid AND r.relispartition),
      'partition_bound', pg_get_expr(r.relpartbound, r.oid),
      'view', CASE WHEN r.relkind IN ('v', 'm') THEN pg_get_viewdef(r.oid) END,
      'sequence', (SELECT json_build_object(
          'type', format_type(s.seqtypid, NULL), 'start', s.seqstart,
          'increment', s.seqincrement, 'min', s.seqmin, 'max', s.seqmax,
          'cache', s.seqcache, 'cycle', s.seqcycle)
        FROM pg_sequence s WHERE s.seqrelid = r.oid)
    )::text
  FROM rel r WHERE r.relkind IN ('r', 'p', 'v', 'm', 'f', 'S', 'c')
  UNION ALL
  SELECT 'column ' || r.nspname || '.' || r.relname || '.' || a.attname,
    json_build_object(
      'position', a.position, 'type', format_type(a.atttypid, a.atttypmod),
      'not_null', a.attnotnull, 'default', pg_get_expr(d.adbin, d.adrelid),
      'identity', a.attidentity, 'generated', a.attgenerated,
      'collation', CASE WHEN a.attcollation <> t.typcollation
                        THEN a.attcollation::regcollation::text END,
      'acl', ${acl("a.attacl")}
    )::text
  FROM rel r
  JOIN (SELECT pa.*, row_number() OVER (PARTITION BY pa.attrelid ORDER BY pa.attnum) AS position
        FROM pg_attribute pa WHERE pa.attnum > 0 AND NOT pa.attisdropped) a
    ON a.attrelid = r.oid
  JOIN pg_type t ON t.oid = a.atttypid
  LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
  WHERE r.relkind IN ('r', 'p', 'v', 'm', 'f', 'c')
  UNION ALL
  SELECT 'constraint ' || r.nspname || '.' || r.relname || '.' || con.conname,
    pg_get_constraintdef(con.oid)
  FROM pg_constraint con JOIN rel r ON r.oid = con.conrelid
  UNION ALL
  SELECT 'constraint ' || n.nspname || '.' || t.typname || '.' || con.conname,
    pg_get_constraintdef(con.oid)
  FROM pg_constraint con JOIN pg_type t ON t.oid = con.contypid
  JOIN ns n ON n.oid = t.typnamespace
  UNION ALL
  SELECT 'index ' || r.nspname || '.' || r.relname, pg_get_indexdef(r.oid)
  FROM rel r WHERE r.relkind IN ('i', 'I')
  UNION ALL
  SELECT 'function ' || n.nspname || '.' || p.proname || '('
      || pg_get_function_identity_arguments(p.oid) || ')',
    json_build_object(
      'owner', pg_get_userbyid(p.proowner), 'acl', ${acl("p.proacl")},
      'definition', CASE WHEN p.prokind = 'a'
        THEN format_type(p.prorettype, NULL)
        ELSE pg_get_functiondef(p.oid) END
    )::text
  FROM pg_proc p JOIN ns n ON n.oid = p.pronamespace
  WHERE NOT EXISTS (
    SELECT 1 FROM ext WHERE ext.classid = 'pg_proc'::regclass AND ext.objid = p.oid)
  UNION ALL
  SELECT 'trigger ' || r.nspname || '.' || r.relname || '.' || tg.tgname,
    pg_get_triggerdef(tg.oid) || ' [' || tg.tgenabled::text || ']'
  FROM pg_trigger tg JOIN rel r ON r.oid = tg.tgrelid WHERE NOT tg.tgisinternal
  UNION ALL
  SELECT 'policy ' || pn.nspname || '.' || pc.relname || '.' || pol.polname,
    json_build_object(
      'command', pol.polcmd, 'permissive', pol.polpermissive,
      'roles', (SELECT array_agg(CASE WHEN role = 0 THEN 'public'
                                      ELSE pg_get_userbyid(role)::text END
                                 ORDER BY 1)
                FROM unnest(pol.polroles) AS role),
      'using', pg_get_expr(pol.polqual, pol.polrelid),
      'check', pg_get_expr(pol.polwithcheck, pol.polrelid)
    )::text
  FROM pg_policy pol JOIN pg_class pc ON pc.oid = pol.polrelid
  JOIN pg_namespace pn ON pn.oid = pc.relnamespace
  WHERE pn.nspname NOT IN ('pg_catalog', 'information_schema')
  UNION ALL
  SELECT 'type ' || n.nspname || '.' || t.typname,
    json_build_object(
      'kind', t.typtype, 'owner', pg_get_userbyid(t.typowner),
      'labels', (SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder)
                 FROM pg_enum e WHERE e.enumtypid = t.oid),
      'base', CASE WHEN t.typtype = 'd' THEN format_type(t.typbasetype, t.typtypmod) END,
      'not_null', t.typnotnull, 'default', t.typdefault
    )::text
  FROM pg_type t JOIN ns n ON n.oid = t.typnamespace
  WHERE t.typtype IN ('e', 'd', 'r', 'm')
    AND NOT EXISTS (
      SELECT 1 FROM ext WHERE ext.classid = 'pg_type'::regclass AND ext.objid = t.oid)
  UNION ALL
  SELECT 'publication ' || pub.pubname || ' ' || r.nspname || '.' || r.relname,
    coalesce(pg_get_expr(pr.prqual, pr.prrelid), '')
  FROM pg_publication_rel pr JOIN pg_publication pub ON pub.oid = pr.prpubid
  JOIN rel r ON r.oid = pr.prrelid
)
SELECT coalesce(json_agg(json_build_array(key, def) ORDER BY key), '[]'::json)::text
FROM items;`;

/** Canonical form: entries sorted by key, one digest over all of them. */
export function buildFingerprint(entries) {
  const sorted = [...entries]
    .map(([key, def]) => [String(key), def === null ? "" : String(def)])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const duplicate = sorted.find(([key], i) => sorted[i - 1]?.[0] === key);
  if (duplicate)
    throw new Error(`Fingerprint key appears twice: ${duplicate[0]}`);
  const hash = createHash("sha256");
  for (const [key, def] of sorted) hash.update(`${key}\t${def}\n`);
  return {
    version: FINGERPRINT_VERSION,
    digest: hash.digest("hex"),
    count: sorted.length,
    entries: sorted,
  };
}

export function captureFingerprint({ databaseUrl, query = queryJson }) {
  const entries = query({
    databaseUrl,
    sql: FINGERPRINT_SQL,
    label: "capture schema fingerprint",
  });
  if (!Array.isArray(entries))
    throw new Error("The fingerprint query returned no list.");
  return buildFingerprint(entries);
}

/** Keys present on one side only, and keys whose definitions differ. */
export function diffFingerprints(expected, actual) {
  if (expected.version !== actual.version) {
    return {
      equal: false,
      versionMismatch: true,
      missing: [],
      unexpected: [],
      changed: [],
    };
  }
  const left = new Map(expected.entries);
  const right = new Map(actual.entries);
  const missing = [...left.keys()].filter((key) => !right.has(key));
  const unexpected = [...right.keys()].filter((key) => !left.has(key));
  const changed = [...left.keys()].filter(
    (key) => right.has(key) && right.get(key) !== left.get(key),
  );
  return {
    equal:
      expected.digest === actual.digest &&
      missing.length + unexpected.length + changed.length === 0,
    versionMismatch: false,
    missing,
    unexpected,
    changed,
  };
}

export function formatFingerprintDiff(
  diff,
  { expectedLabel, actualLabel, limit = 50 },
) {
  if (diff.equal)
    return `Schema fingerprints match (${expectedLabel} = ${actualLabel}).`;
  if (diff.versionMismatch)
    return "Schema fingerprints were made by different versions.";
  const lines = [
    `Schema fingerprints differ (${expectedLabel} vs ${actualLabel}):`,
  ];
  for (const [label, keys] of [
    [`only in ${expectedLabel}`, diff.missing],
    [`only in ${actualLabel}`, diff.unexpected],
    ["defined differently", diff.changed],
  ]) {
    if (keys.length === 0) continue;
    lines.push(`- ${label} (${keys.length}):`);
    for (const key of keys.slice(0, limit)) lines.push(`  - ${key}`);
    if (keys.length > limit) lines.push(`  - ... ${keys.length - limit} more`);
  }
  return lines.join("\n");
}

export function readFingerprint(file) {
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(parsed?.entries))
    throw new Error(`${file} is not a fingerprint.`);
  return { ...buildFingerprint(parsed.entries), version: parsed.version };
}

function argValue(argv, name) {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
}

export function runCli(argv, { env = process.env, log = console.log } = {}) {
  const [command, ...rest] = argv;
  if (command === "capture") {
    const variable = argValue(rest, "--database-url-env");
    const out = argValue(rest, "--out");
    const databaseUrl = variable ? env[variable] : undefined;
    if (!databaseUrl || !out) {
      throw new Error(
        "capture needs --database-url-env <NAME> naming a set variable, and --out <file>.",
      );
    }
    const fingerprint = captureFingerprint({ databaseUrl });
    writeFileSync(out, `${JSON.stringify(fingerprint, null, 1)}\n`);
    log(
      `Captured schema fingerprint ${fingerprint.digest} (${fingerprint.count} objects).`,
    );
    return 0;
  }
  if (command === "compare") {
    const [expectedFile, actualFile] = rest;
    if (!expectedFile || !actualFile)
      throw new Error("compare needs two fingerprint files.");
    const diff = diffFingerprints(
      readFingerprint(expectedFile),
      readFingerprint(actualFile),
    );
    log(
      formatFingerprintDiff(diff, {
        expectedLabel: path.basename(expectedFile),
        actualLabel: path.basename(actualFile),
      }),
    );
    return diff.equal ? 0 : 1;
  }
  throw new Error("Usage: schema-fingerprint.mjs capture|compare ...");
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  try {
    process.exitCode = runCli(process.argv.slice(2));
  } catch (error) {
    console.error(`schema-fingerprint: ${error.message}`);
    process.exitCode = 1;
  }
}
