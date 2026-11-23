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
// commands; no function outside the command schemas has one on its search
// path, and no function in them names the auth schema. Function text includes
// a SQL-standard body. In `public`, no table or
// column grant goes to PUBLIC, none of TRUNCATE, REFERENCES, TRIGGER or
// MAINTAIN goes to anon or authenticated, they hold nothing on a view, and
// their SELECT, INSERT, UPDATE and DELETE grants are each admitted by a policy
// (the end state of migration 20261117034926, widened to views and columns).
// Run by supabase-migrations.mjs after the field-policy census; #516 reuses
// this module. See docs/security/tenant-guard.md.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runPsqlQuery } from "../lib/psql.mjs";
import {
  isAssignmentReader,
  preMembershipExceptions,
  protectedEntry,
} from "./command-entry-boundaries.mjs";
import keyExceptions from "../../docs/security/tenant-key-exceptions.json" with { type: "json" };

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
export const TENANT_RLS_EXCEPTIONS_PATH =
  "docs/security/rls-deny-by-default-exceptions.json";
/**
 * Reviewed signed-in policies of tenant tables that carry no request-tenant
 * condition, each pinned to its deparsed text (AL-2675, WP2b second release;
 * docs/security/tenant-policy-activation-review.md, section 3).
 */
export const TENANT_POLICY_EXCEPTIONS_PATH =
  "docs/security/tenant-policy-exceptions.json";
/** The helpers behind the request's tenant; none may read the token claim. */
export const TENANT_HELPERS = [
  "current_tenant_id",
  "request_tenant_id",
  "request_assignment_id",
  "request_assignment",
];
/** The tenant condition every signed-in policy of a tenant table carries, as deparsed. */
export const TENANT_CONDITION =
  "tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)";
/** The super-admin branch WP2c removes; until then it may stand beside the tenant condition. */
export const SUPER_ADMIN_BRANCH =
  "SELECT authz.is_super_admin() AS is_super_admin";
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
/** Policy commands that only write; a signed-in one needs the grant for it. */
const WRITE_COMMANDS = ["INSERT", "UPDATE", "DELETE"];
/**
 * Tables in `public` with no tenant column whose rows reach their tenant
 * through a parent row (council R3): every signed-in policy on them is a
 * reviewed pin, and none of them may be published.
 */
export const PARENT_SCOPED_TABLES = [
  "donor_activities",
  "post_comments",
  "post_fires",
  "post_likes",
  "post_prayers",
];

const quoted = (names) => names.map((s) => `'${s}'`).join(", ");
const PUBLIC_EXECUTE = `exists (select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        where a.grantee = 0 and a.privilege_type = 'EXECUTE')`;
const SIGNATURE = `format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid))`;
const SEARCH_PATH = `(select substr(c, 13) from unnest(p.proconfig) c where c like 'search_path=%' limit 1)`;
/**
 * A function's text: its source, and the deparsed body of a SQL-standard
 * function (`BEGIN ATOMIC ... END` or `RETURN ...`), whose `prosrc` is empty.
 * The deparse qualifies a name the gate's session cannot see unqualified, and
 * `tenant_guard` and `platform` are never on that session's search path.
 */
const BODY = `(p.prosrc || coalesce(E'\\n' || pg_get_function_sqlbody(p.oid), ''))`;
/**
 * The Data API roles, as rows g(r), and whether policy `p` reaches g.r: it
 * names PUBLIC, or a role g.r holds by membership, itself included
 * (fixcheck F4).
 */
const API_ROLES = `unnest(array['authenticated', 'anon']) g(r)`;
const POLICY_REACHES = `(p.polroles @> array[0::oid]
             or exists (select 1 from unnest(p.polroles) x(rid)
                        where pg_has_role(g.r, x.rid, 'MEMBER')))`;
const COMMAND_SCHEMA_PATTERN = COMMAND_SCHEMAS.join("|");

/** A row-security policy admits role `a.grantee` for the command of `a.privilege_type` on relation `c`. */
const POLICY_ADMITS = `exists (
         select 1 from pg_policy p
          where c.relrowsecurity
            and p.polrelid = c.oid
            and p.polcmd in ('*', case a.privilege_type
              when 'SELECT' then 'r' when 'INSERT' then 'a'
              when 'UPDATE' then 'w' when 'DELETE' then 'd' end::"char")
            and (p.polroles @> array[0::oid] or p.polroles @> array[a.grantee]))`;
/** The grant rule shared by table and column grants of PUBLIC, anon and authenticated. */
const UNADMITTED = `a.grantee in (0, 'anon'::regrole, 'authenticated'::regrole)
     and (
       a.privilege_type in (${quoted(UNSAFE_TABLE_PRIVILEGES)})
       or a.grantee = 0
       or c.relkind not in ('r', 'p')
       or not ${POLICY_ADMITS}
     )`;

/**
 * Grants in `public` that no use admits, on a relation or on one of its
 * columns: any privilege of PUBLIC; any of the unsafe privileges for anon or
 * authenticated; any of their privileges on a view, materialized view or
 * foreign table, which row security does not bind (a view runs with its
 * owner's rights); and their SELECT, INSERT, UPDATE or DELETE on a table where
 * no row-security policy admits that role for that command. The table-level
 * part is the post-assert of migration
 * 20261117034926_close_default_privileges_and_demo_grants.sql, which closed
 * those grants once; council round 2 (A3d) added views and column grants.
 */
