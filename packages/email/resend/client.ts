import { getReceivedEmail, listReceivedEmailAttachments } from "./inbound";
import { sendEmail, sendTestEmail } from "./send";
import { validateResendApiKey } from "./validate";
import { verifyResendWebhookSignature } from "./webhook";

import type {
  ResendClient,
  ResendValidationOptions,
  ResendValidationResult,
  SendEmailOptions,
  SendTestEmailOptions,
  VerifyWebhookOptions,
} from "./types";
import type { EmailSendResult } from "../types";

export function createResendClient(apiKey: string): ResendClient {
  return {
    validateKey: (
      options?: ResendValidationOptions,
    ): Promise<ResendValidationResult> =>
      validateResendApiKey(apiKey, options ?? {}),
    sendEmail: (options: SendEmailOptions): Promise<EmailSendResult> =>
      sendEmail(apiKey, options),
    sendTestEmail: (
      toEmail: string,
      fromEmail: string,
      fromName: string,
      options?: SendTestEmailOptions,
    ): Promise<EmailSendResult> =>
      sendTestEmail(apiKey, toEmail, fromEmail, fromName, options),
    verifyWebhookSignature: (options: Omit<VerifyWebhookOptions, "apiKey">) =>
      verifyResendWebhookSignature({
        ...options,
        apiKey,
      }),
    getReceivedEmail: (emailId: string) => getReceivedEmail(apiKey, emailId),
    listReceivedEmailAttachments: (emailId: string) =>
      listReceivedEmailAttachments(apiKey, emailId),
  };
}
