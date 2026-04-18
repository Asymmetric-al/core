import {
  addSupportPrivateNote,
  readJsonBody,
  withSupportHubAccess,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { addPrivateNoteSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
    const body = await readJsonBody(request, addPrivateNoteSchema);
    if (!body.ok) return body.response;
    try {
      const { id } = await context.params;
      if (body.body.conversationId !== id) {
        return Response.json(
          { error: "conversationId mismatch." },
          { status: 422 },
        );
      }
      const message = await addSupportPrivateNote(body.body);
      return Response.json({ message }, { status: 201 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to add private note.");
    }
  });
}