export const UNADMITTED_TABLE_GRANTS_SQL = `select c.relname as relation, null::text as "column", c.relkind::text as kind,
         case a.grantee when 0 then 'PUBLIC' else a.grantee::regrole::text end as grantee,
         a.privilege_type as privilege
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    cross join lateral aclexplode(c.relacl) a
   where n.nspname = 'public'
     and c.relkind in ('r', 'p', 'v', 'm', 'f')
     and ${UNADMITTED}
  union all
  select c.relname, att.attname::text, c.relkind::text,
         case a.grantee when 0 then 'PUBLIC' else a.grantee::regrole::text end,
         a.privilege_type
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute att on att.attrelid = c.oid and att.attnum > 0 and not att.attisdropped
    cross join lateral aclexplode(att.attacl) a
   where n.nspname = 'public'
     and c.relkind in ('r', 'p', 'v', 'm', 'f')
     and ${UNADMITTED}`;

export const TENANT_RLS_CATALOG_SQL = `-- tenant-rls-catalog-gate:v1
select jsonb_build_object(
  'tenant_keys', coalesce((select jsonb_agg(jsonb_build_object('table', n.nspname || '.' || r.relname, 'keyed', exists (
      select from pg_constraint fk join pg_attribute parent on parent.attrelid=fk.confrelid and parent.attname='id'
        where fk.contype='f' and fk.conrelid=r.oid and fk.conkey=array[a.attnum] and fk.confrelid='public.tenants'::regclass and fk.confkey=array[parent.attnum] and fk.convalidated
    ))) from pg_class r join pg_namespace n on n.oid=r.relnamespace join pg_attribute a on a.attrelid=r.oid and a.attname='tenant_id' and not a.attisdropped
    where r.relkind in ('r','p') and r.relpersistence <> 't'), '[]'::jsonb),
  'payload_installed', to_regclass('cms.payload_migrations') is not null,
  'tenant_update_violations', coalesce((select jsonb_agg(jsonb_build_object('table',n.nspname||'.'||r.relname,'constraint',c.conname)) from pg_constraint c join pg_class r on r.oid=c.conrelid join pg_namespace n on n.oid=r.relnamespace where c.contype='f' and c.confrelid='public.tenants'::regclass and c.confupdtype not in ('a','r')),'[]'::jsonb),
  'tenant_delete_violations', coalesce((
    select jsonb_agg(jsonb_build_object('table', n.nspname || '.' || r.relname, 'constraint', c.conname) order by n.nspname,r.relname,c.conname)
    from pg_constraint c join pg_class r on r.oid=c.conrelid join pg_namespace n on n.oid=r.relnamespace
    where c.contype='f' and c.confrelid='public.tenants'::regclass and c.confdeltype <> 'r'
  ),'[]'::jsonb),
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
      'body', ${BODY},
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
  -- Every function outside the command schemas whose text mentions one, or
  -- whose search path names one. The evaluator decides, with comments
  -- removed, which of them call into one (a comment inside a qualified name
  -- must not hide the call, and one that only names it must not count).
  'wrappers', coalesce((
    select jsonb_agg(jsonb_build_object(
      'function', ${SIGNATURE},
      'schema', n.nspname,
      'definer', p.prosecdef,
      'search_path', ${SEARCH_PATH},
      'body', ${BODY},
      'authenticated', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
      'anon', has_function_privilege('anon', p.oid, 'EXECUTE'),
      'service_role', has_function_privilege('service_role', p.oid, 'EXECUTE'),
      'public_execute', ${PUBLIC_EXECUTE}) order by n.nspname, p.proname, p.oid)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.prokind in ('f', 'p')
      and n.nspname not in (${quoted(COMMAND_SCHEMAS)}, 'pg_catalog', 'information_schema')
      and n.nspname not like 'pg\\_toast%'
      and (${BODY} ~* '(${COMMAND_SCHEMA_PATTERN})'
        or ${SEARCH_PATH} ~* '(${COMMAND_SCHEMA_PATTERN})')), '[]'::jsonb),
  'grants', coalesce((
    select jsonb_agg(to_jsonb(g) order by g.relation, g.grantee, g.privilege)
    from (${UNADMITTED_TABLE_GRANTS_SQL}) g), '[]'::jsonb),
  -- AL-2675 (WP2b, second release): every policy signed-in users reach in
  -- public, as Postgres deparses it, the bodies of the request-tenant
  -- helpers, and the public tables in the Realtime publication. 'granted'
  -- says whether a signed-in role the policy names (authenticated, and anon
  -- too when it is TO public) holds the privilege its command needs, on the
  -- table or on any column of it, directly, through PUBLIC or a membership.
  'policies', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', c.relname,
      'policy', p.polname,
      'cmd', case p.polcmd when 'r' then 'SELECT' when 'a' then 'INSERT'
                           when 'w' then 'UPDATE' when 'd' then 'DELETE' else 'ALL' end,
      'roles', (select jsonb_agg(case r when 0 then 'public' else r::regrole::text end order by 1)
                  from unnest(p.polroles) r),
      'using', pg_get_expr(p.polqual, p.polrelid),
      'check', pg_get_expr(p.polwithcheck, p.polrelid),
      'granted', exists (
        select 1
        from ${API_ROLES}
        where ${POLICY_REACHES} and case p.polcmd
                when 'r' then has_any_column_privilege(g.r, c.oid, 'SELECT')
                when 'a' then has_any_column_privilege(g.r, c.oid, 'INSERT')
                when 'w' then has_any_column_privilege(g.r, c.oid, 'UPDATE')
                when 'd' then has_table_privilege(g.r, c.oid, 'DELETE')
                else has_any_column_privilege(g.r, c.oid, 'SELECT, INSERT, UPDATE')
                  or has_table_privilege(g.r, c.oid, 'DELETE') end),
      -- Council R3: whether the policy is permissive, and whether a signed-in
      -- role it names holds any write privilege, which a FOR ALL policy needs
      -- for its write half.
      'permissive', p.polpermissive,
      'writable', exists (
        select 1
        from ${API_ROLES}
        where ${POLICY_REACHES}
          and (has_any_column_privilege(g.r, c.oid, 'INSERT, UPDATE')
               or has_table_privilege(g.r, c.oid, 'DELETE')))) order by c.relname, p.polname)
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      -- Fixcheck F4: every policy a Data API role reaches, TO PUBLIC or to a
      -- role that authenticated or anon holds by membership.
      and exists (select 1 from ${API_ROLES} where ${POLICY_REACHES})), '[]'::jsonb),
  -- Council R12 (a): every overload of each request-tenant helper ('root'),
  -- and every function they reach through a qualified call in their text.
  'tenant_helpers', coalesce((
    with recursive reach(oid, root) as (
      select p.oid, true
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'authz'
        and p.proname in (${quoted(TENANT_HELPERS)})
      union
      select q.oid, false
      from reach r
      join pg_proc rp on rp.oid = r.oid
      join pg_proc q on q.oid <> rp.oid
      join pg_namespace qn on qn.oid = q.pronamespace
      where qn.nspname not in ('pg_catalog', 'information_schema')
        and qn.nspname not like 'pg\\_%'
        and (rp.prosrc || coalesce(pg_get_function_sqlbody(rp.oid), ''))
            ~* ('(^|[^a-z0-9_$."])"?' || qn.nspname || '"?\\s*\\.\\s*"?' || q.proname || '"?\\s*\\(')
    )
    select jsonb_agg(jsonb_build_object(
      'function', ${SIGNATURE},
      'body', ${BODY},
      'search_path', ${SEARCH_PATH},
      'root', r.root) order by ${SIGNATURE})
    from (select oid, bool_or(root) as root from reach group by oid) r
    join pg_proc p on p.oid = r.oid
    join pg_namespace n on n.oid = p.pronamespace), '[]'::jsonb),
  'published', coalesce((
    select jsonb_agg(t.tablename::text order by t.tablename)
    from pg_publication_tables t
    where t.schemaname = 'public'), '[]'::jsonb)
)::text;`;

