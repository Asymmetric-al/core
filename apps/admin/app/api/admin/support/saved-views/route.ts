import {
  readJsonBody,
  supportHubOwnership,
  toApiErrorResponse,
  withSupportHubAccess,
} from "@asym/api/admin/support-hub";
import { saveSavedViewSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET(request: Request) {
  return withSupportHubAccess(request, async (context) => {
    try {
      const [savedViews, access] = await Promise.all([
        supportHubOwnership.listSavedViews(context),
        supportHubOwnership.describeAccess(context),
      ]);
      return Response.json({ savedViews, access });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to list saved views.");
    }
  });
}

export async function POST(request: Request) {
  return withSupportHubAccess(request, async (context) => {
    const body = await readJsonBody(request, saveSavedViewSchema);
    if (!body.ok) return body.response;
    try {
      const savedView = await supportHubOwnership.saveSavedView(
        context,
        body.body,
      );
      return Response.json({ savedView }, { status: 201 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to save saved view.");
    }
  });
}
