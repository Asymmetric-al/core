import {
  listSupportTeams,
  readJsonBody,
  requireSupportHubAccess,
  saveSupportTeam,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveTeamSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const teams = await listSupportTeams();
    return Response.json({ teams });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list teams.");
  }
}

export async function POST(request: Request) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, saveTeamSchema);
  if (!body.ok) return body.response;
  try {
    const team = await saveSupportTeam(body.body);
    return Response.json({ team }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to save team.");
  }
}
