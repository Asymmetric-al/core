import type {
  MembershipRole,
  StaffSubrole,
  UserRole,
} from "@asym/database/types";

export interface AuthMembership {
  tenantId: string;
  role: MembershipRole;
  staffRole: StaffSubrole | null;
  isActive: boolean;
  isTenantAdmin?: boolean;
}

export interface RoleSnapshot {
  memberships: readonly AuthMembership[];
}

function liveMemberships(snapshot: RoleSnapshot, role: MembershipRole) {
  return snapshot.memberships.filter(
    (membership) => membership.isActive && membership.role === role,
  );
}

export function hasMembershipClass(
  memberships: readonly AuthMembership[],
  tenantId: string | null,
  roleClass: MembershipRole,
): boolean {
  return memberships.some(
    (membership) =>
      membership.isActive &&
      membership.tenantId === tenantId &&
      membership.role === roleClass,
  );
}

export function hasTenantAdministratorMembership(
  memberships: readonly AuthMembership[],
  tenantId: string | null,
): boolean {
  return memberships.some(
    (membership) =>
      membership.isActive &&
      membership.tenantId === tenantId &&
      membership.role === "staff" &&
      membership.isTenantAdmin === true,
  );
}

export function hasRole(snapshot: RoleSnapshot, role: UserRole): boolean {
  if (role === "admin") {
    return liveMemberships(snapshot, "staff").some(
      (membership) => membership.isTenantAdmin === true,
    );
  }
  if (role === "staff" || role === "donor" || role === "missionary") {
    return liveMemberships(snapshot, role).length > 0;
  }
  return false;
}

export function hasAnyRole(snapshot: RoleSnapshot, roles: readonly UserRole[]) {
  return roles.some((role) => hasRole(snapshot, role));
}

export function derivePrimaryRole(snapshot: RoleSnapshot): UserRole | null {
  if (hasRole(snapshot, "admin")) return "admin";
  if (hasRole(snapshot, "staff")) return "staff";
  if (hasRole(snapshot, "missionary")) return "missionary";
  if (hasRole(snapshot, "donor")) return "donor";
  return null;
}
