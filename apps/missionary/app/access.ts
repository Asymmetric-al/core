import type { UserRole } from "@asym/database/types";

export const MISSIONARY_ALLOWED_ROLES = [
  "missionary",
  "admin",
  "staff",
  "super_admin",
] as const satisfies readonly UserRole[];

const MISSIONARY_ALLOWED_ROLE_SET: ReadonlySet<UserRole> = new Set(
  MISSIONARY_ALLOWED_ROLES,
);

export function canAccessMissionaryApp(role: UserRole | null) {
  if (!role) {
    return false;
  }

  return MISSIONARY_ALLOWED_ROLE_SET.has(role);
}
