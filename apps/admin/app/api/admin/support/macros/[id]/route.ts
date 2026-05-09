import {
  deleteSupportMacro,
  readJsonBody,
  withSupportHubAccess,
  saveSupportMacro,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveMacroSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
    const body = await readJsonBody(request, saveMacroSchema);
    if (!body.ok) return body.response;
    try {
      const { id } = await context.params;
      const macro = await saveSupportMacro({ ...body.body, id });
      return Response.json({ macro });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to update macro.");
    }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
    try {
      const { id } = await context.params;
      await deleteSupportMacro(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to delete macro.");
    }
  });
}
