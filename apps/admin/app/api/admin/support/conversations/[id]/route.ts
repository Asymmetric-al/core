import {
  getSupportConversation,
  withSupportHubAccess,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {

  return withSupportHubAccess(async () => {
  try {
    const { id } = await context.params;
    const conversation = await getSupportConversation(id);
    if (!conversation) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ conversation });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load conversation.");
  }
  });
}
