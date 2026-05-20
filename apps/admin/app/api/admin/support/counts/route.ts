import {
  listSupportConversations,
  withSupportHubAccess,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";

/**
 * Lightweight stats endpoint. Returns a per-status breakdown of every
 * conversation visible to the caller. The richer Phase 6 metrics live behind
 * the `/api/admin/support/reports` endpoint; this one is used by the inbox
 * stats strip and by smoke tests as a quick "is the API alive" probe.
 */
export async function GET(request: Request) {
  return withSupportHubAccess(request, async () => {
    try {
      const conversations = await listSupportConversations({});
      const counts = {
        total: conversations.length,
        open: conversations.filter((c) => c.status === "open").length,
        pending: conversations.filter((c) => c.status === "pending").length,
        snoozed: conversations.filter((c) => c.status === "snoozed").length,
        resolved: conversations.filter((c) => c.status === "resolved").length,
        escalated: conversations.filter((c) => c.escalatedAt !== null).length,
        unassigned: conversations.filter((c) => c.assignee === null).length,
      };
      return Response.json({ counts });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to compute counts.");
    }
  });
}
