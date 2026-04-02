/**
 * Resend Service Module
 *
 * Core service layer for Resend email integration. Handles API key validation,
 * outbound sending, webhook verification, and inbound retrieval helpers.
 */

import { Resend } from "resend";

import {
  DELIVERABILITY_HELP_URLS,
  HTTP_STATUS,
  RESEND_ERROR_CODES,
  RETRY_CONFIG,
} from "./constants";

import type {
  DeliverabilityWarning,
  DomainAuthentication,
  EmailRecipient,
  EmailSendResult,
  ResendValidationSnapshot,
  ResendReceivedAttachment,
  ResendReceivedEmail,
  ResendWebhookEnvelope,
  ResendWebhookHeaders,
  SenderIdentity,
} from "./types";

type JsonRecord = Record<string, unknown>;

interface ResendErrorDetails {
  name?: string;
  message: string;
  statusCode?: number;
  retryAfter?: number;
}

interface ResendInboundResult<TData> {
  success: boolean;
  data?: TData;
  error?: string;
  errorCode?: string;
}

interface VerifyWebhookOptions {
  payload: string;
  headers: ResendWebhookHeaders;
  secret: string;
  apiKey?: string;
}

export interface ResendValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
  permissions?: string[];
  senderIdentities?: SenderIdentity[];
  domainAuthentication?: DomainAuthentication[];
  deliverabilityScore?: number;
  warnings?: DeliverabilityWarning[];
}

export interface ResendValidationOptions {
  defaultFromEmail?: string;
}

export interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  from: { email: string; name?: string };
  replyTo?: { email: string; name?: string };
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
  tags?: Array<{ name: string; value: string }>;
  customArgs?: Record<string, string>;
}

export interface SendTestEmailOptions {
  idempotencyKey?: string;
}

export interface ResendClient {
  validateKey: () => Promise<ResendValidationResult>;
  sendEmail: (options: SendEmailOptions) => Promise<EmailSendResult>;
  sendTestEmail: (
    toEmail: string,
    fromEmail: string,
    fromName: string,
    options?: SendTestEmailOptions,
  ) => Promise<EmailSendResult>;
  verifyWebhookSignature: (options: Omit<VerifyWebhookOptions, "apiKey">) => {
    success: boolean;
    event?: ResendWebhookEnvelope;
    error?: string;
    errorCode?: string;
  };
  getReceivedEmail: (
    emailId: string,
  ) => Promise<ResendInboundResult<ResendReceivedEmail>>;
  listReceivedEmailAttachments: (
    emailId: string,
  ) => Promise<ResendInboundResult<ResendReceivedAttachment[]>>;
}

function createResendClientInstance(apiKey: string): Resend {
  return new Resend(apiKey);
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function extractRows(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isJsonRecord);
  }

  if (!isJsonRecord(value)) {
    return [];
  }

  const maybeData = value.data;
  if (Array.isArray(maybeData)) {
    return maybeData.filter(isJsonRecord);
  }

  return [];
}

function mapResendErrorCode(
  name?: string | null,
  statusCode?: number | null,
): string {
  if (name === "missing_api_key" || name === "invalid_api_key") {
    return RESEND_ERROR_CODES.UNAUTHORIZED;
  }

  if (
    name === "restricted_api_key" ||
    name === "invalid_access" ||
    statusCode === HTTP_STATUS.FORBIDDEN
  ) {
    return RESEND_ERROR_CODES.FORBIDDEN;
  }

  if (
    name === "rate_limit_exceeded" ||
    statusCode === HTTP_STATUS.TOO_MANY_REQUESTS
  ) {
    return RESEND_ERROR_CODES.RATE_LIMITED;
  }

  if (
    name === "invalid_idempotency_key" ||
    name === "idempotency_key_conflict" ||
    statusCode === HTTP_STATUS.CONFLICT
  ) {
    return RESEND_ERROR_CODES.CONFLICT;
  }

  if (name === "invalid_from_address") {
    return RESEND_ERROR_CODES.SENDER_NOT_VERIFIED;
  }

  if (
    name === "validation_error" ||
    name === "missing_required_field" ||
    name === "invalid_parameter" ||
    statusCode === HTTP_STATUS.BAD_REQUEST
  ) {
    return RESEND_ERROR_CODES.VALIDATION_ERROR;
  }

  if (statusCode !== null && statusCode !== undefined && statusCode >= 500) {
    return RESEND_ERROR_CODES.SERVER_ERROR;
  }

  return RESEND_ERROR_CODES.UNKNOWN;
}

