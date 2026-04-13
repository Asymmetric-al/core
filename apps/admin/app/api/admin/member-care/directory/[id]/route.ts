import { readMemberCarePersonDetail } from "@asym/api/reads/member-care";

import { requireMemberCareAccess, toApiErrorResponse } from "../../_lib";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireMemberCareAccess();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const detail = await readMemberCarePersonDetail(auth.context.tenantId, id);

    if (!detail.personnel) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(detail);
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load member care profile.");
  }
}
