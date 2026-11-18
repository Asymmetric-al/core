import type { ContributionActionType } from "./types";

/**
 * What each contribution action requires, as data: no request, no session,
 * nothing server-only. Client code (the CRM row actions, the viewer
 * availability projection) reads this module; the server checks in
 * `./permissions` read it too and add the caller's capabilities from the
 * request (AL-2675). Keep server-only imports out of this file, and keep it
 * off `@asym/auth/capabilities`, which only the auth context imports (#492
 * criterion 13): the filter below takes any capability name.
 */

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

export function formatRequiredCapabilities(
  capabilities: ContributionCapability[],
  conjunction: "and" | "or" = "or",
): string {
  return capabilities.join(` ${conjunction} `);
}

const CONTRIBUTION_CAPABILITIES: ReadonlySet<string> =
  new Set<ContributionCapability>([
    "contributions.view_detail",
    "contributions.request_corrections",
    "contributions.apply_corrections",
    "contributions.approve_corrections",
    "contributions.manage_receipts",
    "contributions.run_refunds",
    "contributions.retry_crm_post",
    "contributions.use_provider_actions",
    "contributions.manage_settings",
    "contributions.manage_table_preferences",
    "crm.gift_history.manage_view_defaults",
  ]);

export function isContributionCapability(
  capability: string,
): capability is ContributionCapability {
  return CONTRIBUTION_CAPABILITIES.has(capability);
}