function extractResendErrorDetails(errorLike: unknown): ResendErrorDetails {
  if (!isJsonRecord(errorLike)) {
    return {
      message: "Unknown Resend error",
    };
  }

  const name = asString(errorLike.name) ?? undefined;
  const message = asString(errorLike.message) ?? "Unknown Resend error";
  const statusCode = asNumber(errorLike.statusCode) ?? undefined;

  let retryAfter: number | undefined;
  const retryAfterValue = asNumber(errorLike.retryAfter);
  if (retryAfterValue !== null && retryAfterValue >= 0) {
    retryAfter = retryAfterValue;
  }

  return { name, message, statusCode, retryAfter };
}

function isRetryable(details: ResendErrorDetails): boolean {
  if (
    details.statusCode !== undefined &&
    RETRY_CONFIG.retryableStatuses.some(
      (statusCode) => statusCode === details.statusCode,
    )
  ) {
    return true;
  }

  if (!details.name) {
    return false;
  }

  return RETRY_CONFIG.retryableErrors.some(
    (errorName) => errorName === details.name,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function backoffDelayMs(attemptNumber: number): number {
  const exponential = RETRY_CONFIG.baseDelayMs * 2 ** attemptNumber;
  return Math.min(RETRY_CONFIG.maxDelayMs, exponential);
}

function formatAddress(email: string, name?: string): string {
  if (!name) {
    return email;
  }
  return `${name} <${email}>`;
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

function mapDomainAuthentication(
  domain: JsonRecord,
  index: number,
): DomainAuthentication | null {
  const name = asString(domain.name) || asString(domain.domain);
  if (!name) {
    return null;
  }

  const explicitValid = asBoolean(domain.valid);
  const status =
    asString(domain.status) ??
    (explicitValid === true ? "verified" : "unknown");
  const records = extractRows(domain.records).map((record) => ({
    type: asString(record.type) ?? undefined,
    name: asString(record.name) ?? "",
    value: asString(record.value) ?? asString(record.record) ?? "",
    status: asString(record.status) ?? undefined,
    ttl: asString(record.ttl) ?? undefined,
    record: asString(record.record) ?? undefined,
    priority: asNumber(record.priority) ?? undefined,
  }));

  return {
    id: asNumber(domain.id) ?? index + 1,
    domain: name,
    subdomain: asString(domain.subdomain),
    valid: explicitValid ?? status === "verified",
    status,
    region: asString(domain.region),
    createdAt: asString(domain.created_at) ?? undefined,
    records: records.length > 0 ? records : undefined,
  };
}

function mapSenderIdentity(
  domain: JsonRecord,
  index: number,
): SenderIdentity | null {
  const domainName = asString(domain.name);
  const domainStatus = asString(domain.status);
  if (!domainName || domainStatus !== "verified") {
    return null;
  }

  const fromEmail =
    asString(domain.default_from_email) ??
    asString(domain.from_email) ??
    `noreply@${domainName}`;
  const fromName = asString(domain.default_from_name) ?? domainName;
  const replyTo = asString(domain.default_reply_to_email);

  return {
    id: asNumber(domain.id) ?? index + 1,
    nickname: `${domainName} sender`,
    from_email: fromEmail,
    from_name: fromName,
    reply_to_email: replyTo,
    verified: true,
  };
}

function mapPersistedSenderIdentity(
  value: unknown,
  index: number,
): SenderIdentity | null {
  if (!isJsonRecord(value)) {
    return null;
  }

  const fromEmail = asString(value.from_email);
  const fromName = asString(value.from_name);
  const nickname = asString(value.nickname);
  const verified = asBoolean(value.verified) ?? false;

  if (!fromEmail || !fromName || !nickname) {
    return null;
  }

  return {
    id: asNumber(value.id) ?? index + 1,
    nickname,
    from_email: fromEmail,
    from_name: fromName,
    reply_to_email: asString(value.reply_to_email) || null,
    verified,
  };
}

function parsePermissions(value: unknown): string[] | undefined {
  if (!isJsonRecord(value)) {
    return undefined;
  }

  const candidate =
    value.permissions ??
    value.access ??
    value.scopes ??
    value.scope ??
    value.capabilities;

  if (!Array.isArray(candidate)) {
    return undefined;
  }

  const permissions = candidate
    .map((entry) => asString(entry))
    .filter((entry): entry is string => Boolean(entry));

  return permissions.length > 0 ? permissions : undefined;
}

function normalizeDomainToken(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, "");
}

function getEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return null;
  }

  return normalizeDomainToken(trimmed.slice(atIndex + 1));
}

function getVerifiedDomainNames(
  domains: DomainAuthentication[],
): readonly string[] {
  return [
    ...new Set(
      domains
        .filter((domain) => domain.valid)
        .map((domain) => normalizeDomainToken(domain.domain)),
    ),
  ];
}

