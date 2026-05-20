import {
  listSupportCannedResponses,
  readJsonBody,
  withSupportHubAccess,
  saveSupportCannedResponse,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveCannedResponseSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET(request: Request) {
  return withSupportHubAccess(request, async () => {
    try {
      const cannedResponses = await listSupportCannedResponses();
      return Response.json({ cannedResponses });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to list canned responses.");
    }
  });
}

export async function POST(request: Request) {
  return withSupportHubAccess(request, async () => {
    const body = await readJsonBody(request, saveCannedResponseSchema);
    if (!body.ok) return body.response;
    try {
      const cannedResponse = await saveSupportCannedResponse(body.body);
      return Response.json({ cannedResponse }, { status: 201 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to save canned response.");
    }
  });
}
