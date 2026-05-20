import {
  manualAttentionSchema,
  setManualAttentionFlag,
} from "@asym/api/admin/member-care/mutations";
import {
  readJsonBody,
  requireMemberCareAccess,
  toMutationErrorResponse,
} from "@asym/api/admin/member-care/route-helpers";

export async function PATCH(request: Request) {
  const auth = await requireMemberCareAccess(request);
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJsonBody(request, manualAttentionSchema);
  if (!body.ok) {
    return body.response;
  }

  try {
    const result = await setManualAttentionFlag(
      auth.context.tenantId,
      body.body,
    );
    return Response.json(result);
  } catch (error) {
    return toMutationErrorResponse(
      error,
      "Failed to set manual attention flag.",
    );
  }
}
