import { evaluateEveModelPolicy, hashEveModelPolicy } from "./evaluator";
import { assertEveModelPolicyPermission } from "./permissions";
import { loadEveModelPolicyById } from "./store";
import { ApiHttpError } from "../../shared/api-http-error";
import { createAdminEveAuditIdentity } from "../audit/identity";
import { summarizeEveAuditValue } from "../audit/redaction";

import type { EveModelPolicyDocument } from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

function identityParams(auth: AuthenticatedContext) {
  const identity = createAdminEveAuditIdentity(auth);
  return {
    p_actor_id: identity.actorId,
    p_actor_profile_id: identity.actorProfileId ?? null,
    p_actor_role: identity.actorRole ?? null,
    p_tenant_id: identity.tenantId ?? null,
    p_initiator_type: identity.initiatorType,
    p_initiator_id: identity.initiatorId,
  };
}

function mapMutationError(error: { message: string } | null): never {
  const message = error?.message ?? "eve_model_policy_mutation_failed";
  if (message.includes("eve_model_policy_eval_required")) {
    throw new ApiHttpError(
      409,
      "The policy must pass its current eval gate before activation.",
    );
  }
  if (message.includes("stale_eve_active_model_policy")) {
    throw new ApiHttpError(
      409,
      "The active model policy changed. Refresh and retry deliberately.",
    );
  }
  if (message.includes("stale_eve_model_policy_evaluation")) {
    throw new ApiHttpError(
      409,
      "The model policy changed after evaluation began. Refresh and retry.",
    );
  }
  if (message.includes("missing_eve_model_policy_rollback_target")) {
    throw new ApiHttpError(
      409,
      "There is no prior evaluated policy to restore.",
    );
  }
  if (message.includes("missing_eve_model_policy")) {
    throw new ApiHttpError(404, "Eve model policy was not found.");
  }
  if (message.includes("eve_model_budget_override_limit_exceeded")) {
    throw new ApiHttpError(
      400,
      "Emergency overrides are limited to 24 hours and the documented hard ceilings.",
    );
  }
  if (message.includes("invalid_eve_model_")) {
    throw new ApiHttpError(400, "The Eve model-policy mutation is invalid.");
  }
  throw new Error(message);
}

function throwGovernanceBlocked(): never {
  throw new ApiHttpError(
    409,
    "Model-policy changes are blocked by Eve governance state.",
  );
}

function readUuidMutationResult(
  data: unknown,
  error: { message: string } | null,
): string {
  if (error) mapMutationError(error);
  if (data === null) throwGovernanceBlocked();
  if (typeof data !== "string") mapMutationError(null);
  return data;
}

function assertBooleanMutationResult(
  data: unknown,
  error: { message: string } | null,
): void {
  if (error) mapMutationError(error);
  if (data === false) throwGovernanceBlocked();
  if (data !== true) mapMutationError(null);
}

export async function createEveModelPolicyDraft(input: {
  auth: AuthenticatedContext;
  policy: EveModelPolicyDocument;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<string> {
  await assertEveModelPolicyPermission({
    action: "draft",
    auth: input.auth,
    supabaseAdmin: input.supabaseAdmin,
    target: "model_policy:platform",
  });
  const policyHash = await hashEveModelPolicy(input.policy);
  const auditId = crypto.randomUUID();
  const { data, error } = await input.supabaseAdmin.rpc(
    "create_eve_model_policy_draft",
    {
      p_policy: input.policy,
      p_policy_hash: policyHash,
      p_audit_id: auditId,
      ...identityParams(input.auth),
    },
  );
  return readUuidMutationResult(data, error);
}

export async function evaluateEveModelPolicyDraft(input: {
  auth: AuthenticatedContext;
  policyId: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  await assertEveModelPolicyPermission({
    action: "evaluate",
    auth: input.auth,
    supabaseAdmin: input.supabaseAdmin,
    target: `model_policy:${input.policyId}`,
  });
  const policy = await loadEveModelPolicyById(input);
  if (!policy) throw new ApiHttpError(404, "Eve model policy was not found.");

  const currentHash = await hashEveModelPolicy(policy.policy);
  if (currentHash !== policy.policyHash) {
    throw new ApiHttpError(
      409,
      "The stored policy no longer matches its immutable hash.",
    );
  }
  const evaluation = evaluateEveModelPolicy(policy.policy);
  const { data, error } = await input.supabaseAdmin.rpc(
    "evaluate_eve_model_policy_draft",
    {
      p_policy_id: input.policyId,
      p_policy_hash: currentHash,
      p_eval_status: evaluation.status,
      p_eval_summary: evaluation,
      p_audit_id: crypto.randomUUID(),
      ...identityParams(input.auth),
    },
  );
  assertBooleanMutationResult(data, error);
}

export async function activateEveModelPolicy(input: {
  auth: AuthenticatedContext;
  expectedActivePolicyId: string | null;
  policyId: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  await assertEveModelPolicyPermission({
    action: "activate",
    auth: input.auth,
    supabaseAdmin: input.supabaseAdmin,
    target: `model_policy:${input.policyId}`,
  });
  const { data, error } = await input.supabaseAdmin.rpc(
    "activate_eve_model_policy",
    {
      p_policy_id: input.policyId,
      p_expected_active_policy_id: input.expectedActivePolicyId,
      p_audit_id: crypto.randomUUID(),
      ...identityParams(input.auth),
    },
  );
  assertBooleanMutationResult(data, error);
}

export async function rollbackEveModelPolicy(input: {
  auth: AuthenticatedContext;
  expectedActivePolicyId: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  await assertEveModelPolicyPermission({
    action: "rollback",
    auth: input.auth,
    supabaseAdmin: input.supabaseAdmin,
    target: `model_policy:${input.expectedActivePolicyId}`,
  });
  const { data, error } = await input.supabaseAdmin.rpc(
    "rollback_eve_model_policy",
    {
      p_expected_active_policy_id: input.expectedActivePolicyId,
      p_audit_id: crypto.randomUUID(),
      ...identityParams(input.auth),
    },
  );
  assertBooleanMutationResult(data, error);
}

export async function createEveModelBudgetOverride(input: {
  additionalInputTokens: number;
  additionalOutputTokens: number;
  additionalRequests: number;
  additionalUsdMicros: number;
  auth: AuthenticatedContext;
  expiresAt: string;
  policyId: string;
  reason: string;
  scopeId: string;
  scopeType: "role" | "subagent";
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  await assertEveModelPolicyPermission({
    action: "override_budget",
    auth: input.auth,
    supabaseAdmin: input.supabaseAdmin,
    target: `${input.scopeType}:${input.scopeId}`,
  });
  const { data, error } = await input.supabaseAdmin.rpc(
    "create_eve_model_budget_override",
    {
      p_policy_id: input.policyId,
      p_scope_type: input.scopeType,
      p_scope_id: input.scopeId,
      p_additional_usd_micros: input.additionalUsdMicros,
      p_additional_input_tokens: input.additionalInputTokens,
      p_additional_output_tokens: input.additionalOutputTokens,
      p_additional_requests: input.additionalRequests,
      p_expires_at: input.expiresAt,
      p_reason: summarizeEveAuditValue(input.reason),
      p_audit_id: crypto.randomUUID(),
      ...identityParams(input.auth),
    },
  );
  readUuidMutationResult(data, error);
}
