import {
  listSupportSignatures,
  readJsonBody,
  requireSupportHubAccess,
  saveSupportSignature,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveSignatureSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const signatures = await listSupportSignatures();
    return Response.json({ signatures });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list signatures.");
  }
}

export async function POST(request: Request) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, saveSignatureSchema);
  if (!body.ok) return body.response;
  try {
    const signature = await saveSupportSignature(body.body);
    return Response.json({ signature }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to save signature.");
  }
}
