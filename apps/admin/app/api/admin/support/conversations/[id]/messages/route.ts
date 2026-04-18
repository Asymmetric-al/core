import {
  listSupportConversationMessages,
  requireSupportHubAccess,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const messages = await listSupportConversationMessages(id);
    return Response.json({ messages });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list messages.");
  }
}
