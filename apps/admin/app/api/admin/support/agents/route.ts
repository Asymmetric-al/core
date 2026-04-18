import {
  listSupportAgents,
  withSupportHubAccess,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";

export async function GET() {
  return withSupportHubAccess(async () => {
  try {
    const agents = await listSupportAgents();
    return Response.json({ agents });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list agents.");
  }
  });
}
