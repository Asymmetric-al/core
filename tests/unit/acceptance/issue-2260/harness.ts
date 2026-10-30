/**
 * #2260 shared fixtures (spec r2 = issue comment 6386169035, edited in place
 * with the addendum 6407195511; r1 approved with all defaults in 6386178623).
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { existsSync, readFileSync } from "node:fs";

export const MIG = "supabase/migrations";
/**
 * Spec In 1 / §9: the one migration this issue adds, by EXACT file name (never
 * a glob or date prefix). The version is a reservation; if Samson renumbers it
 * at handback, change only this line.
 */
export const MIGRATION_NAME =
  "20261025120000_donor_feed_preferences_own_rows.sql";
export const MIGRATION = `${MIG}/${MIGRATION_NAME}`;
/** Latest forward migration on develop c4d4fbc5 / 0727d810 (#2252); §9. */
export const DEVELOP_LATEST = "20261025100000";
export const TABLE = "donor_feed_preferences";
export const ROUTE = "packages/api/src/feed-preferences/index.ts";
export const EXCEPTIONS = "docs/security/rls-deny-by-default-exceptions.json";
export const ALLOWLIST = "docs/security/service-role-client-allowlist.json";
export const DOC = "docs/security/donor-feed-preferences-rls.md";
export const REALSTACK =
  "tests/unit/acceptance/issue-2260/donor-feed-preferences.realstack.acceptance.test.ts";
/** In 1.4: exactly these three policies, each TO authenticated. */
export const POLICIES = {
  donor_feed_preferences_own_insert: "INSERT",
  donor_feed_preferences_own_select: "SELECT",
  donor_feed_preferences_own_update: "UPDATE",
} as const;

export const read = (f: string) =>
  existsSync(f) ? readFileSync(f, "utf8") : "";
/** SQL with comments removed (executable text only). */
export const code = (sql: string) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
/** The migration as a batch that runs inside a caller's transaction (top-level BEGIN;/COMMIT; dropped). */
export const migrationBatch = () =>
  read(MIGRATION).replace(/^\s*(BEGIN|COMMIT)\s*;\s*$/gim, "");
