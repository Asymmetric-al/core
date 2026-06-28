import type { CorrectionApprovalPolicy } from "./approval-policy";
import type { ReceiptDeliveryOutcome } from "./receipt-delivery";

export const CONTRIBUTION_ACTION_TYPES = [
  "resend_receipt",
  "approve_staged_gift",
  "retry_staged_gift",
  "crm_repost",
  "metadata_update",
  "refund",
  "donor_relink",
  "amount_correction",
  "designation_correction",
  "fund_correction",
  "allocation_correction",
  "receipt_correction",
  "statement_correction",
  "payment_state_correction",
  "stripe_replay",
] as const;

export type ContributionActionType = (typeof CONTRIBUTION_ACTION_TYPES)[number];

export const CONTRIBUTION_SOURCE_SURFACES = [
  "contribution_hub",
  "donor_crm_record",
  "automation",
  "bulk_action",
  "api",
] as const;

export type ContributionSourceSurface =
  (typeof CONTRIBUTION_SOURCE_SURFACES)[number];

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
  status?: "pending" | "applied" | "failed" | "voided";
  reason: string;
  beforeSummary?: Record<string, unknown> | null;
  afterSummary?: Record<string, unknown> | null;
  providerOutcome?: ContributionProviderOutcome | null;
}

export interface ContributionActionResult<TContribution = unknown> {
  canonicalContribution: TContribution;
  auditEventId: string;
  correctionId?: string | null;
  /** Pending correction request id when approval policy gated the action. */
  correctionRequestId?: string | null;
  /** Whether the correction applied immediately or awaits approval. */
  approvalStatus?: "applied" | "pending_approval";
  /** Adjustment record id when the action applied an adjustment (ADR-CD-004). */
  adjustmentId?: string | null;
  /** Updated receipt delivery outcome for receipt-affecting corrections. */
  receiptOutcome?: ReceiptDeliveryOutcome | null;
  /** True when an idempotent retry returned the previously applied adjustment. */
  idempotentReplay?: boolean;
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
    contributionId: string;
    stagedGiftId: string;
  }) => Promise<{ status: string; sendLogId?: string | null }>;
  approveStagedGift?: (input: {
    tenantId: string;
    contributionId: string;
    stagedGiftId: string;
    actorProfileId: string | null;
    note?: string | null;
  }) => Promise<unknown>;
  retryStagedGift?: (input: {
    tenantId: string;
    contributionId: string;
    stagedGiftId: string;
    actorProfileId: string | null;
    note?: string | null;
  }) => Promise<unknown>;
  /**
   * Retries posting one designation child record (ADR-CD-012). Optional —
   * when the CRM adapter cannot post child records this stays undefined and
   * the limitation is surfaced to staff instead of silently reposting.
   */
  retryDesignationPost?: (input: {
    tenantId: string;
    contributionId: string;
    stagedGiftId: string;
    allocationId: string;
    actorProfileId: string | null;
    note?: string | null;
  }) => Promise<unknown>;
  relinkDonor?: (input: {
    tenantId: string;
    contributionId: string;
    donorId: string;
    expectedRevision?: string | null;
    idempotencyKey: string;
  }) => Promise<{
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
  }>;
  applyCorrection?: (input: {
    tenantId: string;
    contributionId: string;
    actionType: ContributionActionType;
    payload: Record<string, unknown>;
    reason: string;
    actorProfileId: string | null;
    sourceSurface: ContributionSourceSurface;
    actorCapabilities?: string[];
    expectedRevision?: string | null;
    idempotencyKey?: string | null;
  }) => Promise<{
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    status?: "pending" | "applied" | "failed" | "voided";
    adjustmentId?: string | null;
    idempotentReplay?: boolean;
    receiptOutcome?: ReceiptDeliveryOutcome | null;
  }>;
  replayStripeEvent?: (input: {
    tenantId: string;
    contributionId: string;
    payload: Record<string, unknown>;
    expectedRevision?: string | null;
    idempotencyKey: string;
  }) => Promise<ContributionProviderOutcome>;
  resolveReplayStripeEventId?: (input: {
    tenantId: string;
    contributionId: string;
    payload: Record<string, unknown>;
  }) => Promise<string | null>;
  sendCorrectionNotification?: (input: {
    tenantId: string;
    actionType: ContributionActionType;
    contributionId: string;
    correctionId: string | null;
    auditEventId: string;
    actorProfileId: string | null;
    providerOutcome?: ContributionProviderOutcome | null;
    beforeSummary?: Record<string, unknown> | null;
    afterSummary?: Record<string, unknown> | null;
  }) => Promise<{
    decision: "sent" | "suppressed" | "blocked" | "failed" | "not_required";
    taskIds?: string[];
  }>;
  refundContribution?: (input: {
    tenantId: string;
    contributionId: string;
    amount: number;
    reason: string;
    confirmationToken: string;
    expectedRevision?: string | null;
    idempotencyKey: string;
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
  /** Persists a pending correction request (ADR-CD-005); returns its id. */
  createCorrectionRequest?: (input: {
    tenantId: string;
    contributionId: string;
    actionType: ContributionActionType;
    payload: Record<string, unknown>;
    reason: string;
    requestedByProfileId: string | null;
    sourceSurface: ContributionSourceSurface;
    expectedRevision?: string | null;
    idempotencyKey?: string | null;
    /** Requester's proposed updated receipt delivery action (ADR-CD-030). */
    receiptDeliveryProposal?: Record<string, unknown> | null;
  }) => Promise<string>;
  /**
   * Validates that an approved request can be applied and returns the
   * persisted payload/reason. The implementation must verify tenant,
   * contribution, action type, approved status, ownership policy, and payload
   * consistency before the executor bypasses request creation.
   */
  validateApprovedCorrectionRequest?: (input: {
    tenantId: string;
    contributionId: string;
    actionType: ContributionActionType;
    approvedRequestId: string;
    actorProfileId: string | null;
    actorCapabilities?: string[];
    expectedRevision?: string | null;
    requestedPayload: Record<string, unknown>;
  }) => Promise<{
    payload: Record<string, unknown>;
    reason?: string | null;
  }>;
}

export interface ExecuteContributionActionInput<TContribution = unknown> {
  tenantId: string;
  actorProfileId: string | null;
  actorPermissions: ContributionPermission[];
  /** Granular backend capabilities for the actor (ADR-CD-024). */
  actorCapabilities?: string[];
  /**
   * Tenant correction approval policy (ADR-CD-005 / ADR-CD-025). When
   * omitted, the conservative default (separation of duties, no
   * suppression) applies and high-risk corrections create requests.
   */
  approvalPolicy?: CorrectionApprovalPolicy;
  /**
   * Set when an approver applies a previously approved correction request;
   * bypasses request creation but never audit, reasons, or idempotency.
   */
  approvedRequestId?: string | null;
  sourceSurface: ContributionSourceSurface;
  contributionId: string;
  stagedGiftId?: string | null;
  actionType: ContributionActionType;
  reason?: string | null;
  confirmationToken?: string | null;
  /**
   * Optimistic-concurrency token from the detail payload (`detail.revision`).
   * Stale saves are rejected server-side with a recovery path (ADR-CD-022).
   */
  expectedRevision?: string | null;
  /** Caller idempotency key so retried saves cannot double-apply. */
  idempotencyKey?: string | null;
  payload?: Record<string, unknown>;
  organizationSettings?: ContributionOperationOrganizationSettings;
  userPreferences?: ContributionOperationUserPreferences;
  dependencies?: ContributionActionDependencies<TContribution>;
}