/**
 * A function body with its comments removed and, with `blankStrings`, the
 * contents of every string literal removed too (quoted, E'' and dollar
 * quoted). It only finds where comments and literals start and end, so that a
 * call or an EXCEPTION clause cannot hide in, or be faked by, either.
 */
export function stripComments(
  body,
  { blankStrings = false, preserveWidth = false } = {},
) {
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
      out += blankStrings
        ? "''".padEnd(preserveWidth ? end - i : 2)
        : body.slice(i, end);
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
      out +=
        blankStrings && ch === "'"
          ? "''".padEnd(preserveWidth ? j + 1 - i : 2)
          : body.slice(i, j + 1);
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
// The operator check is the whole initialiser: `... := platform.require_operator();`.
const OPERATOR_INITIALISER =
  /(?::=|=|\bDEFAULT\b)\s*platform\.require_operator\s*\(\s*\)\s*;/i;

/**
 * The index of the parenthesis that closes the one at `open`, or -1. String
 * contents are already blank; a quoted identifier is skipped whole.
 */
function closingParenthesis(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      i = text.indexOf('"', i + 1);
      while (i >= 0 && text[i + 1] === '"') i = text.indexOf('"', i + 2);
      if (i < 0) return -1;
    } else if (ch === "(") depth += 1;
    else if (ch === ")" && --depth === 0) return i;
  }
  return -1;
}

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
  // Quoted identifiers are names, never keywords: blanked to an identifier of
  // the same length, a quoted "end", "case" or "begin ..." can neither hide
  // the outer EXCEPTION section nor fake the start of the body.
  const text = stripComments(String(body ?? ""), {
    blankStrings: true,
  }).replace(/"(?:[^"]|"")*"/g, (quoted) => "_".repeat(quoted.length));
  const begin = text.search(/\bBEGIN\b/i);
  if (begin < 0) return "has no BEGIN";
  const declare = text.slice(0, begin);
  const main = text.slice(begin + "BEGIN".length);
  if (schema === "platform")
    return /^\s*DECLARE\b/i.test(declare) && OPERATOR_INITIALISER.test(declare)
      ? null
      : `does not initialise a variable from ${COMMAND_PREAMBLES.platform}) alone in its DECLARE section`;
  const first = HUMAN_FIRST_STATEMENT.exec(main);
  if (!first)
    return `does not call ${COMMAND_PREAMBLES.tenant_guard}...) as its first statement`;
  // The statement ends right after the call: `PERFORM ... WHERE false`, or a
  // call inside a larger expression, need not call it at all.
  const close = closingParenthesis(main, first.index + first[0].length - 1);
  if (close < 0 || !/^\s*;/.test(main.slice(close + 1)))
    return `does not end its first statement right after the call to ${COMMAND_PREAMBLES.tenant_guard}...)`;
  if (outerBlockHasHandler(main))
    return "has an EXCEPTION section that encloses the preamble";
  return null;
}

