import { z } from "zod";

import { EVE_KILL_SWITCH_KEYS, eveKillSwitchStateSchema } from "./types";
import { ApiHttpError } from "../../shared/api-http-error";
import { traceEveAuditEvent } from "../audit/record";
import { summarizeEveAuditValue } from "../audit/redaction";
import { createEveAuditStore } from "../audit/store";

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
    await traceEveAuditEvent({
      store: createEveAuditStore(input.supabaseAdmin),
      event: {
        identity: input.identity,
        policy: {
          id: "eve-governance-kernel",
          status: "unavailable",
        },
        action: "kill_switch.actuation_rejected",
        target: `kill_switch:${input.switchKey}`,
        result: "blocked",
        modelRole: "not_used",
        evidence: {
          requestedEnabled: input.enabled,
          reason: input.reason ?? "No reason provided.",
        },
        change: { stateChanged: false },
        decision: {
          rationale:
            "Kill-switch actuation requires a verified authenticated admin identity.",
          risk: "Prompt, model, tool, service, and runtime identities cannot actuate governance controls.",
          reversalOrFollowUp:
            "Use the authenticated admin control path for any deliberate human change.",
        },
        debug: { source: "eve_kill_switch_control" },
      },
    }).catch(() => undefined);
    throw new Error("eve_kill_switch_requires_admin_identity");
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
    p_actor_id: input.identity.actorId,
    p_actor_profile_id: input.identity.actorProfileId ?? null,
    p_actor_role: input.identity.actorRole ?? null,
    p_tenant_id: input.identity.tenantId ?? null,
    p_initiator_type: input.identity.initiatorType,
    p_initiator_id: input.identity.initiatorId,
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
