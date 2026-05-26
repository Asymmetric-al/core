import {
  listSupportConversationMessages,
  withSupportHubAccess,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withSupportHubAccess(request, async () => {
    try {
      const { id } = await context.params;
      const messages = await listSupportConversationMessages(id);
      return Response.json({ messages });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to list messages.");
    }
  });
}
