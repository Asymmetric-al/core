import {
  listSupportConversations,
  withSupportHubAccess,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";

export async function GET(request: Request) {
  return withSupportHubAccess(async () => {
    try {
      const url = new URL(request.url);
      const conversations = await listSupportConversations({
        inboxId: url.searchParams.get("inboxId") ?? undefined,
        status:
          (url.searchParams.get("status") as
            | "open"
            | "pending"
            | "snoozed"
            | "resolved"
            | "all"
            | null) ?? undefined,
        assigneeAgentId: url.searchParams.get("assigneeAgentId") ?? undefined,
        q: url.searchParams.get("q") ?? undefined,
        labelSlugs:
          url.searchParams.get("labels")?.split(",").filter(Boolean) ??
          undefined,
      });
      return Response.json({ conversations });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to list support conversations.");
    }
  });
}
