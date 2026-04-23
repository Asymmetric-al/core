import {
  deleteSupportTeam,
  readJsonBody,
  withSupportHubAccess,
  saveSupportTeam,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveTeamSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
    const body = await readJsonBody(request, saveTeamSchema);
    if (!body.ok) return body.response;
    try {
      const { id } = await context.params;
      const team = await saveSupportTeam({ ...body.body, id });
      return Response.json({ team });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to update team.");
    }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
    try {
      const { id } = await context.params;
      await deleteSupportTeam(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to delete team.");
    }
  });
}
