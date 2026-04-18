import {
  listSupportAutomationRules,
  readJsonBody,
  withSupportHubAccess,
  saveSupportAutomationRule,
  toApiErrorResponse,
} from "@asym/api/admin/support-hub";
import { saveAutomationRuleSchema } from "@asym/api/admin/support-hub/schemas";

export async function GET() {
  return withSupportHubAccess(async () => {
  try {
    const automationRules = await listSupportAutomationRules();
    return Response.json({ automationRules });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list automation rules.");
  }
  });
}

export async function POST(request: Request) {
  return withSupportHubAccess(async () => {
  const body = await readJsonBody(request, saveAutomationRuleSchema);
  if (!body.ok) return body.response;
  try {
    const automationRule = await saveSupportAutomationRule(body.body);
    return Response.json({ automationRule }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to save automation rule.");
  }
  });
}
