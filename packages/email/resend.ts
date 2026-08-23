/**
 * Resend adapter barrel.
 *
 * Deep modules live under `./resend/`. This file keeps `@asym/email/resend`
 * and existing `packages/email/resend` imports on a stable interface.
 */

export { createResendClient } from "./resend/client";
export { calculateResendRetryDelayMs } from "./resend/errors";
export {
  getReceivedEmail,
  listReceivedEmailAttachments,
} from "./resend/inbound";
export { sendEmail, sendTestEmail } from "./resend/send";
export {
  createResendValidationSnapshot,
  isResendValidationSendReady,
  parseResendValidationSnapshot,
  validateResendApiKey,
} from "./resend/validate";
export { verifyResendWebhookSignature } from "./resend/webhook";
export type {
  ResendClient,
  ResendValidationOptions,
  ResendValidationResult,
  SendEmailOptions,
  SendTestEmailOptions,
} from "./resend/types";
