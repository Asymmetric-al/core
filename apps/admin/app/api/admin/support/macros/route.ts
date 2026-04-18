import {
  listSupportMacros,
  readJsonBody,
  requireSupportHubAccess,
  saveSupportMacro,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveMacroSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const macros = await listSupportMacros();
    return Response.json({ macros });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list macros.");
  }
}

export async function POST(request: Request) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, saveMacroSchema);
  if (!body.ok) return body.response;
  try {
    const macro = await saveSupportMacro(body.body);
    return Response.json({ macro }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to save macro.");
  }
}
