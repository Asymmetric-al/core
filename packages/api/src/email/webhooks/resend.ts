import { createHash, randomUUID } from "node:crypto";

import { getAdminClient } from "@asym/database/supabase/admin";
import {
  getReceivedEmail,
  listReceivedEmailAttachments,
  verifyResendWebhookSignature,
} from "@asym/email";
import {
  type ResendInboundEventData,
  type ResendWebhookEnvelope,
  type ResendWebhookHeaders,
} from "@asym/email/types";
import { serverEnv } from "@asym/env";
import { type NextRequest, NextResponse } from "next/server";

import { routeInboundToSupportHub } from "@asym/api/admin/support-hub/inbound-router";

type JsonRecord = Record<string, unknown>;
type AdminSupabaseClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

type TenantResolutionSource = "payload" | "send_logs" | "inbound_recipients";
type TenantResolutionWarningCode =
  | "tenant_resolution_unresolved"
  | "tenant_resolution_ambiguous"
  | "tenant_resolution_dependency_unavailable";

interface TenantResolutionResult {
  tenantId: string | null;
  source: TenantResolutionSource | null;
  warningCode?: TenantResolutionWarningCode;
  warning?: string;
  retryable?: boolean;
  candidateTenantIds?: string[];
  matchedDomains?: string[];
}

