import { isHighRiskContributionAction } from "./policy";
import { ApiHttpError } from "../../shared/http-errors";

import type { ContributionActionType, ContributionPermission } from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";

function hasFinanceStaffMembership(auth: AuthenticatedContext): boolean {
  return auth.memberships.some(
    (membership) =>
      membership.isActive &&
      membership.tenantId === auth.tenantId &&
      membership.role === "staff" &&
      membership.staffRole === "finance",
  );
}

export function hasContributionPermission(
  auth: AuthenticatedContext,
  permission: ContributionPermission,
): boolean {
  if (permission !== "finance:manage_contributions") {
    return false;
  }

  return (
    auth.role === "super_admin" ||
    auth.role === "admin" ||
    auth.profileRole === "super_admin" ||
    auth.profileRole === "admin" ||
    hasFinanceStaffMembership(auth)
  );
}

export function assertContributionPermission(
  auth: AuthenticatedContext,
  permission: ContributionPermission,
): void {
  if (!hasContributionPermission(auth, permission)) {
    throw new ApiHttpError(403, `Forbidden: requires ${permission}`);
  }
}

export function assertContributionActionPermission(
  auth: AuthenticatedContext,
  actionType: ContributionActionType,
): void {
  if (!isHighRiskContributionAction(actionType)) {
    return;
  }

  assertContributionPermission(auth, "finance:manage_contributions");
}
