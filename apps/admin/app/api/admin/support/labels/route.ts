import {
  listSupportLabels,
  readJsonBody,
  withSupportHubAccess,
  saveSupportLabel,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveLabelSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET(request: Request) {
  return withSupportHubAccess(request, async () => {
    try {
      const labels = await listSupportLabels();
      return Response.json({ labels });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to list labels.");
    }
  });
}

export async function POST(request: Request) {
  return withSupportHubAccess(request, async () => {
    const body = await readJsonBody(request, saveLabelSchema);
    if (!body.ok) return body.response;
    try {
      const label = await saveSupportLabel(body.body);
      return Response.json({ label }, { status: 201 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to save label.");
    }
  });
}
