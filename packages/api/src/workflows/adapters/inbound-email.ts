import {
  routeInboundToSupportHub,
  type InboundRouterResult,
} from "../../admin/support-hub/inbound-router";
import { getHeaderValue } from "../../email/webhooks/resend";
import { acquireWorkClaim, releaseWorkClaim } from "../claims";
import { EMAIL_INBOUND_PROCESS_EVENT } from "../events";
import {
  requestWorkflowDispatch,
  type CreateDispatchRequestInput,
  type RequestWorkflowDispatchDeps,
  type RequestWorkflowDispatchResult,
} from "../ledger";

import type { getAdminClient } from "@asym/database/supabase/admin";

type InboundWorkflowClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

const INBOUND_TABLE = "email_inbound_messages";

export interface InboundEmailRow {
  id: string;
  tenant_id: string;
  resend_email_id: string;
  from_email: string;
  subject: string | null;
  to_recipients: string[];
  cc_recipients: string[];
  bcc_recipients: string[];
  received_at: string | null;
  parsed_text: string | null;
  parsed_html: string | null;
  message_id_header: string | null;
  in_reply_to_header: string | null;
  references_headers: string[];
  attachment_count: number | null;
  body_retrieval_status: string;
  body_retrieval_attempts: number;
  attachment_retrieval_status: string;
  attachment_retrieval_attempts: number;
  conversation_id: string | null;
  support_message_id: string | null;
}

const INBOUND_COLUMNS =
  "id, tenant_id, resend_email_id, from_email, subject, to_recipients, cc_recipients, bcc_recipients, received_at, parsed_text, parsed_html, message_id_header, in_reply_to_header, references_headers, attachment_count, body_retrieval_status, body_retrieval_attempts, attachment_retrieval_status, attachment_retrieval_attempts, conversation_id, support_message_id";

export async function loadInboundEmailForWorkflow(
  client: InboundWorkflowClient,
  input: { tenantId: string; inboundEmailRowId: string },
): Promise<InboundEmailRow> {
  const { data, error } = await client
    .from(INBOUND_TABLE)
    .select(INBOUND_COLUMNS)
    .eq("id", input.inboundEmailRowId)
    .maybeSingle();

  if (error) {
    throw new Error(`inbound_email_load_failed: ${error.message}`);
  }

  if (!data) {
    throw new Error("inbound_email_not_found");
  }

  const row = data as unknown as InboundEmailRow;

  if (row.tenant_id !== input.tenantId) {
    // Tenant isolation: a workflow event may never operate on another
    // tenant's inbound email.
    throw new Error("inbound_email_tenant_mismatch");
  }

  return row;
}

export interface InboundProviderClient {
  fetchReceivedEmail: (
    apiKey: string,
    emailId: string,
  ) => Promise<{
    success: boolean;
    error?: string | null;
    data?: {
      text?: string | null;
      html?: string | null;
      headers?: unknown;
    } | null;
  }>;
  fetchAttachments: (
    apiKey: string,
    emailId: string,
  ) => Promise<{
    success: boolean;
    error?: string | null;
    data?: unknown[] | null;
  }>;
  apiKey: string;
}

export interface RetrieveInboundBodyResult {
  status: "available" | "already_available";
  attempts: number;
}

/**
 * Inbound body retrieval: the durable workflow step that loads the received
 * email body from the provider. Until it succeeds the placeholder stays
 * pending and must never become an empty Support Hub message. Retryable
 * failures throw so the workflow step retries; exhaustion is recorded by the
 * workflow failure handler.
 */
