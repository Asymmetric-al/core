import {
  listSupportBusinessHours,
  readJsonBody,
  requireSupportHubAccess,
  saveSupportBusinessHours,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveBusinessHoursSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const businessHours = await listSupportBusinessHours();
    return Response.json({ businessHours });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list business hours.");
  }
}

export async function POST(request: Request) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, saveBusinessHoursSchema);
  if (!body.ok) return body.response;
  try {
    const businessHours = await saveSupportBusinessHours(body.body);
    return Response.json({ businessHours }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to save business hours.");
  }
}