function getSenderDomainMismatchWarning(
  defaultFromEmail: string | undefined,
  verifiedDomainNames: readonly string[],
): DeliverabilityWarning | null {
  if (!defaultFromEmail) {
    return null;
  }

  const senderDomain = getEmailDomain(defaultFromEmail);
  if (!senderDomain) {
    return null;
  }

  if (verifiedDomainNames.includes(senderDomain)) {
    return null;
  }

  const verifiedDomainHint =
    verifiedDomainNames.length > 0
      ? `Use an address on ${verifiedDomainNames.slice(0, 2).join(" or ")}.`
      : "Verify the sender domain in Resend before attempting to send email.";

  return {
    code: "DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED",
    severity: "error",
    message: `${defaultFromEmail} does not use one of your exact verified Resend domains. ${verifiedDomainHint}`,
    helpUrl: DELIVERABILITY_HELP_URLS.DOMAIN_MISMATCH,
  };
}

function isBlockingDeliverabilityWarning(
  warning: DeliverabilityWarning,
): boolean {
  return warning.severity === "error";
}

function hasVerifiedRecord(
  domains: DomainAuthentication[],
  recordName: string,
  expectedType?: string,
): boolean {
  const normalizedRecordName = recordName.trim().toLowerCase();
  const normalizedExpectedType = expectedType?.trim().toLowerCase();

  return domains.some((domain) =>
    (domain.records ?? []).some((record) => {
      const recordStatus = record.status?.trim().toLowerCase();
      const recordLabel = record.record?.trim().toLowerCase();
      const recordType = record.type?.trim().toLowerCase();

      if (recordStatus !== "verified") {
        return false;
      }

      if (recordLabel !== normalizedRecordName) {
        return false;
      }

      if (normalizedExpectedType && recordType !== normalizedExpectedType) {
        return false;
      }

      return true;
    }),
  );
}

export function createResendValidationSnapshot(
  validation: Pick<
    ResendValidationResult,
    | "senderIdentities"
    | "domainAuthentication"
    | "warnings"
    | "deliverabilityScore"
  >,
  validatedAt: string = new Date().toISOString(),
): ResendValidationSnapshot {
  const senderIdentities = validation.senderIdentities ?? [];
  const domainAuthentication = validation.domainAuthentication ?? [];
  const warnings = validation.warnings ?? [];
  const deliverabilityScore = validation.deliverabilityScore ?? 0;
  const domainAuthenticated = domainAuthentication.some(
    (domain) => domain.valid,
  );

  return {
    senderIdentities,
    domainAuthentication,
    warnings,
    deliverabilityScore,
    validatedAt,
    domainAuthenticated,
    dkimVerified: hasVerifiedRecord(domainAuthentication, "DKIM"),
    spfVerified: hasVerifiedRecord(domainAuthentication, "SPF", "TXT"),
  };
}

function mapDeliverabilityWarning(
  value: unknown,
): DeliverabilityWarning | null {
  if (!isJsonRecord(value)) {
    return null;
  }

  const code = asString(value.code);
  const message = asString(value.message);
  const severity = asString(value.severity);
  if (
    !code ||
    !message ||
    (severity !== "info" && severity !== "warning" && severity !== "error")
  ) {
    return null;
  }

  return {
    code,
    message,
    severity,
    helpUrl: asString(value.helpUrl) || undefined,
  };
}

export function parseResendValidationSnapshot(
  value: unknown,
): ResendValidationSnapshot | null {
  if (!isJsonRecord(value)) {
    return null;
  }

  const senderIdentities = extractRows(value.senderIdentities)
    .map((sender, index) => mapPersistedSenderIdentity(sender, index))
    .filter((sender): sender is SenderIdentity => Boolean(sender));
  const domainAuthentication = extractRows(value.domainAuthentication)
    .map((domain, index) => mapDomainAuthentication(domain, index))
    .filter((domain): domain is DomainAuthentication => Boolean(domain));
  const warnings = Array.isArray(value.warnings)
    ? value.warnings
        .map((warning) => mapDeliverabilityWarning(warning))
        .filter((warning): warning is DeliverabilityWarning => Boolean(warning))
    : [];
  const deliverabilityScore = asNumber(value.deliverabilityScore);
  const validatedAt = asString(value.validatedAt);
  const domainAuthenticated = asBoolean(value.domainAuthenticated);
  const dkimVerified = asBoolean(value.dkimVerified);
  const spfVerified = asBoolean(value.spfVerified);

  if (
    deliverabilityScore === null ||
    !validatedAt ||
    domainAuthenticated === null ||
    dkimVerified === null ||
    spfVerified === null
  ) {
    return null;
  }

  return {
    senderIdentities,
    domainAuthentication,
    warnings,
    deliverabilityScore,
    validatedAt,
    domainAuthenticated,
    dkimVerified,
    spfVerified,
  };
}

