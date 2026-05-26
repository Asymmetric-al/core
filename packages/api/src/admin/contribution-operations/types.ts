export type ContributionActionType =
  | "resend_receipt"
  | "approve_staged_gift"
  | "retry_staged_gift"
  | "crm_repost"
  | "metadata_update"
  | "refund"
  | "donor_relink"
  | "amount_correction"
  | "designation_correction"
  | "fund_correction"
  | "allocation_correction"
  | "receipt_correction"
  | "statement_correction"
  | "payment_state_correction"
  | "stripe_replay";

export type ContributionSourceSurface =
  | "contribution_hub"
  | "donor_crm_record"
  | "automation"
  | "bulk_action"
  | "api";

export type ContributionRiskLevel = "low" | "medium" | "high";

export type ContributionPermission = "finance:manage_contributions";

export type ContributionReasonMode = "optional" | "required";

export interface ContributionOperationOrganizationSettings {
  defaultReasonMode?: ContributionReasonMode;
  allowUserReasonPromptReduction?: boolean;
}

export interface ContributionOperationUserPreferences {
  reduceReasonPrompts?: boolean;
}

export interface ContributionActionPolicy {
  actionType: ContributionActionType;
  riskLevel: ContributionRiskLevel;
  requiresReason: boolean;
  requiresConfirmation: boolean;
  canSuppressReason: boolean;
  requiredPermission: ContributionPermission | null;
  nonSuppressibleReason: boolean;
}

export interface ContributionOperationAuditEventInput {
  tenantId: string;
  actorProfileId: string | null;
  contributionId: string;
  stagedGiftId?: string | null;
  donorId?: string | null;
  actionType: ContributionActionType;
  sourceSurface: ContributionSourceSurface;
  reason?: string | null;
  correctionId?: string | null;
  providerOutcome?: ContributionProviderOutcome | null;
  beforeSummary?: Record<string, unknown> | null;
  afterSummary?: Record<string, unknown> | null;
  downstreamEffects?: Record<string, unknown>;
}

export interface ContributionProviderOutcome {
  provider: "stripe" | "resend" | "twenty" | "platform";
  status: string;
  referenceId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  raw?: Record<string, unknown>;
}

export interface ContributionCorrectionRecordInput {
  tenantId: string;
  contributionId: string;
  stagedGiftId?: string | null;
  actorProfileId: string | null;
  sourceSurface: ContributionSourceSurface;
  correctionType: ContributionActionType;
  reason: string;
  beforeSummary?: Record<string, unknown> | null;
  afterSummary?: Record<string, unknown> | null;
  providerOutcome?: ContributionProviderOutcome | null;
}

export interface ContributionActionResult<TContribution = unknown> {
  canonicalContribution: TContribution;
  auditEventId: string;
  correctionId?: string | null;
  notification?: {
    decision: "sent" | "suppressed" | "blocked" | "failed" | "not_required";
    taskIds?: string[];
  };
  taskIds: string[];
  providerOutcome?: ContributionProviderOutcome | null;
}

export interface ContributionActionDependencies<TContribution = unknown> {
  sendReceipt?: (input: {
    tenantId: string;
    stagedGiftId: string;
  }) => Promise<{ status: string; sendLogId?: string | null }>;
  approveStagedGift?: (input: {
    tenantId: string;
    stagedGiftId: string;
    actorProfileId: string | null;
    note?: string | null;
  }) => Promise<unknown>;
  retryStagedGift?: (input: {
    tenantId: string;
    stagedGiftId: string;
    actorProfileId: string | null;
    note?: string | null;
  }) => Promise<unknown>;
  relinkDonor?: (input: {
    tenantId: string;
    contributionId: string;
    donorId: string;
  }) => Promise<{
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
  }>;
  refundContribution?: (input: {
    tenantId: string;
    contributionId: string;
    amount: number;
    reason: string;
  }) => Promise<ContributionProviderOutcome>;
  appendAuditEvent?: (
    input: ContributionOperationAuditEventInput,
  ) => Promise<string>;
  createCorrectionRecord?: (
    input: ContributionCorrectionRecordInput,
  ) => Promise<string>;
  loadContributionDetail?: (input: {
    tenantId: string;
    contributionId: string;
  }) => Promise<TContribution>;
}

export interface ExecuteContributionActionInput<TContribution = unknown> {
  tenantId: string;
  actorProfileId: string | null;
  actorPermissions: ContributionPermission[];
  sourceSurface: ContributionSourceSurface;
  contributionId: string;
  stagedGiftId?: string | null;
  actionType: ContributionActionType;
  reason?: string | null;
  confirmationToken?: string | null;
  payload?: Record<string, unknown>;
  organizationSettings?: ContributionOperationOrganizationSettings;
  userPreferences?: ContributionOperationUserPreferences;
  dependencies?: ContributionActionDependencies<TContribution>;
}
