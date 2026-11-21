/**
 * #2256 shared fixtures (spec r2 = issue comment 6392691911, "Spec r2
 * (consolidated)", approved; factory note 6402027484). Owned by Acceptance;
 * implementers must not edit.
 */
import { existsSync, readFileSync } from "node:fs";

import { expect } from "vitest";

/**
 * Spec §2 In 1: the one forward migration this issue adds, by exact name. The
 * version is a reservation (§7; Samson renumbers at handback to keep merge
 * order). If it is renumbered, change only this line.
 */
export const MIGRATION = "supabase/migrations/20261025110000_person_anchor.sql";
/** Spec §2 In 8: the rollback is `rollback_` + the migration's file name. */
export const ROLLBACK = MIGRATION.replace(/([^/]+)$/, "rollback_$1");
/** #2254's migration (hard dependency, §9): this slice sorts after it. */
export const V2_MIGRATION =
  "supabase/migrations/20261024140000_identity_email_normalizer_and_donor_keys.sql";
export const DOC = "docs/security/identity-person-anchor.md";
export const FP = "docs/security/field-policies";
export const V3 = "repository-supplement-v3-person-anchor.json";
export const EXCEPTIONS = "docs/security/rls-deny-by-default-exceptions.json";
export const POLICY = "persons_staff_select";
/** Spec §1.2: [table, FK name, CHECK name]. */
export const SEAMS = (["missionaries", "profiles"] as const).map(
  (t) =>
    [
      t,
      `${t}_person_same_tenant_fk`,
      `${t}_person_requires_tenant_check`,
    ] as const,
);
export const CONSTRAINTS = SEAMS.flatMap(([, fk, ck]) => [fk, ck]);

export const SURFACES = "mission_control donor missionary public export".split(
  " ",
);
/** In 5 / OQ6: 10 rows, `security`, (F,F,F) on all five surfaces. */
export const NEW_ROWS = SEAMS.flatMap(([record_type]) =>
  SURFACES.map((surface) => ({
    record_type,
    field_key: "person_id",
    surface,
    tenant_id: null,
    visible: false,
    editable: false,
    exportable: false,
    sensitivity_category: "security",
  })),
);

/**
 * §1.3 / criterion 6 frozen reader set: proname -> prosecdef. 13 readers
 * (9 DEFINER, 4 INVOKER) plus the matched writer `handle_new_user`.
 *
 * Amended by AL-2675 (WP2a; plan WP2a paragraph, NR-49): the two contribution
 * trigger functions test membership instead of `profiles.tenant_id` and leave
 * the set. The member directory, `tenant_member_directory`, reads profiles
 * beside `authz.memberships.tenant_id`, not the profile's tenant, and the
 * lexical scan of criterion 6 matches it. `handle_new_user` writes the donor
 * membership's tenant there too, for the release already running (council
 * round 1 on WP2a, F3).
 *
 * Amended by the WP2a sweep (AL-2675; plan WP2a paragraph): the scan covers
 * `private` too. `private.profile_in_tenant` and the service-key reader
 * `tenant_member_profiles` name profiles beside `authz.memberships.tenant_id`
 * and read no profile's tenant; the lexical scan matches them.
 * `tenant_member_profiles` is an invoker since council round 1 on WP2a (F12):
 * its only caller, the service role, holds the rights it needs.
 */
export const READER_FUNCTIONS: Record<string, boolean> = {
  tenant_member_directory: true,
  tenant_member_profiles: false,
  profile_in_tenant: false,
  assert_eve_retention_actor: true,
  assert_eve_admin_memory_owner: true,
  validate_eve_notification_recipient: true,
  assert_eve_launch_profile: true,
  assert_eve_policy_actor_tenant: true,
  // WP2c verifies the operator's login from profiles; tenant_id belongs to the grant.
  has_eve_policy_permission: true,
  enforce_eve_policy_permission_tenant: false,
  enforce_eve_ai_settings_grant_tenant: false,
  atomic_update_profile_with_audit: false,
  // `atomic_update_user_role_with_audit` left the set with AL-2675 (WP2c, part
  // 1; record D-18): WP2c drops it with GraphQL `updateUserRole`, and the
  // role-change and revoke commands that replace it read no profile.
  set_eve_retention_hold: true,
  expire_eve_retention_records: true,
  handle_new_user: true,
  // DEFINER since AL-2675 (JB11, 20261119135200_post_comment_authors.sql):
  // the commenters' display names and avatars, joined to profiles, for a
  // caller with a live membership in the post's tenant. It names profiles
  // beside posts.tenant_id and authz.memberships.tenant_id and reads no
  // profile's tenant; the lexical scan keeps it.
  post_comment_authors: true,
  // Added by the handler-authority package of WP2 (AL-2675; D-18):
  // `authz.selected_missionary` joins profiles to `authz.memberships` by
  // user and compares the MEMBERSHIP's tenant_id with the selected tenant. It
  // reads no profile's tenant; the lexical scan matches it, as it matches
  // `profile_in_tenant`. An invoker: its only caller is the service role.
  selected_missionary: false,
};
/** §1.3 policy rows ("schema.table policy", sorted): #2256's profiles policy,
 * #2406's profiles-bucket folder policies, and #2407a's editor-image folder
 * policies. Each storage policy reads profiles.tenant_id. */