export function isResendValidationSendReady(
  snapshot: Pick<ResendValidationSnapshot, "domainAuthenticated" | "warnings">,
): boolean {
  return (
    snapshot.domainAuthenticated &&
    !snapshot.warnings.some(isBlockingDeliverabilityWarning)
  );
}

async function enrichDomainRowsWithDetails(
  resend: Resend,
  domainRows: JsonRecord[],
): Promise<JsonRecord[]> {
  return Promise.all(
    domainRows.map(async (domainRow) => {
      const domainId = asString(domainRow.id);
      if (!domainId) {
        return domainRow;
      }

      try {
        const domainResponse = await resend.domains.get(domainId);
        if (domainResponse.error || !isJsonRecord(domainResponse.data)) {
          return domainRow;
        }

        return {
          ...domainRow,
          ...domainResponse.data,
        };
      } catch {
        return domainRow;
      }
    }),
  );
}

export async function validateResendApiKey(
  apiKey: string,
  options: ResendValidationOptions = {},
): Promise<ResendValidationResult> {
  if (!apiKey || typeof apiKey !== "string") {
    return {
      valid: false,
      error: "API key is required",
      errorCode: RESEND_ERROR_CODES.INVALID_API_KEY,
    };
  }

  if (!apiKey.startsWith("re_")) {
    return {
      valid: false,
      error: 'Invalid API key format. Resend API keys start with "re_".',
      errorCode: RESEND_ERROR_CODES.INVALID_API_KEY,
    };
  }

  const resend = createResendClientInstance(apiKey);
  const warnings: DeliverabilityWarning[] = [];
  let permissions: string[] | undefined;

  try {
    const domainsResponse = await resend.domains.list({ limit: 100 });
    if (domainsResponse.error) {
      const details = extractResendErrorDetails(domainsResponse.error);
      const code = mapResendErrorCode(details.name, details.statusCode);
      return {
        valid: false,
        error: details.message,
        errorCode: code,
      };
    }

    const domainRows = await enrichDomainRowsWithDetails(
      resend,
      extractRows(domainsResponse.data),
    );
    const domainAuthentication = domainRows
      .map((domain, index) => mapDomainAuthentication(domain, index))
      .filter((domain): domain is DomainAuthentication => Boolean(domain));
    const senderIdentities = domainRows
      .map((domain, index) => mapSenderIdentity(domain, index))
      .filter((sender): sender is SenderIdentity => Boolean(sender));

    const verifiedDomains = domainAuthentication.filter(
      (domain) => domain.valid,
    );
    const verifiedDomainNames = getVerifiedDomainNames(domainAuthentication);

    if (domainAuthentication.length === 0) {
      warnings.push({
        code: "NO_DOMAINS",
        message:
          "No sending domains were found. Add and verify a Resend domain before production sends.",
        severity: "warning",
        helpUrl: DELIVERABILITY_HELP_URLS.DOMAIN_AUTHENTICATION,
      });
    } else if (verifiedDomains.length === 0) {
      warnings.push({
        code: "DOMAIN_NOT_VERIFIED",
        message:
          "Domains are configured but not verified yet. Complete domain verification for reliable delivery.",
        severity: "warning",
        helpUrl: DELIVERABILITY_HELP_URLS.DOMAIN_AUTHENTICATION,
      });
    }

    const senderDomainMismatchWarning = getSenderDomainMismatchWarning(
      options.defaultFromEmail,
      verifiedDomainNames,
    );
    if (senderDomainMismatchWarning) {
      warnings.push(senderDomainMismatchWarning);
    }

    // Metadata scope lookup is optional. We do not infer permissions when this fails.
    try {
      const keyResponse = await resend.apiKeys.list({ limit: 1 });
      if (!keyResponse.error) {
        const rows = extractRows(keyResponse.data);
        const firstKey = rows[0];
        permissions = firstKey ? parsePermissions(firstKey) : undefined;
      } else {
        warnings.push({
          code: "API_KEY_METADATA_UNAVAILABLE",
          message:
            "API key metadata could not be read with this key. Sending can still work if domain and sender are valid.",
          severity: "info",
          helpUrl: DELIVERABILITY_HELP_URLS.API_KEY,
        });
      }
    } catch {
      warnings.push({
        code: "API_KEY_METADATA_UNAVAILABLE",
        message:
          "API key metadata could not be read with this key. Sending can still work if domain and sender are valid.",
        severity: "info",
        helpUrl: DELIVERABILITY_HELP_URLS.API_KEY,
      });
    }

    const deliverabilityScore =
      verifiedDomains.length > 0
        ? 100
        : domainAuthentication.length > 0
          ? 70
          : 40;

    return {
      valid: true,
      permissions,
      senderIdentities,
      domainAuthentication,
      deliverabilityScore,
      warnings,
    };
  } catch (error) {
    const details = extractResendErrorDetails(error);
    return {
      valid: false,
      error: `Failed to validate API key: ${details.message}`,
      errorCode: mapResendErrorCode(details.name, details.statusCode),
    };
  }
}

