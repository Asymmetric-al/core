import type { UserRole } from "@asym/database/types";

const ADMIN_READ_ROLES = new Set<UserRole>(["admin", "staff", "super_admin"]);

export function hasAdminReadAccess(role: UserRole | null | undefined): boolean {
  if (!role) {
    return false;
  }

  return ADMIN_READ_ROLES.has(role);
}
