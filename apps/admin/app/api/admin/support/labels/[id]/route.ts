import {
  deleteSupportLabel,
  readJsonBody,
  withSupportHubAccess,
  saveSupportLabel,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveLabelSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
  const body = await readJsonBody(request, saveLabelSchema);
  if (!body.ok) return body.response;
  try {
    const { id } = await context.params;
    const label = await saveSupportLabel({ ...body.body, id });
    return Response.json({ label });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to update label.");
  }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
  try {
    const { id } = await context.params;
    await deleteSupportLabel(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete label.");
  }
  });
}
