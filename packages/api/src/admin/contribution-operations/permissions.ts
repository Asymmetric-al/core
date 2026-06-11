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

/**
 * Granular backend capabilities backing the staff-friendly roles
 * (ADR-CD-024). Server-side authority for every contribution action; the UI
 * never infers access from role names.
 */
export type ContributionCapability =
  | "contributions.view_detail"
  | "contributions.request_corrections"
  | "contributions.apply_corrections"
  | "contributions.approve_corrections"
  | "contributions.manage_receipts"
  | "contributions.run_refunds"
  | "contributions.retry_crm_post"
  | "contributions.use_provider_actions"
  | "contributions.manage_settings"
  | "contributions.manage_table_preferences"
  | "crm.gift_history.manage_view_defaults";

const DONOR_CARE_CAPABILITIES: ContributionCapability[] = [
  "contributions.view_detail",
  "contributions.request_corrections",
  "contributions.manage_table_preferences",
];

const FINANCE_STAFF_CAPABILITIES: ContributionCapability[] = [
  ...DONOR_CARE_CAPABILITIES,
  "contributions.apply_corrections",
  "contributions.manage_receipts",
  "contributions.retry_crm_post",
];

const FINANCE_APPROVER_CAPABILITIES: ContributionCapability[] = [
  ...FINANCE_STAFF_CAPABILITIES,
  "contributions.approve_corrections",
  "contributions.run_refunds",
  "contributions.use_provider_actions",
];

const SUPER_ADMIN_CAPABILITIES: ContributionCapability[] = [
  ...FINANCE_APPROVER_CAPABILITIES,
  "contributions.manage_settings",
  "crm.gift_history.manage_view_defaults",
];

export function resolveContributionCapabilities(
  auth: AuthenticatedContext,
): ContributionCapability[] {
  if (auth.role === "super_admin" || auth.profileRole === "super_admin") {
    return [...SUPER_ADMIN_CAPABILITIES];
  }

  if (auth.role === "admin" || auth.profileRole === "admin") {
    return [...FINANCE_APPROVER_CAPABILITIES];
  }

  if (hasFinanceStaffMembership(auth)) {
    return [...FINANCE_STAFF_CAPABILITIES];
  }

  return [...DONOR_CARE_CAPABILITIES];
}
