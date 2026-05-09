import {
  listSupportConversationMessages,
  listSupportConversations,
  withSupportHubAccess,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";

/**
 * Phase 7 report endpoint — returns the raw conversations + messages the
 * Phase 6 aggregator (`apps/admin/features/support-hub/lib/report-aggregations.ts`)
 * needs to compute a `SupportReportSeries`. The UI continues to call the
 * pure aggregator client-side for now; this endpoint lets server-side
 * consumers (Phase 8 inbound runtime, future scheduled exports) get the
 * same shape without going through the TanStack DB collections.
 */
export async function GET(request: Request) {
  return withSupportHubAccess(async () => {
    try {
      const url = new URL(request.url);
      const conversationId = url.searchParams.get("conversationId");
      const conversations = await listSupportConversations({});
      const messages = conversationId
        ? await listSupportConversationMessages(conversationId)
        : [];
      return Response.json({ conversations, messages });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to load report data.");
    }
  });
}
