import {
  readJsonBody,
  supportHubOwnership,
  toApiErrorResponse,
  withSupportHubAccess,
} from "@asym/api/admin/support-hub";
import { saveSavedViewSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, routeContext: RouteContext) {
  return withSupportHubAccess(request, async (context) => {
    const body = await readJsonBody(request, saveSavedViewSchema);
    if (!body.ok) return body.response;
    try {
      const { id } = await routeContext.params;
      const savedView = await supportHubOwnership.saveSavedView(context, {
        ...body.body,
        id,
      });
      return Response.json({ savedView });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to update saved view.");
    }
  });
}

export async function DELETE(request: Request, routeContext: RouteContext) {
  return withSupportHubAccess(request, async (context) => {
    try {
      const { id } = await routeContext.params;
      await supportHubOwnership.deleteSavedView(context, id);
      return new Response(null, { status: 204 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to delete saved view.");
    }
  });
}
