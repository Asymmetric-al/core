import {
  readJsonBody,
  supportHubOwnership,
  toApiErrorResponse,
  withSupportHubAccess,
} from "@asym/api/admin/support-hub";
import { saveNotificationPreferencesSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET(request: Request) {
  return withSupportHubAccess(request, async (context) => {
    try {
      const [preferences, access] = await Promise.all([
        supportHubOwnership.listNotificationPreferences(context),
        supportHubOwnership.describeAccess(context),
      ]);
      return Response.json({ preferences, access });
    } catch (error) {
      return toApiErrorResponse(
        error,
        "Failed to list notification preferences.",
      );
    }
  });
}

export async function PATCH(request: Request) {
  return withSupportHubAccess(request, async (context) => {
    const body = await readJsonBody(request, saveNotificationPreferencesSchema);
    if (!body.ok) return body.response;
    try {
      const preferences = await supportHubOwnership.saveNotificationPreferences(
        context,
        body.body,
      );
      return Response.json({ preferences });
    } catch (error) {
      return toApiErrorResponse(
        error,
        "Failed to save notification preferences.",
      );
    }
  });
}
