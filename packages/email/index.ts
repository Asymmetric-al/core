/**
 * Email service exports.
 *
 * Central export point for the Resend integration.
 */

export {
  getFirstBlockingDeliverabilityWarning,
  toTestSendBlockingErrorCode,
} from "./deliverability-warnings";

export {
  validateResendApiKey,
  createResendValidationSnapshot,
  parseResendValidationSnapshot,
  isResendValidationSendReady,
  sendEmail,
  sendTestEmail,
  verifyResendWebhookSignature,
  getReceivedEmail,
  listReceivedEmailAttachments,
  createResendClient,
  type ResendValidationResult,
  type SendEmailOptions,
} from "./resend";

export type { ResendValidationSnapshot, TestSendEmailResponse } from "./types";

export {
  EMAIL_BUILDER_KINDS,
  EMPTY_REACT_EMAIL_DESIGN,
  createEmailDesignEnvelope,
  isEmailBuilderKind,
  isEmailDesignEnvelope,
  isReactEmailDesignJSON,
  normalizeEmailBuilderKind,
  type EmailBuilderKind,
  type EmailDesignEnvelope,
  type EmailStudioEditorHandle,
  type EmailStudioExportOptions,
  type EmailStudioExportResult,
  type EmailStudioTemplateStatus,
  type ReactEmailDesignJSON,
} from "./email-builder-types";

export {
  DEFAULT_MERGE_TAG_REGISTRY,
  getMergeTagDefinition,
  getMergeTagDefinitions,
  getMergeTagSamples,
  toLegacyUnlayerMergeTags,
  type MergeTagCategory,
  type MergeTagDefinition,
  type MergeTagRegistry,
  type MergeTagValueType,
} from "./merge-tags";

export {
  parseMergeTags,
  renderMergeTags,
  renderTemplateForRecipient,
  validateMergeTags,
  type MergeTagValidation,
  type MergeTagValidationOptions,
  type RenderMergeTagsOptions,
  type RenderedTemplate,
} from "./merge-tag-render";

export {
  RESEND_API_BASE,
  RESEND_ENDPOINTS,
  RESEND_REQUIRED_PERMISSIONS,
  RESEND_OPTIONAL_PERMISSIONS,
  RESEND_ERROR_CODES,
  HTTP_STATUS,
  RETRY_CONFIG,
  RATE_LIMIT_CONFIG,
  DELIVERABILITY_HELP_URLS,
  type ResendErrorCode,
  type HttpStatusCode,
} from "./constants";
