import {
  deleteSupportSignature,
  readJsonBody,
  requireSupportHubAccess,
  saveSupportSignature,
  setDefaultSupportSignature,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveSignatureSchema } from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const url = new URL(request.url);
  if (url.searchParams.get("default") === "true") {
    try {
      await setDefaultSupportSignature(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to set default signature.");
    }
  }
  const body = await readJsonBody(request, saveSignatureSchema);
  if (!body.ok) return body.response;
  try {
    const signature = await saveSupportSignature({ ...body.body, id });
    return Response.json({ signature });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to update signature.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const { id } = await context.params;
    await deleteSupportSignature(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete signature.");
  }
}
