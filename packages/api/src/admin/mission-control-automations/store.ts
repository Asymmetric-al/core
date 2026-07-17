import { resolveMissionControlAutomationLifecycle } from "@asym/database/mission-control-automations";

import {
  getActivationReadinessFailure,
  type AutomationActivationReadiness,
} from "./preview";
import { automationRuleSchema } from "./schemas";
import { ApiHttpError } from "../../shared/http-errors";
import { asString, isRecord } from "../../shared/json-coerce";

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

function normalizePersistedAutomationActions(value: unknown): {
  actions: unknown[];
  retiredCrmRepostRemoved: boolean;
} {
  const rawActions = Array.isArray(value) ? value : [];
  let retiredCrmRepostRemoved = false;
  const actions = rawActions.filter((action) => {
    const retiredCrmRepost =
      isRecord(action) &&
      action.kind === "contribution_action" &&
      action.actionType === "crm_repost";

    if (retiredCrmRepost) {
      retiredCrmRepostRemoved = true;
      return false;
    }

    return true;
  });

  if (retiredCrmRepostRemoved && actions.length === 0) {
    actions.push({ kind: "create_task", issueType: "crm_post_failed" });
  }

  return { actions, retiredCrmRepostRemoved };
}

function toAutomationRule(row: JsonRecord): AutomationRule {
  const normalizedActions = normalizePersistedAutomationActions(row.actions);

  return automationRuleSchema.parse({
    id: asString(row.id) ?? undefined,
    name: asString(row.name) ?? "Untitled automation",
    mode: asString(row.mode) ?? "advanced",
    trigger: row.trigger,
    conditions: Array.isArray(row.conditions) ? row.conditions : [],
    actions: normalizedActions.actions,
    runMode: asString(row.run_mode) ?? "automatic",
    enabled: normalizedActions.retiredCrmRepostRemoved
      ? false
      : row.enabled === true,
    activationStatus: normalizedActions.retiredCrmRepostRemoved
      ? "disabled"
      : toActivationStatus(row.activation_status),
  });
}

function countRuleSummary(
  automationRules: AutomationRule[],
): Pick<
  MissionControlAutomationSummary,
  | "activeRules"
  | "draftRules"
  | "invalidRules"
  | "pausedRules"
  | "readyRules"
  | "totalRules"
> {
  let activeRules = 0;
  let draftRules = 0;
  let invalidRules = 0;
  let pausedRules = 0;
  let readyRules = 0;

  for (const rule of automationRules) {
    const lifecycle = resolveMissionControlAutomationLifecycle(rule);

    if (lifecycle.summaryBucket === "activeRules") {
      activeRules += 1;
      continue;
    }

    if (lifecycle.summaryBucket === "invalidRules") {
      invalidRules += 1;
      continue;
    }

    if (lifecycle.summaryBucket === "pausedRules") {
      pausedRules += 1;
      continue;
    }

    if (lifecycle.summaryBucket === "readyRules") {
      readyRules += 1;
      continue;
    }

    draftRules += 1;
  }

  return {
    totalRules: automationRules.length,
    activeRules,
    pausedRules,
    readyRules,
    draftRules,
    invalidRules,
  };
}

function activityLogHasFailures(row: JsonRecord): boolean {
  return Array.isArray(row.failures) && row.failures.length > 0;
}

function resolveActivationStatusForSave(
  rule: AutomationRule,
): AutomationActivationStatus | undefined {
  if (rule.enabled) {
    return "active";
  }

  if (rule.activationStatus) {
    return rule.activationStatus;
  }

  return rule.id ? undefined : "draft";
}

function assertActiveStatusReady(input: {
  rule: AutomationRule;
  activationStatus: AutomationActivationStatus | undefined;
  activationReady: AutomationActivationReadiness | undefined;
}) {
  if (input.activationStatus !== "active") {
    return;
  }

  if (!input.rule.enabled) {
    throw new ApiHttpError(
      400,
      "Active automation status requires the rule to be enabled.",
    );
  }

  const readinessFailure = getActivationReadinessFailure(input.activationReady);
  if (readinessFailure) {
    throw new ApiHttpError(400, readinessFailure);
  }
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
  activationReady?: AutomationActivationReadiness;
}) {
  const rule = automationRuleSchema.parse(input.rule);
  const activationStatus = resolveActivationStatusForSave(rule);
  assertActiveStatusReady({
    rule,
    activationStatus,
    activationReady: input.activationReady,
  });
  const payload = {
    tenant_id: input.tenantId,
    name: rule.name,
    mode: rule.mode,
    trigger: rule.trigger,
    conditions: rule.conditions,
    actions: rule.actions,
    run_mode: rule.runMode,
    enabled: rule.enabled,
    updated_by: input.actorProfileId,
    updated_at: new Date().toISOString(),
    ...(activationStatus ? { activation_status: activationStatus } : {}),
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
