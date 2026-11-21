import { NextResponse } from "next/server";
import { z } from "zod";

import { assertAutomationPermission } from "./permissions";
import { automationRuleSchema } from "./schemas";
import {
  loadMissionControlAutomationDashboard,
  saveMissionControlAutomationRule,
} from "./store";
import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import { withPlatformOperation } from "../../shared/with-operation";

const automationPostBodySchema = z.union([
  z.object({ rule: automationRuleSchema }),
  automationRuleSchema,
]);

function parseAutomationPostBody(body: unknown) {
  const parsed = automationPostBodySchema.parse(body);
  return "rule" in parsed ? parsed.rule : parsed;
}

export const GET = withPlatformOperation(
  async ({ auth, requestId, supabaseAdmin }) => {
    try {
      assertAutomationPermission(auth);
      const dashboard = await loadMissionControlAutomationDashboard({
        supabaseAdmin,
        tenantId: auth.tenantId,
      });

      return NextResponse.json({ ...dashboard, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to list automations.", requestId);
    }
  },
  { tenantAdministrator: true },
);

export const POST = withPlatformOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      assertAutomationPermission(auth);
      const rule = parseAutomationPostBody(await ensureJsonBody(request));
      const automationRule = await saveMissionControlAutomationRule({
        supabaseAdmin,
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        rule,
      });

      return NextResponse.json({ automationRule, requestId }, { status: 201 });
    } catch (error) {
      return toErrorResponse(error, "Failed to save automation.", requestId);
    }
  },
  { tenantAdministrator: true },
);
