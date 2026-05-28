import { getBulkContributionActionPolicy } from "./action-catalog";

import type {
  ContributionBatchAffectedRecord,
  ContributionBatchExecutionMode,
  ContributionBatchRecord,
  ContributionBatchSkippedRecord,
} from "./types";
import type { ContributionActionType } from "../contribution-operations/types";

const IMMEDIATE_BATCH_LIMIT = 50;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asPayload(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function hasNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasPositiveFiniteNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function hasNonNegativeFiniteNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function getSkipReason(
  actionType: ContributionActionType,
  record: ContributionBatchRecord,
): string | null {
  const payload = asPayload(record.payload);

  if (
    (actionType === "resend_receipt" || actionType === "crm_repost") &&
    !record.stagedGiftId
  ) {
    return "Missing staged gift id.";
  }

  if (actionType === "refund" && !hasPositiveFiniteNumber(payload.amount)) {
    return "Missing payload.amount for refund.";
  }

  if (actionType === "donor_relink" && !hasNonEmptyString(payload.donorId)) {
    return "Missing payload.donorId for donor relink.";
  }

  if (
    actionType === "amount_correction" &&
    !hasNonNegativeFiniteNumber(payload.amount)
  ) {
    return "Missing payload.amount for amount correction.";
  }

  if (
    actionType === "designation_correction" &&
    !hasNonEmptyString(payload.fundId)
  ) {
    return "Missing payload.fundId for designation correction.";
  }

  if (actionType === "fund_correction" && !hasNonEmptyString(payload.fundId)) {
    return "Missing payload.fundId for fund correction.";
  }

  if (actionType === "allocation_correction") {
    if (!hasNonEmptyString(payload.fundId)) {
      return "Missing payload.fundId for allocation correction.";
    }
    if (!hasNonEmptyString(payload.missionaryId)) {
      return "Missing payload.missionaryId for allocation correction.";
    }
  }

  if (
    actionType === "payment_state_correction" &&
    !hasNonEmptyString(payload.status)
  ) {
    return "Missing payload.status for payment state correction.";
  }

  if (
    actionType === "stripe_replay" &&
    !hasNonEmptyString(payload.stripeEventId)
  ) {
    return "Missing payload.stripeEventId for Stripe replay.";
  }

  if (
    actionType === "receipt_correction" ||
    actionType === "statement_correction"
  ) {
    return `${actionType} is not supported for bulk batch execution.`;
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
      payload: asPayload(record.payload),
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
