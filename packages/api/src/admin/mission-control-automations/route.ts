import { NextResponse } from "next/server";

import { assertAutomationPermission } from "./permissions";
import {
  listMissionControlAutomationRules,
  saveMissionControlAutomationRule,
} from "./store";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

export const GET = withOperation(
  async ({ auth, requestId, supabaseAdmin }) => {
    try {
      assertAutomationPermission(auth);
      const automationRules = await listMissionControlAutomationRules({
        supabaseAdmin,
        tenantId: auth.tenantId,
      });

      return NextResponse.json({ automationRules, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to list automations.", requestId);
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      assertAutomationPermission(auth);
      const body = (await ensureJsonBody(request)) as Record<string, unknown>;
      const rule =
        "rule" in body && typeof body.rule === "object" && body.rule
          ? body.rule
          : body;
      const automationRule = await saveMissionControlAutomationRule({
        supabaseAdmin,
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        rule: rule as never,
        activationReady:
          "activationReady" in body &&
          typeof body.activationReady === "object" &&
          body.activationReady
            ? (body.activationReady as never)
            : undefined,
      });

      return NextResponse.json({ automationRule, requestId }, { status: 201 });
    } catch (error) {
      if (error instanceof ApiHttpError) {
        return toErrorResponse(error, "Failed to save automation.", requestId);
      }
      return toErrorResponse(error, "Failed to save automation.", requestId);
    }
  },
  { roles: ["admin", "super_admin"] },
);
