import { correctionRequiresApproval } from "./approval-policy";
import {
  REQUEST_CORRECTION_CAPABILITY,
  directContributionCapabilityForAction,
  isProviderGranularContributionAction,
  requiredCapabilitiesForContributionAction,
} from "./permissions";
import { getContributionActionRiskLevel } from "./policy";

import type { ContributionActionAvailability } from "./action-availability";
import type { CorrectionApprovalPolicy } from "./approval-policy";
import type { ContributionCapability } from "./permissions";
import type {
  CrmGiftInlineActionEntry,
  CrmGiftInlineActionType,
} from "@asym/database/types";

/**
 * Viewer- and policy-scoped availability shared by CRM inline actions and the
 * contribution-detail contract. Keeping this derivation in one module makes
 * the two entry surfaces authorized-identical by construction (issue #270).
 */

export const CRM_INLINE_CONTRIBUTION_ACTION_TYPES = [
  "amount_correction",
  "fund_correction",
  "resend_receipt",
  "approve_staged_gift",
  "retry_staged_gift",
  "refund",
  "stripe_replay",
] as const satisfies readonly CrmGiftInlineActionType[];

/** Direct capability required when the operation does not create a request. */
export const CONTRIBUTION_OPERATION_CAPABILITY = Object.fromEntries(
  CRM_INLINE_CONTRIBUTION_ACTION_TYPES.map((actionType) => [
    actionType,
    directContributionCapabilityForAction(actionType),
  ]),
) as Record<CrmGiftInlineActionType, ContributionCapability>;

const CORRECTION_REQUEST_ACTION_TYPES = [
  "amount_correction",
  "fund_correction",
] as const;

type CorrectionRequestActionType =
  (typeof CORRECTION_REQUEST_ACTION_TYPES)[number];

export function isCorrectionRequestActionType(
  actionType: string,
): actionType is CorrectionRequestActionType {
  return (CORRECTION_REQUEST_ACTION_TYPES as readonly string[]).includes(
    actionType,
  );
}

export function isContributionOperationActionType(
  actionType: string,
): actionType is CrmGiftInlineActionType {
  return (CRM_INLINE_CONTRIBUTION_ACTION_TYPES as readonly string[]).includes(
    actionType,
  );
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

function correctionAvailabilityEntry(
  actionType: CorrectionRequestActionType,
): CrmGiftInlineActionEntry {
  return {
    actionType,
    available: true,
    blockedReason: null,
    nextStep: null,
    riskLevel: getContributionActionRiskLevel(actionType),
  };
}

/**
 * Correction operations surface over immutable donation truth. Which viewer
 * can use each entry depends on whether policy routes it through a request or
 * permits direct application; the state availability itself remains open.
 */
export function buildCorrectionActionAvailability(): CrmGiftInlineActionEntry[] {
  return CORRECTION_REQUEST_ACTION_TYPES.map(correctionAvailabilityEntry);
}

/** Request-routed correction entries under the supplied tenant policy. */
export function buildCorrectionRequestAvailability(
  approvalPolicy: CorrectionApprovalPolicy,
): CrmGiftInlineActionEntry[] {
  return CORRECTION_REQUEST_ACTION_TYPES.filter((actionType) =>
    correctionRequiresApproval({ actionType, policy: approvalPolicy }),
  ).map(correctionAvailabilityEntry);
}

export function requiredCapabilitiesForContributionOperation(
  actionType: CrmGiftInlineActionType,
  approvalPolicy: CorrectionApprovalPolicy,
): ContributionCapability[] {
  const mode = correctionRequiresApproval({
    actionType,
    policy: approvalPolicy,
  })
    ? "request"
    : "direct";

  return requiredCapabilitiesForContributionAction(actionType, { mode });
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
  const approvalRequired = correctionRequiresApproval({
    actionType: input.actionType,
    policy: input.approvalPolicy,
  });
  const executesAsApprovalRequest =
    approvalRequired &&
    requiredCapabilities.includes(REQUEST_CORRECTION_CAPABILITY);

  if (executesAsApprovalRequest) {
    // Provider-touching requests keep the stricter route gate: the requester
    // must hold both the direct capability and the request capability.
    if (isProviderGranularContributionAction(input.actionType)) {
      return requiredCapabilities.every((capability) =>
        input.viewerCapabilities.includes(capability),
      );
    }

    // Approval-gated corrections execute through the request path. Holding
    // only direct apply authority cannot create that request.
    return input.viewerCapabilities.includes(REQUEST_CORRECTION_CAPABILITY);
  }

  return requiredCapabilities.some((capability) =>
    input.viewerCapabilities.includes(capability),
  );
}
