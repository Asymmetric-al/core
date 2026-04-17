import {
  activitySchema,
  logCareActivity,
} from "@asym/api/admin/member-care/mutations";
import {
  readJsonBody,
  requireMemberCareAccess,
  toMutationErrorResponse,
} from "@asym/api/admin/member-care/route-helpers";

export async function POST(request: Request) {
  const auth = await requireMemberCareAccess();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJsonBody(request, activitySchema);
  if (!body.ok) {
    return body.response;
  }

  try {
    const result = await logCareActivity(
      auth.context.tenantId,
      auth.context.userId,
      body.body,
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    return toMutationErrorResponse(error, "Failed to log care activity.");
  }
}
