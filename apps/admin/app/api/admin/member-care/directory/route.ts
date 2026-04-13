import { readMemberCareDirectory } from "@asym/api/reads/member-care";

import { requireMemberCareAccess, toApiErrorResponse } from "../_lib";

export async function GET() {
  const auth = await requireMemberCareAccess();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const directory = await readMemberCareDirectory(auth.context.tenantId);
    return Response.json({ data: directory });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load member care directory.");
  }
}
