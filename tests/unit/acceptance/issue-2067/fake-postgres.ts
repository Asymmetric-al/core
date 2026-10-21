/**
 * Scriptable fake of the `pg` module for the issue #2067 addendum 4
 * acceptance tests (restricted database role + private functions).
 * Addendum 4 (Blake-approved 2026-10-20 10:31 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 *
 * ## What it models (criterion 10 item 1)
 *
 * Only the committed exposure. The gate's session is identified by the user in
 * `DOCUMENT_CUTOVER_DATABASE_URL` (a Supabase pooler user
 * `document_cutover_reader.<project-ref>` is the role `document_cutover_reader`).
 *
 * - `document_cutover.<fn>(...)` calls succeed only for a role holding EXECUTE:
 *   `document_cutover_reader`, the owner `postgres`, or a superuser. `anon`,
 *   `authenticated`, `service_role` and `authenticator` get SQLSTATE `42501`
 *   (criterion 5 / 10 item 3).
 * - A direct `SELECT ... FROM <table|view>` (auth.users,
 *   supabase_migrations.schema_migrations, storage.objects, public.*) by
 *   `document_cutover_reader` fails with `42501`: the role has no table
 *   privileges. Every direct read is recorded in `state.directReads`.
 * - Any write statement (`insert`, `update`, `delete`, DDL, `grant`, `copy`,
 *   `set role`, ...) is recorded in `state.writes` and fails.
 * - Anything else the fake does not understand is recorded in
 *   `state.unsupported` and fails with `XX000`, so the gate fails closed and
 *   the control tests (which assert `unsupported` is empty) point at it.
 *
 * ## Identity queries the fake answers (spec item 5; form not pinned by the
 * spec, see the Scope questions in runtime-checklist.md)
 *
 * `SELECT <items> [FROM pg_roles|pg_catalog.pg_roles|pg_authid [alias]]
 * [WHERE <pred> [AND <pred>]...]` where each item is one of `current_user`,
 * `session_user`, `current_role`, `user`, `[alias.]rolname`,
 * `[alias.]rolsuper`, `[alias.]rolbypassrls`, `[alias.]rolcanlogin`,
 * `[alias.]rolinherit`, `pg_has_role([<role>,] <role>, '<mode>')`, combined
 * with `NOT`, `AND`, `OR`, `::<type>` casts and parentheses, optionally
 * `AS <alias>`. Role operands: `current_user`, `session_user`, `$n`, `'name'`,
 * or `[alias.]rolname` / `[alias.]oid` (the row's role). Predicates:
 * `rolname = <role>`, `rolname IN ('a', ...)`, `pg_has_role(<role>, <role>,
 * '<mode>')`. Membership is transitive (direct or inherited) and superusers
 * are members of every role, as in Postgres.
 *
 * ## The `document_cutover` function contract (pinned; Samson's ruling 2)
 *
 * Exact names, arguments and result columns live in
 * ./document-cutover-contract.ts; the fake routes by EXACT name. Any other
 * `document_cutover.<fn>` is unsupported (XX000). A scalar function's column
 * is the select-list alias if the query gives one, otherwise the function
 * name (as Postgres names it for both `SELECT f()` and `SELECT * FROM f()`).
 * Every value is a numeric string, as `pg` returns `bigint` (ruling 11: counts
 * only; the schema version is the 14-digit version as a bigint). The table
 * census takes the table name (a `'literal'` or `$n` parameter) and serves
 * only the prototype tables. Data comes from `fakeDb` in ./fake-supabase.ts,
 * so one seeding drives both the pre- and post-addendum-4 read paths.
 *
 * ## Connection (ruling 1)
 *
 * Only a connection string is accepted: a `Client` / `Pool` built without
 * `connectionString` (which the real driver would complete from `PG*` env
 * vars) is recorded in `state.fallbackAttempts` and refused.
 *
 * ## Scenario switches
 *
 * - `rlsEmpty`: route names (`schema_version`, `users`, `table`, `storage`,
 *   `external`, `jobs`, `reports`, `integrations`), table names, or `*`.
 *   The call returns ZERO rows and no error: the unit model of RLS filtering a
 *   read (criterion 6 / 10 item 2). The gate must stop with a blocker; a
 *   missing result row is never "zero".
 * - `hang`: same keys; the call never resolves (criterion 7).
 * - `fakeDb.mode`: `permission_denied` -> function calls fail `42501`;
 *   `unavailable` -> function calls fail `08006` (connection lost);
 *   `unknown_shape` -> function calls return `{ unexpected: 'shape' }`.
 *   Identity queries are unaffected.
 */