interface SupabaseErrorLike {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

interface SupabaseWriteResult {
  error: SupabaseErrorLike | null;
}

class WebhookPersistenceError extends Error {
  constructor(
    readonly operation: string,
    readonly context: JsonRecord,
    readonly causeError: SupabaseErrorLike,
  ) {
    super(
      causeError.message || `Failed to persist Resend webhook ${operation}`,
    );
    this.name = "WebhookPersistenceError";
  }
}

async function assertSupabaseWrite(
  operation: string,
  result: PromiseLike<SupabaseWriteResult> | SupabaseWriteResult,
  context: JsonRecord,
): Promise<void> {
  const { error } = await result;
  if (!error) {
    return;
  }

  console.error("Failed to persist Resend webhook data", {
    operation,
    ...context,
    code: error.code,
    message: error.message,
  });
  throw new WebhookPersistenceError(operation, context, error);
}

function isDuplicateEmailEvent(error: SupabaseErrorLike | null): boolean {
  return error?.code === "23505";
}

async function insertEmailEvent(
  supabaseAdmin: AdminSupabaseClient,
  emailEventPayload: JsonRecord,
  context: JsonRecord,
): Promise<void> {
  // PostgREST cannot use the partial unique index on resend_event_id as an
  // upsert target, so duplicate webhooks are handled as replayed inserts.
  const { error } = await supabaseAdmin
    .from("email_events")
    .insert(emailEventPayload);

  if (!error) {
    return;
  }

  if (isDuplicateEmailEvent(error)) {
    return;
  }

  console.error("Failed to persist Resend webhook data", {
    operation: "email_events.insert",
    ...context,
    code: error.code,
    message: error.message,
  });
  throw new WebhookPersistenceError("email_events.insert", context, error);
}

function toWebhookPersistenceResponse(error: WebhookPersistenceError) {
  const correlationId = randomUUID();

  console.error("Resend webhook persistence failure response", {
    correlationId,
    operation: error.operation,
    ...error.context,
    code: error.causeError.code,
    message: error.causeError.message,
  });

  return NextResponse.json(
    {
      accepted: false,
      code: "webhook_persistence_failed",
      correlationId,
      error: "Failed to persist Resend webhook event.",
    },
    { status: 503 },
  );
}

function getResendWebhookConfig() {
  return {
    apiKey: serverEnv.RESEND_API_KEY,
    webhookSecret: serverEnv.RESEND_WEBHOOK_SECRET,
  };
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => asString(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function getHeaderValue(
  headers: unknown,
  names: readonly string[],
): string | null {
  const normalizedNames = new Set(names.map((name) => name.toLowerCase()));

  if (Array.isArray(headers)) {
    for (const entry of headers) {
      if (!isJsonRecord(entry)) continue;
      const name = asString(entry.name)?.toLowerCase();
      if (!name || !normalizedNames.has(name)) continue;
      const value = asString(entry.value);
      if (value) return value;
    }
    return null;
  }

  if (!isJsonRecord(headers)) {
    return null;
  }

  for (const [key, value] of Object.entries(headers)) {
    if (!normalizedNames.has(key.toLowerCase())) continue;
    const stringValue = asString(value);
    if (stringValue) return stringValue;
  }

  return null;
}

function splitHeaderList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function extractEmailAddress(value: unknown): string | null {
  const rawValue = asString(value);
  if (!rawValue) {
    return null;
  }

  const trimmed = normalizeToken(rawValue);
  if (trimmed.length === 0) {
    return null;
  }

  const bracketMatch = trimmed.match(/<([^>]+)>/);
  const candidate = bracketMatch?.[1] ?? trimmed;
  const parts = candidate.split("@");

  if (parts.length !== 2) {
    return null;
  }

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) {
    return null;
  }

  return `${localPart}@${domainPart}`;
}

function extractDomainFromEmail(value: unknown): string | null {
  const email = extractEmailAddress(value);
  if (!email) {
    return null;
  }

  const domain = email.split("@")[1];
  return domain ? normalizeToken(domain) : null;
}

function collectInboundRecipients(eventData: JsonRecord): string[] {
  const merged = [
    ...asStringArray(eventData.to),
    ...asStringArray(eventData.cc),
    ...asStringArray(eventData.bcc),
  ];

  const uniqueRecipients = new Set<string>();
  for (const recipient of merged) {
    const normalizedRecipient = extractEmailAddress(recipient);
    if (normalizedRecipient) {
      uniqueRecipients.add(normalizedRecipient);
    }
  }

  return Array.from(uniqueRecipients);
}

function collectRecipientDomains(recipients: string[]): string[] {
  const uniqueDomains = new Set<string>();
  for (const recipient of recipients) {
    const domain = extractDomainFromEmail(recipient);
    if (domain) {
      uniqueDomains.add(domain);
    }
  }

  return Array.from(uniqueDomains);
}

function getWebhookHeaders(request: NextRequest): ResendWebhookHeaders {
  return {
    "svix-id": request.headers.get("svix-id"),
    "svix-timestamp": request.headers.get("svix-timestamp"),
    "svix-signature": request.headers.get("svix-signature"),
  };
}

function getEventData(event: ResendWebhookEnvelope): JsonRecord {
  return isJsonRecord(event.data) ? event.data : {};
}

function getInboundEmailId(event: ResendWebhookEnvelope): string | null {
  const data = event.data as Partial<ResendInboundEventData>;
  if (!data || typeof data !== "object") {
    return null;
  }

  if (typeof data.email_id === "string" && data.email_id.length > 0) {
    return data.email_id;
  }

  return null;
}

function extractTenantId(event: ResendWebhookEnvelope): string | null {
  const data = getEventData(event);
  const directTenantId = asString(data.tenant_id);
  if (directTenantId) {
    return directTenantId;
  }

  const metadata = isJsonRecord(data.metadata) ? data.metadata : null;
  const metadataTenantId = metadata ? asString(metadata.tenant_id) : null;
  if (metadataTenantId) {
    return metadataTenantId;
  }

  const tags = Array.isArray(data.tags) ? data.tags : [];
  for (const tag of tags) {
    if (!isJsonRecord(tag)) {
      continue;
    }

    const name = asString(tag.name);
    if (name !== "tenant_id") {
      continue;
    }

    const value = asString(tag.value);
    if (value) {
      return value;
    }
  }

  return null;
}

function extractMessageId(event: ResendWebhookEnvelope): string | null {
  const data = getEventData(event);
  return (
    asString(data.resend_message_id) ??
    asString(data.email_id) ??
    asString(data.message_id) ??
    null
  );
}

function extractEventId(event: ResendWebhookEnvelope): string | null {
  const data = getEventData(event);
  return (
    asString(data.resend_event_id) ??
    asString(data.id) ??
    asString(data.event_id) ??
    null
  );
}

function buildSyntheticEventId(
  event: ResendWebhookEnvelope,
  messageId: string | null,
  recipientEmail: string | null,
): string {
  const stableInput = JSON.stringify({
    type: event.type,
    createdAt: asString(event.created_at),
    messageId,
    recipientEmail,
    data: getEventData(event),
  });
  const digest = createHash("sha256").update(stableInput).digest("hex");
  return `synthetic_${digest}`;
}

function extractRecipientEmail(event: ResendWebhookEnvelope): string | null {
  const data = getEventData(event);
  const email = asString(data.email);
  if (email) {
    return email;
  }

  const to = asStringArray(data.to);
  if (to.length > 0) {
    return to[0] ?? null;
  }

  return null;
}

function extractCampaignId(event: ResendWebhookEnvelope): string | null {
  const data = getEventData(event);
  return (
    asString(data.campaign_id) ??
    (isJsonRecord(data.metadata) ? asString(data.metadata.campaign_id) : null)
  );
}

function extractOccurredAt(event: ResendWebhookEnvelope): string {
  return asString(event.created_at) ?? new Date().toISOString();
}

function suppressionTypeForEventType(eventType: string): string | null {
  switch (eventType) {
    case "email.bounced":
      return "bounce";
    case "email.complained":
      return "spam";
    case "email.suppressed":
      return "manual";
    default:
      return null;
  }
}

function sendLogStatusForEventType(eventType: string): string | null {
  switch (eventType) {
    case "email.sent":
    case "email.delivered":
    case "email.delivery_delayed":
    case "email.opened":
    case "email.clicked":
      return "sent";
    case "email.bounced":
    case "email.complained":
    case "email.suppressed":
      return "bounced";
    default:
      return null;
  }
}

async function resolveTenantIdFromSendLogsByMessageId(
  supabaseAdmin: AdminSupabaseClient,
  messageId: string,
): Promise<TenantResolutionResult> {
  const { data, error } = await supabaseAdmin
    .from("email_send_logs")
    .select("tenant_id")
    .eq("resend_message_id", messageId)
    .limit(25);

  if (error) {
    return {
      tenantId: null,
      source: null,
      warningCode: "tenant_resolution_dependency_unavailable",
      warning:
        "Unable to resolve tenant because email_send_logs lookup failed.",
      retryable: true,
    };
  }

  if (!data || data.length === 0) {
    return {
      tenantId: null,
      source: null,
      warningCode: "tenant_resolution_unresolved",
      warning:
        "Unable to resolve tenant from email_send_logs for the provided resend_message_id.",
    };
  }

  const uniqueTenantIds = Array.from(
    new Set(
      data
        .map((row) => asString(row.tenant_id))
        .filter((tenantId): tenantId is string => Boolean(tenantId)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  if (uniqueTenantIds.length === 1) {
    return {
      tenantId: uniqueTenantIds[0] ?? null,
      source: "send_logs",
    };
  }

  if (uniqueTenantIds.length > 1) {
    return {
      tenantId: null,
      source: null,
      warningCode: "tenant_resolution_ambiguous",
      warning:
        "Multiple tenants were found for the provided resend_message_id.",
      candidateTenantIds: uniqueTenantIds,
    };
  }

  return {
    tenantId: null,
    source: null,
    warningCode: "tenant_resolution_unresolved",
    warning:
      "Unable to resolve tenant from email_send_logs for the provided resend_message_id.",
  };
}

async function resolveTenantIdFromInboundRecipients(
  supabaseAdmin: AdminSupabaseClient,
  recipients: string[],
): Promise<TenantResolutionResult> {
  const recipientDomains = collectRecipientDomains(recipients);
  if (recipientDomains.length === 0) {
    return {
      tenantId: null,
      source: null,
      warningCode: "tenant_resolution_unresolved",
      warning:
        "Inbound event did not include a resolvable recipient domain for tenant lookup.",
    };
  }

  const matchedDomains = new Set<string>();
  const matchedTenantIds = new Set<string>();

  for (const domain of recipientDomains) {
    const { data, error } = await supabaseAdmin
      .from("tenant_email_settings")
      .select("tenant_id, default_from_email")
      .eq("is_connected", true)
      .ilike("default_from_email", `%@${domain}`);

    if (error) {
      return {
        tenantId: null,
        source: null,
        warningCode: "tenant_resolution_dependency_unavailable",
        warning:
          "Unable to resolve tenant because tenant_email_settings lookup failed.",
        retryable: true,
        matchedDomains: Array.from(matchedDomains),
      };
    }

    if (!data || data.length === 0) {
      continue;
    }

    for (const row of data) {
      const senderDomain = extractDomainFromEmail(row.default_from_email);
      if (senderDomain !== domain) {
        continue;
      }

      const tenantId = asString(row.tenant_id);
      if (!tenantId) {
        continue;
      }

      matchedDomains.add(domain);
      matchedTenantIds.add(tenantId);
    }
  }

  const resolvedTenantIds = Array.from(matchedTenantIds);
  const resolvedDomains = Array.from(matchedDomains);

  if (resolvedTenantIds.length === 1) {
    return {
      tenantId: resolvedTenantIds[0] ?? null,
      source: "inbound_recipients",
      matchedDomains: resolvedDomains,
    };
  }

  if (resolvedTenantIds.length > 1) {
    return {
      tenantId: null,
      source: null,
      warningCode: "tenant_resolution_ambiguous",
      warning:
        "Inbound recipients matched multiple connected tenants. Tenant resolution is ambiguous.",
      candidateTenantIds: resolvedTenantIds,
      matchedDomains: resolvedDomains,
    };
  }

  return {
    tenantId: null,
    source: null,
    warningCode: "tenant_resolution_unresolved",
    warning:
      "No connected tenant matched the inbound recipient domains for this event.",
    matchedDomains: resolvedDomains,
  };
}

async function resolveTenantId(
  event: ResendWebhookEnvelope,
  eventData: JsonRecord,
  messageId: string | null,
  supabaseAdmin: AdminSupabaseClient,
): Promise<TenantResolutionResult> {
  const tenantIdFromPayload = extractTenantId(event);
  if (tenantIdFromPayload) {
    return {
      tenantId: tenantIdFromPayload,
      source: "payload",
    };
  }

  const isInboundEvent = event.type === "email.received";
  if (isInboundEvent) {
    return resolveTenantIdFromInboundRecipients(
      supabaseAdmin,
      collectInboundRecipients(eventData),
    );
  }

  if (!messageId) {
    return {
      tenantId: null,
      source: null,
      warningCode: "tenant_resolution_unresolved",
      warning:
        "Outbound webhook event did not include a resend_message_id for tenant lookup.",
    };
  }

  return resolveTenantIdFromSendLogsByMessageId(supabaseAdmin, messageId);
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const { apiKey, webhookSecret } = getResendWebhookConfig();

  if (!webhookSecret) {
    return NextResponse.json(
      {
        code: "webhook_verification_unconfigured",
        error: "Resend webhook verification is not configured.",
      },
      { status: 503 },
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        code: "resend_api_key_unconfigured",
        error: "Resend API access is not configured.",
      },
      { status: 503 },
    );
  }

  const verification = verifyResendWebhookSignature({
    payload,
    headers: getWebhookHeaders(request),
    secret: webhookSecret,
    apiKey,
  });

  if (!verification.success || !verification.event) {
    return NextResponse.json(
      {
        error: verification.error ?? "Invalid webhook signature",
        code: verification.errorCode,
      },
      { status: 401 },
    );
  }

  const event = verification.event;
  const { client: supabaseAdmin, error: adminClientError } = getAdminClient();
  if (!supabaseAdmin) {
    console.error("Resend webhook persistence unavailable", {
      eventType: event.type,
      message: adminClientError,
    });
    return NextResponse.json(
      {
        accepted: false,
        eventType: event.type,
        code: "webhook_persistence_unavailable",
        error:
          adminClientError ??
          "Admin client unavailable; unable to persist Resend webhook event.",
      },
      { status: 503 },
    );
  }

  const eventData = getEventData(event);
  const recipientEmail = extractRecipientEmail(event);
  const messageId = extractMessageId(event);
  const eventId = extractEventId(event);
  const resolvedEventId =
    eventId ?? buildSyntheticEventId(event, messageId, recipientEmail);
  const campaignId = extractCampaignId(event);
  const occurredAt = extractOccurredAt(event);
  const tenantResolution = await resolveTenantId(
    event,
    eventData,
    messageId,
    supabaseAdmin,
  );
  const tenantId = tenantResolution.tenantId;
  const isInboundEvent = event.type === "email.received";

  try {
    if (!tenantId && !isInboundEvent) {
      return NextResponse.json(
        {
          accepted: false,
          eventType: event.type,
          messageId,
          code: tenantResolution.warningCode ?? "tenant_resolution_unresolved",
          error:
            tenantResolution.warning ??
            "Unable to resolve tenant for outbound webhook event.",
          candidateTenantIds: tenantResolution.candidateTenantIds,
        },
        { status: tenantResolution.retryable ? 503 : 422 },
      );
    }

    if (isInboundEvent && !tenantId) {
      return NextResponse.json(
        {
          accepted: false,
          eventType: event.type,
          messageId,
          code: tenantResolution.warningCode ?? "tenant_resolution_unresolved",
          error:
            tenantResolution.warning ??
            "Unable to resolve inbound tenant from payload or recipients.",
        },
        { status: 503 },
      );
    }

    if (tenantId && messageId) {
      const emailEventPayload = {
        tenant_id: tenantId,
        resend_event_id: resolvedEventId,
        resend_message_id: messageId,
        event_type: event.type,
        recipient_email: recipientEmail ?? "unknown@example.invalid",
        occurred_at: occurredAt,
        bounce_type: asString(eventData.type),
        bounce_reason: asString(eventData.reason),
        click_url: asString(eventData.url),
        user_agent: asString(eventData.useragent),
        ip_address: asString(eventData.ip),
        campaign_id: campaignId,
        raw_event: eventData,
      };

      await insertEmailEvent(supabaseAdmin, emailEventPayload, {
        eventType: event.type,
        messageId,
        tenantId,
        resendEventId: resolvedEventId,
      });

      const suppressionType = suppressionTypeForEventType(event.type);
      if (suppressionType && recipientEmail) {
        await assertSupabaseWrite(
          "email_suppressions.upsert",
          supabaseAdmin.from("email_suppressions").upsert(
            {
              tenant_id: tenantId,
              email: recipientEmail,
              suppression_type: suppressionType,
              source: "resend",
              reason: asString(eventData.reason),
            },
            {
              onConflict: "tenant_id,email,suppression_type",
            },
          ),
          {
            eventType: event.type,
            messageId,
            tenantId,
            suppressionType,
          },
        );
      }

      const sendLogStatus = sendLogStatusForEventType(event.type);
      if (sendLogStatus) {
        await assertSupabaseWrite(
          "email_send_logs.update",
          supabaseAdmin
            .from("email_send_logs")
            .update({
              status: sendLogStatus,
              sent_at: sendLogStatus === "sent" ? occurredAt : null,
              error_code: sendLogStatus === "bounced" ? event.type : null,
              error_message:
                sendLogStatus === "bounced" ? asString(eventData.reason) : null,
            })
            .eq("tenant_id", tenantId)
            .eq("resend_message_id", messageId),
          {
            eventType: event.type,
            messageId,
            tenantId,
            sendLogStatus,
          },
        );
      }
    }

    if (event.type === "email.received") {
      const emailId = getInboundEmailId(event);
      if (!emailId) {
        return NextResponse.json(
          {
            accepted: true,
            eventType: event.type,
            tenantId,
            resolutionSource: tenantResolution.source,
            warning: "Inbound event did not include an email_id.",
          },
          { status: 202 },
        );
      }

      const [receivedEmailResult, attachmentsResult] = await Promise.allSettled(
        [
          getReceivedEmail(apiKey, emailId),
          listReceivedEmailAttachments(apiKey, emailId),
        ],
      );

      const receivedEmail =
        receivedEmailResult.status === "fulfilled"
          ? receivedEmailResult.value
          : {
              success: false,
              error: "Inbound email body retrieval failed.",
              errorCode: "server_error",
              data: null,
            };
      const attachments =
        attachmentsResult.status === "fulfilled"
          ? attachmentsResult.value
          : {
              success: false,
              error: "Inbound attachment listing failed.",
              errorCode: "server_error",
              data: [],
            };

      const receivedHeaders = receivedEmail.success
        ? receivedEmail.data?.headers
        : null;
      const messageIdHeader =
        getHeaderValue(receivedHeaders, ["message-id", "message_id"]) ??
        asString(eventData.message_id) ??
        asString(eventData.messageId);
      const inReplyToHeader =
        getHeaderValue(receivedHeaders, ["in-reply-to", "in_reply_to"]) ??
        asString(eventData.in_reply_to) ??
        asString(eventData.inReplyTo);
      const referencesHeader =
        getHeaderValue(receivedHeaders, ["references"]) ??
        asString(eventData.references);
      const referencesHeaders = [
        ...splitHeaderList(referencesHeader),
        ...asStringArray(eventData.references),
      ];
      const parsedText = receivedEmail.success
        ? (asString(receivedEmail.data?.text) ?? "")
        : "";
      const parsedHtml = receivedEmail.success
        ? asString(receivedEmail.data?.html)
        : null;

      const inboundWrite = await supabaseAdmin
        .from("email_inbound_messages")
        .upsert(
          {
            tenant_id: tenantId,
            resend_email_id: emailId,
            event_type: event.type,
            from_email: asString(eventData.from) ?? "unknown@example.invalid",
            subject: asString(eventData.subject),
            to_recipients: asStringArray(eventData.to),
            cc_recipients: asStringArray(eventData.cc),
            bcc_recipients: asStringArray(eventData.bcc),
            attachment_count: attachments.data?.length ?? 0,
            received_at: occurredAt,
            payload: eventData,
            parsed_text: parsedText,
            parsed_html: parsedHtml,
            message_id_header: messageIdHeader,
            in_reply_to_header: inReplyToHeader,
            references_headers: referencesHeaders,
          },
          {
            onConflict: "resend_email_id",
          },
        )
        .select("id")
        .single();

      await assertSupabaseWrite("email_inbound_messages.upsert", inboundWrite, {
        eventType: event.type,
        emailId,
        tenantId,
        receivedEmailLoaded: receivedEmail.success,
        attachmentsLoaded: attachments.success,
      });

      const inboundRowId = asString(inboundWrite.data?.id);
      const supportHubRouting = await routeInboundToSupportHub({
        tenantId,
        resendEmailId: emailId,
        inboundEmailRowId: inboundRowId,
        inboxId: null,
        fromAddress: asString(eventData.from) ?? "unknown@example.invalid",
        fromName: null,
        toAddresses: asStringArray(eventData.to),
        ccAddresses: asStringArray(eventData.cc),
        bccAddresses: asStringArray(eventData.bcc),
        subject: asString(eventData.subject),
        messageIdHeader,
        inReplyToHeader,
        referencesHeaders,
        bodyText: parsedText,
        bodyHtml: parsedHtml,
        receivedAt: occurredAt,
      });

      if (
        inboundRowId &&
        supportHubRouting.status === "routed" &&
        supportHubRouting.conversationId &&
        supportHubRouting.messageId
      ) {
        await assertSupabaseWrite(
          "email_inbound_messages.support_hub_bridge",
          supabaseAdmin
            .from("email_inbound_messages")
            .update({
              conversation_id: supportHubRouting.conversationId,
              support_message_id: supportHubRouting.messageId,
            })
            .eq("tenant_id", tenantId)
            .eq("id", inboundRowId),
          {
            eventType: event.type,
            emailId,
            tenantId,
            conversationId: supportHubRouting.conversationId,
            supportMessageId: supportHubRouting.messageId,
          },
        );
      }

      return NextResponse.json(
        {
          accepted: true,
          eventType: event.type,
          tenantId,
          resolutionSource: tenantResolution.source,
          emailId,
          receivedEmailLoaded: receivedEmail.success,
          attachmentsLoaded: attachments.success,
          attachmentCount: attachments.data?.length ?? 0,
          supportHub: supportHubRouting,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        accepted: true,
        eventType: event.type,
        tenantId,
        messageId,
        resolutionSource: tenantResolution.source,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof WebhookPersistenceError) {
      return toWebhookPersistenceResponse(error);
    }

    console.error("Unexpected Resend webhook handling failure", {
      eventType: event.type,
      messageId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        accepted: false,
        eventType: event.type,
        messageId,
        code: "webhook_processing_failed",
        error: "Failed to process Resend webhook event.",
      },
      { status: 503 },
    );
  }
}
