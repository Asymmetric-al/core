import {
  listSupportSavedViews,
  readJsonBody,
  withSupportHubAccess,
  saveSupportSavedView,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveSavedViewSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET(request: Request) {
  return withSupportHubAccess(request, async () => {
    try {
      const savedViews = await listSupportSavedViews();
      return Response.json({ savedViews });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to list saved views.");
    }
  });
}

export async function POST(request: Request) {
  return withSupportHubAccess(request, async () => {
    const body = await readJsonBody(request, saveSavedViewSchema);
    if (!body.ok) return body.response;
    try {
      const savedView = await saveSupportSavedView(body.body);
      return Response.json({ savedView }, { status: 201 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to save saved view.");
    }
  });
}
