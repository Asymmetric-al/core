export {
  buildContributionActionAvailability,
  type ContributionActionAvailability,
} from "./action-availability";
export { executeContributionAction } from "./actions";
export {
  assertCanDecideCorrectionRequest,
  canDecideCorrectionRequest,
  correctionRequiresApproval,
  resolveCorrectionApprovalPolicy,
  type CorrectionApprovalOwnershipMode,
  type CorrectionApprovalPolicy,
} from "./approval-policy";
export {
  ensureCorrectionApprovalWorkflow,
  evaluatePendingApprovalSla,
  planApprovalNotifications,
  processCorrectionApprovalSla,
  recordCorrectionApprovalOutcome,
  resolveApprovalNotificationSettings,
  resolveApproverNotificationPreference,
  type ApprovalNotificationSettings,
  type ApprovalNotificationSettingsRow,
  type ApproverNotificationPreference,
  type PendingApprovalSlaState,
  type PlannedApprovalNotification,
} from "./approval-notifications";
export {
  buildContributionCrmPostState,
  CRM_CHILD_RECORDS_UNSUPPORTED_MESSAGE,
  type ContributionCrmPostState,
  type CrmDesignationRecordState,
  type CrmPostFailedScope,
  type CrmPostLinkInput,
} from "./crm-post-state";
export {
  createContributionCorrectionRequestInSupabase,
  decideContributionCorrectionRequest,
  loadContributionCorrectionRequest,
  loadCorrectionApprovalPolicy,
  type ContributionCorrectionRequest,
  type CorrectionRequestStatus,
} from "./correction-requests";
export { buildContributionDetail } from "./detail-read-model";
export {
  buildInlineContributionActions,
  INLINE_ACTION_CAPABILITY,
  isInlineContributionActionType,
  pickNextBestInlineContributionAction,
  type BuildInlineContributionActionsInput,
} from "./inline-actions";
export {
  getContributionNotificationPolicy,
  isContributionNotificationSuppressionReasonRequired,
  type ContributionNotificationDecision,
  type ContributionNotificationMode,
} from "./notifications/policy";
export {
  sendContributionCorrectionNotification,
  type ContributionCorrectionNotificationEvent,
  type ContributionCorrectionNotificationInput,
  type ContributionCorrectionNotificationLogResult,
  type ContributionCorrectionNotificationSettings,
  type ContributionCorrectionNotificationTaskInput,
  type ContributionCorrectionNotificationTemplate,
} from "./notifications/send";
export {
  logContributionNotificationEvent,
  sendContributionCorrectionNotificationFromSupabase,
} from "./notifications/store";
export {
  isContributionCorrectionTemplateFamily,
  isContributionCorrectionTemplateVariantForFamily,
  resolveContributionCorrectionTemplateVariant,
  validateContributionCorrectionTemplate,
  type ContributionCorrectionTemplateVariantRef,
} from "./notifications/templates";
export {
  applyContributionCorrection,
  loadReceiptDeliveryContext,
} from "./operations";
export {
  refundContributionThroughStripe,
  type RefundContributionThroughStripeInput,
} from "./refunds";
export {
  assertAllowedPaymentStateCorrectionStatus,
  isAllowedPaymentStateCorrectionStatus,
  type PaymentStateCorrectionStatus,
} from "./payment-status-allowlist";
export {
  assertContributionActionPermission,
  assertContributionPermission,
  hasContributionPermission,
  resolveContributionCapabilities,
  type ContributionCapability,
} from "./permissions";
export {
  getContributionActionPolicy,
  getContributionActionRiskLevel,
  isContributionConfirmationRequired,
  isContributionReasonRequired,
  isHighRiskContributionAction,
} from "./policy";
export {
  CRM_DESIGNATION_RETRY_UNSUPPORTED_NEXT_STEP,
  CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON,
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
  isContributionCrmPostingSupported,
  isContributionRouteCrmRetryScopeSupported,
  type ContributionCrmRetryScope,
} from "./crm-retry-support";
export {
  buildReceiptSnapshotContent,
  computeReceiptAffectedFields,
  evaluateReceiptDeliveryOptions,
  parseReceiptDeliverySelection,
  parseReceiptSnapshotContent,
  resolveConfirmedReceiptDelivery,
  resolveTenantReceiptDeliveryPolicy,
  validateReceiptDeliverySelection,
  type ReceiptDeliveryChoice,
  type ReceiptDeliveryDonorContext,
  type ReceiptDeliveryOption,
  type ReceiptDeliveryOutcome,
  type ReceiptDeliverySelection,
  type ReceiptSnapshotContentV1,
  type ReceiptSnapshotDesignationLineV1,
  type ReceiptSnapshotSourceDetail,
  type ResolvedReceiptDeliverySelection,
  type TenantReceiptDeliveryPolicy,
  type TenantReceiptDeliveryPolicyRow,
} from "./receipt-delivery";
export {
  assertReceiptSnapshotPdfCapability,
  buildUpdatedReceiptHtml,
  renderContributionReceiptSnapshotPdf,
  type RenderedContributionReceiptSnapshotPdf,
} from "./receipt-pdf";
export {
  buildContributionReceiptDeliveryView,
  projectContributionActionResultForViewer,
  projectContributionDetailForViewer,
  projectCorrectionRequestsForViewer,
  stripeReplayAvailability,
  type ContributionProviderProof,
  type ContributionReceiptDeliveryView,
  type ProjectContributionDetailOptions,
  type ViewerProjectedContributionDetail,
  type ViewerProjectedCorrectionRequest,
} from "./viewer-projection";

export type {
  ContributionActionDependencies,
  ContributionActionPolicy,
  ContributionActionResult,
  ContributionActionType,
  ContributionCorrectionRecordInput,
  ContributionOperationAuditEventInput,
  ContributionOperationOrganizationSettings,
  ContributionOperationUserPreferences,
  ContributionPermission,
  ContributionProviderOutcome,
  ContributionReasonMode,
  ContributionRiskLevel,
  ContributionSourceSurface,
  ExecuteContributionActionInput,
} from "./types";
export {
  CONTRIBUTION_ACTION_TYPES,
  CONTRIBUTION_SOURCE_SURFACES,
  isFailedProviderOutcomeStatus,
} from "./types";
export type {
  ContributionDetail,
  ContributionDetailDonationInput,
  ContributionDetailDonorInput,
  ContributionDetailInput,
} from "./detail-read-model";