import { READER_ROLE, contractFunction } from "./document-cutover-contract";
import { fakeDb } from "./fake-supabase";

import type { DocumentCutoverRoute } from "./document-cutover-contract";

type Row = Record<string, unknown>;

export { READER_ROLE };

export interface FakePgRole {
  rolsuper: boolean;
  rolbypassrls: boolean;
  rolcanlogin: boolean;
  rolinherit: boolean;
  /** Direct memberships (roles this role is a member of). */
  memberOf: string[];
}

export type FakePgRoute = DocumentCutoverRoute;

export interface FakePgQuery {
  user: string;
  text: string;
  kind:
    | "identity"
    | "function"
    | "direct"
    | "control"
    | "write"
    | "unsupported";
  route?: FakePgRoute;
  fn?: string;
  args?: unknown[];
}

export interface FakePgData {
  schemaVersion(): string | null;
  userCount(): number;
  tableRows(table: string): Row[];
  mode(): string;
}

export interface FakePgState {
  roles: Map<string, FakePgRole>;
  /** Overrides the role derived from the connection string, when set. */
  sessionUserOverride: string | null;
  connections: Array<{ connectionString: string | undefined; user: string }>;
  /** Clients built without a connection string (PG* env fallback). */
  fallbackAttempts: number;
  queries: FakePgQuery[];
  directReads: string[];
  writes: string[];
  unsupported: string[];
  rlsEmpty: Set<string>;
  hang: Set<string>;
  /** When true, `connect()` fails like an unreachable server (ECONNREFUSED). */
  refuseConnections: boolean;
  /** Called with the SQL of every write statement before it fails. */
  onWrite?: (sql: string) => void;
  data: FakePgData;
  reset(): void;
}

function role(partial: Partial<FakePgRole> = {}): FakePgRole {
  return {
    rolsuper: false,
    rolbypassrls: false,
    rolcanlogin: false,
    rolinherit: true,
    memberOf: [],
    ...partial,
  };
}

/** Supabase-like role catalog. `postgres` is not a superuser on Supabase. */
export function defaultRoles(): Map<string, FakePgRole> {
  return new Map<string, FakePgRole>([
    // Blake's prerequisite step 2 turns LOGIN on; the migration creates NOLOGIN.
    [READER_ROLE, role({ rolcanlogin: true })],
    [
      "postgres",
      role({
        rolbypassrls: true,
        rolcanlogin: true,
        memberOf: ["anon", "authenticated", "service_role"],
      }),
    ],
    [
      "supabase_admin",
      role({ rolsuper: true, rolbypassrls: true, rolcanlogin: true }),
    ],
    ["service_role", role({ rolbypassrls: true })],
    [
      "authenticator",
      role({
        rolcanlogin: true,
        rolinherit: false,
        memberOf: ["anon", "authenticated", "service_role"],
      }),
    ],
    ["anon", role()],
    ["authenticated", role()],
  ]);
}

export const PROTOTYPE_TABLES = [
  "pdf_templates",
  "pdf_template_versions",
  "pdf_template_renders",
  "pdf_template_artifacts",
  "pdf_template_audit_events",
  "pdf_template_batches",
  "pdf_template_batch_jobs",
  "contribution_receipt_snapshots",
  "gift_receipt_records",
] as const;

export function createFakePgState(data: FakePgData): FakePgState {
  const state: FakePgState = {
    roles: defaultRoles(),
    sessionUserOverride: null,
    connections: [],
    fallbackAttempts: 0,
    queries: [],
    directReads: [],
    writes: [],
    unsupported: [],
    rlsEmpty: new Set(),
    hang: new Set(),
    refuseConnections: false,
    data,
    reset() {
      this.roles = defaultRoles();
      this.sessionUserOverride = null;
      this.connections = [];
      this.fallbackAttempts = 0;
      this.queries = [];
      this.directReads = [];
      this.writes = [];
      this.unsupported = [];
      this.rlsEmpty = new Set();
      this.hang = new Set();
      this.refuseConnections = false;
    },
  };
  return state;
}