export const READER_POLICIES = [
  "public.profiles profiles staff tenant select",
  "storage.objects editor images owner folder insert",
  "storage.objects editor images owner folder update",
  "storage.objects profiles owner folder insert",
  "storage.objects profiles owner folder update",
];
/**
 * §1.3 app rows (files). Amended by AL-2675 (WP2a; NR-20, A08): the auth
 * context, the proxies' role resolver and the Payload strategy resolve the
 * caller's membership and no longer read the profile's tenant.
 *
 * Emptied by the WP2a sweep (AL-2675; plan WP2a paragraph, 7.1, NR-68): the
 * assistant memory route tests the caller's live membership in the request's
 * tenant, the reaction routes take the resolved assignment's tenant, and
 * retained drafts are scoped by the page's tenant, so no app code reads a
 * profile's tenant. Criterion 6 still compares the scan to this list exactly,
 * and 6b adds the query-filter half.
 */
export const READER_APPS: string[] = [];

/**
 * The query-filter half of the reader manifest (AL-2675, the WP2a sweep;
 * plan WP2a paragraph, NR-68). Criterion 6 finds property reads of
 * `profile.tenant_id`; this finds code that filters `profiles` by tenant or
 * role, which the sweep moved to membership:
 * - a `.from("profiles")` chain (to its statement's end or the next query) that filters
 *   `tenant_id` or `role` (`eq`, `neq`, `in`, `is`, `filter`, `match`, `or`),
 * - the same filter applied later to a variable that holds such a chain,
 * - a generic tenant-row helper called with the `profiles` table,
 * - a filter on `profiles` joined from another table: a dotted column
 *   (`.eq("profiles.tenant_id", …)`) or a `referencedTable` / `foreignTable:
 *   "profiles"` option beside a `tenant_id` or `role` condition (council
 *   round 1 on WP2a, F14).
 * Limit, by name: `.from()` with a table name that is not a literal (a
 * variable or an expression) is not followed, so a generic helper handed
 * "profiles" through a variable it then filters by tenant is not seen. Closing
 * it would flag every generic `.from(table)` helper; criterion 6's property
 * scan and the helper rule above cover the forms the code base uses.
 * Returns `file:line text` per finding.
 */
export function profileQueryFilterHits(file: string, text: string): string[] {
  const hits: string[] = [];
  const lineOf = (index: number) => text.slice(0, index).split("\n").length;
  const FILTER =
    /\.(?:eq|neq|in|is|filter|not)\(\s*["'`](?:tenant_id|role)["'`]|\.match\(\s*\{[^}]*\b(?:tenant_id|role)\b|\.or\(\s*["'`][^"'`]*\b(?:tenant_id|role)\./;
  const report = (index: number, snippet: string) =>
    hits.push(
      `${file}:${lineOf(index)} ${snippet.replace(/\s+/g, " ").trim().slice(0, 120)}`,
    );

  for (const m of text.matchAll(/\.from\(\s*["'`]profiles["'`]\s*\)/g)) {
    const rest = text.slice(m.index! + m[0].length);
    // The chain ends at its statement's end or at the next query, whichever
    // comes first (a Promise.all or a ternary holds several queries).
    const ends = [rest.indexOf(";"), rest.search(/\.from\(/)].filter(
      (i) => i >= 0,
    );
    const chain = ends.length > 0 ? rest.slice(0, Math.min(...ends)) : rest;
    if (FILTER.test(chain)) report(m.index!, m[0] + chain);
    const before = text.slice(0, m.index!);
    const assigned = /(?:let|const|var)\s+(\w+)\s*=\s*[\w.\s]*$/.exec(before);
    if (assigned) {
      const name = assigned[1]!;
      const later = new RegExp(
        String.raw`\b${name}\s*(?:=\s*${name}\s*)?\.(?:eq|neq|in|is|filter|not)\(\s*["'\`](?:tenant_id|role)["'\`]`,
        "g",
      );
      for (const l of text.matchAll(later)) report(l.index!, l[0]);
    }
  }
  for (const m of text.matchAll(
    /\b\w*[Tt]enant\w*\(\s*[^,()]+,\s*["'`]profiles["'`]/g,
  ))
    report(m.index!, m[0]);
  // A filter on profiles joined from another table.
  for (const m of text.matchAll(
    /\.(?:eq|neq|in|is|filter|not)\(\s*["'`]profiles\.(?:tenant_id|role)["'`]/g,
  ))
    report(m.index!, m[0]);
  for (const m of text.matchAll(
    /\.or\(\s*(["'`])[^"'`]*\b(?:tenant_id|role)\.[^"'`]*\1\s*,\s*\{[^}]*\b(?:referencedTable|foreignTable)\s*:\s*["'`]profiles["'`]/g,
  ))
    report(m.index!, m[0]);
  return hits;
}

export const read = (p: string) =>
  existsSync(p) ? readFileSync(p, "utf8") : "";
/** SQL with comments removed (executable text only). */
export const code = (sql: string) =>
  sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
/** Reads a pinned file after asserting it exists, so no scan passes on a missing file. */
export function sqlFile(p: string): string {
  expect(existsSync(p), `${p} must exist`).toBe(true);
  return read(p);
}
/** The statements between the file's `BEGIN;` and `COMMIT;` lines, for re-application inside a test transaction. */
export function body(p: string): string {
  const lines = sqlFile(p).split("\n");
  const trimmed = lines.map((l) => l.trim());
  const b = trimmed.indexOf("BEGIN;");
  const c = trimmed.lastIndexOf("COMMIT;");
  expect(b >= 0 && c > b, `${p}: BEGIN; ... COMMIT; lines`).toBe(true);
  return lines.slice(b + 1, c).join("\n");
}
/** Top-level statements with comments removed, string literals blanked, whitespace collapsed. */
export const statements = (sql: string) =>
  code(sql)
    .replace(/\$\$[\s\S]*?\$\$/g, "$$$$")
    .replace(/'(?:[^']|'')*'/g, "''")
    .split(";")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
