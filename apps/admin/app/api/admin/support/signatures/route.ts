import {
  listSupportSignatures,
  readJsonBody,
  withSupportHubAccess,
  saveSupportSignature,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveSignatureSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  return withSupportHubAccess(async () => {
    try {
      const signatures = await listSupportSignatures();
      return Response.json({ signatures });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to list signatures.");
    }
  });
}

export async function POST(request: Request) {
  return withSupportHubAccess(async () => {
    const body = await readJsonBody(request, saveSignatureSchema);
    if (!body.ok) return body.response;
    try {
      const signature = await saveSupportSignature(body.body);
      return Response.json({ signature }, { status: 201 });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to save signature.");
    }
  });
}
