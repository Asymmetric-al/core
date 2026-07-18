import { z } from "zod";

import { EVE_POLICY_STATUSES } from "./types";

import type {
  EveGovernanceAdminView,
  EveGovernanceDecisionRecord,
  EveGovernanceSnapshot,
  EveGovernanceStore,
  EveRunSummary,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const governanceStateRowSchema = z.object({
  release_enabled: z.boolean(),
  emergency_off: z.boolean(),
  kill_switch_state: z.object({
    all_automation: z.boolean(),
    active_runs: z.boolean(),
    github_actions: z.boolean(),
    production_writes: z.boolean(),
    sandbox_networking: z.boolean(),
    dynamic_workflows: z.boolean(),
    model_policy_changes: z.boolean(),
    force_approval: z.boolean(),
  }),
  policy_status: z.enum(EVE_POLICY_STATUSES),
  policy_summary: z.string().nullable(),
  state_version: z.number().int().positive(),
  updated_at: z.string(),
});

const runSummaryRowSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  target: z.string().nullable(),
  governance_decision: z.enum(["allowed", "blocked"]),
  decision_reason: z.string(),
  status: z.enum(["started", "completed", "failed", "skipped", "stopped"]),
  updated_at: z.string(),
});

function toGovernanceSnapshot(row: unknown): EveGovernanceSnapshot {
  const parsed = governanceStateRowSchema.parse(row);
  return {
    source: "persisted",
    releaseEnabled: parsed.release_enabled,
    emergencyOff: parsed.emergency_off,
    killSwitchState: parsed.kill_switch_state,
    policyStatus: parsed.policy_status,
    policySummary: parsed.policy_summary ?? undefined,
    stateVersion: parsed.state_version,
    updatedAt: parsed.updated_at,
  };
}

function toRunSummary(row: unknown): EveRunSummary {
  const parsed = runSummaryRowSchema.parse(row);
  return {
    id: parsed.id,
    action: parsed.action,
    target: parsed.target ?? undefined,
    decision: parsed.governance_decision,
    reason: parsed.decision_reason,
    status: parsed.status,
    updatedAt: parsed.updated_at,
  };
}

export async function loadEveGovernanceSnapshot(input: {
  supabaseAdmin: AdminSupabaseClient;
}): Promise<EveGovernanceSnapshot | null> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_governance_state")
    .select(
      "release_enabled, emergency_off, kill_switch_state, policy_status, policy_summary, state_version, updated_at",
    )
    .eq("id", "global")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toGovernanceSnapshot(data) : null;
}

export async function recordEveGovernanceDecision(input: {
  supabaseAdmin: AdminSupabaseClient;
  record: EveGovernanceDecisionRecord;
}): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await input.supabaseAdmin.from("eve_run_summaries").upsert(
    {
      id: input.record.id,
      action: input.record.action,
      target: input.record.target ?? null,
      governance_decision: input.record.decision,
      decision_reason: input.record.reason,
      status: input.record.status,
      state_version: input.record.stateVersion ?? null,
      initiated_by_profile_id: input.record.initiatedByProfileId ?? null,
      accountable_trigger: input.record.accountableTrigger ?? null,
      summary: input.record.summary ?? {},
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export function createEveGovernanceStore(
  supabaseAdmin: AdminSupabaseClient,
): EveGovernanceStore {
  return {
    loadSnapshot: () => loadEveGovernanceSnapshot({ supabaseAdmin }),
    recordDecision: (record) =>
      recordEveGovernanceDecision({ supabaseAdmin, record }),
  };
}

export async function loadEveGovernanceAdminView(input: {
  supabaseAdmin: AdminSupabaseClient;
}): Promise<EveGovernanceAdminView> {
  const [snapshot, recentRunsResult] = await Promise.all([
    loadEveGovernanceSnapshot(input),
    input.supabaseAdmin
      .from("eve_run_summaries")
      .select(
        "id, action, target, governance_decision, decision_reason, status, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  if (recentRunsResult.error) {
    throw new Error(recentRunsResult.error.message);
  }

  const system =
    snapshot ??
    ({
      source: "missing",
      releaseEnabled: false,
      emergencyOff: false,
      killSwitchState: {
        all_automation: true,
        active_runs: true,
        github_actions: true,
        production_writes: true,
        sandbox_networking: true,
        dynamic_workflows: true,
        model_policy_changes: true,
        force_approval: true,
      },
      policyStatus: "not_configured",
      stateVersion: 1,
      updatedAt: new Date(0).toISOString(),
    } satisfies EveGovernanceSnapshot);

  return {
    system,
    recentRuns: (recentRunsResult.data ?? []).map(toRunSummary),
  };
}
