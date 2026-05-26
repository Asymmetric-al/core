import {
  requireMemberCareAccess,
  toApiErrorResponse,
} from "@asym/api/admin/member-care/route-helpers";
import { readMemberCareDashboardSnapshot } from "@asym/api/reads/member-care";

export async function GET(request: Request) {
  const auth = await requireMemberCareAccess(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const snapshot = await readMemberCareDashboardSnapshot(
      auth.context.tenantId,
    );
    return Response.json(snapshot);
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load member care dashboard.");
  }
}
