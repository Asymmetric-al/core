import { z } from "zod";

import { eveModelPolicyDocumentSchema } from "./schema";
import {
  EVE_MODEL_POLICY_EVAL_STATUSES,
  EVE_MODEL_POLICY_STATUSES,
} from "./types";

import type {
  EveModelBudgetOverride,
  EveModelPolicyEvaluation,
  EveModelPolicyRecord,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const evaluationSchema = z.object({
  status: z.enum(["passed", "failed"]),
  evaluatedAt: z.string(),
  checks: z.array(
    z.object({
      id: z.string(),
      passed: z.boolean(),
      message: z.string(),
    }),
  ),
});

const policyRowSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().positive(),
  status: z.enum(EVE_MODEL_POLICY_STATUSES),
  previous_policy_id: z.string().uuid().nullable(),
  policy: eveModelPolicyDocumentSchema,
  policy_hash: z.string().length(64),
  eval_status: z.enum(EVE_MODEL_POLICY_EVAL_STATUSES),
  eval_summary: evaluationSchema.nullable(),
  evaluated_at: z.string().nullable(),
  activated_at: z.string().nullable(),
  created_by_profile_id: z.string().uuid(),
  created_at: z.string(),
});

const budgetOverrideRowSchema = z.object({
  id: z.string().uuid(),
  policy_id: z.string().uuid(),
  scope_type: z.enum(["role", "subagent"]),
  scope_id: z.string(),
  additional_usd_micros: z.number().int().nonnegative(),
  additional_input_tokens: z.number().int().nonnegative(),
  additional_output_tokens: z.number().int().nonnegative(),
  additional_requests: z.number().int().nonnegative(),
  reason: z.string(),
  expires_at: z.string(),
  created_at: z.string(),
});

function toPolicyRecord(row: unknown): EveModelPolicyRecord {
  const parsed = policyRowSchema.parse(row);
  return {
    id: parsed.id,
    version: parsed.version,
    status: parsed.status,
    previousPolicyId: parsed.previous_policy_id ?? undefined,
    policy: parsed.policy,
    policyHash: parsed.policy_hash,
    evalStatus: parsed.eval_status,
    evalSummary:
      (parsed.eval_summary as EveModelPolicyEvaluation | null) ?? undefined,
    evaluatedAt: parsed.evaluated_at ?? undefined,
    activatedAt: parsed.activated_at ?? undefined,
    createdByProfileId: parsed.created_by_profile_id,
    createdAt: parsed.created_at,
  };
}

function toBudgetOverride(row: unknown): EveModelBudgetOverride {
  const parsed = budgetOverrideRowSchema.parse(row);
  return {
    id: parsed.id,
    policyId: parsed.policy_id,
    scopeType: parsed.scope_type,
    scopeId: parsed.scope_id,
    additionalUsdMicros: parsed.additional_usd_micros,
    additionalInputTokens: parsed.additional_input_tokens,
    additionalOutputTokens: parsed.additional_output_tokens,
    additionalRequests: parsed.additional_requests,
    reason: parsed.reason,
    expiresAt: parsed.expires_at,
    createdAt: parsed.created_at,
  };
}

const policySelect =
  "id, version, status, previous_policy_id, policy, policy_hash, eval_status, eval_summary, evaluated_at, activated_at, created_by_profile_id, created_at";

export async function loadEveModelPolicies(input: {
  supabaseAdmin: AdminSupabaseClient;
  limit?: number;
}): Promise<EveModelPolicyRecord[]> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_model_policies")
    .select(policySelect)
    .order("version", { ascending: false })
    .limit(input.limit ?? 30);

  if (error) throw new Error(error.message);
  return (data ?? []).map(toPolicyRecord);
}

export async function loadEveModelPolicyById(input: {
  supabaseAdmin: AdminSupabaseClient;
  policyId: string;
}): Promise<EveModelPolicyRecord | null> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_model_policies")
    .select(policySelect)
    .eq("id", input.policyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toPolicyRecord(data) : null;
}

export async function loadActiveEveModelBudgetOverrides(input: {
  supabaseAdmin: AdminSupabaseClient;
}): Promise<EveModelBudgetOverride[]> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_model_budget_overrides")
    .select(
      "id, policy_id, scope_type, scope_id, additional_usd_micros, additional_input_tokens, additional_output_tokens, additional_requests, reason, expires_at, created_at",
    )
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toBudgetOverride);
}

export async function hasEveAiSettingsGrant(input: {
  supabaseAdmin: AdminSupabaseClient;
  profileId: string;
  tenantId: string;
}): Promise<boolean> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_ai_settings_grants")
    .select("id")
    .eq("tenant_id", input.tenantId)
    .eq("profile_id", input.profileId)
    .eq("permission", "ai.settings.manage")
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data !== null;
}
