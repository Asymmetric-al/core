/**
 * #2258 shared fixtures (spec r2 = issue comment 6388953289, plus pins
 * addendum 1 = 6419311427, approved in 6419380148).
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { createHash } from "node:crypto";
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
/**
 * c12 + addendum 1 item 3: tests that stay green AND unedited, pinned by git
 * blob id at develop 88eefbd9 (`git ls-tree 88eefbd9 <path>`).
 */
export const UNEDITED: Record<string, string> = {
  "tests/unit/auth/membership-rpc-contract.test.ts":
    "6553ce80839e496930b425679ad659e3e56e68c6",
  "tests/unit/packages/api/auth/get-auth-context-request-propagation.test.ts":
    "83cc87dcfb0af9840e8bde281a62fc04a357262e",
  // #2402 27cd6961 adds the REVOKE ALL ON SCHEMA private expectation.
  "tests/unit/security/authz-definer-execute-grants.test.ts":
    "596a3626eb8f864bd56cb8baf367b8f8f110e73b",
  "tests/unit/acceptance/issue-2270/authz-execute-grants.realstack.acceptance.test.ts":
    "3cb0512009db80f11c5043c63727e601d909ebe0",
  "tests/unit/acceptance/issue-2270/harness.ts":
    "e9e7201350e5d1f90f85c266f762d450ca3637d5",
  "tests/unit/acceptance/issue-2270/static.acceptance.test.ts":
    "dba22b6452fc7f51a6345cef502acb195e622902",
  /** c2: projection/types.ts is not edited. */
  "packages/api/src/projection/types.ts":
    "bb325e269ee9ec18689717f7fbbdeaad9a924998",
};

export const read = (f: string) =>
  existsSync(f) ? readFileSync(f, "utf8") : "";
/** git's blob id of a working-tree file (sha1 of "blob <len>\0" + bytes). */
export const blobId = (f: string) => {
  const b = readFileSync(f);
  return createHash("sha1")
    .update(Buffer.concat([Buffer.from(`blob ${b.length}\0`), b]))
    .digest("hex");
};
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
