import { isHighRiskContributionAction } from "./policy";
import {
  CONTRIBUTION_ACTION_TYPES,
  type ContributionActionType,
} from "./types";
import { ApiHttpError } from "../../shared/api-http-error";

/**
 * Tenant-configurable correction approval policy (ADR-CD-005 / ADR-CD-025).
 *
 * Externally visible (high-risk) corrections require approval by default.
 * Super admins may suppress individual gates, but stronger approval
 * categories stay gated regardless of suppression or relaxed ownership, and
 * suppression never bypasses audit, reasons, concurrency, or idempotency.
 */

export type CorrectionApprovalOwnershipMode =
  | "no_approval_required"
  | "one_approver"
  | "separation_of_duties";

export interface CorrectionApprovalPolicy {
  ownershipMode: CorrectionApprovalOwnershipMode;
  /** Action types whose approval gate the tenant explicitly suppressed. */
  suppressedGates: ContributionActionType[];
  /** Action types that always require approval, even when suppressed. */
  strongerApprovalCategories: ContributionActionType[];
  /** Hours before a pending request reminds eligible approvers (#262). */
  reminderHours: number;
  /** Hours before a pending request escalates; null disables escalation. */
  escalationHours: number | null;
}

export interface CorrectionApprovalPolicyRow {
  ownership_mode?: string | null;
  suppressed_gates?: string[] | null;
  stronger_approval_categories?: string[] | null;
  reminder_hours?: number | null;
  escalation_hours?: number | null;
}

const OWNERSHIP_MODES: CorrectionApprovalOwnershipMode[] = [
  "no_approval_required",
  "one_approver",
  "separation_of_duties",
];
const CONTRIBUTION_ACTION_TYPE_SET = new Set<string>(CONTRIBUTION_ACTION_TYPES);

function normalizeActionTypes(
  values: string[] | null | undefined,
): ContributionActionType[] {
  return (values ?? []).filter((value): value is ContributionActionType =>
    CONTRIBUTION_ACTION_TYPE_SET.has(value),
  );
}

export function resolveCorrectionApprovalPolicy(
  row: CorrectionApprovalPolicyRow | null | undefined,
): CorrectionApprovalPolicy {
  const ownershipMode = OWNERSHIP_MODES.includes(
    row?.ownership_mode as CorrectionApprovalOwnershipMode,
  )
    ? (row?.ownership_mode as CorrectionApprovalOwnershipMode)
    : "separation_of_duties";

  return {
    ownershipMode,
    suppressedGates: normalizeActionTypes(row?.suppressed_gates),
    strongerApprovalCategories: normalizeActionTypes(
      row?.stronger_approval_categories,
    ),
    reminderHours: row?.reminder_hours ?? 24,
    escalationHours: row?.escalation_hours ?? null,
  };
}

/**
 * Whether a correction must go through a correction request instead of
 * applying immediately. Server-side enforcement; UI state is advisory only.
 */
export function correctionRequiresApproval(input: {
  actionType: ContributionActionType;
  policy: CorrectionApprovalPolicy;
}): boolean {
  const { actionType, policy } = input;

  if (policy.strongerApprovalCategories.includes(actionType)) {
    return true;
  }

  if (!isHighRiskContributionAction(actionType)) {
    return false;
  }

  if (policy.ownershipMode === "no_approval_required") {
    return false;
  }

  return !policy.suppressedGates.includes(actionType);
}

/**
 * Server-side approver check (ADR-CD-025). Separation of duties means the
 * requester can never approve or reject their own high-risk correction.
 */
export function assertCanDecideCorrectionRequest(input: {
  policy: CorrectionApprovalPolicy;
  request: { requestedByProfileId: string | null };
  deciderProfileId: string | null;
  deciderCapabilities: string[];
}): void {
  if (
    !input.deciderCapabilities.includes("contributions.approve_corrections")
  ) {
    throw new ApiHttpError(
      403,
      "Forbidden: requires contributions.approve_corrections",
    );
  }

  if (
    input.policy.ownershipMode === "separation_of_duties" &&
    input.request.requestedByProfileId !== null &&
    input.deciderProfileId !== null &&
    input.request.requestedByProfileId === input.deciderProfileId
  ) {
    throw new ApiHttpError(
      403,
      "You cannot approve or reject your own correction request. Another approver must decide it.",
    );
  }
}

/**
 * Non-throwing mirror of {@link assertCanDecideCorrectionRequest} for viewer
 * projections (#263). Must stay in behavioral parity with the assertion —
 * enforced by a unit test — so what the UI shows never diverges from what the
 * decision endpoint enforces.
 */
export function canDecideCorrectionRequest(input: {
  policy: CorrectionApprovalPolicy;
  request: { requestedByProfileId: string | null };
  deciderProfileId: string | null;
  deciderCapabilities: string[];
}): boolean {
  if (
    !input.deciderCapabilities.includes("contributions.approve_corrections")
  ) {
    return false;
  }

  const decidesOwnRequest =
    input.policy.ownershipMode === "separation_of_duties" &&
    input.request.requestedByProfileId !== null &&
    input.deciderProfileId !== null &&
    input.request.requestedByProfileId === input.deciderProfileId;

  return !decidesOwnRequest;
}
