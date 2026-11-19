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
  /**
   * The tenant-administrator flag (plan 5.1); only ever `true` on a staff
   * row. Absent means `false`: a snapshot built without it grants no
   * administration.
   */
  isTenantAdmin?: boolean;
}

/**
 * The membership rows a role check judges. Authority is a live membership
 * and nothing else (plan 5.1, AL-2675): there is no profile role here, and
 * none is consulted anywhere. A request's context holds exactly one row, the
 * assignment the resolver selected.
 */
export interface RoleSnapshot {
  memberships: readonly AuthMembership[];
}

function liveMemberships(snapshot: RoleSnapshot, role: MembershipRole) {
  return snapshot.memberships.filter(
    (membership) => membership.isActive && membership.role === role,
  );
}

/**
 * Whether a live membership of `roleClass` in `tenantId` is among
 * `memberships` (AL-2675). Pure, so runtimes without a request scope can use
 * it; `@asym/auth/context` wraps it for a context.
 */
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

/** Whether the live staff row of `tenantId` carries the tenant-administrator flag (AL-2675). */
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

/**
 * Whether the snapshot's membership grants a role name:
 * - `admin`: a live staff membership that carries the tenant-administrator
 *   flag. A staff membership without it is not an administrator.
 * - `staff`: any live staff membership, flagged or not.
 * - `donor`, `missionary`: a live membership of that class.
 * - `super_admin` and every other name: never. Platform operators are not a
 *   membership role; WP2c gives them their own list.
 */
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

/**
 * The primary role name of a snapshot, for display and routing: `admin` for a
 * flagged staff membership, then `staff`, `missionary`, `donor`. `null` when
 * no membership is live.
 */
export function derivePrimaryRole(snapshot: RoleSnapshot): UserRole | null {
  if (hasRole(snapshot, "admin")) return "admin";
  if (hasRole(snapshot, "staff")) return "staff";
  if (hasRole(snapshot, "missionary")) return "missionary";
  if (hasRole(snapshot, "donor")) return "donor";
  return null;
}
