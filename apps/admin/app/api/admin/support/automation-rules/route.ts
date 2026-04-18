import {
  listSupportAutomationRules,
  readJsonBody,
  requireSupportHubAccess,
  saveSupportAutomationRule,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveAutomationRuleSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  try {
    const automationRules = await listSupportAutomationRules();
    return Response.json({ automationRules });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list automation rules.");
  }
}

export async function POST(request: Request) {
  const auth = await requireSupportHubAccess();
  if (!auth.ok) return auth.response;
  const body = await readJsonBody(request, saveAutomationRuleSchema);
  if (!body.ok) return body.response;
  try {
    const automationRule = await saveSupportAutomationRule(body.body);
    return Response.json({ automationRule }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to save automation rule.");
  }
}
