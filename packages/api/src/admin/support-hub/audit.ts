import type { getAdminClient } from "@asym/database/supabase/admin";

type SupportAuditClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

export interface SupportAuditEntry {
  tenantId: string;
  conversationId?: string | null;
  actorProfileId: string | null;
  verb: string;
  body: string;
  metadata: Record<string, unknown>;
}

function toAuditRow(entry: SupportAuditEntry) {
  return {
    tenant_id: entry.tenantId,
    conversation_id: entry.conversationId ?? null,
    actor_profile_id: entry.actorProfileId,
    actor_agent_id: null,
    verb: entry.verb,
    body: entry.body,
    metadata: entry.metadata,
  };
}

/**
 * Appends one entry — or several entries in ONE insert, so paired markers
 * succeed or fail together — to support_audit_log. Throws on failure: audit
 * history is part of the product behavior, so callers either let the error
 * propagate or map it to their safe failure code.
 */
export async function appendSupportAudit(
  client: SupportAuditClient,
  entries: SupportAuditEntry | SupportAuditEntry[],
): Promise<void> {
  const payload = Array.isArray(entries)
    ? entries.map(toAuditRow)
    : toAuditRow(entries);

  const { error } = await client.from("support_audit_log").insert(payload);

  if (error) {
    throw new Error(`support_audit_append_failed: ${error.message}`);
  }
}
