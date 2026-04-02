/**
 * Email service exports.
 *
 * Central export point for the Resend integration.
 */

export {
  validateResendApiKey,
  createResendValidationSnapshot,
  parseResendValidationSnapshot,
  getFirstBlockingDeliverabilityWarning,
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
