import {
  requireMemberCareAccess,
  toApiErrorResponse,
} from "@asym/api/admin/member-care/route-helpers";
import { readMemberCareDirectory } from "@asym/api/reads/member-care";

export async function GET() {
  const auth = await requireMemberCareAccess();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const directory = await readMemberCareDirectory(auth.context.tenantId);
    return Response.json(directory);
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load member care directory.");
  }
}
