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
  AutomationRuleRecentActivity,
  MissionControlAutomationDashboard,
  MissionControlAutomationSummary,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;
type JsonRecord = Record<string, unknown>;

const ACTIVITY_LOG_LOOKBACK_MS = 24 * 60 * 60 * 1000;
/** PostgREST max_rows (supabase/config.toml): the activity read pages. */
const ACTIVITY_LOG_PAGE_SIZE = 1000;
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

const AUTOMATION_RULE_COLUMNS =
  "id, name, mode, trigger, conditions, actions, run_mode, enabled, activation_status, updated_at";
const AUTOMATION_RULE_PAGE_LIMIT = 100;

export async function listMissionControlAutomationRules(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
}) {
  const { data, error } = await input.supabaseAdmin
    .from("mission_control_automation_rules")
    .select(AUTOMATION_RULE_COLUMNS)
    .eq("tenant_id", input.tenantId)
    .order("updated_at", { ascending: false })
    .limit(AUTOMATION_RULE_PAGE_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as JsonRecord[]).map(toAutomationRule);
}

/**
 * The tenant's rules with these ids. The dashboard reads rules that ran in
 * the window but fell outside the newest page, so their runs land on a
 * listed rule instead of reading as a deleted rule's.
 */
async function listMissionControlAutomationRulesById(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  ruleIds: string[];
}): Promise<AutomationRule[]> {
  if (input.ruleIds.length === 0) return [];

  const { data, error } = await input.supabaseAdmin
    .from("mission_control_automation_rules")
    .select(AUTOMATION_RULE_COLUMNS)
    .eq("tenant_id", input.tenantId)
    .in("id", input.ruleIds)
    .order("updated_at", { ascending: false })
    .limit(input.ruleIds.length);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as JsonRecord[]).map(toAutomationRule);
}

const NO_RECENT_ACTIVITY: AutomationRuleRecentActivity = {
  runs24h: 0,
  failedRuns24h: 0,
  lastFailureAt: null,
};

/**
 * Per-rule runs and failures from the same activity rows the summary
 * counts. Rows with no rule (the foreign key clears it when a rule is
 * deleted) count only in the summary.
 */
function summarizeActivityByRule(
  rows: JsonRecord[],
): Map<string, AutomationRuleRecentActivity> {
  const byRule = new Map<string, AutomationRuleRecentActivity>();
  for (const row of rows) {
    const ruleId = asString(row.rule_id);
    if (!ruleId) continue;
    const current = byRule.get(ruleId) ?? { ...NO_RECENT_ACTIVITY };
    current.runs24h += 1;
    if (activityLogHasFailures(row)) {
      current.failedRuns24h += 1;
      const createdAt = asString(row.created_at);
      if (
        createdAt &&
        (current.lastFailureAt === null ||
          Date.parse(createdAt) > Date.parse(current.lastFailureAt))
      ) {
        current.lastFailureAt = createdAt;
      }
    }
    byRule.set(ruleId, current);
  }
  return byRule;
}

async function loadMissionControlAutomationActivitySummary(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
}): Promise<{
  summary: Pick<
    MissionControlAutomationSummary,
    "activityLogBacked" | "executions24h" | "failedRuns24h"
  >;
  byRule: Map<string, AutomationRuleRecentActivity>;
  /** Failed runs whose log row names no rule (its rule was deleted). */
  failedRunsWithoutRule: number;
}> {
  const cutoff = new Date(Date.now() - ACTIVITY_LOG_LOOKBACK_MS).toISOString();
  // Every run in the window, page by page: a rule past one page must not
  // read as "No runs", and the totals must count every run.
  const rows: JsonRecord[] = [];
  for (let from = 0; ;) {
    const { data, error } = await input.supabaseAdmin
      .from("mission_control_automation_activity_logs")
      .select("rule_id, failures, created_at")
      .eq("tenant_id", input.tenantId)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + ACTIVITY_LOG_PAGE_SIZE - 1);

    if (error) {
      throw new Error(error.message);
    }

    const page = (data ?? []) as JsonRecord[];
    if (page.length === 0) break;
    rows.push(...page);
    from += page.length;
  }

  return {
    summary: {
      executions24h: rows.length,
      failedRuns24h: rows.filter(activityLogHasFailures).length,
      activityLogBacked: true,
    },
    byRule: summarizeActivityByRule(rows),
    failedRunsWithoutRule: rows.filter(
      (row) => !asString(row.rule_id) && activityLogHasFailures(row),
    ).length,
  };
}

export async function loadMissionControlAutomationDashboard(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
}): Promise<MissionControlAutomationDashboard> {
  const pageRules = await listMissionControlAutomationRules(input);
  const activity = await loadMissionControlAutomationActivitySummary(input);

  // The page holds the newest rules only. A rule that ran in the window but
  // sits past it is read by id, so its runs and failures stay on a rule.
  const listedIds = new Set(
    pageRules.flatMap((rule) => (rule.id ? [rule.id] : [])),
  );
  const ranOutsidePage = [...activity.byRule.keys()].filter(
    (ruleId) => !listedIds.has(ruleId),
  );
  const extraRules = await listMissionControlAutomationRulesById({
    ...input,
    ruleIds: ranOutsidePage,
  });
  const automationRules = [...pageRules, ...extraRules];
  const ruleSummary = countRuleSummary(automationRules);

  // A rule id that could not be read back has no rule to show, so its
  // failures count with the runs that name no rule.
  const readIds = new Set(
    extraRules.flatMap((rule) => (rule.id ? [rule.id] : [])),
  );
  const failedRunsOfUnreadRules = ranOutsidePage
    .filter((ruleId) => !readIds.has(ruleId))
    .reduce(
      (total, ruleId) =>
        total + (activity.byRule.get(ruleId)?.failedRuns24h ?? 0),
      0,
    );

  return {
    automationRules: automationRules.map((rule) => ({
      ...rule,
      ...((rule.id ? activity.byRule.get(rule.id) : undefined) ??
        NO_RECENT_ACTIVITY),
    })),
    summary: {
      ...ruleSummary,
      ...activity.summary,
      failedRunsWithoutRule24h:
        activity.failedRunsWithoutRule + failedRunsOfUnreadRules,
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
