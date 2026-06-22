import { automationRuleSchema } from "./schemas";

import type {
  AutomationActivationStatus,
  AutomationRule,
  MissionControlAutomationDashboard,
  MissionControlAutomationSummary,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;
type JsonRecord = Record<string, unknown>;

const ACTIVITY_LOG_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_LOG_SUMMARY_LIMIT = 1000;
const AUTOMATION_ACTIVATION_STATUSES = new Set<AutomationActivationStatus>([
  "draft",
  "ready",
  "active",
  "paused",
  "disabled",
]);

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function toActivationStatus(value: unknown): AutomationActivationStatus {
  const status = asString(value);
  if (
    status &&
    AUTOMATION_ACTIVATION_STATUSES.has(status as AutomationActivationStatus)
  ) {
    return status as AutomationActivationStatus;
  }
  return "draft";
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
    activationStatus: toActivationStatus(row.activation_status),
  });
}

function countRuleSummary(
  automationRules: AutomationRule[],
): Pick<
  MissionControlAutomationSummary,
  "activeRules" | "draftRules" | "pausedRules" | "totalRules"
> {
  let activeRules = 0;
  let draftRules = 0;
  let pausedRules = 0;

  for (const rule of automationRules) {
    if (rule.enabled || rule.activationStatus === "active") {
      activeRules += 1;
      continue;
    }

    if (
      rule.activationStatus === "paused" ||
      rule.activationStatus === "disabled"
    ) {
      pausedRules += 1;
      continue;
    }

    if (rule.activationStatus === "draft") {
      draftRules += 1;
    }
  }

  return {
    totalRules: automationRules.length,
    activeRules,
    pausedRules,
    draftRules,
  };
}

function activityLogHasFailures(row: JsonRecord): boolean {
  return Array.isArray(row.failures) && row.failures.length > 0;
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

async function loadMissionControlAutomationActivitySummary(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
}): Promise<
  Pick<
    MissionControlAutomationSummary,
    "activityLogBacked" | "executions24h" | "failedRuns24h"
  >
> {
  const cutoff = new Date(Date.now() - ACTIVITY_LOG_LOOKBACK_MS).toISOString();
  const { data, error } = await input.supabaseAdmin
    .from("mission_control_automation_activity_logs")
    .select("failures, created_at")
    .eq("tenant_id", input.tenantId)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(ACTIVITY_LOG_SUMMARY_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as JsonRecord[];

  return {
    executions24h: rows.length,
    failedRuns24h: rows.filter(activityLogHasFailures).length,
    activityLogBacked: true,
  };
}

export async function loadMissionControlAutomationDashboard(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
}): Promise<MissionControlAutomationDashboard> {
  const automationRules = await listMissionControlAutomationRules(input);
  const ruleSummary = countRuleSummary(automationRules);
  const activitySummary =
    await loadMissionControlAutomationActivitySummary(input);

  return {
    automationRules,
    summary: {
      ...ruleSummary,
      ...activitySummary,
      integrationHealthBacked: false,
    },
  };
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
    .select(
      "id, name, mode, trigger, conditions, actions, run_mode, enabled, activation_status",
    )
    .single();

  if (error || !isRecord(data)) {
    throw new Error(error?.message ?? "Failed to save automation rule.");
  }

  return toAutomationRule(data);
}
