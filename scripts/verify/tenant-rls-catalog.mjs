// Tenant RLS catalog gate (#2253, extended by AL-2674). Every public tenant
// table (relkind r/p with a live tenant_id) must have RLS enabled and forced,
// and either at least one policy or a reviewed entry in the #2251
// deny-by-default list. Owners of tenant tables and of SECURITY DEFINER
// functions in the app schemas must bypass RLS (#2251 owner invariant), except
// the command role tenant_guard. Every SECURITY DEFINER function in the app
// schemas has a fixed search path and no PUBLIC EXECUTE, and anon may execute
// one only when it is on the reviewed allowlist of public read functions
// (plan 5.4). In the command schemas, a function signed-in users can execute
// is a human entry point (tenant_guard) or a platform command (platform) and
// calls that lane's preamble; no function there is executable by both signed-in
// users and the service key, or by PUBLIC or anon. Run by
// supabase-migrations.mjs after the field-policy census; #516 reuses this
// module. See docs/security/tenant-guard.md.
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
/** Reviewed SECURITY DEFINER functions that anon may execute (plan 5.4). */
export const ANON_DEFINER_ALLOWLIST_PATH =
  "docs/security/anon-definer-allowlist.json";
export const DEFINER_SCHEMAS = [
  "public",
  "authz",
  "document_cutover",
  "private",
  "tenant_guard",
  "platform",
];
/**
 * The command schemas and the call that every function signed-in users can
 * execute there must make: the human-command preamble in tenant_guard, the
 * shared operator check in platform.
 */
export const COMMAND_PREAMBLES = {
  tenant_guard: "tenant_guard.begin_human_command(",
  platform: "platform.require_operator(",
};
/** The non-bypass role that may own SECURITY DEFINER command functions. */
export const COMMAND_OWNER = "tenant_guard";

const quoted = (names) => names.map((s) => `'${s}'`).join(", ");
const PUBLIC_EXECUTE = `exists (select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        where a.grantee = 0 and a.privilege_type = 'EXECUTE')`;

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
      'schema', n.nspname,
      'owner', r.rolname,
      'owner_bypass', r.rolsuper or r.rolbypassrls,
      'search_path', (select substr(c, 13) from unnest(p.proconfig) c
        where c like 'search_path=%' limit 1),
      'volatility', p.provolatile,
      'public_execute', ${PUBLIC_EXECUTE},
      'anon_execute', has_function_privilege('anon', p.oid, 'EXECUTE')) order by n.nspname, p.proname, p.oid)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_roles r on r.oid = p.proowner
    where p.prosecdef
      and n.nspname in (${quoted(DEFINER_SCHEMAS)})), '[]'::jsonb),
  'commands', coalesce((
    select jsonb_agg(jsonb_build_object(
      'function', format('%I.%I(%s)', n.nspname, p.proname,
        pg_get_function_identity_arguments(p.oid)),
      'schema', n.nspname,
      'owner', r.rolname,
      'definer', p.prosecdef,
      'authenticated', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
      'service_role', has_function_privilege('service_role', p.oid, 'EXECUTE'),
      'anon', has_function_privilege('anon', p.oid, 'EXECUTE'),
      'public_execute', ${PUBLIC_EXECUTE},
      'preamble', strpos(lower(pg_get_functiondef(p.oid)), case n.nspname
        ${Object.entries(COMMAND_PREAMBLES)
          .map(([s, call]) => `when '${s}' then '${call}'`)
          .join(" ")} end) > 0) order by n.nspname, p.proname, p.oid)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_roles r on r.oid = p.proowner
    where p.prokind in ('f', 'p')
      and n.nspname in (${quoted(Object.keys(COMMAND_PREAMBLES))})), '[]'::jsonb)
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
 * Parses the anon allowlist: { allowed: Set<function signature>, failures }.
 * Each entry names a function as the catalog prints it (`schema.name(args)`),
 * with a reason and its reviewer.
 */
function readAnonAllowlist(allowlist) {
  const failures = [];
  const allowed = new Set();
  const malformed = (detail, fn) =>
    failures.push({ code: "ANON_ALLOWLIST_MALFORMED", function: fn, detail });
  if (allowlist instanceof Error) malformed(allowlist.message);
  else if (!Array.isArray(allowlist?.entries))
    malformed("expected an object with an entries array");
  else
    for (const [i, entry] of allowlist.entries.entries()) {
      const fn = entry?.function;
      if (typeof fn !== "string" || !fn)
        malformed(`entry ${i} has no function`);
      else if (allowed.has(fn)) malformed(`duplicate entry ${i}`, fn);
      else if (typeof entry.reason !== "string" || !entry.reason.trim())
        malformed(`entry ${i} has no reason`, fn);
      else allowed.add(fn);
    }
  return { allowed, failures };
}

/**
 * Pure evaluator. `snapshot` is the parsed TENANT_RLS_CATALOG_SQL result;
 * `exceptions` is the parsed exception list, and `anonAllowlist` the parsed
 * anon allowlist, each an Error when it could not be read. Returns
 * { ok, failures: [{ code, table | function, detail }], counts }.
 */
