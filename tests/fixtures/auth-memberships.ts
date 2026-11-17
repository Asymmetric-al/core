/**
 * AL-2675 (WP2a): authority is the one membership a request acts under, so a
 * test that means "an administrator" or "a donor" builds that membership
 * rather than a profile role. `admin` is a staff row with the
 * tenant-administrator flag. `super_admin` gets the same row, because that is
 * what the AL-2675 backfill grants a super_admin profile in its tenant; being a
 * platform operator is not a membership and stays with WP2c. Unknown names
 * hold none.
 */
import type { AuthMembership } from "../../packages/auth/permissions";

export function membershipsForRole(
  role: string | null | undefined,
  tenantId: string,
): AuthMembership[] {
  switch (role) {
    case "admin":
    case "super_admin":
      return [
        {
          tenantId,
          role: "staff",
          staffRole: "development",
          isActive: true,
          isTenantAdmin: true,
        },
      ];
    case "staff":
      return [
        {
          tenantId,
          role: "staff",
          staffRole: "development",
          isActive: true,
          isTenantAdmin: false,
        },
      ];
    case "donor":
    case "missionary":
      return [
        {
          tenantId,
          role,
          staffRole: null,
          isActive: true,
          isTenantAdmin: false,
        },
      ];
    default:
      return [];
  }
}