/** The #2067 suite's shared state, backed by `fakeDb`. */
export const fakePg: FakePgState = createFakePgState({
  schemaVersion: () => fakeDb.schemaVersion,
  userCount: () => fakeDb.users.length,
  tableRows: (table) => fakeDb.tableRows.get(table) ?? [],
  mode: () => fakeDb.mode,
});

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class FakePgError extends Error {
  readonly code: string;
  readonly severity = "ERROR";
  constructor(code: string, message: string) {
    super(message);
    this.name = "error";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Role semantics
// ---------------------------------------------------------------------------

export function isMember(
  state: FakePgState,
  member: string,
  target: string,
): boolean {
  if (member === target) return true;
  if (state.roles.get(member)?.rolsuper) return true;
  const seen = new Set<string>();
  const stack = [...(state.roles.get(member)?.memberOf ?? [])];
  while (stack.length > 0) {
    const next = stack.pop() as string;
    if (next === target) return true;
    if (seen.has(next)) continue;
    seen.add(next);
    stack.push(...(state.roles.get(next)?.memberOf ?? []));
  }
  return false;
}

function canExecute(state: FakePgState, user: string): boolean {
  const entry = state.roles.get(user);
  if (!entry) return false;
  return entry.rolsuper || user === "postgres" || user === READER_ROLE;
}

// ---------------------------------------------------------------------------
// SQL helpers
// ---------------------------------------------------------------------------

function normalize(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/;\s*$/, "")
    .trim();
}

/**
 * Split on top-level occurrences of `separator` (outside quotes and parens):
 * a comma, or the keyword `or` / `and` as a whole word.
 */
function splitTopLevel(text: string, separator: "," | "or" | "and"): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = false;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "'") quote = !quote;
    if (quote) continue;
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (depth !== 0) continue;
    if (separator === ",") {
      if (char === ",") {
        parts.push(text.slice(start, i));
        start = i + 1;
      }
      continue;
    }
    const word = text.slice(i, i + separator.length).toLowerCase();
    const before = i === 0 ? " " : (text[i - 1] as string);
    const after = text[i + separator.length] ?? " ";
    if (word === separator && /[\s)]/.test(before) && /[\s(]/.test(after)) {
      parts.push(text.slice(start, i));
      start = i + separator.length;
      i += separator.length - 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((part) => part.trim()).filter((part) => part.length > 0);
}

function stripCasts(expr: string): string {
  return expr.replace(/::\s*"?[a-z_][a-z0-9_]*"?(\[\])?/gi, "").trim();
}

function unwrapParens(expr: string): string {
  let out = expr.trim();
  while (out.startsWith("(") && out.endsWith(")")) {
    let depth = 0;
    let wraps = true;
    for (let i = 0; i < out.length; i += 1) {
      if (out[i] === "(") depth += 1;
      if (out[i] === ")") depth -= 1;
      if (depth === 0 && i < out.length - 1) {
        wraps = false;
        break;
      }
    }
    if (!wraps) break;
    out = out.slice(1, -1).trim();
  }
  return out;
}

class Unsupported extends Error {}

interface EvalContext {
  state: FakePgState;
  user: string;
  values: unknown[];
  /** Role of the current pg_roles row, when the query reads pg_roles. */
  rowRole?: string;
}

function roleOperand(raw: string, ctx: EvalContext): string {
  const expr = stripCasts(unwrapParens(raw)).replace(
    /^[a-z_][a-z0-9_]*\./i,
    (prefix) => (/^(pg_catalog)\.$/i.test(prefix) ? "" : prefix),
  );
  const lower = expr.toLowerCase();
  if (
    ["current_user", "session_user", "current_role", "user"].includes(lower)
  ) {
    return ctx.user;
  }
  const param = /^\$(\d+)$/.exec(expr);
  if (param) return String(ctx.values[Number(param[1]) - 1]);
  const literal = /^'([^']*)'$/.exec(expr);
  if (literal) return literal[1] as string;
  if (/^([a-z_][a-z0-9_]*\.)?(rolname|oid)$/i.test(expr) && ctx.rowRole) {
    return ctx.rowRole;
  }
  throw new Unsupported(`role operand ${raw}`);
}

