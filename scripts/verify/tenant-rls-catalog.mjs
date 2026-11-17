// Tenant RLS catalog gate (#2253, extended by AL-2674). Every public tenant
// table (relkind r/p with a live tenant_id) must have RLS enabled and forced,
// and either at least one policy or a reviewed entry in the #2251
// deny-by-default list. Owners of tenant tables and of SECURITY DEFINER
// functions in the app schemas must bypass RLS (#2251 owner invariant), except
// the command role tenant_guard inside its own schema; tenant_guard owns
// nothing outside it, and postgres owns every definer in `platform`. Every
// SECURITY DEFINER function in the app schemas has a fixed search path (empty
// in the command schemas, never naming "$user" elsewhere) and no PUBLIC
// EXECUTE, and anon may execute one only when it is on the reviewed allowlist
// of public read functions (plan 5.4). In the command schemas, a function
// signed-in users can execute is a human entry point (tenant_guard) whose
// first statement is the human preamble, or a platform command (platform)
// whose DECLARE section runs the operator check; no function there is
// executable by both signed-in users and the service key, or by PUBLIC or
// anon. A function elsewhere that calls into a command schema is a SECURITY
// INVOKER wrapper with a fixed search path, closed to PUBLIC and anon, and
// open to signed-in users only when it calls human entry points or platform
// commands. In `public`, no table grant goes to PUBLIC, none of TRUNCATE,
// REFERENCES, TRIGGER or MAINTAIN goes to anon or authenticated, and their
// SELECT, INSERT, UPDATE and DELETE grants are each admitted by a policy (the
// end state of migration 20261117034926). Run by supabase-migrations.mjs after
// the field-policy census; #516 reuses this module. See
// docs/security/tenant-guard.md.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runPsqlQuery } from "../lib/psql.mjs";

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
/** The non-bypass role that may own SECURITY DEFINER command functions, in its own schema only. */
export const COMMAND_OWNER = "tenant_guard";
/** The only owner of SECURITY DEFINER functions in `platform` (plan 7.2). */
export const PLATFORM_OWNER = "postgres";
/**
 * The command schemas and the call each lane's entry points make first: the
 * human-command preamble in tenant_guard, the shared operator check in
 * platform.
 */
export const COMMAND_PREAMBLES = {
  tenant_guard: "tenant_guard.begin_human_command(",
  platform: "platform.require_operator(",
};
const COMMAND_SCHEMAS = Object.keys(COMMAND_PREAMBLES);
/** Table privileges no Data API role may hold in `public`. */
const UNSAFE_TABLE_PRIVILEGES = [
  "TRUNCATE",
  "REFERENCES",
  "TRIGGER",
  "MAINTAIN",
];

const quoted = (names) => names.map((s) => `'${s}'`).join(", ");
const PUBLIC_EXECUTE = `exists (select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        where a.grantee = 0 and a.privilege_type = 'EXECUTE')`;
const SIGNATURE = `format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid))`;
const SEARCH_PATH = `(select substr(c, 13) from unnest(p.proconfig) c where c like 'search_path=%' limit 1)`;

/**
 * Grants in `public` that no use admits: any table privilege of PUBLIC; any of
 * the unsafe privileges for anon or authenticated; and their SELECT, INSERT,
 * UPDATE or DELETE on a table where no row-security policy admits that role
 * for that command. The same predicate as the post-assert of migration
 * 20261117034926_close_default_privileges_and_demo_grants.sql, which closed
 * them once; this keeps them closed.
 */
