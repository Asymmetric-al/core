import { hasEveAiSettingsGrant } from "./store";
import { ApiHttpError } from "../../shared/api-http-error";
import { createAdminEveAuditIdentity } from "../audit/identity";
import { traceEveAuditEvent } from "../audit/record";
import { createEveAuditStore } from "../audit/store";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

export async function canManageEveModelPolicy(input: {
  auth: AuthenticatedContext;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<boolean> {
  if (
    input.auth.role === "super_admin" ||
    input.auth.profileRole === "super_admin"
  ) {
    return true;
  }

  return hasEveAiSettingsGrant({
    supabaseAdmin: input.supabaseAdmin,
    profileId: input.auth.profileId,
    tenantId: input.auth.tenantId,
  });
}

export async function assertEveModelPolicyPermission(input: {
  action: string;
  auth: AuthenticatedContext;
  supabaseAdmin: AdminSupabaseClient;
  target?: string;
}): Promise<void> {
  if (await canManageEveModelPolicy(input)) return;

  await traceEveAuditEvent({
    store: createEveAuditStore(input.supabaseAdmin),
    event: {
      identity: createAdminEveAuditIdentity(input.auth),
      policy: { id: "eve-model-policy", status: "permission_denied" },
      action: "model_policy.permission_denied",
      target: input.target,
      result: "blocked",
      modelRole: "not_used",
      evidence: {
        attemptedAction: input.action,
        requiredPermission: "ai.settings.manage",
      },
      change: { stateChanged: false },
      decision: {
        rationale:
          "General admin access does not imply the dedicated AI-settings permission.",
        risk: "Unauthorized model policy changes could silently weaken Eve.",
        reversalOrFollowUp:
          "A super admin must grant ai.settings.manage through the app-owned permission store.",
      },
      debug: { source: "eve_model_policy_permission" },
    },
  }).catch(() => undefined);

  throw new ApiHttpError(403, "Forbidden: requires ai.settings.manage");
}
