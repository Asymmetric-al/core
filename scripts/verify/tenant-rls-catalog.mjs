// Tenant RLS catalog gate (#2253). Every public tenant table (relkind r/p
// with a live tenant_id) must have RLS enabled and forced, and either at least
// one policy or a reviewed entry in the #2251 deny-by-default list. Owners of
// tenant tables and of SECURITY DEFINER functions in the app schemas must
// bypass RLS (#2251 owner invariant). Run by supabase-migrations.mjs after the
// field-policy census; #516 reuses this module. See docs/security/tenant-guard.md.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
export const TENANT_RLS_EXCEPTIONS_PATH =
  "docs/security/rls-deny-by-default-exceptions.json";
export const DEFINER_SCHEMAS = [
  "public",
  "authz",
  "document_cutover",
  "private",
];

export const TENANT_RLS_CATALOG_SQL = `-- tenant-rls-catalog-gate:v1
select jsonb_build_object(
  'tables', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', c.relname,
      'tenant', exists (
        select 1 from pg_attribute a
        where a.attrelid = c.oid and a.attname = 'tenant_id'
          and a.attnum > 0 and not a.attisdropped),
      'rls', c.relrowsecurity,
      'force', c.relforcerowsecurity,
      'policies', (select count(*) from pg_policy p where p.polrelid = c.oid),
      'owner', r.rolname,
      'owner_bypass', r.rolsuper or r.rolbypassrls) order by c.relname)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    join pg_roles r on r.oid = c.relowner
    where n.nspname = 'public' and c.relkind in ('r', 'p')), '[]'::jsonb),
  'definers', coalesce((
    select jsonb_agg(jsonb_build_object(
      'function', format('%I.%I(%s)', n.nspname, p.proname,
        pg_get_function_identity_arguments(p.oid)),
      'owner', r.rolname,
      'owner_bypass', r.rolsuper or r.rolbypassrls) order by n.nspname, p.proname, p.oid)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_roles r on r.oid = p.proowner
    where p.prosecdef
      and n.nspname in (${DEFINER_SCHEMAS.map((s) => `'${s}'`).join(", ")})), '[]'::jsonb)
)::text;`;

/** Parses the exception list: { listed: Set<table>, failures }. */
function readExceptions(exceptions) {
  const failures = [];
  const listed = new Set();
  const malformed = (detail, table) =>
    failures.push({ code: "EXCEPTIONS_MALFORMED", table, detail });
  if (exceptions instanceof Error) malformed(exceptions.message);
  else if (!Array.isArray(exceptions?.entries))
    malformed("expected an object with an entries array");
  else
    for (const [i, entry] of exceptions.entries.entries()) {
      const table = entry?.table;
      if (typeof table !== "string" || !table)
        malformed(`entry ${i} has no table`);
      else if (listed.has(table)) malformed(`duplicate entry ${i}`, table);
      else listed.add(table);
    }
  return { listed, failures, usable: Array.isArray(exceptions?.entries) };
}

/**
 * Pure evaluator. `snapshot` is the parsed TENANT_RLS_CATALOG_SQL result;
 * `exceptions` is the parsed exception list, or an Error when it could not be
 * read. Returns { ok, failures: [{ code, table | function, detail }], counts }.
 */
export function evaluateTenantRlsCatalog(snapshot, exceptions) {
  const { listed, failures, usable } = readExceptions(exceptions);
  const fail = (code, table, detail) => failures.push({ code, table, detail });
  const tables = new Map(snapshot.tables.map((t) => [t.table, t]));
  const tenant = snapshot.tables.filter((t) => t.tenant);
  for (const t of tenant) {
    if (!t.rls)
      fail("RLS_DISABLED", t.table, "row level security is not enabled");
    if (!t.force)
      fail("FORCE_MISSING", t.table, "row level security is not forced");
    if (Number(t.policies) === 0 && usable && !listed.has(t.table))
      fail(
        "NO_POLICY_UNLISTED",
        t.table,
        `no policy and not listed in ${TENANT_RLS_EXCEPTIONS_PATH}`,
      );
    if (!t.owner_bypass)
      fail(
        "OWNER_NO_BYPASS",
        t.table,
        `owner ${t.owner} has neither rolsuper nor rolbypassrls`,
      );
  }
  let stale = 0;
  for (const table of listed) {
    const t = tables.get(table);
    const code = !t
      ? "STALE_MISSING_TABLE"
      : !t.tenant
        ? "STALE_NOT_TENANT"
        : Number(t.policies) > 0
          ? "STALE_HAS_POLICY"
          : null;
    if (!code) continue;
    stale += 1;
    fail(
      code,
      table,
      `stale exception: remove it from ${TENANT_RLS_EXCEPTIONS_PATH}`,
    );
  }
  for (const d of snapshot.definers)
    if (!d.owner_bypass && d.owner !== "tenant_guard")
      failures.push({
        code: "DEFINER_OWNER_NO_BYPASS",
        function: d.function,
        detail: `SECURITY DEFINER owner ${d.owner} has neither rolsuper nor rolbypassrls`,
      });
  const counts = {
    tenant: tenant.length,
    withPolicy: tenant.filter((t) => Number(t.policies) > 0).length,
    listed: listed.size,
    stale,
    definers: snapshot.definers.length,
  };
  return { ok: failures.length === 0, failures, counts };
}

/** One-line summary printed by the verifier. */
export const formatTenantRlsCatalogSummary = ({ counts: c }) =>
  `PASS: tenant RLS catalog gate: ${c.tenant} tenant tables enabled and forced (${c.withPolicy} with policies, ${c.listed} listed deny-by-default, ${c.stale} stale), ${c.definers} SECURITY DEFINER functions with RLS-bypassing owners.`;

/**
 * Runs the catalog query through psql (the census pattern) and evaluates it
 * against the exception list. Throws when psql fails or prints no snapshot.
 */
export function runTenantRlsCatalogGate({
  databaseUrl,
  psqlBin = "psql",
  root = repoRoot,
}) {
  let exceptions;
  try {
    exceptions = JSON.parse(
      readFileSync(path.join(root, TENANT_RLS_EXCEPTIONS_PATH), "utf8"),
    );
  } catch (error) {
    exceptions = new Error(`${TENANT_RLS_EXCEPTIONS_PATH}: ${error.message}`);
  }
  const result = spawnSync(
    psqlBin,
    [
      databaseUrl,
      "-X",
      "-v",
      "ON_ERROR_STOP=1",
      "-At",
      "-c",
      TENANT_RLS_CATALOG_SQL,
    ],
    { cwd: root, encoding: "utf8", shell: false },
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(result.stderr || "tenant RLS catalog query failed");
  const line = result.stdout.trim().split("\n").pop() ?? "";
  let snapshot;
  try {
    snapshot = JSON.parse(line);
  } catch {
    throw new Error(
      `tenant RLS catalog query printed no snapshot: ${line.slice(0, 200)}`,
    );
  }
  if (!Array.isArray(snapshot?.tables) || !Array.isArray(snapshot?.definers))
    throw new Error("tenant RLS catalog snapshot has no tables or definers");
  return evaluateTenantRlsCatalog(snapshot, exceptions);
}
