import { getBulkContributionActionPolicy } from "./action-catalog";

import type {
  ContributionBatchAffectedRecord,
  ContributionBatchExecutionMode,
  ContributionBatchRecord,
  ContributionBatchSkippedRecord,
} from "./types";
import type { ContributionActionType } from "../contribution-operations/types";

const IMMEDIATE_BATCH_LIMIT = 50;

function getSkipReason(
  actionType: ContributionActionType,
  record: ContributionBatchRecord,
): string | null {
  if (
    (actionType === "resend_receipt" || actionType === "crm_repost") &&
    !record.stagedGiftId
  ) {
    return "Missing staged gift id.";
  }

  return null;
}

export function createContributionBatchPreview(input: {
  actionType: ContributionActionType;
  records: ContributionBatchRecord[];
}) {
  const affectedRecords: ContributionBatchAffectedRecord[] = [];
  const skippedRecords: ContributionBatchSkippedRecord[] = [];

  for (const record of input.records) {
    const skipReason = getSkipReason(input.actionType, record);
    if (skipReason) {
      skippedRecords.push({
        contributionId: record.id,
        reason: skipReason,
      });
      continue;
    }

    affectedRecords.push({
      contributionId: record.id,
      stagedGiftId: record.stagedGiftId,
      proposedAction: input.actionType,
    });
  }

  return {
    actionType: input.actionType,
    affectedRecords,
    skippedRecords,
    totalCount: input.records.length,
  };
}

export function chooseContributionBatchExecutionMode(input: {
  actionType: ContributionActionType;
  selectedCount: number;
}): ContributionBatchExecutionMode {
  const policy = getBulkContributionActionPolicy(input.actionType);
  if (
    policy.backgroundRequired ||
    input.selectedCount > IMMEDIATE_BATCH_LIMIT
  ) {
    return "background";
  }

  return "immediate";
}
