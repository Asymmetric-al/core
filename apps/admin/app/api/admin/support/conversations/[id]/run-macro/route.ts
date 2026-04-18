import {
  readJsonBody,
  requireSupportHubAccess,
  runSupportMacroOnServer,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { z } from "zod";

const runMacroSchema = z.object({
  conversationId: z.string().min(1),
  macroId: z.string().min(1),
  authorAgentId: z.string().min(1),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, runMacroSchema);
  if (!body.ok) return body.response;
  try {
    const { id } = await context.params;
    if (body.body.conversationId !== id) {
      return Response.json(
        { error: "conversationId mismatch." },
        { status: 422 },
      );
    }
    const result = await runSupportMacroOnServer(body.body);
    return Response.json({ result });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to run macro.");
  }
}
