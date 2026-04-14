import {
  createCareThreadPost,
  threadPostSchema,
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

  const body = await readJsonBody(request, threadPostSchema);
  if (!body.ok) {
    return body.response;
  }

  try {
    const result = await createCareThreadPost(
      auth.context.tenantId,
      auth.context.userId,
      body.body,
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    return toMutationErrorResponse(error, "Failed to create thread post.");
  }
}
