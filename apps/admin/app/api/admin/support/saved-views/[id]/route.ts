import {
  deleteSupportSavedView,
  readJsonBody,
  requireSupportHubAccess,
  saveSupportSavedView,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveSavedViewSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, saveSavedViewSchema);
  if (!body.ok) return body.response;
  try {
    const { id } = await context.params;
    const savedView = await saveSupportSavedView({ ...body.body, id });
    return Response.json({ savedView });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to update saved view.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const { id } = await context.params;
    await deleteSupportSavedView(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete saved view.");
  }
}
