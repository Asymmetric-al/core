/** #2270 shared fixtures (Final spec r1, approved 2026-10-24 with all defaults). Owned by Acceptance. */
import { existsSync, readFileSync } from "node:fs";

/** Spec §6: the one migration this issue adds, by exact name. */
export const MIGRATION =
  "supabase/migrations/20261024163000_authz_definer_execute_lockdown.sql";
export const DOC = "docs/security/function-execute-grants.md";
export const read = (f: string) =>
  existsSync(f) ? readFileSync(f, "utf8") : "";

/** Spec §1.2: exact EXECUTE grantees per function (regprocedure text). */
export const GRANTS: Record<string, string[]> = {
  "current_user_memberships(uuid)": ["authenticated", "postgres"],
  "authz.is_super_admin()": ["authenticated", "postgres", "service_role"],
  "authz.has_membership(uuid,authz.membership_role[])": [
    "authenticated",
    "postgres",
    "service_role",
  ],
  "authz.has_staff_membership(uuid,authz.staff_role[])": [
    "authenticated",
    "postgres",
    "service_role",
  ],
};

/** Spec §1.3: the 8 policies re-scoped to authenticated, by table. */
export const POLICIES: [string, string][] = [
  ["crm_command_logs", "select"],
  ["crm_command_logs", "insert"],
  ["crm_record_links", "select"],
  ["crm_record_links", "insert"],
  ["crm_record_links", "update"],
  ["crm_merge_candidates", "select"],
  ["crm_merge_candidates", "insert"],
  ["crm_merge_candidates", "update"],
];
export const CRM_TABLES = [...new Set(POLICIES.map(([t]) => t))];

/** Spec §1.4, verbatim (normative). */
export const SPEC_STATEMENTS = `BEGIN;
REVOKE ALL ON FUNCTION public.current_user_memberships(UUID) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_memberships(UUID) TO authenticated;
REVOKE ALL ON FUNCTION authz.is_super_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION authz.has_membership(UUID, authz.membership_role[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION authz.has_staff_membership(UUID, authz.staff_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION authz.is_super_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.has_membership(UUID, authz.membership_role[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION authz.has_staff_membership(UUID, authz.staff_role[]) TO authenticated, service_role;
${POLICIES.map(
  ([t, c]) =>
    `ALTER POLICY "authz staff tenant ${c} ${t}" ON public.${t} TO authenticated;`,
).join("\n")}
SELECT pg_notify('pgrst', 'reload schema');
COMMIT;`;

/** SQL with comments removed, split into whitespace-normalized statements. */
export function statements(sql: string) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .split(";")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
