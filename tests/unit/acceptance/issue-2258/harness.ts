/**
 * #2258 shared fixtures (spec r2 = issue comment 6388953289, plus pins
 * addendum 1 = 6419311427, approved in 6419380148).
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";

export const MIG = "supabase/migrations";
/**
 * Addendum 1 item 1 (OQ9): the migration and its rollback, by EXACT file name.
 * The version is a reservation; if Samson renumbers it at handback, change
 * only these two lines.
 */
export const MIGRATION_NAME = "20261025120700_current_user_assignments_rpc.sql";
export const ROLLBACK_NAME = `rollback_${MIGRATION_NAME}`;
export const MIGRATION = `${MIG}/${MIGRATION_NAME}`;
export const ROLLBACK = `${MIG}/${ROLLBACK_NAME}`;
/** Newest forward migration on develop 88eefbd9 (addendum 1 item 1). */
export const DEVELOP_LATEST = "20261025120000";
export const FN = "public.current_user_assignments()";
export const PRINCIPAL_DIR = "packages/api/src/principal";
/** Module specifiers are strings, loaded with import(), so each test fails on its own while the module is missing. */
export const MOD = {
  assignment: "../../../../packages/api/src/principal/assignment",
  projection: "../../../../packages/api/src/principal/projection",
  reader: "../../../../packages/api/src/principal/reader",
} as const;
export const DOC = "docs/guides/architecture/authz-memberships.md";
export const REALSTACK =
  "tests/unit/acceptance/issue-2258/current-user-assignments.realstack.acceptance.test.ts";
export const read = (f: string) =>
  existsSync(f) ? readFileSync(f, "utf8") : "";
/** SQL with comments removed (executable text only). */
export const code = (sql: string) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
/** The migration as a batch that runs inside a caller's transaction (top-level BEGIN;/COMMIT; dropped). */
export const migrationBatch = () =>
  read(MIGRATION).replace(/^\s*(BEGIN|COMMIT)\s*;\s*$/gim, "");
/** Non-test source files under principal/** (relative paths). */
export function principalSources(dir = PRINCIPAL_DIR): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = `${dir}/${n}`;
    if (statSync(p).isDirectory()) return principalSources(p);
    return /\.(ts|tsx|mts)$/.test(n) && !/\.(test|spec)\.tsx?$/.test(n)
      ? [p]
      : [];
  });
}

/** Membership row as current_user_assignments() returns it (and AssignmentRow mirrors it). */
export type Row = {
  id: string;
  user_id: string;
  tenant_id: string;
  role: string;
  staff_role: string | null;
  updated_at: string;
};
export type Reader = { listActiveAssignments(): Promise<ReadonlyArray<Row>> };
export type Resolve = (
  input: {
    userId: string;
    proposedAssignmentId?: string;
    expectedTenantId?: string;
  },
  reader: Reader,
) => Promise<
  | { ok: true; assignment: Record<string, unknown>; selection: string }
  | { ok: false; reason: string }
>;
/** OQ7: revision = updated_at. The ActiveAssignment a row must resolve to. */
export const asAssignment = (r: Row) => ({
  assignmentId: r.id,
  userId: r.user_id,
  tenantId: r.tenant_id,
  revision: r.updated_at,
  membershipRole: r.role,
  staffRole: r.staff_role,
});
