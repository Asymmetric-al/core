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
 */
export const READER_FUNCTIONS: Record<string, boolean> = {
  enforce_contribution_operation_tenant_refs: true,
  enforce_contribution_notification_tenant_refs: true,
  assert_eve_retention_actor: true,
  assert_eve_admin_memory_owner: true,
  validate_eve_notification_recipient: true,
  assert_eve_launch_profile: true,
  assert_eve_policy_actor_tenant: true,
  enforce_eve_policy_permission_tenant: false,
  enforce_eve_ai_settings_grant_tenant: false,
  atomic_update_profile_with_audit: false,
  atomic_update_user_role_with_audit: false,
  set_eve_retention_hold: true,
  expire_eve_retention_records: true,
  handle_new_user: true,
};
/** §1.3 RLS policy readers, "schema.table policy", sorted. #2406 addendum 1
 * adds the two storage.objects folder policies (they read profiles.tenant_id). */
export const READER_POLICIES = [
  "public.profiles profiles staff tenant select",
  "storage.objects profiles owner folder insert",
  "storage.objects profiles owner folder update",
];
/** §1.3 app rows (files). */
export const READER_APPS = [
  "apps/admin/src/cms/auth/supabase-strategy.ts",
  "packages/api/src/eve/admin-memory/route.ts",
  "packages/api/src/posts/reaction-route-utils.ts",
  "packages/auth/context.ts",
  "packages/auth/resolve-user-role.ts",
];

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
