import {
  listSupportSavedViews,
  readJsonBody,
  requireSupportHubAccess,
  saveSupportSavedView,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveSavedViewSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const savedViews = await listSupportSavedViews();
    return Response.json({ savedViews });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list saved views.");
  }
}

export async function POST(request: Request) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, saveSavedViewSchema);
  if (!body.ok) return body.response;
  try {
    const savedView = await saveSupportSavedView(body.body);
    return Response.json({ savedView }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to save saved view.");
  }
}
