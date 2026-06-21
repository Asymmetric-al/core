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

function hasActiveStaffMembership(auth: AuthenticatedContext): boolean {
  return auth.memberships.some(
    (membership) =>
      membership.isActive &&
      membership.tenantId === auth.tenantId &&
      membership.role === "staff",
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
  options: { mode?: "direct" | "request" } = {},
): void {
  const requiredCapabilities = requiredCapabilitiesForAction(
    actionType,
    options,
  );
  const actorCapabilities = resolveContributionCapabilities(auth);

  if (
    requiredCapabilities.some((capability) =>
      actorCapabilities.includes(capability),
    )
  ) {
    return;
  }

  throw new ApiHttpError(
    403,
    `Forbidden: requires ${formatRequiredCapabilities(requiredCapabilities)}`,
  );
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

const CONTRIBUTION_ACTION_REQUIRED_CAPABILITY: Record<
  ContributionActionType,
  ContributionCapability
> = {
  resend_receipt: "contributions.manage_receipts",
  approve_staged_gift: "contributions.apply_corrections",
  retry_staged_gift: "contributions.retry_crm_post",
  crm_repost: "contributions.retry_crm_post",
  metadata_update: "contributions.apply_corrections",
  refund: "contributions.run_refunds",
  stripe_replay: "contributions.use_provider_actions",
  donor_relink: "contributions.apply_corrections",
  amount_correction: "contributions.apply_corrections",
  designation_correction: "contributions.apply_corrections",
  fund_correction: "contributions.apply_corrections",
  allocation_correction: "contributions.apply_corrections",
  receipt_correction: "contributions.apply_corrections",
  statement_correction: "contributions.apply_corrections",
  payment_state_correction: "contributions.apply_corrections",
};

const INLINE_CORRECTION_REQUEST_ACTION_TYPES = new Set<ContributionActionType>([
  "amount_correction",
  "fund_correction",
]);

function requiredCapabilitiesForAction(
  actionType: ContributionActionType,
  options: { mode?: "direct" | "request" },
): ContributionCapability[] {
  const directCapability = CONTRIBUTION_ACTION_REQUIRED_CAPABILITY[actionType];

  if (
    options.mode === "request" &&
    INLINE_CORRECTION_REQUEST_ACTION_TYPES.has(actionType)
  ) {
    return [directCapability, "contributions.request_corrections"];
  }

  return [directCapability];
}

function formatRequiredCapabilities(
  capabilities: ContributionCapability[],
): string {
  return capabilities.join(" or ");
}

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

  if (hasActiveStaffMembership(auth)) {
    return [...DONOR_CARE_CAPABILITIES];
  }

  return [];
}
