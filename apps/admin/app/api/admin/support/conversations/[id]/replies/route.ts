import {
  readJsonBody,
  withSupportHubAccess,
  sendSupportReply,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { sendReplySchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
    const body = await readJsonBody(request, sendReplySchema);
    if (!body.ok) return body.response;
    try {
      const { id } = await context.params;
      if (body.body.conversationId !== id) {
        return Response.json(
          { error: "conversationId in payload must match the route id." },
          { status: 422 },
        );
      }
      const message = await sendSupportReply(body.body);
      return Response.json({ message }, { status: 201 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to send reply.");
    }
  });
}
