import {
  setManualAttentionFlag,
  type SetManualAttentionInput,
} from "@asym/api/admin/member-care/mutations";

import {
  readJsonBody,
  requireMemberCareAccess,
  toMutationErrorResponse,
} from "../_lib";

export async function PATCH(request: Request) {
  const auth = await requireMemberCareAccess();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  try {
    const result = await setManualAttentionFlag(
      auth.context.tenantId,
      body.body as SetManualAttentionInput,
    );
    return Response.json(result);
  } catch (error) {
    return toMutationErrorResponse(
      error,
      "Failed to set manual attention flag.",
    );
  }
}
