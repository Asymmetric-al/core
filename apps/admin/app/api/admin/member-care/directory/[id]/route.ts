import {
  requireMemberCareAccess,
  toApiErrorResponse,
} from "@asym/api/admin/member-care/route-helpers";
import { readMemberCarePersonDetail } from "@asym/api/reads/member-care";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireMemberCareAccess(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const detail = await readMemberCarePersonDetail(
      auth.context.tenantId,
      id,
      auth.context.userId,
      auth.context.isSuperAdmin,
    );

    if (!detail.personnel) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(detail);
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load member care profile.");
  }
}
