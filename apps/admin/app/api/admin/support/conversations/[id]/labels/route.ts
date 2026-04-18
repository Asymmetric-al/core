import {
  readJsonBody,
  withSupportHubAccess,
  toApiErrorResponse,
  toggleSupportConversationLabel,
} from "@asym/api/admin/support-hub";
import { toggleConversationLabelSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
    const body = await readJsonBody(request, toggleConversationLabelSchema);
    if (!body.ok) return body.response;
    try {
      const { id } = await context.params;
      if (body.body.conversationId !== id) {
        return Response.json(
          { error: "conversationId mismatch." },
          { status: 422 },
        );
      }
      const conversation = await toggleSupportConversationLabel(body.body);
      return Response.json({ conversation });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to toggle label.");
    }
  });
}
