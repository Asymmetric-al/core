import { readMemberCareDashboardSnapshot } from "@asym/api/reads/member-care";

import { requireMemberCareAccess, toApiErrorResponse } from "../_lib";

export async function GET() {
  const auth = await requireMemberCareAccess();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const snapshot = await readMemberCareDashboardSnapshot(auth.context.tenantId);
    return Response.json(snapshot);
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load member care dashboard.");
  }
}
