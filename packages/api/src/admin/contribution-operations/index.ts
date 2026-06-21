export {
  buildContributionActionAvailability,
  type ContributionActionAvailability,
} from "./action-availability";
export { executeContributionAction } from "./actions";
export {
  assertCanDecideCorrectionRequest,
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
export { applyContributionCorrection } from "./operations";
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
  computeReceiptAffectedFields,
  evaluateReceiptDeliveryOptions,
  parseReceiptDeliverySelection,
  resolveConfirmedReceiptDelivery,
  resolveTenantReceiptDeliveryPolicy,
  validateReceiptDeliverySelection,
  type ReceiptDeliveryChoice,
  type ReceiptDeliveryDonorContext,
  type ReceiptDeliveryOption,
  type ReceiptDeliveryOutcome,
  type ReceiptDeliverySelection,
  type TenantReceiptDeliveryPolicy,
  type TenantReceiptDeliveryPolicyRow,
} from "./receipt-delivery";
export {
  projectContributionDetailForViewer,
  stripeReplayAvailability,
  type ContributionProviderProof,
  type ViewerProjectedContributionDetail,
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
export type {
  ContributionDetail,
  ContributionDetailDonationInput,
  ContributionDetailDonorInput,
  ContributionDetailInput,
} from "./detail-read-model";
