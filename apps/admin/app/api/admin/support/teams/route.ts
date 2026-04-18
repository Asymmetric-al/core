import {
  listSupportTeams,
  readJsonBody,
  withSupportHubAccess,
  saveSupportTeam,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveTeamSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  return withSupportHubAccess(async () => {
  try {
    const teams = await listSupportTeams();
    return Response.json({ teams });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list teams.");
  }
  });
}

export async function POST(request: Request) {
  return withSupportHubAccess(async () => {
  const body = await readJsonBody(request, saveTeamSchema);
  if (!body.ok) return body.response;
  try {
    const team = await saveSupportTeam(body.body);
    return Response.json({ team }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to save team.");
  }
  });
}
