import { ApiHttpError } from "../../shared/api-http-error";

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
  const requiredCapabilities = requiredCapabilitiesForContributionAction(
    actionType,
    options,
  );
  const actorCapabilities = resolveContributionCapabilities(auth);
  const requiresEveryCapability =
    isProviderGranularContributionAction(actionType) &&
    options.mode === "request";
  const hasRequiredCapabilities = requiresEveryCapability
    ? requiredCapabilities.every((capability) =>
        actorCapabilities.includes(capability),
      )
    : requiredCapabilities.some((capability) =>
        actorCapabilities.includes(capability),
      );

  if (hasRequiredCapabilities) {
    return;
  }

  throw new ApiHttpError(
    403,
    `Forbidden: requires ${formatRequiredCapabilities(
      requiredCapabilities,
      requiresEveryCapability ? "and" : "or",
    )}`,
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

export const REQUEST_CORRECTION_CAPABILITY: ContributionCapability =
  "contributions.request_corrections";

export const APPROVE_CORRECTION_CAPABILITY: ContributionCapability =
  "contributions.approve_corrections";

interface ContributionActionPolicy {
  /** Granular capability that authorizes executing the action directly. */
  directCapability: ContributionCapability;
  /** Whether tenant approval policy may route it through a correction request. */
  approvalRequestable: boolean;
  /**
   * Provider-touching actions are granted only by their granular capability
   * (never the legacy manage permission), and in request mode the requester
   * must hold the request capability in addition — not instead.
   */
  providerGranular: boolean;
}

/**
 * Single authority for what every contribution action requires (ADR-CD-024).
 * Adding an action type forces a decision on all three properties here; the
 * route gate, the executor, and the viewer availability projection all
 * derive from this table.
 */
const CONTRIBUTION_ACTION_POLICY: Record<
  ContributionActionType,
  ContributionActionPolicy
> = {
  resend_receipt: {
    directCapability: "contributions.manage_receipts",
    approvalRequestable: false,
    providerGranular: false,
  },
  approve_staged_gift: {
    directCapability: "contributions.apply_corrections",
    approvalRequestable: false,
    providerGranular: false,
  },
  retry_staged_gift: {
    directCapability: "contributions.retry_crm_post",
    approvalRequestable: false,
    providerGranular: false,
  },
  crm_repost: {
    directCapability: "contributions.retry_crm_post",
    approvalRequestable: false,
    providerGranular: false,
  },
  metadata_update: {
    directCapability: "contributions.apply_corrections",
    approvalRequestable: false,
    providerGranular: false,
  },
  refund: {
    directCapability: "contributions.run_refunds",
    approvalRequestable: true,
    providerGranular: true,
  },
  stripe_replay: {
    directCapability: "contributions.use_provider_actions",
    approvalRequestable: true,
    providerGranular: true,
  },
  donor_relink: {
    directCapability: "contributions.apply_corrections",
    approvalRequestable: true,
    providerGranular: false,
  },
  amount_correction: {
    directCapability: "contributions.apply_corrections",
    approvalRequestable: true,
    providerGranular: false,
  },
  designation_correction: {
    directCapability: "contributions.apply_corrections",
    approvalRequestable: true,
    providerGranular: false,
  },
  fund_correction: {
    directCapability: "contributions.apply_corrections",
    approvalRequestable: true,
    providerGranular: false,
  },
  allocation_correction: {
    directCapability: "contributions.apply_corrections",
    approvalRequestable: true,
    providerGranular: false,
  },
  receipt_correction: {
    directCapability: "contributions.apply_corrections",
    approvalRequestable: true,
    providerGranular: false,
  },
  statement_correction: {
    directCapability: "contributions.apply_corrections",
    approvalRequestable: true,
    providerGranular: false,
  },
  payment_state_correction: {
    directCapability: "contributions.apply_corrections",
    approvalRequestable: true,
    providerGranular: false,
  },
};

export function directContributionCapabilityForAction(
  actionType: ContributionActionType,
): ContributionCapability {
  return CONTRIBUTION_ACTION_POLICY[actionType].directCapability;
}

export function isProviderGranularContributionAction(
  actionType: ContributionActionType,
): boolean {
  return CONTRIBUTION_ACTION_POLICY[actionType].providerGranular;
}

export function requiredCapabilitiesForContributionAction(
  actionType: ContributionActionType,
  options: { mode?: "direct" | "request" },
): ContributionCapability[] {
  const policy = CONTRIBUTION_ACTION_POLICY[actionType];

  if (options.mode === "request" && policy.approvalRequestable) {
    return [policy.directCapability, REQUEST_CORRECTION_CAPABILITY];
  }

  return [policy.directCapability];
}

function formatRequiredCapabilities(
  capabilities: ContributionCapability[],
  conjunction: "and" | "or" = "or",
): string {
  return capabilities.join(` ${conjunction} `);
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
