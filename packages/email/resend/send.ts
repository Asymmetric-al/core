import { RESEND_ERROR_CODES, RESEND_LIMITS, RETRY_CONFIG } from "../constants";
import {
  calculateResendRetryDelayMs,
  extractResendErrorDetails,
  extractRetryAfterFromThrown,
  extractRetryAfterSeconds,
  isRetryable,
  mapResendErrorCode,
  sleep,
} from "./errors";
import { createResendClientInstance } from "./sdk";

import type { EmailSendResult } from "../types";
import type {
  ResendErrorDetails,
  SendEmailOptions,
  SendTestEmailOptions,
} from "./types";

const DISPLAY_NAME_SPECIAL_CHARS = /[()<>[\]:;@\\,."]/;
const DISPLAY_NAME_CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/;

function formatAddress(email: string, name?: string): string {
  if (!name) {
    return email;
  }
  if (!DISPLAY_NAME_SPECIAL_CHARS.test(name)) {
    return `${name} <${email}>`;
  }
  const escaped = name.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  return `"${escaped}" <${email}>`;
}

function escapeHtmlValue(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeTagToken(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 256);
}

function buildTags(
  tags?: Array<{ name: string; value: string }>,
  customArgs?: Record<string, string>,
): Array<{ name: string; value: string }> | undefined {
  const normalized: Array<{ name: string; value: string }> = [];

  if (Array.isArray(tags)) {
    for (const tag of tags) {
      const name = sanitizeTagToken(tag.name);
      const value = sanitizeTagToken(tag.value);
      if (name.length > 0 && value.length > 0) {
        normalized.push({ name, value });
      }
    }
  }

  if (customArgs) {
    for (const [rawName, rawValue] of Object.entries(customArgs)) {
      const name = sanitizeTagToken(rawName);
      const value = sanitizeTagToken(String(rawValue));
      if (name.length > 0 && value.length > 0) {
        normalized.push({ name, value });
      }
    }
  }

  if (normalized.length === 0) {
    return undefined;
  }

  return normalized;
}

function validationFailure(
  correlationId: string,
  recipientCount: number,
  message: string,
): EmailSendResult {
  return {
    success: false,
    correlationId,
    recipientCount,
    retryCount: 0,
    errors: [
      {
        code: RESEND_ERROR_CODES.VALIDATION_ERROR,
        message,
      },
    ],
  };
}

function displayNameHasControlCharacters(name: string | undefined): boolean {
  return typeof name === "string" && DISPLAY_NAME_CONTROL_CHARS.test(name);
}

function collectDisplayNames(
  options: SendEmailOptions,
): Array<string | undefined> {
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  return [
    options.from.name,
    options.replyTo?.name,
    ...recipients.map((recipient) => recipient.name),
  ];
}

export function validateSendEmailOptions(
  options: SendEmailOptions,
  recipientCount: number,
  correlationId: string,
): { error: EmailSendResult | null; idempotencyKey: string } {
  const idempotencyKey = (options.idempotencyKey ?? "").trim();

  if (idempotencyKey.length === 0) {
    return {
      idempotencyKey,
      error: validationFailure(
        correlationId,
        recipientCount,
        "idempotencyKey is required for Resend sends to prevent duplicate email delivery.",
      ),
    };
  }

  if (idempotencyKey.length > 256) {
    return {
      idempotencyKey,
      error: validationFailure(
        correlationId,
        recipientCount,
        "idempotencyKey must be 256 characters or fewer.",
      ),
    };
  }

  if (recipientCount === 0) {
    return {
      idempotencyKey,
      error: validationFailure(
        correlationId,
        recipientCount,
        "At least one recipient is required.",
      ),
    };
  }

  if (recipientCount > RESEND_LIMITS.maxRecipientsPerEmail) {
    return {
      idempotencyKey,
      error: validationFailure(
        correlationId,
        recipientCount,
        `Resend supports at most ${RESEND_LIMITS.maxRecipientsPerEmail} recipients per single email request.`,
      ),
    };
  }

  if (collectDisplayNames(options).some(displayNameHasControlCharacters)) {
    return {
      idempotencyKey,
      error: validationFailure(
        correlationId,
        recipientCount,
        "Display names cannot contain control characters.",
      ),
    };
  }

  return { error: null, idempotencyKey };
}

function sendFailure(
  correlationId: string,
  recipientCount: number,
  retryCount: number,
  details: ResendErrorDetails,
): EmailSendResult {
  const errorCode = mapResendErrorCode(details.name, details.statusCode);
  return {
    success: false,
    correlationId,
    recipientCount,
    retryCount,
    rateLimited: errorCode === RESEND_ERROR_CODES.RATE_LIMITED,
    retryAfter: details.retryAfter,
    errors: [
      {
        code: errorCode,
        message: details.message,
      },
    ],
  };
}

export async function sendEmail(
  apiKey: string,
  options: SendEmailOptions,
): Promise<EmailSendResult> {
  const correlationId = crypto.randomUUID();
  const resend = createResendClientInstance(apiKey);
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const { error: validationError, idempotencyKey } = validateSendEmailOptions(
    options,
    recipients.length,
    correlationId,
  );
  if (validationError) {
    return validationError;
  }

  const tags = buildTags(options.tags, options.customArgs);

  const payload = {
    from: formatAddress(options.from.email, options.from.name),
    to: recipients.map((recipient) =>
      formatAddress(recipient.email, recipient.name),
    ),
    replyTo: options.replyTo
      ? formatAddress(options.replyTo.email, options.replyTo.name)
      : undefined,
    subject: options.subject,
    html: options.html,
    text: options.text ?? stripHtml(options.html),
    tags,
  };

  let lastError: ResendErrorDetails | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    const abortSignal = AbortSignal.timeout(RESEND_LIMITS.requestTimeoutMs);
    const sendOptions = {
      idempotencyKey,
      signal: abortSignal,
    };

    try {
      const response = await resend.emails.send(payload, sendOptions);

      if (!response.error) {
        return {
          success: true,
          messageId: response.data?.id,
          correlationId,
          recipientCount: recipients.length,
          retryCount: attempt,
        };
      }

      if (abortSignal.aborted) {
        lastError = { message: "Resend request timed out" };
      } else {
        const details = extractResendErrorDetails(response.error);
        details.retryAfter ??= extractRetryAfterSeconds(
          (response as { headers?: unknown }).headers,
        );
        lastError = details;
      }
    } catch (error) {
      if (abortSignal.aborted) {
        lastError = {
          message: "Resend request timed out",
          retryAfter: extractRetryAfterFromThrown(error),
        };
      } else {
        const details = extractResendErrorDetails(error);
        details.retryAfter ??= extractRetryAfterFromThrown(error);
        lastError = details;
      }
    }

    if (!lastError) {
      break;
    }

    if (attempt < RETRY_CONFIG.maxRetries && isRetryable(lastError)) {
      await sleep(calculateResendRetryDelayMs(attempt, lastError.retryAfter));
      continue;
    }

    return sendFailure(correlationId, recipients.length, attempt, lastError);
  }

  return {
    success: false,
    correlationId,
    recipientCount: recipients.length,
    retryCount: RETRY_CONFIG.maxRetries,
    errors: [
      {
        code: RESEND_ERROR_CODES.UNKNOWN,
        message: lastError?.message ?? "Failed to send email",
      },
    ],
  };
}

export async function sendTestEmail(
  apiKey: string,
  toEmail: string,
  fromEmail: string,
  fromName: string,
  options: SendTestEmailOptions = {},
): Promise<EmailSendResult> {
  const safeFromName = escapeHtmlValue(fromName);
  const safeFromEmail = escapeHtmlValue(fromEmail);
  const safeToEmail = escapeHtmlValue(toEmail);

  return sendEmail(apiKey, {
    to: { email: toEmail },
    from: { email: fromEmail, name: fromName },
    subject: "Resend connection test",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h1 style="margin: 0 0 12px;">Resend integration is active</h1>
        <p style="margin: 0 0 8px;">This is a test email from your integration settings.</p>
        <p style="margin: 0; color: #555;">
          From: ${safeFromName} &lt;${safeFromEmail}&gt;<br/>
          To: ${safeToEmail}
        </p>
      </div>
    `,
    idempotencyKey:
      options.idempotencyKey ?? `test-connection/${crypto.randomUUID()}`,
    tags: [
      { name: "email_type", value: "connection_test" },
      { name: "source", value: "admin_integration" },
    ],
  });
}