function evalBool(raw: string, ctx: EvalContext): unknown {
  const expr = unwrapParens(stripCasts(raw));
  const ors = splitTopLevel(expr, "or");
  if (ors.length > 1) return ors.some((part) => evalBool(part, ctx) === true);
  const ands = splitTopLevel(expr, "and");
  if (ands.length > 1)
    return ands.every((part) => evalBool(part, ctx) === true);
  const not = /^not\s+([\s\S]+)$/i.exec(expr);
  if (not) return !(evalBool(not[1] as string, ctx) === true);
  return evalAtom(expr, ctx);
}

function evalAtom(raw: string, ctx: EvalContext): unknown {
  const expr = unwrapParens(stripCasts(raw));
  const lower = expr.toLowerCase();
  if (
    ["current_user", "session_user", "current_role", "user"].includes(lower)
  ) {
    return ctx.user;
  }
  const column =
    /^(?:[a-z_][a-z0-9_]*\.)?(rolname|rolsuper|rolbypassrls|rolcanlogin|rolinherit)$/i.exec(
      expr,
    );
  if (column) {
    const name = (column[1] as string).toLowerCase();
    const target = ctx.rowRole ?? ctx.user;
    if (name === "rolname") return target;
    const entry = ctx.state.roles.get(target);
    if (!entry) throw new Unsupported(`unknown role ${target}`);
    return entry[name as keyof FakePgRole];
  }
  const hasRole = /^(?:pg_catalog\.)?pg_has_role\s*\(([\s\S]*)\)$/i.exec(expr);
  if (hasRole) {
    const args = splitTopLevel(hasRole[1] as string, ",");
    if (args.length < 2 || args.length > 3) throw new Unsupported(expr);
    const mode = /^'([a-z ,]+)'$/i
      .exec(args.at(-1) as string)?.[1]
      ?.toLowerCase();
    if (!mode || !/(member|usage|set)/.test(mode)) throw new Unsupported(expr);
    const member =
      args.length === 3 ? roleOperand(args[0] as string, ctx) : ctx.user;
    const target = roleOperand(args[args.length - 2] as string, ctx);
    return isMember(ctx.state, member, target);
  }
  const isBool = /^([\s\S]+?)\s+is\s+(not\s+)?(true|false)$/i.exec(expr);
  if (isBool) {
    const value = evalBool(isBool[1] as string, ctx) === true;
    const wanted = (isBool[3] as string).toLowerCase() === "true";
    return isBool[2] ? value !== wanted : value === wanted;
  }
  const eq = /^([\s\S]+?)\s*(<>|!=|=)\s*([\s\S]+)$/.exec(expr);
  if (eq) {
    let same: boolean;
    try {
      same =
        roleOperand(eq[1] as string, ctx) === roleOperand(eq[3] as string, ctx);
    } catch (error) {
      if (!(error instanceof Unsupported)) throw error;
      same = evalBool(eq[1] as string, ctx) === evalBool(eq[3] as string, ctx);
    }
    return eq[2] === "=" ? same : !same;
  }
  const inList = /^(?:[a-z_][a-z0-9_]*\.)?rolname\s+in\s*\(([\s\S]+)\)$/i.exec(
    expr,
  );
  if (inList) {
    const names = splitTopLevel(inList[1] as string, ",").map((item) =>
      roleOperand(item, ctx),
    );
    return names.includes(ctx.rowRole ?? ctx.user);
  }
  if (lower === "true") return true;
  if (lower === "false") return false;
  throw new Unsupported(`expression ${raw}`);
}

