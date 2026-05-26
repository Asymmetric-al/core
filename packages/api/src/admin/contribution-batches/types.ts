import type {
  ContributionActionType,
  ContributionSourceSurface,
} from "../contribution-operations/types";

export type ContributionBatchRiskLevel = "low" | "high";
export type ContributionBatchExecutionMode = "immediate" | "background";
export type ContributionBatchStatus =
  | "running"
  | "complete"
  | "complete_with_issues"
  | "failed"
  | "cancelled";
export type ContributionBatchItemStatus = "succeeded" | "skipped" | "failed";

export interface ContributionBatchRecord {
  id: string;
  stagedGiftId: string | null;
  receiptStatus?: string | null;
}

export interface ContributionBatchAffectedRecord {
  contributionId: string;
  stagedGiftId: string | null;
  proposedAction: ContributionActionType;
}

export interface ContributionBatchSkippedRecord {
  contributionId: string;
  reason: string;
}

export interface ContributionBatchItemResult {
  contributionId?: string;
  donorName?: string;
  donorEmail?: string;
  amount?: number;
  currency?: string;
  action?: ContributionActionType;
  status: ContributionBatchItemStatus;
  skipReason?: string | null;
  failureReason?: string | null;
  auditEventId?: string | null;
  taskId?: string | null;
  timestamp?: string;
}

export interface ProcessContributionBatchInput {
  tenantId: string;
  actorProfileId: string | null;
  actionType: ContributionActionType;
  sourceSurface: ContributionSourceSurface;
  records: ContributionBatchRecord[];
  reason?: string | null;
  confirmationToken?: string | null;
  executeContributionAction: (input: {
    tenantId: string;
    actorProfileId: string | null;
    sourceSurface: ContributionSourceSurface;
    contributionId: string;
    stagedGiftId?: string | null;
    actionType: ContributionActionType;
    reason?: string | null;
    confirmationToken?: string | null;
    actorPermissions?: Array<"finance:manage_contributions">;
    payload: Record<string, unknown>;
  }) => Promise<{ auditEventId?: string | null; taskIds?: string[] }>;
  createFollowUpTask?: (input: {
    tenantId: string;
    actorProfileId: string | null;
    contributionId: string;
    actionType: ContributionActionType;
    reason: string;
  }) => Promise<string>;
}
