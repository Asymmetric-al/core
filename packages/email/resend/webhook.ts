import { RESEND_ERROR_CODES } from "../constants";
import { extractResendErrorDetails } from "./errors";
import { createResendClientInstance } from "./sdk";

import type { ResendWebhookEnvelope } from "../types";
import type { VerifyWebhookOptions } from "./types";

export function verifyResendWebhookSignature(options: VerifyWebhookOptions): {
  success: boolean;
  event?: ResendWebhookEnvelope;
  error?: string;
  errorCode?: string;
} {
  if (!options.secret) {
    return {
      success: false,
      error: "RESEND_WEBHOOK_SECRET is required",
      errorCode: RESEND_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
    };
  }

  const resolvedApiKey = options.apiKey || process.env.RESEND_API_KEY;
  if (!resolvedApiKey) {
    return {
      success: false,
      error: "RESEND_API_KEY is required for webhook verification",
      errorCode: RESEND_ERROR_CODES.INVALID_API_KEY,
    };
  }

  const resend = createResendClientInstance(resolvedApiKey);

  try {
    const verificationHeaders = {
      id: options.headers["svix-id"] ?? "",
      timestamp: options.headers["svix-timestamp"] ?? "",
      signature: options.headers["svix-signature"] ?? "",
    };

    const event = resend.webhooks.verify({
      payload: options.payload,
      headers: verificationHeaders,
      webhookSecret: options.secret,
    }) as unknown as ResendWebhookEnvelope;

    return {
      success: true,
      event,
    };
  } catch (error) {
    const details = extractResendErrorDetails(error);
    return {
      success: false,
      error: details.message || "Invalid webhook signature",
      errorCode: RESEND_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
    };
  }
}
