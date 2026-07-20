import { z } from "zod";

import { EVE_KILL_SWITCH_KEYS, eveKillSwitchStateSchema } from "./types";
import { ApiHttpError } from "../../shared/api-http-error";
import { traceBlockedEveControlDecision } from "../audit/control-decision";
import { toEveAuditIdentityRpcParams } from "../audit/identity";
import { summarizeEveAuditValue } from "../audit/redaction";

import type { EveKillSwitchKey, EveKillSwitchMutationResult } from "./types";
import type { EveVerifiedAuditIdentity } from "../audit/types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

export const eveKillSwitchMutationSchema = z
  .object({
    switchKey: z.enum(EVE_KILL_SWITCH_KEYS),
    enabled: z.boolean(),
    expectedStateVersion: z.number().int().positive(),
    reason: z.string().trim().min(1).max(500).optional(),
  })
  .strict();

const mutationResultSchema = z.object({
  auditId: z.string().uuid(),
  changed: z.boolean(),
  enabled: z.boolean(),
  killSwitchState: eveKillSwitchStateSchema,
  stateVersion: z.number().int().positive(),
  switchKey: z.enum(EVE_KILL_SWITCH_KEYS),
  updatedAt: z.string(),
});

export async function setEveKillSwitch(input: {
  supabaseAdmin: AdminSupabaseClient;
  identity: EveVerifiedAuditIdentity;
  switchKey: EveKillSwitchKey;
  enabled: boolean;
  expectedStateVersion: number;
  reason?: string;
  auditId?: string;
}): Promise<EveKillSwitchMutationResult> {
  if (input.identity.identityMode !== "admin") {
    await traceBlockedEveControlDecision({
      supabaseAdmin: input.supabaseAdmin,
      identity: input.identity,
      policy: {
        id: "eve-governance-kernel",
        status: "unavailable",
      },
      action: "kill_switch.actuation_rejected",
      target: `kill_switch:${input.switchKey}`,
      evidence: {
        requestedEnabled: input.enabled,
        reason: input.reason ?? "No reason provided.",
      },
      decision: {
        rationale:
          "Kill-switch actuation requires a verified authenticated admin identity.",
        risk: "Prompt, model, tool, service, and runtime identities cannot actuate governance controls.",
        reversalOrFollowUp:
          "Use the authenticated admin control path for any deliberate human change.",
      },
      debug: { source: "eve_kill_switch_control" },
    });
    throw new ApiHttpError(
      403,
      "Forbidden: kill-switch actuation requires an authenticated admin identity.",
    );
  }

  const reason = input.reason
    ? summarizeEveAuditValue(input.reason)
    : "No reason provided.";
  const auditId = input.auditId ?? crypto.randomUUID();

  const { data, error } = await input.supabaseAdmin.rpc("set_eve_kill_switch", {
    p_switch_key: input.switchKey,
    p_enabled: input.enabled,
    p_expected_state_version: input.expectedStateVersion,
    p_audit_id: auditId,
    ...toEveAuditIdentityRpcParams(input.identity),
    p_reason: reason,
  });

  if (error) {
    if (error.message.includes("stale_eve_governance_state")) {
      throw new ApiHttpError(
        409,
        "Eve governance state changed. Refresh and retry deliberately.",
      );
    }

    if (error.message.includes("missing_eve_governance_state")) {
      throw new ApiHttpError(
        503,
        "Eve governance state is unavailable. Eve remains fail-closed.",
      );
    }

    throw new Error(error.message);
  }

  return mutationResultSchema.parse(data);
}