function columnName(item: string): { expr: string; name: string } {
  const explicit = /^([\s\S]+?)\s+as\s+"?([a-z_][a-z0-9_]*)"?$/i.exec(item);
  if (explicit) {
    return {
      expr: explicit[1] as string,
      name: (explicit[2] as string).toLowerCase(),
    };
  }
  const implicit = /^([\s\S]*[a-z0-9_)"])\s+"?([a-z_][a-z0-9_]*)"?$/i.exec(
    item,
  );
  if (
    implicit &&
    !/(^|\s)(not|and|or|in|is|=)$/i.test((implicit[1] as string).trim()) &&
    !/^(and|or|not|in|is|from)$/i.test(implicit[2] as string) &&
    !/[=<>]\s*[a-z_]*$/i.test(implicit[1] as string)
  ) {
    return {
      expr: implicit[1] as string,
      name: (implicit[2] as string).toLowerCase(),
    };
  }
  const bare = unwrapParens(stripCasts(item));
  const lower = bare.toLowerCase();
  if (
    ["current_user", "session_user", "current_role", "user"].includes(lower)
  ) {
    return { expr: item, name: lower === "user" ? "current_user" : lower };
  }
  const col = /^(?:[a-z_][a-z0-9_]*\.)?([a-z_][a-z0-9_]*)$/i.exec(bare);
  if (col) return { expr: item, name: (col[1] as string).toLowerCase() };
  if (/^(?:pg_catalog\.)?pg_has_role\s*\(/i.test(bare)) {
    return { expr: item, name: "pg_has_role" };
  }
  return { expr: item, name: "?column?" };
}

function evalIdentity(sql: string, ctx: EvalContext): Row[] {
  const match =
    /^select\s+([\s\S]+?)(?:\s+from\s+([\s\S]+?))?(?:\s+where\s+([\s\S]+?))?(?:\s+limit\s+\d+)?$/i.exec(
      sql,
    );
  if (!match) throw new Unsupported(sql);
  const items = splitTopLevel(match[1] as string, ",").map(columnName);
  const from = match[2]?.trim();
  const where = match[3]?.trim();

  if (!from) {
    if (where) throw new Unsupported(sql);
    const row: Row = {};
    for (const item of items) row[item.name] = evalBool(item.expr, ctx);
    return [row];
  }
  if (
    !/^(pg_catalog\.)?(pg_roles|pg_authid)(\s+(as\s+)?[a-z_][a-z0-9_]*)?$/i.test(
      from,
    )
  ) {
    throw new Unsupported(`from ${from}`);
  }
  const rows: Row[] = [];
  for (const roleName of ctx.state.roles.keys()) {
    const rowCtx = { ...ctx, rowRole: roleName };
    if (where && evalBool(where, rowCtx) !== true) continue;
    const row: Row = {};
    for (const item of items) row[item.name] = evalBool(item.expr, rowCtx);
    rows.push(row);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// document_cutover functions
// ---------------------------------------------------------------------------

function routeFor(fn: string, args: unknown[]): FakePgRoute | undefined {
  const contract = contractFunction(fn);
  if (!contract || contract.args.length !== args.length) return undefined;
  return contract.route;
}

function parseArgs(raw: string, values: unknown[]): unknown[] {
  if (!raw.trim()) return [];
  return splitTopLevel(raw, ",").map((arg) => {
    const expr = stripCasts(arg).replace(/^[a-z_]+\s*=>\s*/i, "");
    const param = /^\$(\d+)$/.exec(expr);
    if (param) return values[Number(param[1]) - 1];
    const literal = /^'([^']*)'$/.exec(expr);
    if (literal) return literal[1];
    if (/^null$/i.test(expr)) return null;
    if (/^-?\d+$/.test(expr)) return Number(expr);
    throw new Unsupported(`function argument ${arg}`);
  });
}

const count = (n: number) => String(n);

function routeRow(
  state: FakePgState,
  route: FakePgRoute,
  fn: string,
  args: unknown[],
): Row {
  const rows = (table: string) => state.data.tableRows(table);
  const notNull = (table: string, column: string) =>
    rows(table).filter(
      (row) => row[column] !== null && row[column] !== undefined,
    );
  switch (route) {
    case "schema_version": {
      const version = state.data.schemaVersion();
      if (version === null) {
        throw new FakePgError(
          "42P01",
          'relation "supabase_migrations.schema_migrations" does not exist (acceptance fake)',
        );
      }
      if (!/^\d{14}$/.test(version)) {
        throw new FakePgError(
          "22P02",
          `acceptance fake: schema version ${version} is not a 14-digit bigint`,
        );
      }
      return { [fn]: version };
    }
    case "users":
      return { [fn]: count(state.data.userCount()) };
    case "table": {
      const table = String(args[0] ?? "");
      if (!(PROTOTYPE_TABLES as readonly string[]).includes(table)) {
        throw new FakePgError(
          "22023",
          `document_cutover: table ${table} is not a detector table (acceptance fake)`,
        );
      }
      const tenants = new Set(
        notNull(table, "tenant_id").map((row) => String(row.tenant_id)),
      );
      return {
        row_count: count(rows(table).length),
        tenant_count: count(tenants.size),
      };
    }
    case "storage":
      return {
        referenced_rows: count(
          notNull("pdf_template_artifacts", "storage_path").length,
        ),
        bucket_objects: "0",
      };
    case "external":
      return { [fn]: count(notNull("pdf_template_artifacts", "url").length) };
    case "jobs":
      return { [fn]: count(rows("pdf_template_batch_jobs").length) };
    case "reports":
      return {
        [fn]: count(
          rows("pdf_templates").filter((row) => {
            const report = row.migration_report;
            return (
              report !== null &&
              report !== undefined &&
              !(
                typeof report === "object" &&
                Object.keys(report as object).length === 0
              )
            );
          }).length,
        ),
      };
    case "integrations":
      return {
        [fn]: count(
          rows("pdf_template_renders").filter(
            (row) => row.renderer === "docraptor",
          ).length,
        ),
      };
  }
}

function scenarioMatches(
  set: Set<string>,
  route: FakePgRoute,
  args: unknown[],
): boolean {
  if (set.has("*") || set.has(route)) return true;
  return route === "table" && typeof args[0] === "string" && set.has(args[0]);
}

// ---------------------------------------------------------------------------
// Query dispatch
// ---------------------------------------------------------------------------

export interface FakePgResult {
  command: string;
  rowCount: number;
  rows: Row[];
  fields: Array<{ name: string }>;
}

function result(rows: Row[], command = "SELECT"): FakePgResult {
  return {
    command,
    rowCount: rows.length,
    rows,
    fields: Object.keys(rows[0] ?? {}).map((name) => ({ name })),
  };
}

const WRITE_SQL =
  /^(insert|update|delete|merge|truncate|create|alter|drop|grant|revoke|copy|call|do|vacuum|analyze|refresh|comment|security|lock|reindex|cluster|import|reassign|notify|listen|prepare transaction)\b/i;
const CONTROL_SQL =
  /^(begin|commit|end|rollback|start transaction|savepoint|release|show|reset|discard|deallocate|set (local |session )?(transaction|statement_timeout|lock_timeout|idle_in_transaction_session_timeout|application_name|search_path|default_transaction_read_only|timezone|time zone|client_encoding))\b/i;

async function dispatch(
  state: FakePgState,
  user: string,
  rawText: string,
  values: unknown[],
): Promise<FakePgResult> {
  const sql = normalize(rawText);
  const lower = sql.toLowerCase();
  const log = (entry: Omit<FakePgQuery, "user" | "text">) => {
    state.queries.push({ user, text: sql, ...entry });
  };

  if (
    /^set\s+(local\s+|session\s+)?(role|session authorization)\b/i.test(sql)
  ) {
    log({ kind: "write" });
    state.writes.push(sql);
    state.onWrite?.(sql);
    throw new FakePgError(
      "42501",
      "permission denied to set role (acceptance fake)",
    );
  }
  if (
    WRITE_SQL.test(sql) ||
    /\bfor\s+(update|share|no key update|key share)\b/i.test(sql) ||
    /\b(nextval|setval|set_config|pg_advisory_lock|lo_import|lo_unlink|pg_terminate_backend)\s*\(/i.test(
      sql,
    )
  ) {
    log({ kind: "write" });
    state.writes.push(sql);
    state.onWrite?.(sql);
    throw new FakePgError(
      "25006",
      `cannot execute ${sql.split(" ")[0]} in a read-only role (acceptance fake)`,
    );
  }
  if (CONTROL_SQL.test(sql) || /^select\s+1$/i.test(sql)) {
    log({ kind: "control" });
    return result([], sql.split(" ")[0]?.toUpperCase() ?? "SET");
  }

  const calls = [
    ...sql.matchAll(
      /"?document_cutover"?\s*\.\s*"?([a-z_][a-z0-9_]*)"?\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/gi,
    ),
  ];
  if (calls.length > 0) {
    const mode = state.data.mode();
    const row: Row = {};
    let empty = false;
    for (const call of calls) {
      const fn = (call[1] as string).toLowerCase();
      let args: unknown[];
      try {
        args = parseArgs(call[2] as string, values);
      } catch (error) {
        log({ kind: "unsupported", fn });
        state.unsupported.push(sql);
        throw new FakePgError(
          "XX000",
          `acceptance fake: unsupported query: ${(error as Error).message}`,
        );
      }
      const route = routeFor(fn, args);
      log({ kind: "function", fn, args, route });
      if (!canExecute(state, user)) {
        throw new FakePgError(
          "42501",
          `permission denied for ${state.roles.has(user) ? "schema document_cutover" : "function"} (acceptance fake)`,
        );
      }
      if (!route) {
        state.unsupported.push(sql);
        throw new FakePgError(
          "XX000",
          `acceptance fake: document_cutover.${fn} is not in the pinned contract (document-cutover-contract.ts)`,
        );
      }
      if (mode === "permission_denied") {
        throw new FakePgError(
          "42501",
          `permission denied for function ${fn} (acceptance fake)`,
        );
      }
      if (mode === "unavailable") {
        throw new FakePgError(
          "08006",
          "Connection terminated unexpectedly (acceptance fake)",
        );
      }
      if (scenarioMatches(state.hang, route, args)) {
        await new Promise<never>(() => undefined);
      }
      if (scenarioMatches(state.rlsEmpty, route, args)) {
        empty = true;
        continue;
      }
      if (mode === "unknown_shape") {
        Object.assign(row, { unexpected: "shape" });
        continue;
      }
      const computed = routeRow(state, route, fn, args);
      Object.assign(row, computed);
    }
    if (empty) return result([]);
    // Apply a single select-list alias to a scalar result (`select f() as x`).
    const alias =
      /^select\s+[\s\S]+\)\s+(?:as\s+)?"?([a-z_][a-z0-9_]*)"?$/i.exec(sql);
    const keys = Object.keys(row);
    if (
      alias &&
      calls.length === 1 &&
      keys.length === 1 &&
      !/^from$/i.test(alias[1] as string)
    ) {
      return result([
        { [(alias[1] as string).toLowerCase()]: row[keys[0] as string] },
      ]);
    }
    return result([row]);
  }

  if (
    /\b(current_user|session_user|current_role|pg_roles|pg_authid|pg_has_role|rolsuper|rolbypassrls)\b/i.test(
      lower,
    ) &&
    !/\bfrom\s+(?!pg_catalog\.pg_roles|pg_roles|pg_catalog\.pg_authid|pg_authid)[a-z_"]/i.test(
      lower,
    )
  ) {
    try {
      const rows = evalIdentity(sql, { state, user, values });
      log({ kind: "identity" });
      return result(rows);
    } catch (error) {
      if (!(error instanceof Unsupported)) throw error;
      log({ kind: "unsupported" });
      state.unsupported.push(sql);
      throw new FakePgError(
        "XX000",
        `acceptance fake: unsupported query: ${sql}`,
      );
    }
  }

  const direct =
    /\bfrom\s+("?[a-z_][a-z0-9_]*"?(?:\s*\.\s*"?[a-z_][a-z0-9_]*"?)?)/i.exec(
      sql,
    );
  if (
    direct &&
    !/^(pg_catalog\.|information_schema\.)/i.test(direct[1] as string)
  ) {
    const relation = (direct[1] as string).replace(/["\s]/g, "");
    log({ kind: "direct" });
    state.directReads.push(relation);
    if (!state.roles.get(user)?.rolsuper && user !== "postgres") {
      throw new FakePgError(
        "42501",
        `permission denied for table ${relation.split(".").at(-1)} (acceptance fake)`,
      );
    }
    return result([]);
  }

  log({ kind: "unsupported" });
  state.unsupported.push(sql);
  throw new FakePgError("XX000", `acceptance fake: unsupported query: ${sql}`);
}

// ---------------------------------------------------------------------------
// pg module surface (Client, Pool)
// ---------------------------------------------------------------------------

type ConnectionConfig =
  | string
  | { connectionString?: string; user?: string; [key: string]: unknown }
  | undefined;

function sessionUserFor(
  state: FakePgState,
  config: ConnectionConfig,
): {
  connectionString: string | undefined;
  user: string;
} {
  const connectionString =
    typeof config === "string" ? config : config?.connectionString;
  if (state.sessionUserOverride) {
    return { connectionString, user: state.sessionUserOverride };
  }
  if (!connectionString) {
    state.fallbackAttempts += 1;
    throw new FakePgError(
      "08001",
      "no connection string given (acceptance fake): the gate must use DOCUMENT_CUTOVER_DATABASE_URL only, never PG* env vars",
    );
  }
  let user: string | undefined;
  try {
    const parsed = new URL(connectionString);
    if (parsed.username) user = decodeURIComponent(parsed.username);
  } catch {
    throw new FakePgError(
      "08001",
      "invalid connection string (acceptance fake)",
    );
  }
  if (!user) {
    state.fallbackAttempts += 1;
    throw new FakePgError(
      "08001",
      "connection string has no user (acceptance fake): PGUSER fallback is not allowed",
    );
  }
  // Supabase pooler user: `<role>.<project-ref>`.
  return { connectionString, user: user.split(".")[0] as string };
}

type QueryArg = string | { text: string; values?: unknown[] };

export function createFakePgModule(
  state: FakePgState,
): Record<string, unknown> {
  class Client {
    private readonly config: ConnectionConfig;
    private user: string | null = null;
    private ended = false;

    constructor(config?: ConnectionConfig) {
      this.config = config;
    }

    async connect(callback?: (error: Error | null) => void): Promise<void> {
      try {
        if (state.refuseConnections) {
          throw Object.assign(
            new Error("connect ECONNREFUSED 127.0.0.1:9 (acceptance fake)"),
            { code: "ECONNREFUSED" },
          );
        }
        const session = sessionUserFor(state, this.config);
        if (!state.roles.has(session.user)) {
          throw new FakePgError(
            "28P01",
            `password authentication failed for user "${session.user}" (acceptance fake)`,
          );
        }
        state.connections.push(session);
        this.user = session.user;
        callback?.(null);
      } catch (error) {
        if (callback) callback(error as Error);
        else throw error;
      }
    }

    async query(
      arg: QueryArg,
      values?: unknown[] | ((...a: unknown[]) => void),
      callback?: (...a: unknown[]) => void,
    ): Promise<FakePgResult> {
      if (this.ended || this.user === null) {
        throw new FakePgError(
          "08003",
          "Client is not connected (acceptance fake)",
        );
      }
      const text = typeof arg === "string" ? arg : arg.text;
      const params =
        (typeof arg === "object" && arg.values) ||
        (Array.isArray(values) ? values : []);
      const cb = typeof values === "function" ? values : callback;
      try {
        const out = await dispatch(state, this.user, text, params);
        cb?.(null, out);
        return out;
      } catch (error) {
        if (cb) {
          cb(error);
          return result([]);
        }
        throw error;
      }
    }

    async end(): Promise<void> {
      this.ended = true;
    }

    release(): void {
      this.ended = true;
    }

    on(): this {
      return this;
    }

    once(): this {
      return this;
    }

    removeListener(): this {
      return this;
    }
  }

  class Pool {
    private readonly config: ConnectionConfig;
    constructor(config?: ConnectionConfig) {
      this.config = config;
    }

    async connect(): Promise<Client> {
      const client = new Client(this.config);
      await client.connect();
      return client;
    }

    async query(arg: QueryArg, values?: unknown[]): Promise<FakePgResult> {
      const client = await this.connect();
      try {
        return await client.query(arg, values);
      } finally {
        client.release();
      }
    }

    async end(): Promise<void> {}

    on(): this {
      return this;
    }
  }

  const types = {
    setTypeParser: () => undefined,
    getTypeParser: () => (value: unknown) => value,
  };
  const api = { Client, Pool, types, DatabaseError: FakePgError };
  return { ...api, default: api };
}

/** `vi.mock("pg", ...)` factory body for the #2067 suite. */
export function mockPgModule(): Record<string, unknown> {
  return createFakePgModule(fakePg);
}
