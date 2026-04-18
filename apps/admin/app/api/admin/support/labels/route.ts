import {
  listSupportLabels,
  readJsonBody,
  requireSupportHubAccess,
  saveSupportLabel,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveLabelSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const labels = await listSupportLabels();
    return Response.json({ labels });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list labels.");
  }
}

export async function POST(request: Request) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, saveLabelSchema);
  if (!body.ok) return body.response;
  try {
    const label = await saveSupportLabel(body.body);
    return Response.json({ label }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to save label.");
  }
}