export const UNADMITTED_TABLE_GRANTS_SQL = `select c.relname as relation,
         case a.grantee when 0 then 'PUBLIC' else a.grantee::regrole::text end as grantee,
         a.privilege_type as privilege
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    cross join lateral aclexplode(c.relacl) a
   where n.nspname = 'public'
     and c.relkind in ('r', 'p', 'v', 'm', 'f')
     and a.grantee in (0, 'anon'::regrole, 'authenticated'::regrole)
     and (
       a.privilege_type in (${quoted(UNSAFE_TABLE_PRIVILEGES)})
       or a.grantee = 0
       or (c.relkind in ('r', 'p') and not exists (
         select 1 from pg_policy p
          where c.relrowsecurity
            and p.polrelid = c.oid
            and p.polcmd in ('*', case a.privilege_type
              when 'SELECT' then 'r' when 'INSERT' then 'a'
              when 'UPDATE' then 'w' when 'DELETE' then 'd' end::"char")
            and (p.polroles @> array[0::oid] or p.polroles @> array[a.grantee])
       ))
     )`;

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
      'function', ${SIGNATURE},
      'schema', n.nspname,
      'owner', r.rolname,
      'owner_bypass', r.rolsuper or r.rolbypassrls,
      'search_path', ${SEARCH_PATH},
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
      'function', ${SIGNATURE},
      'schema', n.nspname,
      'owner', r.rolname,
      'definer', p.prosecdef,
      'language', l.lanname,
      'body', p.prosrc,
      'authenticated', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
      'service_role', has_function_privilege('service_role', p.oid, 'EXECUTE'),
      'anon', has_function_privilege('anon', p.oid, 'EXECUTE'),
      'public_execute', ${PUBLIC_EXECUTE}) order by n.nspname, p.proname, p.oid)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_roles r on r.oid = p.proowner
    join pg_language l on l.oid = p.prolang
    where p.prokind in ('f', 'p')
      and (n.nspname in (${quoted(COMMAND_SCHEMAS)})
        or r.rolname = '${COMMAND_OWNER}')), '[]'::jsonb),
  'wrappers', coalesce((
    select jsonb_agg(jsonb_build_object(
      'function', ${SIGNATURE},
      'schema', n.nspname,
      'definer', p.prosecdef,
      'search_path', ${SEARCH_PATH},
      'body', p.prosrc,
      'authenticated', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
      'anon', has_function_privilege('anon', p.oid, 'EXECUTE'),
      'public_execute', ${PUBLIC_EXECUTE}) order by n.nspname, p.proname, p.oid)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.prokind in ('f', 'p')
      and n.nspname not in (${quoted(COMMAND_SCHEMAS)}, 'pg_catalog', 'information_schema')
      and n.nspname not like 'pg\\_toast%'
      and p.prosrc ~* '(${COMMAND_SCHEMAS.join("|")})"?\\s*\\.'), '[]'::jsonb),
  'grants', coalesce((
    select jsonb_agg(to_jsonb(g) order by g.relation, g.grantee, g.privilege)
    from (${UNADMITTED_TABLE_GRANTS_SQL}) g), '[]'::jsonb)
)::text;`;

/**
 * A function body with its comments removed and, with `blankStrings`, the
 * contents of every string literal removed too (quoted, E'' and dollar
 * quoted). It only finds where comments and literals start and end, so that a
 * call or an EXCEPTION clause cannot hide in, or be faked by, either.
 */
export function stripComments(body, { blankStrings = false } = {}) {
  const IDENT = /[A-Za-z0-9_$]/;
  const DOLLAR = /\$([A-Za-z_][A-Za-z0-9_]*)?\$/y;
  let out = "";
  let i = 0;
  while (i < body.length) {
    const two = body.slice(i, i + 2);
    if (two === "--") {
      const end = body.indexOf("\n", i);
      i = end < 0 ? body.length : end;
      continue;
    }
    if (two === "/*") {
      // Block comments nest in PostgreSQL.
      let depth = 0;
      do {
        const mark = body.slice(i, i + 2);
        depth += mark === "/*" ? 1 : mark === "*/" ? -1 : 0;
        i += mark === "/*" || mark === "*/" ? 2 : 1;
      } while (depth > 0 && i < body.length);
      out += " ";
      continue;
    }
    const ch = body[i];
    DOLLAR.lastIndex = i;
    const dollar =
      ch === "$" && !IDENT.test(body[i - 1] ?? "") ? DOLLAR.exec(body) : null;
    if (dollar) {
      const close = body.indexOf(dollar[0], i + dollar[0].length);
      const end = close < 0 ? body.length : close + dollar[0].length;
      out += blankStrings ? "''" : body.slice(i, end);
      i = end;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const escapes =
        ch === "'" &&
        /[eE]/.test(body[i - 1] ?? "") &&
        !IDENT.test(body[i - 2] ?? "");
      let j = i + 1;
      while (j < body.length) {
        if (escapes && body[j] === "\\") j += 2;
        else if (body[j] === ch && body[j + 1] === ch) j += 2;
        else if (body[j] === ch) break;
        else j += 1;
      }
      out += blankStrings && ch === "'" ? "''" : body.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

const HUMAN_FIRST_STATEMENT =
  /^\s*(?:PERFORM\s+|[A-Za-z_][A-Za-z0-9_]*\s*:=\s*)tenant_guard\.begin_human_command\s*\(/i;
const OPERATOR_INITIALISER =
  /(?::=|=|\bDEFAULT\b)\s*platform\.require_operator\s*\(\s*\)/i;

/**
 * Whether the outer block of `main` (the text after its BEGIN) has an
 * EXCEPTION section. Nested blocks and CASE are tracked only to find where
 * the outer block's own section would start.
 */
function outerBlockHasHandler(main) {
  const open = [];
  for (const [, word] of main.matchAll(
    /\b(BEGIN|CASE|END(?:\s+(?:IF|LOOP|CASE)\b)?|EXCEPTION\s+WHEN)\b/gi,
  )) {
    const w = word.toUpperCase().replace(/\s+/g, " ");
    if (w === "BEGIN" || w === "CASE") open.push(w);
    else if (w === "END IF" || w === "END LOOP") continue;
    else if (w.startsWith("END")) {
      if (!open.length) return false;
      open.pop();
    } else if (!open.length) return true;
  }
  return false;
}

/**
 * Why a command-schema entry point does not open with its lane's check, or
 * null. A human entry point's first statement is the human preamble, outside
 * any EXCEPTION section; a platform command initialises a variable from the
 * operator check in its outer DECLARE section, where no handler of the
 * function can catch the refusal. Both are PL/pgSQL.
 */
export function laneCheckProblem({ schema, language, body }) {
  if (language !== "plpgsql") return "is not PL/pgSQL";
  const text = stripComments(String(body ?? ""), { blankStrings: true });
  const begin = text.search(/\bBEGIN\b/i);
  if (begin < 0) return "has no BEGIN";
  const declare = text.slice(0, begin);
  const main = text.slice(begin + "BEGIN".length);
  if (schema === "platform")
    return /^\s*DECLARE\b/i.test(declare) && OPERATOR_INITIALISER.test(declare)
      ? null
      : `does not initialise a variable from ${COMMAND_PREAMBLES.platform}) in its DECLARE section`;
  if (!HUMAN_FIRST_STATEMENT.test(main))
    return `does not call ${COMMAND_PREAMBLES.tenant_guard}...) as its first statement`;
  if (outerBlockHasHandler(main))
    return "has an EXCEPTION section that encloses the preamble";
  return null;
}

/** The command-schema functions a body calls, as `schema.name`, comments ignored and dynamic SQL included. */
export function callsIntoCommandSchemas(body) {
  const calls = new Set();
  const text = stripComments(String(body ?? ""));
  const re = new RegExp(
    `(?:^|[^A-Za-z0-9_$."])"?(${COMMAND_SCHEMAS.join("|")})"?\\s*\\.\\s*"?([A-Za-z_][A-Za-z0-9_$]*)"?\\s*\\(`,
    "gi",
  );
  for (const [, schema, name] of text.matchAll(re))
    calls.add(`${schema.toLowerCase()}.${name.toLowerCase()}`);
  return [...calls].sort();
}