export async function retrieveInboundBody(
  client: InboundWorkflowClient,
  provider: InboundProviderClient,
  input: { tenantId: string; inboundEmailRowId: string },
): Promise<RetrieveInboundBodyResult> {
  const row = await loadInboundEmailForWorkflow(client, input);

  if (row.body_retrieval_status === "available") {
    return {
      status: "already_available",
      attempts: row.body_retrieval_attempts,
    };
  }

  const attempts = row.body_retrieval_attempts + 1;

  let received: Awaited<
    ReturnType<InboundProviderClient["fetchReceivedEmail"]>
  >;
  try {
    received = await provider.fetchReceivedEmail(
      provider.apiKey,
      row.resend_email_id,
    );
  } catch (error) {
    received = {
      success: false,
      error: error instanceof Error ? error.message : "provider call failed",
      data: null,
    };
  }

  if (!received.success || !received.data) {
    await client
      .from(INBOUND_TABLE)
      .update({
        body_retrieval_attempts: attempts,
        body_retrieval_error: received.error ?? "body retrieval failed",
      })
      .eq("id", row.id);

    throw new Error(
      `inbound_body_retrieval_failed: ${received.error ?? "provider error"}`,
    );
  }

  const headers = received.data.headers ?? null;
  const messageIdHeader =
    getHeaderValue(headers, ["message-id", "message_id"]) ??
    row.message_id_header;
  const inReplyToHeader =
    getHeaderValue(headers, ["in-reply-to", "in_reply_to"]) ??
    row.in_reply_to_header;
  const referencesHeader = getHeaderValue(headers, ["references"]);
  const referencesHeaders = referencesHeader
    ? referencesHeader.split(/\s+/).filter(Boolean)
    : row.references_headers;

  const updated = await client
    .from(INBOUND_TABLE)
    .update({
      parsed_text: received.data.text ?? "",
      parsed_html: received.data.html ?? null,
      message_id_header: messageIdHeader,
      in_reply_to_header: inReplyToHeader,
      references_headers: referencesHeaders,
      body_retrieval_status: "available",
      body_retrieval_attempts: attempts,
      body_retrieved_at: new Date().toISOString(),
      body_retrieval_error: null,
    })
    .eq("id", row.id);

  if (updated.error) {
    throw new Error(`inbound_body_persist_failed: ${updated.error.message}`);
  }

  return { status: "available", attempts };
}

export interface ListInboundAttachmentsResult {
  status: "available" | "none" | "failed" | "already_available";
  count: number;
}

/**
 * Attachment metadata listing. Attachment failures are visible and retryable
 * but never block the support conversation after the body is available, so
 * this step records failures instead of throwing.
 */
export async function listInboundAttachments(
  client: InboundWorkflowClient,
  provider: InboundProviderClient,
  input: { tenantId: string; inboundEmailRowId: string },
): Promise<ListInboundAttachmentsResult> {
  const row = await loadInboundEmailForWorkflow(client, input);

  if (row.attachment_retrieval_status === "available") {
    return { status: "already_available", count: row.attachment_count ?? 0 };
  }

  const attempts = row.attachment_retrieval_attempts + 1;

  let listed: Awaited<ReturnType<InboundProviderClient["fetchAttachments"]>>;
  try {
    listed = await provider.fetchAttachments(
      provider.apiKey,
      row.resend_email_id,
    );
  } catch (error) {
    listed = {
      success: false,
      error: error instanceof Error ? error.message : "provider call failed",
      data: null,
    };
  }

  if (!listed.success || !listed.data) {
    await client
      .from(INBOUND_TABLE)
      .update({
        attachment_retrieval_status: "failed",
        attachment_retrieval_attempts: attempts,
        attachment_retrieval_error: listed.error ?? "attachment listing failed",
      })
      .eq("id", row.id);

    return { status: "failed", count: row.attachment_count ?? 0 };
  }

  const count = listed.data.length;

  await client
    .from(INBOUND_TABLE)
    .update({
      attachment_count: count,
      attachment_retrieval_status: count > 0 ? "available" : "none",
      attachment_retrieval_attempts: attempts,
      attachments_retrieved_at: new Date().toISOString(),
      attachment_retrieval_error: null,
    })
    .eq("id", row.id);

  return { status: count > 0 ? "available" : "none", count };
}

export interface RouteReadyInboundEmailResult {
  status: "routed" | "already_routed" | "skipped" | "skipped_no_body";
  conversationId: string | null;
  messageId: string | null;
  reason: string;
}

/**
 * Support Hub routing for a ready inbound email. Support message readiness
 * requires the body: placeholders never become empty support messages, and a
 * fresh read prevents duplicate routing on replay or concurrent runs.
 */
export async function routeReadyInboundEmail(
  client: InboundWorkflowClient,
  input: { tenantId: string; inboundEmailRowId: string },
  route: (
    envelope: Parameters<typeof routeInboundToSupportHub>[0],
  ) => Promise<InboundRouterResult> = routeInboundToSupportHub,
): Promise<RouteReadyInboundEmailResult> {
  const row = await loadInboundEmailForWorkflow(client, input);

  if (row.support_message_id) {
    return {
      status: "already_routed",
      conversationId: row.conversation_id,
      messageId: row.support_message_id,
      reason: "inbound email already has a Support Hub message.",
    };
  }

  if (row.body_retrieval_status !== "available") {
    return {
      status: "skipped_no_body",
      conversationId: null,
      messageId: null,
      reason:
        "Support Hub routing requires the received email body; the placeholder stays pending.",
    };
  }

  const routing = await route({
    tenantId: row.tenant_id,
    resendEmailId: row.resend_email_id,
    inboundEmailRowId: row.id,
    inboxId: null,
    fromAddress: row.from_email,
    fromName: null,
    toAddresses: row.to_recipients,
    ccAddresses: row.cc_recipients,
    bccAddresses: row.bcc_recipients,
    subject: row.subject,
    messageIdHeader: row.message_id_header,
    inReplyToHeader: row.in_reply_to_header,
    referencesHeaders: row.references_headers,
    bodyText: row.parsed_text ?? "",
    bodyHtml: row.parsed_html,
    receivedAt: row.received_at ?? new Date().toISOString(),
  });

  if (
    routing.status === "routed" &&
    routing.conversationId &&
    routing.messageId
  ) {
    await client
      .from(INBOUND_TABLE)
      .update({
        conversation_id: routing.conversationId,
        support_message_id: routing.messageId,
      })
      .eq("id", row.id);

    return {
      status: "routed",
      conversationId: routing.conversationId,
      messageId: routing.messageId,
      reason: routing.reason,
    };
  }

  return {
    status: "skipped",
    conversationId: null,
    messageId: null,
    reason: routing.reason,
  };
}

