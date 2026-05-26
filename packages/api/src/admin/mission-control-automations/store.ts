import { automationRuleSchema } from "./schemas";

import type { AutomationRule } from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;
type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function toAutomationRule(row: JsonRecord): AutomationRule {
  return automationRuleSchema.parse({
    id: asString(row.id) ?? undefined,
    name: asString(row.name) ?? "Untitled automation",
    mode: asString(row.mode) ?? "advanced",
    trigger: row.trigger,
    conditions: Array.isArray(row.conditions) ? row.conditions : [],
    actions: Array.isArray(row.actions) ? row.actions : [],
    runMode: asString(row.run_mode) ?? "automatic",
    enabled: row.enabled === true,
  });
}

export async function listMissionControlAutomationRules(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
}) {
  const { data, error } = await input.supabaseAdmin
    .from("mission_control_automation_rules")
    .select(
      "id, name, mode, trigger, conditions, actions, run_mode, enabled, activation_status, updated_at",
    )
    .eq("tenant_id", input.tenantId)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as JsonRecord[]).map(toAutomationRule);
}

export async function saveMissionControlAutomationRule(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  actorProfileId: string | null;
  rule: AutomationRule;
  activationReady?: {
    hasFreshPreview: boolean;
    hasSuccessfulTestRun: boolean;
    activityLogConfigured: boolean;
  };
}) {
  const rule = automationRuleSchema.parse(input.rule);
  if (rule.enabled) {
    const ready = input.activationReady;
    if (!ready?.hasFreshPreview) {
      throw new Error("Automation activation requires a fresh preview.");
    }
    if (!ready.hasSuccessfulTestRun) {
      throw new Error("Automation activation requires a successful test run.");
    }
    if (!ready.activityLogConfigured) {
      throw new Error("Automation activation requires activity log setup.");
    }
  }
  const payload = {
    tenant_id: input.tenantId,
    name: rule.name,
    mode: rule.mode,
    trigger: rule.trigger,
    conditions: rule.conditions,
    actions: rule.actions,
    run_mode: rule.runMode,
    enabled: rule.enabled,
    activation_status: rule.enabled ? "active" : "draft",
    updated_by: input.actorProfileId,
    updated_at: new Date().toISOString(),
  };

  const query = rule.id
    ? input.supabaseAdmin
        .from("mission_control_automation_rules")
        .update(payload)
        .eq("tenant_id", input.tenantId)
        .eq("id", rule.id)
    : input.supabaseAdmin.from("mission_control_automation_rules").insert({
        ...payload,
        created_by: input.actorProfileId,
      });

  const { data, error } = await query
    .select("id, name, mode, trigger, conditions, actions, run_mode, enabled")
    .single();

  if (error || !isRecord(data)) {
    throw new Error(error?.message ?? "Failed to save automation rule.");
  }

  return toAutomationRule(data);
}
