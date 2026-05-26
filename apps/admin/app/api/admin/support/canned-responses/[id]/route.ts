import {
  deleteSupportCannedResponse,
  readJsonBody,
  withSupportHubAccess,
  saveSupportCannedResponse,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveCannedResponseSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withSupportHubAccess(request, async () => {
    const body = await readJsonBody(request, saveCannedResponseSchema);
    if (!body.ok) return body.response;
    try {
      const { id } = await context.params;
      const cannedResponse = await saveSupportCannedResponse({
        ...body.body,
        id,
      });
      return Response.json({ cannedResponse });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to update canned response.");
    }
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return withSupportHubAccess(request, async () => {
    try {
      const { id } = await context.params;
      await deleteSupportCannedResponse(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to delete canned response.");
    }
  });
}
