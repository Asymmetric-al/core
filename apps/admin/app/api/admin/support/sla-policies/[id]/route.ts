import {
  deleteSupportSlaPolicy,
  readJsonBody,
  withSupportHubAccess,
  saveSupportSlaPolicy,
  setDefaultSupportSlaPolicy,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveSlaPolicySchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
  const { id } = await context.params;
  const url = new URL(request.url);
  if (url.searchParams.get("default") === "true") {
    try {
      await setDefaultSupportSlaPolicy(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to set default SLA policy.");
    }
  }
  const body = await readJsonBody(request, saveSlaPolicySchema);
  if (!body.ok) return body.response;
  try {
    const slaPolicy = await saveSupportSlaPolicy({ ...body.body, id });
    return Response.json({ slaPolicy });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to update SLA policy.");
  }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
  try {
    const { id } = await context.params;
    await deleteSupportSlaPolicy(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete SLA policy.");
  }
  });
}
