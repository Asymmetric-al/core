import {
  correctionRequiresApproval,
  resolveCorrectionApprovalPolicy,
} from "./approval-policy";
import { getContributionActionRiskLevel } from "./policy";
import { stripeReplayAvailability } from "./viewer-projection";

import type { ContributionActionAvailability } from "./action-availability";
import type { CorrectionApprovalPolicy } from "./approval-policy";
import type { ContributionCapability } from "./permissions";
import type { ContributionActionType } from "./types";
import type {
  CrmGiftInlineActionEntry,
  CrmGiftInlineActions,
  CrmGiftInlineActionType,
} from "@asym/database/types";

/**
 * Inline operation parity (issue #270, ADR-CD-033).
 *
 * CRM gift rows surface the same contribution-detail operations inline.
 * Entries reuse the shared availability derivation verbatim so blocked
 * reasons, next steps, and risk levels match contribution detail exactly,
 * then get filtered to what the viewer's capabilities allow (ADR-CD-024).
 */

/** Capability a viewer needs before an operation is surfaced inline. */
export const INLINE_ACTION_CAPABILITY: Record<
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

const INLINE_REQUEST_CAPABILITY: ContributionCapability =
  "contributions.request_corrections";

const INLINE_CORRECTION_REQUEST_ACTION_TYPES = new Set<CrmGiftInlineActionType>(
  ["amount_correction", "fund_correction"],
);

const INLINE_APPROVAL_REQUEST_ACTION_TYPES = new Set<CrmGiftInlineActionType>([
  "amount_correction",
  "fund_correction",
  "refund",
  "stripe_replay",
]);

/**
 * Only low-risk workflow actions are ever promoted to the row's single
 * next-best slot. High-risk operations (corrections, refunds, provider
 * replay) always stay behind the grouped menu and the operation shell.
 */
const NEXT_BEST_PRIORITY: CrmGiftInlineActionType[] = [
  "approve_staged_gift",
  "retry_staged_gift",
  "resend_receipt",
];

export function isInlineContributionActionType(
  actionType: string,
): actionType is CrmGiftInlineActionType {
  return actionType in INLINE_ACTION_CAPABILITY;
}

function correctionRequestEntry(
  actionType: "amount_correction" | "fund_correction",
): CrmGiftInlineActionEntry {
  // Corrections are adjustment-record requests over the original donation
  // truth, so they have no state precondition; approval policy gates the
  // apply step server-side (ADR-CD-004 / ADR-CD-005).
  return {
    actionType,
    available: true,
    blockedReason: null,
    nextStep: null,
    riskLevel: getContributionActionRiskLevel(actionType),
  };
}

function requiredCapabilitiesForInlineAction(
  actionType: CrmGiftInlineActionType,
  approvalPolicy: CorrectionApprovalPolicy,
): ContributionCapability[] {
  const directCapability = INLINE_ACTION_CAPABILITY[actionType];
  const canRequestApproval =
    INLINE_APPROVAL_REQUEST_ACTION_TYPES.has(actionType) &&
    correctionRequiresApproval({
      actionType: actionType as ContributionActionType,
      policy: approvalPolicy,
    });

  if (!canRequestApproval || directCapability === INLINE_REQUEST_CAPABILITY) {
    return [directCapability];
  }

  return [directCapability, INLINE_REQUEST_CAPABILITY];
}

export function pickNextBestInlineContributionAction(
  entries: CrmGiftInlineActionEntry[],
): CrmGiftInlineActionType | null {
  for (const actionType of NEXT_BEST_PRIORITY) {
    const entry = entries.find(
      (candidate) => candidate.actionType === actionType,
    );
    if (entry?.available) {
      return actionType;
    }
  }

  return null;
}

export interface BuildInlineContributionActionsInput {
  /** Shared state availability — the same derivation contribution detail uses. */
  availability: ContributionActionAvailability[];
  /** Provider payment proof drives replay availability (ADR-CD-015). */
  providerPaymentIntentId: string | null;
  providerChargeId?: string | null;
  /**
   * Tenant correction approval policy. When omitted, use the same conservative
   * default as the executor so request-only inline actions do not overpromise.
   */
  approvalPolicy?: CorrectionApprovalPolicy | null;
  viewerCapabilities: string[];
}

export function buildInlineContributionActions(
  input: BuildInlineContributionActionsInput,
): CrmGiftInlineActions {
  const workflowEntries = input.availability
    .filter(
      (
        entry,
      ): entry is ContributionActionAvailability & CrmGiftInlineActionEntry =>
        isInlineContributionActionType(entry.actionType) &&
        entry.actionType !== "stripe_replay",
    )
    .filter(
      (entry) => !INLINE_CORRECTION_REQUEST_ACTION_TYPES.has(entry.actionType),
    );
  const approvalPolicy =
    input.approvalPolicy ?? resolveCorrectionApprovalPolicy(null);
  const correctionRequestEntries = (
    ["amount_correction", "fund_correction"] as const
  )
    .filter((actionType) =>
      correctionRequiresApproval({ actionType, policy: approvalPolicy }),
    )
    .map(correctionRequestEntry);

  const allEntries: CrmGiftInlineActionEntry[] = [
    ...correctionRequestEntries,
    ...workflowEntries,
    {
      ...stripeReplayAvailability(
        input.providerPaymentIntentId,
        input.providerChargeId ?? null,
      ),
      actionType: "stripe_replay",
    },
  ];

  const entries = allEntries.filter((entry) => {
    const requiredCapabilities = requiredCapabilitiesForInlineAction(
      entry.actionType,
      approvalPolicy,
    );
    return requiredCapabilities.some((capability) =>
      input.viewerCapabilities.includes(capability),
    );
  });

  return {
    nextBestActionType: pickNextBestInlineContributionAction(entries),
    entries,
  };
}
