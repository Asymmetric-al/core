import {
  requireMemberCareAccess,
  toApiErrorResponse,
} from "@asym/api/admin/member-care/route-helpers";
import {
  readMemberCareDirectorySnapshot,
  MEMBER_CARE_DIRECTORY_LIMIT,
} from "@asym/api/reads/member-care";

export async function GET(request: Request) {
  const auth = await requireMemberCareAccess(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const directory = await readMemberCareDirectorySnapshot(
      auth.context.tenantId,
    );
    return Response.json(directory.personnel, {
      headers: {
        "X-Total-Count": String(directory.total),
        "X-Directory-Limit": String(MEMBER_CARE_DIRECTORY_LIMIT),
      },
    });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load member care directory.");
  }
}