export function evaluateTenantRlsCatalog(
  snapshot,
  exceptions,
  anonAllowlist = { entries: [] },
) {
  const { listed, failures, usable } = readExceptions(exceptions);
  const fail = (code, table, detail) => failures.push({ code, table, detail });
  const failFn = (code, fn, detail) =>
    failures.push({ code, function: fn, detail });
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

  const anon = readAnonAllowlist(anonAllowlist);
  failures.push(...anon.failures);
  const definers = new Map(snapshot.definers.map((d) => [d.function, d]));
  for (const d of snapshot.definers) {
    if (!d.owner_bypass && d.owner !== COMMAND_OWNER)
      failFn(
        "DEFINER_OWNER_NO_BYPASS",
        d.function,
        `SECURITY DEFINER owner ${d.owner} has neither rolsuper nor rolbypassrls`,
      );
    if (typeof d.search_path !== "string")
      failFn(
        "DEFINER_SEARCH_PATH_UNSET",
        d.function,
        "SECURITY DEFINER function has no fixed search_path (SET search_path = '')",
      );
    if (d.public_execute)
      failFn(
        "DEFINER_PUBLIC_EXECUTE",
        d.function,
        "PUBLIC may execute a SECURITY DEFINER function: revoke it by name",
      );
    if (d.anon_execute && !anon.allowed.has(d.function))
      failFn(
        "DEFINER_ANON_EXECUTE",
        d.function,
        `anon may execute a SECURITY DEFINER function not listed in ${ANON_DEFINER_ALLOWLIST_PATH}`,
      );
  }
  for (const fn of anon.allowed) {
    const d = definers.get(fn);
    if (!d) {
      failFn(
        "ANON_ALLOWLIST_STALE",
        fn,
        `no SECURITY DEFINER function with this signature: remove it from ${ANON_DEFINER_ALLOWLIST_PATH}`,
      );
      continue;
    }
    if (d.volatility === "v" || d.search_path !== '""')
      failFn(
        "ANON_ALLOWLISTED_UNSAFE",
        fn,
        "an anon-executable read function must be STABLE or IMMUTABLE with SET search_path = ''",
      );
  }

  const commands = snapshot.commands ?? [];
  for (const c of commands) {
    const preamble = COMMAND_PREAMBLES[c.schema];
    if (c.public_execute || c.anon)
      failFn(
        "COMMAND_PUBLIC_EXECUTE",
        c.function,
        `PUBLIC or anon may execute a function in the ${c.schema} schema`,
      );
    if (c.authenticated && c.service_role)
      failFn(
        "COMMAND_LANE_MIXED",
        c.function,
        "both authenticated (human lane) and service_role (worker lane) may execute it",
      );
    if (!c.authenticated) continue;
    if (
      c.schema === "tenant_guard" &&
      !(c.definer && c.owner === COMMAND_OWNER && c.preamble)
    )
      failFn(
        "COMMAND_HUMAN_NO_PREAMBLE",
        c.function,
        `a tenant_guard function authenticated may execute must be a SECURITY DEFINER owned by ${COMMAND_OWNER} that calls ${preamble}...)`,
      );
    if (c.schema === "platform" && !(c.definer && c.preamble))
      failFn(
        "PLATFORM_COMMAND_NO_OPERATOR_CHECK",
        c.function,
        `a platform function authenticated may execute must be a SECURITY DEFINER that calls ${preamble})`,
      );
  }

  const counts = {
    tenant: tenant.length,
    withPolicy: tenant.filter((t) => Number(t.policies) > 0).length,
    listed: listed.size,
    stale,
    definers: snapshot.definers.length,
    anonAllowed: anon.allowed.size,
    humanEntryPoints: commands.filter(
      (c) => c.schema === "tenant_guard" && c.authenticated,
    ).length,
    platformCommands: commands.filter(
      (c) => c.schema === "platform" && c.authenticated,
    ).length,
  };
  return { ok: failures.length === 0, failures, counts };
}

/** One-line summary printed by the verifier. */
export const formatTenantRlsCatalogSummary = ({ counts: c }) =>
  `PASS: tenant RLS catalog gate: ${c.tenant} tenant tables enabled and forced (${c.withPolicy} with policies, ${c.listed} listed deny-by-default, ${c.stale} stale), ${c.definers} SECURITY DEFINER functions with RLS-bypassing owners, a fixed search path and no PUBLIC EXECUTE (${c.anonAllowed ?? 0} anon-allowlisted); command lanes: ${c.humanEntryPoints ?? 0} human entry points, ${c.platformCommands ?? 0} platform commands.`;

function readJson(root, relativePath) {
  try {
    return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    return new Error(`${relativePath}: ${error.message}`);
  }
}

const isBool = (value) => typeof value === "boolean";
/** Throws unless every definer and command row carries the fields the evaluator reads. */
function assertSnapshotShape(snapshot) {
  if (
    !Array.isArray(snapshot?.tables) ||
    !Array.isArray(snapshot?.definers) ||
    !Array.isArray(snapshot?.commands)
  )
    throw new Error(
      "tenant RLS catalog snapshot has no tables, definers or commands",
    );
  for (const d of snapshot.definers)
    if (
      !isBool(d?.public_execute) ||
      !isBool(d?.anon_execute) ||
      !("search_path" in d)
    )
      throw new Error(
        `tenant RLS catalog snapshot definer row is incomplete: ${d?.function}`,
      );
  for (const c of snapshot.commands)
    if (
      ![
        "definer",
        "authenticated",
        "service_role",
        "anon",
        "public_execute",
        "preamble",
      ].every((k) => isBool(c?.[k]))
    )
      throw new Error(
        `tenant RLS catalog snapshot command row is incomplete: ${c?.function}`,
      );
}

/**
 * Runs the catalog query through psql (the census pattern) and evaluates it
 * against the exception list and the anon allowlist. Throws when psql fails
 * or prints no complete snapshot.
 */
export function runTenantRlsCatalogGate({
  databaseUrl,
  psqlBin = "psql",
  root = repoRoot,
}) {
  const exceptions = readJson(root, TENANT_RLS_EXCEPTIONS_PATH);
  const anonAllowlist = readJson(root, ANON_DEFINER_ALLOWLIST_PATH);
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
  assertSnapshotShape(snapshot);
  return evaluateTenantRlsCatalog(snapshot, exceptions, anonAllowlist);
}
