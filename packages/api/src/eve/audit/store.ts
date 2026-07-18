import { z } from "zod";

import { EVE_AUDIT_IDENTITY_MODES, EVE_AUDIT_RESULTS } from "./types";

import type { EveAuditEventRecord, EveAuditStore } from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const auditRowSchema = z.object({
  id: z.string().uuid(),
  run_id: z.string().uuid().nullable(),
  tenant_id: z.string().uuid().nullable(),
  actor_id: z.string(),
  actor_profile_id: z.string().uuid().nullable(),
  actor_role: z.string().nullable(),
  identity_mode: z.enum(EVE_AUDIT_IDENTITY_MODES),
  initiator_type: z.string(),
  initiator_id: z.string(),
  policy_id: z.string(),
  policy_status: z.string(),
  governance_state_version: z.number().int().positive().nullable(),
  action: z.string(),
  target: z.string().nullable(),
  result: z.enum(EVE_AUDIT_RESULTS),
  tool_name: z.string().nullable(),
  subagent_name: z.string().nullable(),
  model_role: z.string(),
  evidence_summary: z.string(),
  change_summary: z.string(),
  decision_summary: z.string(),
  debug_metadata: z.record(z.string(), z.unknown()),
  redaction_version: z.literal("eve-audit-v1"),
  created_at: z.string(),
});

function toAuditEventRecord(row: unknown): EveAuditEventRecord {
  const parsed = auditRowSchema.parse(row);
  return {
    id: parsed.id,
    runId: parsed.run_id ?? undefined,
    tenantId: parsed.tenant_id ?? undefined,
    actorId: parsed.actor_id,
    actorProfileId: parsed.actor_profile_id ?? undefined,
    actorRole: parsed.actor_role ?? undefined,
    identityMode: parsed.identity_mode,
    initiatorType: parsed.initiator_type,
    initiatorId: parsed.initiator_id,
    policyId: parsed.policy_id,
    policyStatus: parsed.policy_status,
    governanceStateVersion: parsed.governance_state_version ?? undefined,
    action: parsed.action,
    target: parsed.target ?? undefined,
    result: parsed.result,
    toolName: parsed.tool_name ?? undefined,
    subagentName: parsed.subagent_name ?? undefined,
    modelRole: parsed.model_role,
    evidenceSummary: parsed.evidence_summary,
    changeSummary: parsed.change_summary,
    decisionSummary: parsed.decision_summary,
    debugMetadata: parsed.debug_metadata,
    redactionVersion: parsed.redaction_version,
    createdAt: parsed.created_at,
  };
}

export async function appendEveAuditEvent(input: {
  supabaseAdmin: AdminSupabaseClient;
  record: EveAuditEventRecord;
}): Promise<void> {
  const { error } = await input.supabaseAdmin.from("eve_audit_events").insert({
    id: input.record.id,
    run_id: input.record.runId ?? null,
    tenant_id: input.record.tenantId ?? null,
    actor_id: input.record.actorId,
    actor_profile_id: input.record.actorProfileId ?? null,
    actor_role: input.record.actorRole ?? null,
    identity_mode: input.record.identityMode,
    initiator_type: input.record.initiatorType,
    initiator_id: input.record.initiatorId,
    policy_id: input.record.policyId,
    policy_status: input.record.policyStatus,
    governance_state_version: input.record.governanceStateVersion ?? null,
    action: input.record.action,
    target: input.record.target ?? null,
    result: input.record.result,
    tool_name: input.record.toolName ?? null,
    subagent_name: input.record.subagentName ?? null,
    model_role: input.record.modelRole,
    evidence_summary: input.record.evidenceSummary,
    change_summary: input.record.changeSummary,
    decision_summary: input.record.decisionSummary,
    debug_metadata: input.record.debugMetadata,
    redaction_version: input.record.redactionVersion,
    created_at: input.record.createdAt,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export function createEveAuditStore(
  supabaseAdmin: AdminSupabaseClient,
): EveAuditStore {
  return {
    append: (record) => appendEveAuditEvent({ supabaseAdmin, record }),
  };
}

export async function loadRecentEveAuditEvents(input: {
  auth: AuthenticatedContext;
  supabaseAdmin: AdminSupabaseClient;
  limit?: number;
}): Promise<EveAuditEventRecord[]> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_audit_events")
    .select(
      "id, run_id, tenant_id, actor_id, actor_profile_id, actor_role, identity_mode, initiator_type, initiator_id, policy_id, policy_status, governance_state_version, action, target, result, tool_name, subagent_name, model_role, evidence_summary, change_summary, decision_summary, debug_metadata, redaction_version, created_at",
    )
    .eq("tenant_id", input.auth.tenantId)
    .eq("actor_profile_id", input.auth.profileId)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 50);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(toAuditEventRecord);
}