/** Why a search path is not fixed, or null: unset; not empty in a command schema; naming "$user" elsewhere. */
function searchPathProblem(schema, searchPath) {
  if (typeof searchPath !== "string") return "unset";
  if (COMMAND_SCHEMAS.includes(schema))
    return searchPath === '""' ? null : `${searchPath}, not empty`;
  return searchPath.includes("$user") ? `${searchPath} names "$user"` : null;
}

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
    const guardInItsSchema =
      d.owner === COMMAND_OWNER && d.schema === COMMAND_OWNER;
    if (!d.owner_bypass && !guardInItsSchema)
      failFn(
        "DEFINER_OWNER_NO_BYPASS",
        d.function,
        `SECURITY DEFINER owner ${d.owner} has neither rolsuper nor rolbypassrls`,
      );
    if (d.schema === "platform" && d.owner !== PLATFORM_OWNER)
      failFn(
        "PLATFORM_DEFINER_OWNER",
        d.function,
        `a SECURITY DEFINER function in platform is owned by ${PLATFORM_OWNER}, not ${d.owner} (plan 7.2)`,
      );
    const pathProblem = searchPathProblem(d.schema, d.search_path);
    if (pathProblem === "unset")
      failFn(
        "DEFINER_SEARCH_PATH_UNSET",
        d.function,
        "SECURITY DEFINER function has no fixed search_path (SET search_path = '')",
      );
    else if (pathProblem)
      failFn(
        "DEFINER_SEARCH_PATH_UNSAFE",
        d.function,
        `search_path ${pathProblem}: use SET search_path = '' (required in tenant_guard and platform)`,
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

  const commands = (snapshot.commands ?? []).filter((c) => {
    if (COMMAND_SCHEMAS.includes(c.schema)) return true;
    failFn(
      "GUARD_OWNED_OUTSIDE_SCHEMA",
      c.function,
      `${COMMAND_OWNER} owns functions in the ${COMMAND_OWNER} schema only`,
    );
    return false;
  });
  for (const c of commands) {
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
    if (c.schema === "tenant_guard") {
      const problem = !c.definer
        ? "is not SECURITY DEFINER"
        : c.owner !== COMMAND_OWNER
          ? `is owned by ${c.owner}, not ${COMMAND_OWNER}`
          : laneCheckProblem(c);
      if (problem)
        failFn(
          "COMMAND_HUMAN_NO_PREAMBLE",
          c.function,
          `a tenant_guard function authenticated may execute is a SECURITY DEFINER owned by ${COMMAND_OWNER} whose first statement calls ${COMMAND_PREAMBLES.tenant_guard}...); this one ${problem}`,
        );
    } else {
      const problem = c.definer
        ? laneCheckProblem(c)
        : "is not SECURITY DEFINER";
      if (problem)
        failFn(
          "PLATFORM_COMMAND_NO_OPERATOR_CHECK",
          c.function,
          `a platform function authenticated may execute is a SECURITY DEFINER whose DECLARE section initialises a variable from ${COMMAND_PREAMBLES.platform}); this one ${problem}`,
        );
    }
  }

  // A target a signed-in user may reach through a wrapper: every function of
  // that name in its command schema is executable by authenticated.
  const signedInTargets = new Map();
  for (const c of commands) {
    const key = c.function.slice(0, c.function.indexOf("(")).toLowerCase();
    signedInTargets.set(
      key,
      (signedInTargets.get(key) ?? true) && Boolean(c.authenticated),
    );
  }
  let wrappers = 0;
  for (const w of snapshot.wrappers ?? []) {
    const targets = callsIntoCommandSchemas(w.body);
    if (!targets.length) continue;
    wrappers += 1;
    const calls = `it calls ${targets.join(", ")}`;
    if (w.definer)
      failFn(
        "WRAPPER_DEFINER",
        w.function,
        `${calls}: a function outside the command schemas that calls into them is SECURITY INVOKER`,
      );
    if (searchPathProblem(w.schema, w.search_path))
      failFn(
        "WRAPPER_SEARCH_PATH",
        w.function,
        `${calls}: set a fixed search path that does not name "$user" (SET search_path = '')`,
      );
    if (w.public_execute || w.anon)
      failFn(
        "WRAPPER_PUBLIC_EXECUTE",
        w.function,
        `${calls}: PUBLIC or anon may execute it`,
      );
    const workers = targets.filter((t) => signedInTargets.get(t) !== true);
    if (w.authenticated && workers.length)
      failFn(
        "WRAPPER_GRANTS_WORKER",
        w.function,
        `authenticated may execute it, but ${workers.join(", ")} is not a human entry point or a platform command`,
      );
  }

  for (const g of snapshot.grants ?? []) {
    const [code, why] =
      g.grantee === "PUBLIC"
        ? ["GRANT_TO_PUBLIC", "PUBLIC holds no table privilege in public"]
        : UNSAFE_TABLE_PRIVILEGES.includes(g.privilege)
          ? ["GRANT_UNSAFE_PRIVILEGE", "no Data API role holds it"]
          : [
              "GRANT_WITHOUT_POLICY",
              "no row-security policy admits that role for that command",
            ];
    fail(code, g.relation, `${g.grantee} holds ${g.privilege}: ${why}`);
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
    wrappers,
  };
  return { ok: failures.length === 0, failures, counts };
}

