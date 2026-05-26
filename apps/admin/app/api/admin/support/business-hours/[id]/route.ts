import {
  deleteSupportBusinessHours,
  readJsonBody,
  withSupportHubAccess,
  saveSupportBusinessHours,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveBusinessHoursSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withSupportHubAccess(request, async () => {
    const body = await readJsonBody(request, saveBusinessHoursSchema);
    if (!body.ok) return body.response;
    try {
      const { id } = await context.params;
      const businessHours = await saveSupportBusinessHours({
        ...body.body,
        id,
      });
      return Response.json({ businessHours });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to update business hours.");
    }
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return withSupportHubAccess(request, async () => {
    try {
      const { id } = await context.params;
      await deleteSupportBusinessHours(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to delete business hours.");
    }
  });
}
