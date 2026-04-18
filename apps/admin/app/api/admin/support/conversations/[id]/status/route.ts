import {
  readJsonBody,
  requireSupportHubAccess,
  setSupportConversationStatus,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { setConversationStatusSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, setConversationStatusSchema);
  if (!body.ok) return body.response;
  try {
    const { id } = await context.params;
    if (body.body.conversationId !== id) {
      return Response.json(
        { error: "conversationId mismatch." },
        { status: 422 },
      );
    }
    const conversation = await setSupportConversationStatus(body.body);
    return Response.json({ conversation });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to set status.");
  }
}
