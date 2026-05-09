import { createHash } from "node:crypto";

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
import { type NextRequest, NextResponse } from "next/server";

type JsonRecord = Record<string, unknown>;
type AdminSupabaseClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

type TenantResolutionSource = "payload" | "send_logs" | "inbound_recipients";
type TenantResolutionWarningCode =
  | "tenant_resolution_unresolved"
  | "tenant_resolution_ambiguous";

interface TenantResolutionResult {
  tenantId: string | null;
  source: TenantResolutionSource | null;
  warningCode?: TenantResolutionWarningCode;
  warning?: string;
  candidateTenantIds?: string[];
  matchedDomains?: string[];
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

  if (error || !data || data.length === 0) {
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

    if (error || !data || data.length === 0) {
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
  supabaseAdmin: AdminSupabaseClient | null,
): Promise<TenantResolutionResult> {
  const tenantIdFromPayload = extractTenantId(event);
  if (tenantIdFromPayload) {
    return {
      tenantId: tenantIdFromPayload,
      source: "payload",
    };
  }

  const isInboundEvent = event.type === "email.received";
  if (!supabaseAdmin) {
    return {
      tenantId: null,
      source: null,
      warningCode: "tenant_resolution_unresolved",
      warning: isInboundEvent
        ? "Admin client unavailable; unable to resolve inbound tenant from connected settings."
        : "Admin client unavailable; unable to resolve outbound tenant without explicit tenant_id.",
    };
  }

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
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error:
          "RESEND_WEBHOOK_SECRET is not configured for webhook verification",
      },
      { status: 503 },
    );
  }

  const verification = verifyResendWebhookSignature({
    payload,
    headers: getWebhookHeaders(request),
    secret: webhookSecret,
    apiKey: process.env.RESEND_API_KEY,
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
  const { client: supabaseAdmin } = getAdminClient();
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
      { status: 422 },
    );
  }

  if (supabaseAdmin && tenantId && messageId) {
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

    await supabaseAdmin.from("email_events").upsert(emailEventPayload, {
      onConflict: "tenant_id,resend_event_id",
    });

    const suppressionType = suppressionTypeForEventType(event.type);
    if (suppressionType && recipientEmail) {
      await supabaseAdmin.from("email_suppressions").upsert(
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
      );
    }

    const sendLogStatus = sendLogStatusForEventType(event.type);
    if (sendLogStatus) {
      await supabaseAdmin
        .from("email_send_logs")
        .update({
          status: sendLogStatus,
          sent_at: sendLogStatus === "sent" ? occurredAt : null,
          error_code: sendLogStatus === "bounced" ? event.type : null,
          error_message:
            sendLogStatus === "bounced" ? asString(eventData.reason) : null,
        })
        .eq("tenant_id", tenantId)
        .eq("resend_message_id", messageId);
    }
  }

  if (event.type === "email.received") {
    const inboundTenantWarning =
      tenantId === null
        ? {
            tenantWarningCode:
              tenantResolution.warningCode ?? "tenant_resolution_unresolved",
            tenantWarning:
              tenantResolution.warning ??
              "Inbound tenant could not be resolved from payload or recipients.",
            candidateTenantIds: tenantResolution.candidateTenantIds,
            matchedDomains: tenantResolution.matchedDomains,
          }
        : null;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          accepted: true,
          eventType: event.type,
          tenantId,
          resolutionSource: tenantResolution.source,
          warning:
            "RESEND_API_KEY is not configured; skipping inbound body retrieval.",
          ...(inboundTenantWarning ?? {}),
        },
        { status: 202 },
      );
    }

    const emailId = getInboundEmailId(event);
    if (!emailId) {
      return NextResponse.json(
        {
          accepted: true,
          eventType: event.type,
          tenantId,
          resolutionSource: tenantResolution.source,
          warning: "Inbound event did not include an email_id.",
          ...(inboundTenantWarning ?? {}),
        },
        { status: 202 },
      );
    }

    const [receivedEmailResult, attachmentsResult] = await Promise.allSettled([
      getReceivedEmail(apiKey, emailId),
      listReceivedEmailAttachments(apiKey, emailId),
    ]);

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

    if (supabaseAdmin) {
      await supabaseAdmin.from("email_inbound_messages").upsert(
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
          parsed_text: receivedEmail.success
            ? asString(receivedEmail.data?.text)
            : null,
          parsed_html: receivedEmail.success
            ? asString(receivedEmail.data?.html)
            : null,
        },
        {
          onConflict: "resend_email_id",
        },
      );
    }

    // TODO(Phase 8 — Support Hub inbound wiring):
    //
    // Right here, after the inbound message has been verified, the body
    // has been hydrated from Resend, and the row has been persisted to
    // `email_inbound_messages`, route the message into the donor-care
    // Support Hub. Today no client of this webhook does that — the
    // typed stub `routeInboundToSupportHub()` in
    // `packages/api/src/admin/support-hub/inbound-router.ts` returns
    // `{ status: "deferred" }` and is reachable only via its unit test.
    //
    // Phase 8 plan:
    //   1. Resolve the donor-care inbox via the recipient address (see
    //      `collectInboundRecipients(eventData)` above).
    //   2. Resolve / create the donor participant + thread the message
    //      onto an existing conversation when `In-Reply-To` /
    //      `References` matches; otherwise open a new conversation.
    //   3. Call `routeInboundToSupportHub({ tenantId, inboxId, ... })`
    //      from `@asym/api/admin/support-hub/inbound-router`. The
    //      adapter export in
    //      `packages/api/src/admin/support-hub/adapter/index.ts` will
    //      already point at the Supabase implementation by the time this
    //      branch wires up.
    //
    // See `docs/features/support-hub/final-audit-and-wrap-up.md` for the
    // full Phase 8 follow-up checklist.

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
        ...(inboundTenantWarning ?? {}),
      },
      { status: inboundTenantWarning ? 202 : 200 },
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
}
