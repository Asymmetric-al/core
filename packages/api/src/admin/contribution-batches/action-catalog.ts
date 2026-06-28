import { getContributionActionRiskLevel } from "../contribution-operations/policy";

import type { ContributionBatchRiskLevel } from "./types";
import type { ContributionActionType } from "../contribution-operations/types";

const PREVIEW_SKIPPABLE_LOW_RISK_ACTIONS = new Set<ContributionActionType>([
  "resend_receipt",
  "crm_repost",
]);

const BULK_RISK_OVERRIDES: Partial<
  Record<ContributionActionType, ContributionBatchRiskLevel>
> = {
  // CRM reposts are provider replays, but bulk reposting is recoverable and
  // preview-skippable in this workflow.
  crm_repost: "low",
  // Allocation corrections are medium-risk one at a time, but bulk allocation
  // edits can reassign financial ownership across many contributions.
  allocation_correction: "high",
};

export function getBulkContributionActionRiskLevel(
  actionType: ContributionActionType,
): ContributionBatchRiskLevel {
  const override = BULK_RISK_OVERRIDES[actionType];
  if (override) {
    return override;
  }

  return getContributionActionRiskLevel(actionType) === "low" ? "low" : "high";
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
