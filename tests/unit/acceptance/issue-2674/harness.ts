/**
 * AL-2674 (WP1 slice 1.1a) shared fixtures for the real-stack suites. They run
 * against the migrated database named by TENANT_GUARD_IT_ADMIN_DATABASE_URL
 * (a PG17 superuser URL, as in CI's `migrate` job); without it they skip,
 * except in that job, where they fail. Every check is one transaction that is
 * always rolled back. Callers are emulated as PostgREST does it: SET LOCAL
 * ROLE plus request.jwt.claims and request.headers. The single-claim setting
 * request.jwt.claim.sub, which current PostgREST no longer sets, stays empty,
 * so the guard resolves the caller from the JSON claims setting (AL-2674 A9).
 */
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import type pg from "pg";

export const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
export const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";

export const MIG = "supabase/migrations";
export const COMMAND_LANE_MIGRATION = `${MIG}/20261117034638_command_lane_human_entry_points.sql`;
export const PLATFORM_MIGRATION = `${MIG}/20261117034650_platform_schema_marker_and_health.sql`;
export const HYGIENE_MIGRATION = `${MIG}/20261117034708_definer_execute_hygiene.sql`;
export const DEFAULTS_MIGRATION = `${MIG}/20261117034926_close_default_privileges_and_demo_grants.sql`;
export const GUARD_CLI = "scripts/db/require-disposable-database.mjs";
export const CATALOG = "scripts/verify/tenant-rls-catalog.mjs";

export const read = (file: string) =>
  existsSync(file) ? readFileSync(file, "utf8") : "";

/** The statements between a migration's `BEGIN;` and `COMMIT;` lines. */
export function migrationBody(file: string) {
  const m = /^BEGIN;$([\s\S]*)^COMMIT;$/m.exec(read(file));
  if (!m) throw new Error(`${file} must wrap its body in BEGIN; ... COMMIT;`);
  return m[1]!;
}

/** A migration's `DO $$` block whose first line is `-- post-assert: <tag>`, verbatim. */
export function postAssert(file: string, tag: string) {
  const start = read(file).indexOf(`DO $$\n-- post-assert: ${tag}\n`);
  if (start < 0) throw new Error(`${file} has no post-assert "${tag}"`);
  const end = read(file).indexOf("$$;", start + "DO $$".length);
  return read(file).slice(start, end + "$$;".length);
}

/**
 * Fixture ids. TA, TB tenants. U1: one live staff/finance row in TA (m1).
 * U2: two live rows in TA (m2a staff/development, m2b donor), one inactive row
 * in TA (m2c missionary) and one live row in TB (m2d donor). U3: a donor in
 * TB only (m3).
 */
export function fixtureIds() {
  const id: Record<string, string> = {};
  for (const k of "TA TB U1 U2 U3 m1 m2a m2b m2c m2d m3".split(" "))
    id[k] = randomUUID();
  return id;
}

export function fixtureSql(id: Record<string, string>) {
  const q = (k: string) => `'${id[k]}'`;
  const rows: [string, string, string, string, string | null, boolean][] = [
    ["m1", "U1", "TA", "staff", "finance", true],
    ["m2a", "U2", "TA", "staff", "development", true],
    ["m2b", "U2", "TA", "donor", null, true],
    ["m2c", "U2", "TA", "missionary", null, false],
    ["m2d", "U2", "TB", "donor", null, true],
    ["m3", "U3", "TB", "donor", null, true],
  ];
  // Since AL-2675 the sign-up trigger also gives each new login a donor
  // membership in the demo tenant; the fixture removes it so each user holds
  // exactly the rows below.
  return `insert into public.tenants (id, name, slug) values (${q("TA")}, 'acc2674 A', 'acc2674-' || ${q("TA")}), (${q("TB")}, 'acc2674 B', 'acc2674-' || ${q("TB")});
    insert into auth.users (id) values (${q("U1")}), (${q("U2")}), (${q("U3")});
    delete from authz.memberships where user_id in (${q("U1")}, ${q("U2")}, ${q("U3")});
    insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active) values ${rows
      .map(
        ([m, u, t, role, staff, live]) =>
          `(${q(m)}, ${q(u)}, ${q(t)}, '${role}', ${staff ? `'${staff}'` : "null"}, ${live})`,
      )
      .join(", ")};`;
}

export type Outcome = {
  rows: Record<string, unknown>[];
  code: string | null;
  message: string;
};

export type Caller = {
  /** Fixture key of the JWT subject, or null for no session. */
  sub?: string | null;
  /** Authenticator assurance level claim, e.g. aal2. */
  aal?: string;
  /** Request headers as PostgREST sets them (lowercased names). */
  headers?: Record<string, string>;
};

/** Runs one statement as `role` for `caller`, inside a savepoint that is always rolled back. */
export function asRole(db: pg.Client, id: Record<string, string>) {
  return async (
    role: string,
    caller: Caller,
    sql: string,
  ): Promise<Outcome> => {
    await db.query("savepoint acc2674");
    try {
      await db.query(`set local role ${role}`);
      const sub = caller.sub ? id[caller.sub]! : "";
      const claims = caller.sub
        ? JSON.stringify({
            sub,
            role,
            ...(caller.aal ? { aal: caller.aal } : {}),
          })
        : "";
      await db.query(
        `select set_config('request.jwt.claims', $1, true),
                set_config('request.jwt.claim.sub', '', true),
                set_config('request.headers', $2, true)`,
        [claims, caller.headers ? JSON.stringify(caller.headers) : ""],
      );
      const r = await db.query(sql);
      return {
        rows: r.rows as Record<string, unknown>[],
        code: null,
        message: "",
      };
    } catch (e) {
      const err = e as { code?: string; message?: string };
      return {
        rows: [],
        code: err.code ?? "?",
        message: err.message ?? String(e),
      };
    } finally {
      await db.query("rollback to savepoint acc2674");
    }
  };
}

/** A call of `fn` (regprocedure text) with a typed NULL for every argument. */
export async function nullCall(db: pg.Client, fn: string) {
  const r = await db.query(
    `select coalesce(string_agg('NULL::' || format_type(t, NULL), ', ' order by o), '') a
       from unnest((select proargtypes::oid[] from pg_proc where oid = $1::regprocedure)) with ordinality u(t, o)`,
    [fn],
  );
  const name = fn.slice(0, fn.indexOf("("));
  return `select ${name}(${(r.rows[0] as { a: string }).a})`;
}
