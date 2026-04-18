import {
  deleteSupportAutomationRule,
  readJsonBody,
  withSupportHubAccess,
  saveSupportAutomationRule,
  toApiErrorResponse,
  toggleSupportAutomationRule,
} from "@asym/api/admin/support-hub";
import {
  saveAutomationRuleSchema,
  toggleAutomationRuleSchema,
} from "@asym/api/admin/support-hub/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
  const { id } = await context.params;
  const url = new URL(request.url);
  if (url.searchParams.get("toggle") === "true") {
    const body = await readJsonBody(request, toggleAutomationRuleSchema);
    if (!body.ok) return body.response;
    try {
      const automationRule = await toggleSupportAutomationRule({
        ...body.body,
        id,
      });
      return Response.json({ automationRule });
    } catch (error) {
      return toApiErrorResponse(error, "Failed to toggle automation rule.");
    }
  }
  const body = await readJsonBody(request, saveAutomationRuleSchema);
  if (!body.ok) return body.response;
  try {
    const automationRule = await saveSupportAutomationRule({
      ...body.body,
      id,
    });
    return Response.json({ automationRule });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to update automation rule.");
  }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withSupportHubAccess(async () => {
  try {
    const { id } = await context.params;
    await deleteSupportAutomationRule(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete automation rule.");
  }
  });
}
