import {
  getSupportInboxSettings,
  readJsonBody,
  requireSupportHubAccess,
  saveSupportInboxSettings,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveInboxSettingsSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET(request: Request) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const url = new URL(request.url);
    const settings = await getSupportInboxSettings(
      url.searchParams.get("inboxId"),
    );
    return Response.json({ settings });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load inbox settings.");
  }
}

export async function PATCH(request: Request) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, saveInboxSettingsSchema);
  if (!body.ok) return body.response;
  try {
    const settings = await saveSupportInboxSettings(body.body);
    return Response.json({ settings });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to save inbox settings.");
  }
}
