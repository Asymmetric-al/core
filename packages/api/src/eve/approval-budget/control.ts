import { ApiHttpError } from "../../shared/api-http-error";
import {
  createAdminEveAuditIdentity,
  type EveVerifiedAuditIdentity,
} from "../audit";

import type {
  EveBudgetScopeType,
  EvePolicyActionId,
  EvePolicyConsultResult,
} from "./types";
import type { EveSessionIdentity } from "../session-ownership/types";
import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

function identityParams(auth: AuthenticatedContext) {
  return verifiedIdentityParams(createAdminEveAuditIdentity(auth));
}

function verifiedIdentityParams(identity: EveVerifiedAuditIdentity) {
  if (!identity.actorProfileId || !identity.tenantId) {
    throw new Error(
      "Eve policy consultation requires a tenant-linked actor profile.",
    );
  }
  return {
    p_actor_id: identity.actorId,
    p_actor_profile_id: identity.actorProfileId,
    p_actor_role: identity.actorRole,
    p_tenant_id: identity.tenantId,
    p_initiator_type: identity.initiatorType,
    p_initiator_id: identity.initiatorId,
  };
}
function mapError(error: { message: string } | null): never {
  const message = error?.message ?? "eve_approval_budget_mutation_failed";
  if (message.includes("permission_required"))
    throw new ApiHttpError(
      403,
      "A dedicated Eve policy permission is required.",
    );
  if (message.includes("missing_eve_action_approval"))
    throw new ApiHttpError(404, "Approval request was not found.");
  if (message.includes("stale_eve_action_approval"))
    throw new ApiHttpError(409, "Approval is no longer pending.");
  if (message.includes("missing_eve_operational_budget"))
    throw new ApiHttpError(404, "Budget was not found.");
  if (message.includes("invalid_eve_"))
    throw new ApiHttpError(400, "The approval or budget request is invalid.");
  if (message.includes("actor_tenant_mismatch"))
    throw new ApiHttpError(403, "Actor ownership could not be verified.");
  if (message.includes("runtime_session_identity_mismatch"))
    throw new ApiHttpError(
      403,
      "Runtime session ownership could not be verified.",
    );
  throw new Error(message);
}

export async function executeEveRuntimePolicyConsult(input: {
  actionId: EvePolicyActionId;
  identity: EveSessionIdentity;
  sessionId: string;
  supabaseAdmin: AdminSupabaseClient;
  targetKey: string;
}): Promise<EvePolicyConsultResult> {
  const { data, error } = await input.supabaseAdmin.rpc(
    "consult_eve_runtime_budget_policy",
    {
      p_action_id: input.actionId,
      p_target_key: input.targetKey,
      p_decision_id: crypto.randomUUID(),
      p_audit_id: crypto.randomUUID(),
      p_session_id: input.sessionId,
      p_actor_id: input.identity.actorId,
      p_tenant_id: input.identity.tenantId,
    },
  );
  if (error || !data) return mapError(error);
  return data as unknown as EvePolicyConsultResult;
}

export async function executeEvePolicyTracer(input: {
  actionId: EvePolicyActionId;
  approvalId?: string;
  auth: AuthenticatedContext;
  supabaseAdmin: AdminSupabaseClient;
  targetKey: string;
}): Promise<EvePolicyConsultResult> {
  return executeEvePolicyTracerAsIdentity({
    actionId: input.actionId,
    approvalId: input.approvalId,
    identity: createAdminEveAuditIdentity(input.auth),
    supabaseAdmin: input.supabaseAdmin,
    targetKey: input.targetKey,
  });
}

export async function executeEvePolicyTracerAsIdentity(input: {
  actionId: EvePolicyActionId;
  approvalId?: string;
  identity: EveVerifiedAuditIdentity;
  supabaseAdmin: AdminSupabaseClient;
  targetKey: string;
}): Promise<EvePolicyConsultResult> {
  const { data, error } = await input.supabaseAdmin.rpc(
    "consult_eve_approval_budget_policy",
    {
      p_action_id: input.actionId,
      p_target_key: input.targetKey,
      p_approval_id: input.approvalId ?? null,
      p_decision_id: crypto.randomUUID(),
      p_audit_id: crypto.randomUUID(),
      ...verifiedIdentityParams(input.identity),
    },
  );
  if (error || !data) return mapError(error);
  return data as unknown as EvePolicyConsultResult;
}
export async function requestEvePolicyApproval(input: {
  actionId: EvePolicyActionId;
  auth: AuthenticatedContext;
  supabaseAdmin: AdminSupabaseClient;
  targetKey: string;
}): Promise<string> {
  const { data, error } = await input.supabaseAdmin.rpc(
    "request_eve_policy_approval",
    {
      p_action_id: input.actionId,
      p_target_key: input.targetKey,
      p_audit_id: crypto.randomUUID(),
      ...identityParams(input.auth),
    },
  );
  if (error || typeof data !== "string") return mapError(error);
  return data;
}
export async function decideEvePolicyApproval(input: {
  approvalId: string;
  approved: boolean;
  auth: AuthenticatedContext;
  reason: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const { data: approval, error: ownershipError } = await input.supabaseAdmin
    .from("eve_action_approvals")
    .select("id")
    .eq("id", input.approvalId)
    .eq("tenant_id", input.auth.tenantId)
    .eq("requested_by_profile_id", input.auth.profileId)
    .maybeSingle();
  if (ownershipError) throw new Error(ownershipError.message);
  if (!approval) {
    throw new ApiHttpError(
      403,
      "Approval response ownership could not be verified.",
    );
  }

  const { error } = await input.supabaseAdmin.rpc(
    "decide_eve_policy_approval",
    {
      p_approval_id: input.approvalId,
      p_approved: input.approved,
      p_reason: input.reason,
      p_audit_id: crypto.randomUUID(),
      ...identityParams(input.auth),
    },
  );
  if (error) mapError(error);
}
export async function createEveBudgetEmergencyOverride(input: {
  additionalInputTokens: number;
  additionalOutputTokens: number;
  additionalRequests: number;
  additionalUsdMicros: number;
  auth: AuthenticatedContext;
  expiresAt: string;
  reason: string;
  scopeId: string;
  scopeType: EveBudgetScopeType;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<string> {
  const { data, error } = await input.supabaseAdmin.rpc(
    "create_eve_budget_emergency_override",
    {
      p_scope_type: input.scopeType,
      p_scope_id: input.scopeId,
      p_additional_requests: input.additionalRequests,
      p_additional_usd_micros: input.additionalUsdMicros,
      p_additional_input_tokens: input.additionalInputTokens,
      p_additional_output_tokens: input.additionalOutputTokens,
      p_expires_at: input.expiresAt,
      p_reason: input.reason,
      p_audit_id: crypto.randomUUID(),
      ...identityParams(input.auth),
    },
  );
  if (error || typeof data !== "string") return mapError(error);
  return data;
}