export async function sendEmail(
  apiKey: string,
  options: SendEmailOptions,
): Promise<EmailSendResult> {
  const correlationId = crypto.randomUUID();
  const resend = createResendClientInstance(apiKey);
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
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
    try {
      const response = await resend.emails.send(
        payload,
        options.idempotencyKey
          ? {
              idempotencyKey: options.idempotencyKey,
            }
          : undefined,
      );

      if (!response.error) {
        return {
          success: true,
          messageId: response.data?.id,
          correlationId,
          recipientCount: recipients.length,
        };
      }

      const details = extractResendErrorDetails(response.error);
      lastError = details;

      if (attempt < RETRY_CONFIG.maxRetries && isRetryable(details)) {
        await sleep(backoffDelayMs(attempt));
        continue;
      }

      const errorCode = mapResendErrorCode(details.name, details.statusCode);
      return {
        success: false,
        correlationId,
        recipientCount: recipients.length,
        rateLimited: errorCode === RESEND_ERROR_CODES.RATE_LIMITED,
        retryAfter: details.retryAfter,
        errors: [
          {
            code: errorCode,
            message: details.message,
          },
        ],
      };
    } catch (error) {
      const details = extractResendErrorDetails(error);
      lastError = details;

      if (attempt < RETRY_CONFIG.maxRetries && isRetryable(details)) {
        await sleep(backoffDelayMs(attempt));
        continue;
      }

      const errorCode = mapResendErrorCode(details.name, details.statusCode);
      return {
        success: false,
        correlationId,
        recipientCount: recipients.length,
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
  }

  return {
    success: false,
    correlationId,
    recipientCount: recipients.length,
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
  return sendEmail(apiKey, {
    to: { email: toEmail },
    from: { email: fromEmail, name: fromName },
    subject: "Resend connection test",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h1 style="margin: 0 0 12px;">Resend integration is active</h1>
        <p style="margin: 0 0 8px;">This is a test email from your integration settings.</p>
        <p style="margin: 0; color: #555;">
          From: ${fromName} &lt;${fromEmail}&gt;<br/>
          To: ${toEmail}
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

  const resend = new Resend(resolvedApiKey);

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

export async function getReceivedEmail(
  apiKey: string,
  emailId: string,
): Promise<ResendInboundResult<ResendReceivedEmail>> {
  const resend = createResendClientInstance(apiKey);
  const response = await resend.emails.receiving.get(emailId);
  if (response.error) {
    const details = extractResendErrorDetails(response.error);
    return {
      success: false,
      error: details.message,
      errorCode: mapResendErrorCode(details.name, details.statusCode),
    };
  }

  return {
    success: true,
    data: (isJsonRecord(response.data)
      ? response.data
      : {}) as ResendReceivedEmail,
  };
}

export async function listReceivedEmailAttachments(
  apiKey: string,
  emailId: string,
): Promise<ResendInboundResult<ResendReceivedAttachment[]>> {
  const resend = createResendClientInstance(apiKey);
  const response = await resend.emails.receiving.attachments.list({ emailId });
  if (response.error) {
    const details = extractResendErrorDetails(response.error);
    return {
      success: false,
      error: details.message,
      errorCode: mapResendErrorCode(details.name, details.statusCode),
    };
  }

  const rows = extractRows(response.data).map(
    (row): ResendReceivedAttachment => ({
      id: asString(row.id) ?? "",
      filename: asString(row.filename) ?? "attachment",
      content_type: asString(row.content_type) ?? undefined,
      download_url: asString(row.download_url) ?? "",
      expires_at: asString(row.expires_at) ?? undefined,
    }),
  );

  return {
    success: true,
    data: rows.filter((attachment) => attachment.id && attachment.download_url),
  };
}

export function createResendClient(apiKey: string): ResendClient {
  return {
    validateKey: (): Promise<ResendValidationResult> =>
      validateResendApiKey(apiKey),
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
