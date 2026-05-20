import {
  listSupportSlaPolicies,
  readJsonBody,
  withSupportHubAccess,
  saveSupportSlaPolicy,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveSlaPolicySchema } from "@asym/api/admin/support-hub/schemas";

export async function GET(request: Request) {
  return withSupportHubAccess(request, async () => {
    try {
      const slaPolicies = await listSupportSlaPolicies();
      return Response.json({ slaPolicies });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to list SLA policies.");
    }
  });
}

export async function POST(request: Request) {
  return withSupportHubAccess(request, async () => {
    const body = await readJsonBody(request, saveSlaPolicySchema);
    if (!body.ok) return body.response;
    try {
      const slaPolicy = await saveSupportSlaPolicy(body.body);
      return Response.json({ slaPolicy }, { status: 201 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to save SLA policy.");
    }
  });
}
