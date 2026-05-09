import { z } from "zod";

/**
 * Inbound email → Support Hub conversation routing.
 *
 * Phase 7 — STUB. The body is intentionally a no-op. The seam exists so
 * Phase 8 can wire `packages/api/src/email/webhooks/resend.ts`'s
 * `email.received` branch into the support hub without a contract change at
 * the call site.
 *
 * Phase 8 work (planned):
 *   1. Pull the Resend `email.received` payload (body, headers, attachments).
 *   2. Resolve the tenant via `tenant_email_settings` + recipient address.
 *   3. Thread the message via `In-Reply-To` → `References` → `(tenant,
 *      external_email, normalized_subject)` lookup, otherwise create a new
 *      `support_conversations` row.
 *   4. Insert a `support_messages` row with `direction = "inbound"`,
 *      `type = "email"`, the parsed body, and the message-id headers.
 *   5. Re-evaluate enabled automation rules whose `trigger` is
 *      `message_received`; dispatch matched actions through the existing
 *      `runSupportMacro` helper (the planned actions already speak the
 *      `SupportMacroAction` shape — see Phase 6 automation engine).
 */

export const inboundEmailEnvelopeSchema = z.object({
  tenantId: z.string().min(1).nullable(),
  resendEmailId: z.string().min(1),
  inboxId: z.string().min(1).nullable(),
  fromAddress: z.string().min(1),
  toAddresses: z.array(z.string().min(1)),
  subject: z.string().nullable(),
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
 * Phase 7 stub: validates the envelope so callers can rely on a typed result
 * shape, then returns `status: "deferred"` so the existing Resend webhook
 * keeps logging "warning: stored, not threaded yet". Phase 8 fills in the
 * real implementation.
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
  return {
    status: "deferred",
    conversationId: null,
    messageId: null,
    reason:
      "support hub inbound router is stubbed in Phase 7; Phase 8 wires the Supabase migration + threading logic.",
  };
}