function entryStatement(body) {
  const raw = stripComments(body);
  const masked = stripComments(raw, {
    blankStrings: true,
    preserveWidth: true,
  }).replace(/"(?:[^"]|"")*"/g, (name) => "_".repeat(name.length));
  const begin = /\bBEGIN\b/i.exec(masked);
  if (!begin) return null;
  const start = begin.index + begin[0].length;
  return {
    raw: raw.slice(start),
    main: masked.slice(start),
    declarations: masked.slice(0, begin.index),
  };
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

/**
 * Whether a function body names a command schema as a qualifier
 * (`tenant_guard.`, `"platform" .`), comments ignored and strings included,
 * so that dynamic SQL counts.
 */
export function namesCommandSchema(body) {
  return new RegExp(
    `(?:^|[^A-Za-z0-9_$."])"?(?:${COMMAND_SCHEMAS.join("|")})"?\\s*\\.`,
    "i",
  ).test(stripComments(String(body ?? "")));
}

/** `auth.` (or `"auth".`) as a qualifier, not the tail of a longer name. */
const AUTH_QUALIFIER = /(?<![\w$."])"?auth"?\s*\.\s*"?[A-Za-z_]/i;

/**
 * Whether a function body names the `auth` schema: comments are ignored,
 * strings are not, so a call through dynamic SQL counts (AL-2674 A9).
 */
export function namesAuthSchema(body) {
  return AUTH_QUALIFIER.test(stripComments(String(body ?? "")));
}

/**
 * The schema names of a `search_path` setting as the catalog stores it
 * (`tenant_guard, public`, `"Odd Name", public`, `""`), unquoted.
 */
export function searchPathSchemas(searchPath) {
  if (typeof searchPath !== "string") return [];
  return (searchPath.match(/(?:"(?:[^"]|"")*"|[^,"])+/g) ?? [])
    .map((part) => part.trim())
    .map((part) =>
      /^"[\s\S]*"$/.test(part) ? part.slice(1, -1).replaceAll('""', '"') : part,
    )
    .filter(Boolean);
}

/** Why a search path is not fixed, or null: unset; not empty in a command schema; naming "$user" elsewhere. */
function searchPathProblem(schema, searchPath) {
  if (typeof searchPath !== "string") return "unset";
  if (COMMAND_SCHEMAS.includes(schema))
    return searchPath === '""' ? null : `${searchPath}, not empty`;
  return searchPath.includes("$user") ? `${searchPath} names "$user"` : null;
}

/** Parses the exception list: { listed: Set<table>, failures }. */
/**
 * Walks deparsed policy text and calls `visit(index, depth)` for every
 * character outside single-quoted literals and double-quoted identifiers,
 * with the parenthesis depth before it.
 */
function walkExpression(text, visit) {
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "'" || ch === '"') {
      const close = text.indexOf(ch, i + 1);
      i = close < 0 ? text.length : close;
      // A doubled quote inside a literal continues it.
      while (text[i + 1] === ch) {
        const next = text.indexOf(ch, i + 2);
        i = next < 0 ? text.length : next;
      }
      continue;
    }
    if (visit(i, depth) === false) return;
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
  }
}

/** The text without the parentheses that enclose all of it. */
export function stripParens(text) {
  let s = text.trim();
  for (;;) {
    if (!s.startsWith("(") || !s.endsWith(")")) return s;
    let closesAtEnd = true;
    walkExpression(s, (i, depth) => {
      if (s[i] === ")" && depth === 1 && i < s.length - 1) {
        closesAtEnd = false;
        return false;
      }
    });
    if (!closesAtEnd) return s;
    s = s.slice(1, -1).trim();
  }
}

/** The operands of `text` joined at the top level by `op` ("AND" or "OR"). */
export function splitTopLevel(text, op) {
  const s = stripParens(text);
  const token = ` ${op} `;
  const parts = [];
  let start = 0;
  walkExpression(s, (i, depth) => {
    if (depth === 0 && s.startsWith(token, i)) {
      parts.push(s.slice(start, i));
      start = i + token.length;
    }
  });
  parts.push(s.slice(start));
  return parts.map((p) => p.trim());
}

const isSuperAdminBranch = (expr) => stripParens(expr) === SUPER_ADMIN_BRANCH;

/**
 * Whether a deparsed policy expression admits a row only under the request's
 * tenant: the tenant condition itself, a conjunction with a tenant-bound
 * operand, or a disjunction whose every operand is tenant-bound, beside at
 * most one super-admin branch, `(SELECT authz.is_super_admin())`, until WP2c
 * removes it (activation review Q6). Any other disjunct fails.
 */
