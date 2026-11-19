import { hasEveAiSettingsGrant } from "./store";
import { ApiHttpError } from "../../shared/api-http-error";
import { traceBlockedEveControlDecision } from "../audit/control-decision";
import { createAdminEveAuditIdentity } from "../audit/identity";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

export async function canManageEveModelPolicy(input: {
  auth: AuthenticatedContext;
  /** The shared operator check's result (`withOperation`'s `isPlatformOperator()`). */
  platformOperator?: boolean;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<boolean> {
  // A platform gate (AL-2675 WP2c): the shared operator check, not a role name.
  if (input.platformOperator === true) {
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
  platformOperator?: boolean;
  supabaseAdmin: AdminSupabaseClient;
  target?: string;
}): Promise<void> {
  if (await canManageEveModelPolicy(input)) return;

  await traceBlockedEveControlDecision({
    supabaseAdmin: input.supabaseAdmin,
    identity: createAdminEveAuditIdentity(input.auth),
    policy: { id: "eve-model-policy", status: "permission_denied" },
    action: "model_policy.permission_denied",
    target: input.target,
    evidence: {
      attemptedAction: input.action,
      requiredPermission: "ai.settings.manage",
    },
    decision: {
      rationale:
        "General admin access does not imply the dedicated AI-settings permission.",
      risk: "Unauthorized model policy changes could silently weaken Eve.",
      reversalOrFollowUp:
        "Ask a confirmed platform operator to perform the change, or obtain an active ai.settings.manage grant in this tenant.",
    },
    debug: { source: "eve_model_policy_permission" },
  });

  throw new ApiHttpError(403, "Forbidden: requires ai.settings.manage");
}
