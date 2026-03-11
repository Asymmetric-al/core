import type {
  MembershipRole,
  StaffSubrole,
  UserRole,
} from "@asym/database/types";

export type DashboardScope =
  | "donor_portal"
  | "missionary_dashboard"
  | "admin_dashboard";

export type StaffCapability =
  | "admin.dashboard.access"
  | "admin.crm.manage"
  | "admin.gifts.manage"
  | "admin.reports.view";

export interface AuthMembership {
  tenantId: string;
  role: MembershipRole;
  staffRole: StaffSubrole | null;
  isActive: boolean;
}

export interface RoleSnapshot {
  profileRole: UserRole | null;
  memberships: AuthMembership[];
}

const PUBLIC_COMPATIBILITY_ROLES = new Set<UserRole>(["donor", "missionary"]);

const BASE_STAFF_CAPABILITIES: readonly StaffCapability[] = [
  "admin.dashboard.access",
  "admin.crm.manage",
  "admin.gifts.manage",
  "admin.reports.view",
];

/**
 * Foundation policy:
 * - All staff subroles have full Mission Control admin access in MVP.
 * - This map intentionally keeps capability sets explicit so we can narrow by
 *   subrole later without changing call sites.
 */
export const STAFF_SUBROLE_CAPABILITIES: Readonly<
  Record<StaffSubrole, readonly StaffCapability[]>
> = {
  finance: BASE_STAFF_CAPABILITIES,
  mobilizer: BASE_STAFF_CAPABILITIES,
  development: BASE_STAFF_CAPABILITIES,
  hr: BASE_STAFF_CAPABILITIES,
  member_care: BASE_STAFF_CAPABILITIES,
};

function hasMembershipRole(snapshot: RoleSnapshot, role: MembershipRole) {
  return snapshot.memberships.some(
    (membership) => membership.isActive && membership.role === role,
  );
}

export function hasRole(snapshot: RoleSnapshot, role: UserRole): boolean {
  if (role === "super_admin") {
    return snapshot.profileRole === "super_admin";
  }

  if (role === "admin") {
    return (
      hasMembershipRole(snapshot, "staff") || hasRole(snapshot, "super_admin")
    );
  }

  if (role === "staff") {
    return (
      hasMembershipRole(snapshot, "staff") || hasRole(snapshot, "super_admin")
    );
  }

  if (role === "donor" || role === "missionary") {
    return (
      hasMembershipRole(snapshot, role) ||
      (snapshot.profileRole
        ? PUBLIC_COMPATIBILITY_ROLES.has(snapshot.profileRole) &&
          snapshot.profileRole === role
        : false) ||
      snapshot.profileRole === "super_admin"
    );
  }

  return snapshot.profileRole === role;
}

export function hasAnyRole(snapshot: RoleSnapshot, roles: readonly UserRole[]) {
  return roles.some((role) => hasRole(snapshot, role));
}

export function derivePrimaryRole(snapshot: RoleSnapshot): UserRole | null {
  if (snapshot.profileRole === "super_admin") return "super_admin";
  if (hasMembershipRole(snapshot, "staff")) return "staff";
  if (hasMembershipRole(snapshot, "missionary")) return "missionary";
  if (hasMembershipRole(snapshot, "donor")) return "donor";

  if (
    snapshot.profileRole &&
    PUBLIC_COMPATIBILITY_ROLES.has(snapshot.profileRole)
  ) {
    return snapshot.profileRole;
  }

  return null;
}

export function hasStaffSubrole(
  snapshot: RoleSnapshot,
  staffRole: StaffSubrole,
) {
  if (snapshot.profileRole === "super_admin") {
    return true;
  }

  return snapshot.memberships.some(
    (membership) =>
      membership.isActive &&
      membership.role === "staff" &&
      membership.staffRole === staffRole,
  );
}

export function canAccessDashboard(
  snapshot: RoleSnapshot,
  scope: DashboardScope,
) {
  if (hasRole(snapshot, "super_admin")) return true;

  if (scope === "admin_dashboard") {
    return hasRole(snapshot, "staff") || hasRole(snapshot, "admin");
  }

  if (scope === "missionary_dashboard") {
    return hasRole(snapshot, "missionary");
  }

  return hasRole(snapshot, "donor");
}