export function tenantBound(expr) {
  const s = stripParens(expr);
  if (s === TENANT_CONDITION) return true;
  const ors = splitTopLevel(s, "OR");
  if (ors.length > 1) {
    const branches = ors.filter(isSuperAdminBranch).length;
    return (
      branches <= 1 &&
      ors.every((d) => isSuperAdminBranch(d) || tenantBound(d)) &&
      ors.some((d) => !isSuperAdminBranch(d))
    );
  }
  const ands = splitTopLevel(s, "AND");
  return ands.length > 1 && ands.some(tenantBound);
}

/**
 * The calls of `authz` helpers in a deparsed policy expression that run once
 * for every row: a call that is not the whole of its own sub-select, or whose
 * arguments name anything but constants, casts and other whole sub-selects
 * of helpers (record D-25; TP1 section 8, item 1).
 */
export function perRowLookups(expr) {
  const found = [];
  const s = expr;
  // Council R12 (b): `auth.` calls too, such as a bare auth.uid() compared
  // with a column, which runs once for every row.
  const CALL = /(?:authz|auth)\.([A-Za-z_][A-Za-z0-9_$]*)\s*\(/y;
  walkExpression(s, (i) => {
    // A call, not a type in a cast ('staff'::authz.membership_role).
    if (/[A-Za-z0-9_$.":]/.test(s[i - 1] ?? "")) return;
    CALL.lastIndex = i;
    const m = CALL.exec(s);
    if (!m) return;
    const open = i + m[0].length - 1;
    const name = m[1];
    let close = -1;
    walkExpression(s.slice(open), (j, depth) => {
      if (s[open + j] === ")" && depth === 1) {
        close = open + j;
        return false;
      }
    });
    const call = s.slice(i, close + 1);
    const wrapped =
      /\(\s*SELECT\s+$/.test(s.slice(0, i)) &&
      s.startsWith(` AS ${name})`, close + 1);
    const args = s
      .slice(open + 1, close)
      .replace(/\(\s*SELECT\s+authz\.[a-z_]+\([^()]*\)\s+AS\s+[a-z_]+\)/g, "")
      .replace(/'(?:[^']|'')*'/g, "")
      .replace(/::[A-Za-z_][\w.]*(\[\])?/g, "")
      .replace(/\b(ARRAY|NULL|true|false)\b/g, "");
    if (!wrapped || /[A-Za-z_]/.test(args)) found.push(call);
  });
  return found;
}

/** Whether a deparsed expression or a function body reads the token's claims for authority. */
const readsTokenClaim = (text) =>
  /auth\.jwt\s*\(|app_metadata|request\.jwt\.claims?\b/i.test(text ?? "");

/**
 * Whether a function a request-tenant helper calls reads anything of the
 * token but its subject (council R12 (a)): `auth.uid()` reads the subject,
 * the caller's identity, and nothing else may be read.
 */
function readsClaimBeyondSubject(text) {
  const t = text ?? "";
  if (/auth\.jwt\s*\(|app_metadata|user_metadata/i.test(t)) return true;
  if (/request\.jwt\.claim\.(?!sub\b)[a-z_]/i.test(t)) return true;
  if (/request\.jwt\.claims\b/i.test(t)) {
    const keys = [...t.matchAll(/->>?\s*'([^']*)'/g)].map((m) => m[1]);
    return keys.length === 0 || keys.some((key) => key !== "sub");
  }
  return false;
}

/**
 * What a policy effectively admits for its command, as Postgres reads it
 * (council R2): a missing USING is true for every row, a missing WITH CHECK
 * is the USING. SELECT and DELETE are judged by their USING, INSERT by its
 * WITH CHECK, UPDATE and FOR ALL by both.
 */
export function effectivePredicates(p) {
  const using = p.using ?? "true";
  const check = p.check ?? using;
  if (p.cmd === "SELECT" || p.cmd === "DELETE") return [using];
  if (p.cmd === "INSERT") return [check];
  return using === check ? [using] : [using, check];
}

/** A policy that admits nothing: `false` for every command it governs. */
const isPlainDeny = (p) =>
  effectivePredicates(p).every((e) => stripParens(e) === "false");

const sortedRoles = (roles) => [...(roles ?? [])].map(String).sort();

/** Whether a pinned entry still describes the policy: text, command, roles and kind. */
function pinMatches(entry, p) {
  return (
    (entry.using ?? null) === (p.using ?? null) &&
    (entry.check ?? null) === (p.check ?? null) &&
    entry.cmd === p.cmd &&
    entry.permissive === p.permissive &&
    JSON.stringify(sortedRoles(entry.roles)) ===
      JSON.stringify(sortedRoles(p.roles))
  );
}

/**
 * Parses the reviewed policy exceptions: { listed: Map<"table|policy", entry>,
 * failures }. Each entry names a table and policy, the exact deparsed `using`
 * and `check` text it is reviewed with (null when the policy has none), its
 * command, its roles and whether it is permissive (council R3), and a reason.
 */
function readPolicyExceptions(exceptions) {
  const failures = [];
  const listed = new Map();
  const malformed = (detail, table) =>
    failures.push({ code: "POLICY_EXCEPTIONS_MALFORMED", table, detail });
  if (exceptions instanceof Error) malformed(exceptions.message);
  else if (!Array.isArray(exceptions?.entries))
    malformed("expected an object with an entries array");
  else
    for (const [i, entry] of exceptions.entries.entries()) {
      const key = `${entry?.table}|${entry?.policy}`;
      if (typeof entry?.table !== "string" || typeof entry?.policy !== "string")
        malformed(`entry ${i} has no table or policy`);
      else if (listed.has(key)) malformed(`duplicate entry ${i}`, entry.table);
      else if (typeof entry.reason !== "string" || !entry.reason.trim())
        malformed(`entry ${i} has no reason`, entry.table);
      else if (!("using" in entry) || !("check" in entry))
        malformed(`entry ${i} has no using or check text`, entry.table);
      else if (
        typeof entry.cmd !== "string" ||
        !Array.isArray(entry.roles) ||
        !entry.roles.every((r) => typeof r === "string") ||
        typeof entry.permissive !== "boolean"
      )
        malformed(
          `entry ${i} does not pin its command, roles and permissive flag`,
          entry.table,
        );
      else listed.set(key, entry);
    }
  return { listed, failures };
}

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
  policyExceptionList = { entries: [] },
  preMembershipList = undefined,
) {
  const { listed, failures, usable } = readExceptions(exceptions);
  const fail = (code, table, detail) => failures.push({ code, table, detail });
  const failFn = (code, fn, detail) =>
    failures.push({ code, function: fn, detail });
  const tables = new Map(snapshot.tables.map((t) => [t.table, t]));
  const missingKeys = new Set(
    (snapshot.tenant_keys ?? [])
      .filter((item) => !item.keyed)
      .map((item) => item.table),
  );
  for (const name of missingKeys)
    if (!keyExceptions.tables.includes(name))
      fail(
        "TENANT_KEY_MISSING",
        name,
        "tenant_id has no validated foreign key to public.tenants(id)",
      );
  if (snapshot.payload_installed)
    for (const name of keyExceptions.tables)
      if (!missingKeys.has(name))
        fail(
          "TENANT_KEY_STALE_EXCEPTION",
          name,
          "remove the obsolete CMS tenant-key exception",
        );
  for (const edge of snapshot.tenant_update_violations ?? [])
    fail(
      "TENANT_UPDATE_ACTION",
      edge.table,
      `${edge.constraint} must restrict tenant updates or use NO ACTION`,
    );
  for (const edge of snapshot.tenant_delete_violations ?? [])
    fail(
      "TENANT_DELETE_ACTION",
      edge.table,
      `${edge.constraint} must restrict tenant deletion`,
    );
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
  const preMembership =
    preMembershipList === undefined
      ? preMembershipExceptions(commands)
      : preMembershipExceptions(commands, preMembershipList);
  failures.push(...preMembership.failures);
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
    if (namesAuthSchema(c.body))
      failFn(
        "COMMAND_READS_AUTH",
        c.function,
        `a function in the ${c.schema} schema names the auth schema, which the guard cannot be granted on Supabase's own image; read the caller with tenant_guard.caller_id() and the claims with tenant_guard.request_claims()`,
      );
    if (
      c.schema === "tenant_guard" &&
      c.service_role &&
      !c.authenticated &&
      (!c.definer ||
        c.owner !== COMMAND_OWNER ||
        !protectedEntry(c, entryStatement(c.body), outerBlockHasHandler))
    )
      failFn(
        "COMMAND_HELPER_EXPOSED",
        c.function,
        "Service EXECUTE requires a guard-owned definer that enters its tenant before any other work",
      );
    if (!c.authenticated) continue;
    if (c.schema === "tenant_guard") {
      const problem = !c.definer
        ? "is not SECURITY DEFINER"
        : c.owner !== COMMAND_OWNER
          ? `is owned by ${c.owner}, not ${COMMAND_OWNER}`
          : preMembership.allowed.has(c.function)
            ? null
            : laneCheckProblem(c);
      if (problem)
        failFn(
          "COMMAND_HUMAN_NO_PREAMBLE",
          c.function,
          `a tenant_guard function authenticated may execute is a SECURITY DEFINER owned by ${COMMAND_OWNER} whose first statement calls ${COMMAND_PREAMBLES.tenant_guard}...); this one ${problem}`,
        );
      else if (
        !c.service_role &&
        !preMembership.allowed.has(c.function) &&
        !isAssignmentReader(c) &&
        !protectedEntry(c, entryStatement(c.body), outerBlockHasHandler)
      )
        failFn(
          "COMMAND_CAPABILITY",
          c.function,
          "Open with a tenant argument and one literal code-registry capability; no declaration initializer may run first",
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
  // that name in its command schema is executable by authenticated. Every
  // signed-in command, a platform command as much as a tenant_guard one, is a
  // human target: a wrapper that calls one grants nothing to service_role.
  const signedInTargets = new Map();
  const humanTargets = new Set();
  for (const c of commands) {
    const key = c.function.slice(0, c.function.indexOf("(")).toLowerCase();
    if (c.authenticated) humanTargets.add(key);
    signedInTargets.set(
      key,
      (signedInTargets.get(key) ?? true) && Boolean(c.authenticated),
    );
  }
  let wrappers = 0;
  for (const w of snapshot.wrappers ?? []) {
    // On the search path, a command schema lets the body call into it
    // unqualified, where no rule below would see the call.
    const onPath = searchPathSchemas(w.search_path).filter((schema) =>
      COMMAND_SCHEMAS.includes(schema),
    );
    if (onPath.length)
      failFn(
        "COMMAND_SCHEMA_ON_SEARCH_PATH",
        w.function,
        `its search path names ${onPath.join(", ")}: a function outside the command schemas calls into them by qualified name only, with SET search_path = ''`,
      );
    // A function whose text, comments removed, names a command schema is held
    // to the wrapper rules even when no call in it parses (dynamic SQL that
    // builds the call, a regproc): only the grant rule needs the targets.
    if (!namesCommandSchema(w.body)) continue;
    const targets = callsIntoCommandSchemas(w.body);
    if (targets.length) wrappers += 1;
    const calls = targets.length
      ? `it calls ${targets.join(", ")}`
      : "it names a command schema in a call no scanner reads";
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
    if (w.service_role && targets.some((target) => humanTargets.has(target)))
      failFn(
        "WRAPPER_GRANTS_HUMAN",
        w.function,
        "A wrapper calling a human entry point grants no EXECUTE to service_role",
      );
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
          : g.kind && !["r", "p"].includes(g.kind)
            ? [
                "GRANT_ON_VIEW",
                "row security does not bind a view, materialized view or foreign table; reach it through a reviewed function",
              ]
            : [
                "GRANT_WITHOUT_POLICY",
                "no row-security policy admits that role for that command",
              ];
    const on = g.column ? ` on column ${g.column}` : "";
    fail(code, g.relation, `${g.grantee} holds ${g.privilege}${on}: ${why}`);
  }

  // AL-2675 (WP2b, second release; plan 12, WP2 exit): the tenant condition
  // on every signed-in policy of a tenant table, each lookup once for a
  // statement, no policy and no tenant helper that reads the token claim, and
  // no tenant table in the Realtime publication (plan 5.2).
  const policyExceptions = readPolicyExceptions(policyExceptionList);
  failures.push(...policyExceptions.failures);
  const seen = new Set();
  let tenantPolicies = 0;
  for (const p of snapshot.policies ?? []) {
    const key = `${p.table}|${p.policy}`;
    const exprs = [p.using, p.check].filter(
      (e) => e !== null && e !== undefined,
    );
    if (exprs.some(readsTokenClaim))
      fail(
        "POLICY_READS_TOKEN_CLAIM",
        p.table,
        `policy "${p.policy}" reads the token's claims; the request's tenant comes from authz.current_tenant_id()`,
      );
    // Activation review Q7, as the coordinator widened it: no signed-in
    // write policy where no signed-in role holds the privilege its command
    // needs. Such a policy admits nothing today and would admit every role
    // it names the day a grant came back, unreviewed. It holds on every
    // table in public, a tenant table or not, listed or not. A FOR ALL policy
    // also governs reads and is held to the rules below instead.
    if (WRITE_COMMANDS.includes(p.cmd) && p.granted === false)
      fail(
        "WRITE_POLICY_WITHOUT_GRANT",
        p.table,
        `policy "${p.policy}" (${p.cmd}) stands where no signed-in role it names holds ${p.cmd}: drop the policy, or grant the privilege and review the policy with it`,
      );
    // Council R3: a FOR ALL policy also writes; where no signed-in role holds
    // a write privilege only a plain deny may stand.
    if (p.cmd === "ALL" && p.writable === false && !isPlainDeny(p))
      fail(
        "WRITE_POLICY_WITHOUT_GRANT",
        p.table,
        `policy "${p.policy}" (ALL) is not a plain deny and no signed-in role it names holds INSERT, UPDATE or DELETE: make it a SELECT policy, or a deny`,
      );
    // A listed exception is pinned to its text, command, roles and kind on
    // any table in public, a tenant table or not (the post tables have no
    // tenant column). On a table that reaches its tenant through a parent,
    // every signed-in policy is a pin (council R3).
    const listedEntry = policyExceptions.listed.get(key);
    const parentScoped = PARENT_SCOPED_TABLES.includes(p.table);
    if (!tables.get(p.table)?.tenant && !listedEntry && !parentScoped) continue;
    if (tables.get(p.table)?.tenant) tenantPolicies += 1;
    const lookups = (e) => {
      for (const call of perRowLookups(e))
        fail(
          "POLICY_LOOKUP_PER_ROW",
          p.table,
          `policy "${p.policy}" calls ${call} once for every row: write it as a whole sub-select, (SELECT authz.f(...)), with no column of the row`,
        );
    };
    if (listedEntry) {
      seen.add(key);
      if (!pinMatches(listedEntry, p))
        fail(
          "POLICY_EXCEPTION_CHANGED",
          p.table,
          `policy "${p.policy}" differs from its reviewed text, command, roles or kind in ${TENANT_POLICY_EXCEPTIONS_PATH}: review it again`,
        );
      else for (const e of exprs) lookups(e);
      continue;
    }
    if (parentScoped) {
      fail(
        "PARENT_SCOPED_POLICY_NOT_PINNED",
        p.table,
        `policy "${p.policy}" (${p.cmd}) on a table that reaches its tenant through a parent is not a reviewed pin in ${TENANT_POLICY_EXCEPTIONS_PATH}; Postgres ORs it with the pinned one`,
      );
      continue;
    }
    // Council R2: the effective predicate of each command, with a missing
    // USING as true and a missing WITH CHECK as the USING. The super-admin
    // branch passes only beside the tenant condition (tenantBound).
    for (const e of effectivePredicates(p)) {
      if (stripParens(e) === "false") continue;
      if (!tenantBound(e))
        fail(
          "TENANT_CONDITION_MISSING",
          p.table,
          `policy "${p.policy}" (${p.cmd}) admits a row without ${TENANT_CONDITION}`,
        );
      lookups(e);
    }
  }
  for (const key of policyExceptions.listed.keys())
    if (!seen.has(key)) {
      const [table, policy] = key.split("|");
      fail(
        "POLICY_EXCEPTION_STALE",
        table,
        `no signed-in policy "${policy}" on this table: remove it from ${TENANT_POLICY_EXCEPTIONS_PATH}`,
      );
    }
  if (snapshot.tenant_helpers) {
    // Council R12 (a): every entry by its signature, so an overload cannot
    // hide another; each helper reads no claim, and each function they call
    // reads the token's subject at most.
    const roots = snapshot.tenant_helpers.filter((h) => h.root !== false);
    for (const name of TENANT_HELPERS)
      if (!roots.some((h) => h.function.startsWith(`authz.${name}(`)))
        failFn(
          "TENANT_HELPER_MISSING",
          `authz.${name}`,
          "the request-tenant helper is missing",
        );
    for (const h of snapshot.tenant_helpers) {
      const body = stripComments(h.body);
      if (
        h.root !== false ? readsTokenClaim(body) : readsClaimBeyondSubject(body)
      )
        failFn(
          "TENANT_HELPER_READS_CLAIM",
          h.function,
          h.root !== false
            ? "the request's tenant comes from the x-asym-tenant header and a live membership, never the token's claims"
            : "a request-tenant helper calls this function, which reads the token beyond its subject",
        );
      // Fixcheck F4: the gate follows schema-qualified calls only. With an
      // empty search path, a call a helper makes without a schema resolves in
      // pg_catalog alone, so nothing it reaches goes unread.
      if (h.root !== false && h.search_path !== '""')
        failFn(
          "TENANT_HELPER_SEARCH_PATH",
          h.function,
          "a request-tenant helper sets an empty search path (SET search_path = ''), so a call without a schema cannot reach a function the gate does not read",
        );
    }
  }
  for (const t of snapshot.published ?? [])
    if (tables.get(t)?.tenant || PARENT_SCOPED_TABLES.includes(t))
      fail(
        "TENANT_TABLE_PUBLISHED",
        t,
        tables.get(t)?.tenant
          ? "a tenant table is in a publication: a subscription would need a read policy that ignores the active tenant (plan 5.2)"
          : "a table that reaches its tenant through a parent is in a publication: a subscription would need a read policy that ignores the active tenant (plan 5.2; council R3)",
      );

  const counts = {
    tenantPolicies,
    policyExceptions: policyExceptions.listed.size,
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
  `PASS: tenant RLS catalog gate: ${c.tenant} tenant tables enabled and forced (${c.withPolicy} with policies, ${c.listed} listed deny-by-default, ${c.stale} stale), ${c.definers} SECURITY DEFINER functions with RLS-bypassing owners, a fixed search path and no PUBLIC EXECUTE (${c.anonAllowed ?? 0} anon-allowlisted); command lanes: ${c.humanEntryPoints ?? 0} human entry points, ${c.platformCommands ?? 0} platform commands, ${c.wrappers ?? 0} wrappers; no table grant in public outside a policy; ${c.tenantPolicies ?? 0} signed-in policies of tenant tables carry the request's tenant with each lookup once a statement (${c.policyExceptions ?? 0} reviewed exceptions), none reads the token claim, no signed-in write policy stands without the grant for its command, and no tenant table is published.`;

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
  const lists = [
    "tenant_keys",
    "tenant_update_violations",
    "tenant_delete_violations",
    "tables",
    "definers",
    "commands",
    "wrappers",
    "grants",
    "policies",
    "tenant_helpers",
    "published",
  ];
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
      ![...lane, "definer", "service_role"].every((k) => isBool(w?.[k])) ||
      !isText(w.body) ||
      !("search_path" in w)
    )
      throw incomplete("wrapper", w);
  for (const g of snapshot.grants)
    if (
      ![g?.relation, g?.grantee, g?.privilege, g?.kind].every(isText) ||
      !(g.column === null || isText(g.column))
    )
      throw incomplete("grant", g);
  const textOrNull = (v) => v === null || isText(v);
  for (const p of snapshot.policies)
    if (
      ![p?.table, p?.policy, p?.cmd].every(isText) ||
      !Array.isArray(p.roles) ||
      !textOrNull(p.using) ||
      !textOrNull(p.check) ||
      !isBool(p.granted) ||
      !isBool(p.permissive) ||
      !isBool(p.writable)
    )
      throw incomplete("policy", { relation: `${p?.table} ${p?.policy}` });
  for (const h of snapshot.tenant_helpers)
    if (![h?.function, h?.body].every(isText) || !isBool(h.root))
      throw incomplete("tenant helper", h);
  if (!snapshot.published.every(isText))
    throw incomplete("publication", { relation: "published" });
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
  const policyExceptions = readJson(root, TENANT_POLICY_EXCEPTIONS_PATH);
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
  return evaluateTenantRlsCatalog(
    snapshot,
    exceptions,
    anonAllowlist,
    policyExceptions,
  );
}
