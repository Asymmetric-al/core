import {
  readJsonBody,
  withSupportHubAccess,
  setSupportConversationPriority,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { setConversationPrioritySchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withSupportHubAccess(request, async () => {
    const body = await readJsonBody(request, setConversationPrioritySchema);
    if (!body.ok) return body.response;
    try {
      const { id } = await context.params;
      if (body.body.conversationId !== id) {
        return Response.json(
          { error: "conversationId mismatch." },
          { status: 422 },
        );
      }
      const conversation = await setSupportConversationPriority(body.body);
      return Response.json({ conversation });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to set priority.");
    }
  });
}
