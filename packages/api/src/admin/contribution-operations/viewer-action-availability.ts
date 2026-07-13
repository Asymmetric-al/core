import { correctionRequiresApproval } from "./approval-policy";
import { getContributionActionRiskLevel } from "./policy";

import type { ContributionActionAvailability } from "./action-availability";
import type { CorrectionApprovalPolicy } from "./approval-policy";
import type { ContributionCapability } from "./permissions";
import type {
  CrmGiftInlineActionEntry,
  CrmGiftInlineActionType,
} from "@asym/database/types";

/**
 * Viewer-scoped availability derivation shared by CRM inline actions and the
 * contribution detail contract (issue #270).
 *
 * Both surfaces must offer the same operations with identical availability,
 * blocked reasons, and next steps — parity by construction, not parallel
 * maintenance. Every piece that depends on the viewer or tenant policy
 * (correction request entries, provider replay, capability gating) lives
 * here so `buildInlineContributionActions` and
 * `projectContributionDetailForViewer` derive from one implementation.
 */

/** Capability a viewer needs before an operation is surfaced (ADR-CD-024). */
export const CONTRIBUTION_OPERATION_CAPABILITY: Record<
  CrmGiftInlineActionType,
  ContributionCapability
> = {
  amount_correction: "contributions.request_corrections",
  fund_correction: "contributions.request_corrections",
  resend_receipt: "contributions.manage_receipts",
  approve_staged_gift: "contributions.apply_corrections",
  retry_staged_gift: "contributions.retry_crm_post",
  refund: "contributions.run_refunds",
  stripe_replay: "contributions.use_provider_actions",
};

const REQUEST_CAPABILITY: ContributionCapability =
  "contributions.request_corrections";

const CORRECTION_REQUEST_ACTION_TYPES = [
  "amount_correction",
  "fund_correction",
] as const;

type CorrectionRequestActionType =
  (typeof CORRECTION_REQUEST_ACTION_TYPES)[number];

/**
 * Operations a request-capable viewer may submit as approval requests. These
 * must match the executor's approval-request path (isApprovalRequestAction:
 * refund + corrections, including provider replay). Request capability only
 * qualifies while the tenant policy requires approval; otherwise the direct
 * operation capability remains required.
 */
const APPROVAL_REQUEST_ACTION_TYPES = new Set<CrmGiftInlineActionType>([
  "amount_correction",
  "fund_correction",
  "refund",
  "stripe_replay",
]);

export function isCorrectionRequestActionType(
  actionType: string,
): actionType is CorrectionRequestActionType {
  return (CORRECTION_REQUEST_ACTION_TYPES as readonly string[]).includes(
    actionType,
  );
}

/** Narrow to operations the shared capability map governs. */
export function isContributionOperationActionType(
  actionType: string,
): actionType is CrmGiftInlineActionType {
  return actionType in CONTRIBUTION_OPERATION_CAPABILITY;
}

/** Provider payment proof drives replay availability (ADR-CD-015). */
export function stripeReplayAvailability(
  paymentIntentId: string | null,
  chargeId: string | null,
): ContributionActionAvailability {
  if (!paymentIntentId && !chargeId) {
    return {
      actionType: "stripe_replay",
      available: false,
      blockedReason: "This gift has no provider payment events to replay.",
      nextStep:
        "Webhook replay applies to gifts processed through the payment provider.",
      riskLevel: "high",
    };
  }

  return {
    actionType: "stripe_replay",
    available: true,
    blockedReason: null,
    nextStep: null,
    riskLevel: "high",
  };
}

/**
 * Correction operations surface as adjustment-record requests over the
 * original donation truth, so they have no state precondition; approval
 * policy gates the apply step server-side (ADR-CD-004 / ADR-CD-005). When
 * the tenant policy lets corrections apply directly, the request affordance
 * is omitted because a request-only submission would be rejected by the
 * executor.
 */
export function buildCorrectionRequestAvailability(
  approvalPolicy: CorrectionApprovalPolicy,
): CrmGiftInlineActionEntry[] {
  return CORRECTION_REQUEST_ACTION_TYPES.filter((actionType) =>
    correctionRequiresApproval({ actionType, policy: approvalPolicy }),
  ).map((actionType) => ({
    actionType,
    available: true,
    blockedReason: null,
    nextStep: null,
    riskLevel: getContributionActionRiskLevel(actionType),
  }));
}

/**
 * Capabilities that let a viewer act on an operation: the direct capability
 * always qualifies; request capability also qualifies when tenant policy
 * routes the operation through approval (ADR-CD-024 / ADR-CD-025).
 */
export function requiredCapabilitiesForContributionOperation(
  actionType: CrmGiftInlineActionType,
  approvalPolicy: CorrectionApprovalPolicy,
): ContributionCapability[] {
  const directCapability = CONTRIBUTION_OPERATION_CAPABILITY[actionType];
  const canRequestApproval =
    APPROVAL_REQUEST_ACTION_TYPES.has(actionType) &&
    correctionRequiresApproval({ actionType, policy: approvalPolicy });

  if (!canRequestApproval || directCapability === REQUEST_CAPABILITY) {
    return [directCapability];
  }

  return [directCapability, REQUEST_CAPABILITY];
}

export function viewerCanUseContributionOperation(input: {
  actionType: CrmGiftInlineActionType;
  approvalPolicy: CorrectionApprovalPolicy;
  viewerCapabilities: string[];
}): boolean {
  const requiredCapabilities = requiredCapabilitiesForContributionOperation(
    input.actionType,
    input.approvalPolicy,
  );

  return requiredCapabilities.some((capability) =>
    input.viewerCapabilities.includes(capability),
  );
}
