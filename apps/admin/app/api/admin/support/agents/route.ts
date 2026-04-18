import {
  listSupportAgents,
  requireSupportHubAccess,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";

export async function GET() {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const agents = await listSupportAgents();
    return Response.json({ agents });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list agents.");
  }
}
