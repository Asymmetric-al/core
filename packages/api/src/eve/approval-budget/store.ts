import { z } from "zod";

import {
  EVE_APPROVAL_MODES,
  EVE_BUDGET_SCOPE_TYPES,
  EVE_POLICY_ACTION_IDS,
  EVE_TRUST_ZONES,
  EVE_WRITE_CLASSES,
} from "./types";

import type {
  EveActionApprovalRecord,
  EveActionCatalogEntry,
  EveApprovalBudgetAdminView,
  EveApprovalPolicyRecord,
  EveBudgetRecord,
  EvePolicyDecisionRecord,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const catalogSchema = z.object({
  action_id: z.enum(EVE_POLICY_ACTION_IDS),
  trust_zone: z.enum(EVE_TRUST_ZONES),
  write_class: z.enum(EVE_WRITE_CLASSES),
  governance_domain: z.literal("production_writes"),
  budget_scope_type: z.enum(EVE_BUDGET_SCOPE_TYPES),
  budget_scope_id: z.string(),
  request_cost: z.number().int().nonnegative(),
  usd_micros_cost: z.number().int().nonnegative(),
  input_token_cost: z.number().int().nonnegative(),
  output_token_cost: z.number().int().nonnegative(),
});
const policySchema = z.object({
  trust_zone: z.enum(EVE_TRUST_ZONES),
  operational_mode: z.enum(EVE_APPROVAL_MODES),
  updated_at: z.string(),
});
const budgetSchema = z.object({
  id: z.string().uuid(),
  scope_type: z.enum(EVE_BUDGET_SCOPE_TYPES),
  scope_id: z.string(),
  max_requests: z.number().int().nonnegative(),
  max_usd_micros: z.number().int().nonnegative(),
  max_input_tokens: z.number().int().nonnegative(),
  max_output_tokens: z.number().int().nonnegative(),
  window_seconds: z.number().int().positive(),
});
const usageSchema = z.object({
  budget_id: z.string().uuid(),
  window_started_at: z.string(),
  used_requests: z.number().int().nonnegative(),
  used_usd_micros: z.number().int().nonnegative(),
  used_input_tokens: z.number().int().nonnegative(),
  used_output_tokens: z.number().int().nonnegative(),
});
const overrideSchema = z.object({
  budget_id: z.string().uuid(),
  additional_requests: z.number().int().nonnegative(),
  additional_usd_micros: z.number().int().nonnegative(),
  additional_input_tokens: z.number().int().nonnegative(),
  additional_output_tokens: z.number().int().nonnegative(),
});
const approvalSchema = z.object({
  id: z.string().uuid(),
  action_id: z.string(),
  target_key: z.string(),
  trust_zone: z.enum(EVE_TRUST_ZONES),
  approval_level: z.enum(["zone", "strict"]),
  status: z.enum(["pending", "approved", "denied", "used"]),
  expires_at: z.string(),
  created_at: z.string(),
});
const decisionSchema = z.object({
  id: z.string().uuid(),
  action_id: z.string(),
  target_key: z.string(),
  trust_zone: z.enum(EVE_TRUST_ZONES),
  write_class: z.enum(EVE_WRITE_CLASSES),
  decision: z.enum(["allow", "deny", "pause", "override"]),
  reason: z.string(),
  created_at: z.string(),
});

function mapCatalog(value: unknown): EveActionCatalogEntry {
  const row = catalogSchema.parse(value);
  return {
    actionId: row.action_id,
    trustZone: row.trust_zone,
    writeClass: row.write_class,
    domain: row.governance_domain,
    budgetScopeType: row.budget_scope_type,
    budgetScopeId: row.budget_scope_id,
    requestCost: row.request_cost,
    usdMicrosCost: row.usd_micros_cost,
    inputTokenCost: row.input_token_cost,
    outputTokenCost: row.output_token_cost,
  };
}
function mapPolicy(value: unknown): EveApprovalPolicyRecord {
  const row = policySchema.parse(value);
  return {
    trustZone: row.trust_zone,
    operationalMode: row.operational_mode,
    updatedAt: row.updated_at,
  };
}
function mapApproval(value: unknown): EveActionApprovalRecord {
  const row = approvalSchema.parse(value);
  return {
    id: row.id,
    actionId: row.action_id,
    targetKey: row.target_key,
    trustZone: row.trust_zone,
    approvalLevel: row.approval_level,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}
function mapDecision(value: unknown): EvePolicyDecisionRecord {
  const row = decisionSchema.parse(value);
  return {
    id: row.id,
    actionId: row.action_id,
    targetKey: row.target_key,
    trustZone: row.trust_zone,
    writeClass: row.write_class,
    decision: row.decision,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export async function loadEveApprovalBudgetAdminView(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveApprovalBudgetAdminView> {
  const [
    catalogResult,
    policyResult,
    budgetResult,
    usageResult,
    overrideResult,
    approvalResult,
    decisionResult,
  ] = await Promise.all([
    input.supabaseAdmin
      .from("eve_action_policy_catalog")
      .select(
        "action_id, trust_zone, write_class, governance_domain, budget_scope_type, budget_scope_id, request_cost, usd_micros_cost, input_token_cost, output_token_cost",
      )
      .eq("is_active", true)
      .order("action_id"),
    input.supabaseAdmin
      .from("eve_approval_policies")
      .select("trust_zone, operational_mode, updated_at")
      .order("trust_zone"),
    input.supabaseAdmin
      .from("eve_operational_budgets")
      .select(
        "id, scope_type, scope_id, max_requests, max_usd_micros, max_input_tokens, max_output_tokens, window_seconds",
      )
      .order("scope_type"),
    input.supabaseAdmin
      .from("eve_budget_usage_windows")
      .select(
        "budget_id, window_started_at, used_requests, used_usd_micros, used_input_tokens, used_output_tokens",
      )
      .eq("tenant_id", input.tenantId)
      .order("window_started_at", { ascending: false }),
    input.supabaseAdmin
      .from("eve_budget_emergency_overrides")
      .select(
        "budget_id, additional_requests, additional_usd_micros, additional_input_tokens, additional_output_tokens",
      )
      .eq("tenant_id", input.tenantId)
      .gt("expires_at", new Date().toISOString()),
    input.supabaseAdmin
      .from("eve_action_approvals")
      .select(
        "id, action_id, target_key, trust_zone, approval_level, status, expires_at, created_at",
      )
      .eq("tenant_id", input.tenantId)
      .order("created_at", { ascending: false })
      .limit(50),
    input.supabaseAdmin
      .from("eve_policy_decisions")
      .select(
        "id, action_id, target_key, trust_zone, write_class, decision, reason, created_at",
      )
      .eq("tenant_id", input.tenantId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  for (const result of [
    catalogResult,
    policyResult,
    budgetResult,
    usageResult,
    overrideResult,
    approvalResult,
    decisionResult,
  ])
    if (result.error) throw new Error(result.error.message);
  const latestUsage = new Map<string, z.infer<typeof usageSchema>>();
  for (const value of usageResult.data ?? []) {
    const row = usageSchema.parse(value);
    if (!latestUsage.has(row.budget_id)) latestUsage.set(row.budget_id, row);
  }
  const additions = new Map<
    string,
    { requests: number; usd: number; input: number; output: number }
  >();
  for (const value of overrideResult.data ?? []) {
    const row = overrideSchema.parse(value);
    const current = additions.get(row.budget_id) ?? {
      requests: 0,
      usd: 0,
      input: 0,
      output: 0,
    };
    current.requests += row.additional_requests;
    current.usd += row.additional_usd_micros;
    current.input += row.additional_input_tokens;
    current.output += row.additional_output_tokens;
    additions.set(row.budget_id, current);
  }
  const budgets: EveBudgetRecord[] = (budgetResult.data ?? []).map((value) => {
    const row = budgetSchema.parse(value);
    const candidateUsage = latestUsage.get(row.id);
    const windowEndsAt = candidateUsage
      ? new Date(
          new Date(candidateUsage.window_started_at).getTime() +
            row.window_seconds * 1000,
        )
      : undefined;
    const usage =
      windowEndsAt && windowEndsAt.getTime() > Date.now()
        ? candidateUsage
        : undefined;
    const extra = additions.get(row.id) ?? {
      requests: 0,
      usd: 0,
      input: 0,
      output: 0,
    };
    return {
      id: row.id,
      scopeType: row.scope_type,
      scopeId: row.scope_id,
      maxRequests: row.max_requests,
      maxUsdMicros: row.max_usd_micros,
      maxInputTokens: row.max_input_tokens,
      maxOutputTokens: row.max_output_tokens,
      windowSeconds: row.window_seconds,
      usedRequests: usage?.used_requests ?? 0,
      usedUsdMicros: usage?.used_usd_micros ?? 0,
      usedInputTokens: usage?.used_input_tokens ?? 0,
      usedOutputTokens: usage?.used_output_tokens ?? 0,
      additionalRequests: extra.requests,
      additionalUsdMicros: extra.usd,
      additionalInputTokens: extra.input,
      additionalOutputTokens: extra.output,
      windowEndsAt: usage ? windowEndsAt?.toISOString() : undefined,
    };
  });
  return {
    catalog: (catalogResult.data ?? []).map(mapCatalog),
    policies: (policyResult.data ?? []).map(mapPolicy),
    budgets,
    approvals: (approvalResult.data ?? []).map(mapApproval),
    decisions: (decisionResult.data ?? []).map(mapDecision),
  };
}
