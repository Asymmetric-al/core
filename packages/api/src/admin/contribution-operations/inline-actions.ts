import { resolveCorrectionApprovalPolicy } from "./approval-policy";
import { directContributionCapabilityForAction } from "./permissions";
import {
  buildCorrectionActionAvailability,
  CRM_INLINE_CONTRIBUTION_ACTION_TYPES,
  isCorrectionRequestActionType,
  stripeReplayAvailability,
  viewerCanUseContributionOperation,
} from "./viewer-action-availability";

import type { ContributionActionAvailability } from "./action-availability";
import type { CorrectionApprovalPolicy } from "./approval-policy";
import type { ContributionCapability } from "./permissions";
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
 * The viewer/policy-dependent pieces live in `viewer-action-availability`
 * and are shared with the detail viewer projection.
 */

/** Capability a viewer needs before an operation is surfaced inline. */
export const INLINE_ACTION_CAPABILITY: Record<
  CrmGiftInlineActionType,
  ContributionCapability
> = Object.fromEntries(
  CRM_INLINE_CONTRIBUTION_ACTION_TYPES.map((actionType) => [
    actionType,
    directContributionCapabilityForAction(actionType),
  ]),
) as Record<CrmGiftInlineActionType, ContributionCapability>;

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
  return (CRM_INLINE_CONTRIBUTION_ACTION_TYPES as readonly string[]).includes(
    actionType,
  );
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
  const approvalPolicy =
    input.approvalPolicy ?? resolveCorrectionApprovalPolicy(null);
  const workflowEntries = input.availability
    .filter(
      (
        entry,
      ): entry is ContributionActionAvailability & CrmGiftInlineActionEntry =>
        isInlineContributionActionType(entry.actionType) &&
        entry.actionType !== "stripe_replay",
    )
    .filter((entry) => !isCorrectionRequestActionType(entry.actionType));
  const correctionEntries = buildCorrectionActionAvailability();

  const allEntries: CrmGiftInlineActionEntry[] = [
    ...correctionEntries,
    ...workflowEntries,
    {
      ...stripeReplayAvailability(
        input.providerPaymentIntentId,
        input.providerChargeId ?? null,
      ),
      actionType: "stripe_replay",
    },
  ];

  const entries = allEntries.filter((entry) =>
    viewerCanUseContributionOperation({
      actionType: entry.actionType,
      approvalPolicy,
      viewerCapabilities: input.viewerCapabilities,
    }),
  );

  return {
    nextBestActionType: pickNextBestInlineContributionAction(entries),
    entries,
  };
}
