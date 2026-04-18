import {
  listSupportNotificationPreferences,
  readJsonBody,
  withSupportHubAccess,
  saveSupportNotificationPreferences,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveNotificationPreferencesSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  return withSupportHubAccess(async () => {
    try {
      const preferences = await listSupportNotificationPreferences();
      return Response.json({ preferences });
    } catch (error) {
      return toApiErrorResponse(
        error,
        "Failed to list notification preferences.",
      );
    }
  });
}

export async function PATCH(request: Request) {
  return withSupportHubAccess(async () => {
    const body = await readJsonBody(request, saveNotificationPreferencesSchema);
    if (!body.ok) return body.response;
    try {
      const preferences = await saveSupportNotificationPreferences(body.body);
      return Response.json({ preferences });
    } catch (error) {
      return toApiErrorResponse(
        error,
        "Failed to save notification preferences.",
      );
    }
  });
}