/** One-line summary printed by the verifier. */
export const formatTenantRlsCatalogSummary = ({ counts: c }) =>
  `PASS: tenant RLS catalog gate: ${c.tenant} tenant tables enabled and forced (${c.withPolicy} with policies, ${c.listed} listed deny-by-default, ${c.stale} stale), ${c.definers} SECURITY DEFINER functions with RLS-bypassing owners, a fixed search path and no PUBLIC EXECUTE (${c.anonAllowed ?? 0} anon-allowlisted); command lanes: ${c.humanEntryPoints ?? 0} human entry points, ${c.platformCommands ?? 0} platform commands, ${c.wrappers ?? 0} wrappers; no table grant in public outside a policy.`;

function readJson(root, relativePath) {
  try {
    return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    return new Error(`${relativePath}: ${error.message}`);
  }
}

const isBool = (value) => typeof value === "boolean";
const isText = (value) => typeof value === "string";
/** Throws unless every row carries the fields the evaluator reads. */
function assertSnapshotShape(snapshot) {
  const lists = ["tables", "definers", "commands", "wrappers", "grants"];
  if (!lists.every((k) => Array.isArray(snapshot?.[k])))
    throw new Error(
      `tenant RLS catalog snapshot has no ${lists.join(", ")} lists`,
    );
  const incomplete = (kind, row) =>
    new Error(
      `tenant RLS catalog snapshot ${kind} row is incomplete: ${row?.function ?? row?.relation}`,
    );
  for (const d of snapshot.definers)
    if (
      !isBool(d?.public_execute) ||
      !isBool(d?.anon_execute) ||
      !("search_path" in d)
    )
      throw incomplete("definer", d);
  const lane = ["authenticated", "anon", "public_execute"];
  for (const c of snapshot.commands)
    if (
      ![...lane, "definer", "service_role"].every((k) => isBool(c?.[k])) ||
      !isText(c.language) ||
      !isText(c.body)
    )
      throw incomplete("command", c);
  for (const w of snapshot.wrappers)
    if (
      ![...lane, "definer"].every((k) => isBool(w?.[k])) ||
      !isText(w.body) ||
      !("search_path" in w)
    )
      throw incomplete("wrapper", w);
  for (const g of snapshot.grants)
    if (![g?.relation, g?.grantee, g?.privilege].every(isText))
      throw incomplete("grant", g);
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
  const stdout = runPsqlQuery({
    databaseUrl,
    sql: TENANT_RLS_CATALOG_SQL,
    psqlBin,
    cwd: root,
  });
  const line = stdout.trim().split("\n").pop() ?? "";
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
