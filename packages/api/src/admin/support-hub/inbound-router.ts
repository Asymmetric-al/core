import { z } from "zod";

import { routeInboundEmailToSupabaseSupportHub } from "./adapter/supabase";
import { listSupportInboxes } from "./reads/registry";
import { runWithSupportHubTenant } from "./request-context";
import { extractEmailAddress } from "../../email/address";

/**
 * Inbound email → Support Hub conversation routing.
 */

export const inboundEmailEnvelopeSchema = z.object({
  tenantId: z.string().min(1).nullable(),
  resendEmailId: z.string().min(1),
  inboundEmailRowId: z.string().min(1).nullable().optional(),
  inboxId: z.string().min(1).nullable(),
  fromAddress: z.string().min(1),
  fromName: z.string().min(1).nullable().optional(),
  toAddresses: z.array(z.string().min(1)),
  ccAddresses: z.array(z.string().min(1)).default([]),
  bccAddresses: z.array(z.string().min(1)).default([]),
  subject: z.string().nullable(),
  messageIdHeader: z.string().min(1).nullable().optional(),
  inReplyToHeader: z.string().nullable(),
  referencesHeaders: z.array(z.string()),
  bodyText: z.string(),
  bodyHtml: z.string().nullable(),
  receivedAt: z.string().min(1),
});

export type InboundEmailEnvelope = z.infer<typeof inboundEmailEnvelopeSchema>;

export interface InboundRouterResult {
  status: "deferred" | "routed" | "skipped";
  conversationId: string | null;
  messageId: string | null;
  reason: string;
}

/**
 * Routes a verified Resend inbound email into the tenant's Support Hub inbox.
 * Tenant resolution must happen before this function is called; this function
 * then resolves the inbox, threads by email headers or subject/contact fallback,
 * and inserts the support message through the active adapter.
 */
export async function routeInboundToSupportHub(
  envelope: InboundEmailEnvelope,
): Promise<InboundRouterResult> {
  const parsed = inboundEmailEnvelopeSchema.safeParse(envelope);
  if (!parsed.success) {
    return {
      status: "skipped",
      conversationId: null,
      messageId: null,
      reason: `invalid envelope: ${parsed.error.issues[0]?.message ?? "shape mismatch"}`,
    };
  }

  if (!parsed.data.tenantId) {
    return {
      status: "skipped",
      conversationId: null,
      messageId: null,
      reason: "tenantId is required before routing inbound support email.",
    };
  }

  const inboxId = await resolveInboxId(parsed.data);
  if (!inboxId) {
    return {
      status: "skipped",
      conversationId: null,
      messageId: null,
      reason: "no Support Hub inbox matched the inbound recipients.",
    };
  }

  const routed = await routeInboundEmailToSupabaseSupportHub({
    tenantId: parsed.data.tenantId,
    resendEmailId: parsed.data.resendEmailId,
    inboundEmailRowId: parsed.data.inboundEmailRowId ?? null,
    inboxId,
    fromAddress: parsed.data.fromAddress,
    fromName: parsed.data.fromName ?? null,
    toAddresses: parsed.data.toAddresses,
    ccAddresses: parsed.data.ccAddresses,
    bccAddresses: parsed.data.bccAddresses,
    subject: parsed.data.subject,
    messageIdHeader: parsed.data.messageIdHeader ?? null,
    inReplyToHeader: parsed.data.inReplyToHeader,
    referencesHeaders: parsed.data.referencesHeaders,
    bodyText: parsed.data.bodyText,
    bodyHtml: parsed.data.bodyHtml,
    receivedAt: parsed.data.receivedAt,
  });

  return {
    status: "routed",
    conversationId: routed.conversationId,
    messageId: routed.messageId,
    reason: routed.created
      ? "created a new Support Hub conversation."
      : "threaded inbound email into an existing Support Hub conversation.",
  };
}

async function resolveInboxId(
  envelope: z.infer<typeof inboundEmailEnvelopeSchema>,
): Promise<string | null> {
  if (envelope.inboxId) {
    return envelope.inboxId;
  }

  return runWithSupportHubTenant(envelope.tenantId!, async () => {
    const inboxes = await listSupportInboxes();
    const recipients = new Set(
      [
        ...envelope.toAddresses,
        ...envelope.ccAddresses,
        ...envelope.bccAddresses,
      ]
        .map((address) => extractEmailAddress(address))
        .filter((address): address is string => Boolean(address)),
    );
    const match = inboxes.find((inbox) =>
      recipients.has(inbox.inboundAddress.toLowerCase()),
    );
    return match?.id ?? null;
  });
}
