import {
  logCareActivity,
  type LogCareActivityInput,
} from "@asym/api/admin/member-care/mutations";

import {
  readJsonBody,
  requireMemberCareAccess,
  toMutationErrorResponse,
} from "../_lib";

export async function POST(request: Request) {
  const auth = await requireMemberCareAccess();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  try {
    const result = await logCareActivity(
      auth.context.tenantId,
      auth.context.userId,
      body.body as LogCareActivityInput,
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    return toMutationErrorResponse(error, "Failed to log care activity.");
  }
}