/**
 * Body retrieval exhaustion: automatic attempts stopped without success. The
 * placeholder stays visible for audit and authorized staff retry; it still
 * must not become an empty Support Hub message.
 */
export async function markInboundBodyRetrievalFailed(
  client: InboundWorkflowClient,
  input: { inboundEmailRowId: string },
): Promise<void> {
  await client
    .from(INBOUND_TABLE)
    .update({ body_retrieval_status: "failed" })
    .eq("id", input.inboundEmailRowId)
    .in("body_retrieval_status", ["pending", "processing"]);
}

export type InboundRetryKind = "body" | "attachments";

export interface InboundRetryDispatchResult {
  status: "retry_dispatched" | "active_retry_in_progress" | "not_needed";
  dispatch: RequestWorkflowDispatchResult["outcome"] | null;
}

export interface InboundRetryDeps {
  client: InboundWorkflowClient;
  requestDispatch?: (
    deps: RequestWorkflowDispatchDeps,
    input: CreateDispatchRequestInput,
  ) => Promise<RequestWorkflowDispatchResult>;
}

/**
 * Staff-requested retry for inbound body or attachment retrieval. The retry
 * runs through product authorization (caller), a product work claim (one
 * active retry per item), and workflow dispatch. Staff never reach the
 * provider directly and never receive provider internals back.
 */
export async function requestInboundEmailRetryDispatch(
  deps: InboundRetryDeps,
  input: {
    tenantId: string;
    inboundEmailRowId: string;
    kind: InboundRetryKind;
    requestedBy: string;
  },
): Promise<InboundRetryDispatchResult> {
  const row = await loadInboundEmailForWorkflow(deps.client, {
    tenantId: input.tenantId,
    inboundEmailRowId: input.inboundEmailRowId,
  });

  if (input.kind === "body" && row.body_retrieval_status === "available") {
    return { status: "not_needed", dispatch: null };
  }

  if (
    input.kind === "attachments" &&
    row.attachment_retrieval_status === "available"
  ) {
    return { status: "not_needed", dispatch: null };
  }

  const claim = await acquireWorkClaim(deps.client, {
    tenantId: input.tenantId,
    subject: {
      type: `inbound_email_${input.kind}_retry`,
      id: row.id,
    },
    claimedBy: `staff-retry:${input.requestedBy}`,
  });

  if (!claim.acquired || !claim.claimId) {
    // Active retry reuse: repeated clicks see the in-progress attempt
    // instead of creating duplicate provider work.
    return { status: "active_retry_in_progress", dispatch: null };
  }

  try {
    const statusPatch =
      input.kind === "body"
        ? { body_retrieval_status: "pending", body_retrieval_error: null }
        : {
            attachment_retrieval_status: "retrying",
            attachment_retrieval_error: null,
          };

    await deps.client.from(INBOUND_TABLE).update(statusPatch).eq("id", row.id);

    const attempts =
      input.kind === "body"
        ? row.body_retrieval_attempts
        : row.attachment_retrieval_attempts;

    const requestDispatch = deps.requestDispatch ?? requestWorkflowDispatch;
    const dispatch = await requestDispatch(
      { client: deps.client },
      {
        tenantId: input.tenantId,
        productArea: "email",
        workflowName: EMAIL_INBOUND_PROCESS_EVENT,
        subject: { type: "email_inbound_message", id: row.id },
        idempotencyKey: `inbound-email-retry/${row.id}/${input.kind}/attempt-${attempts}`,
        context: { retryKind: input.kind, requestedBy: input.requestedBy },
      },
    );

    return { status: "retry_dispatched", dispatch: dispatch.outcome };
  } finally {
    await releaseWorkClaim(deps.client, { claimId: claim.claimId });
  }
}
