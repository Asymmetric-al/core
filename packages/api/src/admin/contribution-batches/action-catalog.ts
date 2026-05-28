import type { ContributionBatchRiskLevel } from "./types";
import type { ContributionActionType } from "../contribution-operations/types";

const PREVIEW_SKIPPABLE_LOW_RISK_ACTIONS = new Set<ContributionActionType>([
  "resend_receipt",
  "crm_repost",
]);

const HIGH_RISK_BULK_ACTIONS = new Set<ContributionActionType>([
  "refund",
  "donor_relink",
  "amount_correction",
  "designation_correction",
  "fund_correction",
  "allocation_correction",
  "payment_state_correction",
  "stripe_replay",
]);

export function getBulkContributionActionRiskLevel(
  actionType: ContributionActionType,
): ContributionBatchRiskLevel {
  return HIGH_RISK_BULK_ACTIONS.has(actionType) ? "high" : "low";
}

export function isBulkPreviewSkippable(
  actionType: ContributionActionType,
): boolean {
  return PREVIEW_SKIPPABLE_LOW_RISK_ACTIONS.has(actionType);
}

export function getBulkContributionActionPolicy(
  actionType: ContributionActionType,
) {
  const riskLevel = getBulkContributionActionRiskLevel(actionType);

  return {
    actionType,
    riskLevel,
    requiresConfirmation: true,
    requiresPreview: riskLevel === "high",
    backgroundRequired: riskLevel === "high",
    previewSkippable: isBulkPreviewSkippable(actionType),
  };
}
