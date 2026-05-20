import {
  careRequirementSchema,
  upsertCareRequirement,
} from "@asym/api/admin/member-care/mutations";
import {
  readJsonBody,
  requireMemberCareAccess,
  toMutationErrorResponse,
} from "@asym/api/admin/member-care/route-helpers";

export async function POST(request: Request) {
  const auth = await requireMemberCareAccess(request);
  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJsonBody(request, careRequirementSchema);
  if (!body.ok) {
    return body.response;
  }

  try {
    const result = await upsertCareRequirement(
      auth.context.tenantId,
      auth.context.userId,
      body.body,
    );
    return Response.json(result);
  } catch (error) {
    return toMutationErrorResponse(error, "Failed to upsert care requirement.");
  }
}
