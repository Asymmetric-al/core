import { z } from "zod";

import {
  EVE_ENGINEERING_FINDING_SEVERITIES,
  EVE_ENGINEERING_FINDING_STATUSES,
  EVE_ENGINEERING_MONITOR_TYPES,
  type EveEngineeringFinding,
  type EveEngineeringMonitorAdminView,
  type EveEngineeringMonitorConfig,
} from "./types";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const configRowSchema = z.object({
  id: z.string(),
  tenant_id: z.string().uuid(),
  monitor_type: z.enum(EVE_ENGINEERING_MONITOR_TYPES),
  enabled: z.boolean(),
  paused: z.boolean(),
  source_type: z.enum(["event", "schedule"]),
  schedule: z.string(),
  threshold: z.record(
    z.string(),
    z.union([z.number(), z.string(), z.boolean()]),
  ),
  severity_rules: z.record(
    z.string(),
    z.enum(EVE_ENGINEERING_FINDING_SEVERITIES),
  ),
  destination_policy: z.object({
    kind: z.enum(["comment", "issue", "none"]),
    minimumSeverity: z.enum(EVE_ENGINEERING_FINDING_SEVERITIES),
  }),
  owner_key: z.string(),
  repo_owner: z.literal("Asymmetric-al"),
  repo_name: z.literal("core"),
  dedupe_window_seconds: z.number().int().positive(),
  freshness_window_seconds: z.number().int().positive(),
  policy_version: z.number().int().positive(),
  checkpoint: z.string().nullable(),
  next_run_at: z.string(),
  lease_token: z.string().uuid().nullable().optional(),
});

const findingRowSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  monitor_id: z.string(),
  run_id: z.string().uuid(),
  signal_type: z.enum(EVE_ENGINEERING_MONITOR_TYPES),
  target_id: z.string(),
  target_revision: z.string(),
  first_observed_at: z.string(),
  last_observed_at: z.string(),
  severity: z.enum(EVE_ENGINEERING_FINDING_SEVERITIES),
  status: z.enum(EVE_ENGINEERING_FINDING_STATUSES),
  dedupe_key: z.string(),
  policy_version: z.number().int().positive(),
  safe_evidence: z.record(z.string(), z.unknown()),
  decision_summary: z.string(),
  observation_count: z.number().int().positive(),
});

function toConfig(row: unknown): EveEngineeringMonitorConfig {
  const value = configRowSchema.parse(row);
  return {
    id: value.id,
    tenantId: value.tenant_id,
    type: value.monitor_type,
    enabled: value.enabled,
    paused: value.paused,
    source: value.source_type,
    schedule: value.schedule,
    threshold: value.threshold,
    severityRules: value.severity_rules,
    destinationPolicy: value.destination_policy,
    owner: value.owner_key,
    repoOwner: value.repo_owner,
    repoName: value.repo_name,
    dedupeWindowSeconds: value.dedupe_window_seconds,
    freshnessWindowSeconds: value.freshness_window_seconds,
    policyVersion: value.policy_version,
    checkpoint: value.checkpoint ?? undefined,
    nextRunAt: value.next_run_at,
    leaseToken: value.lease_token ?? undefined,
  };
}

function toFinding(row: unknown): EveEngineeringFinding {
  const value = findingRowSchema.parse(row);
  return {
    id: value.id,
    tenantId: value.tenant_id,
    monitorId: value.monitor_id,
    runId: value.run_id,
    signalType: value.signal_type,
    targetId: value.target_id,
    targetRevision: value.target_revision,
    firstObservedAt: value.first_observed_at,
    lastObservedAt: value.last_observed_at,
    severity: value.severity,
    status: value.status,
    dedupeKey: value.dedupe_key,
    policyVersion: value.policy_version,
    safeEvidence: value.safe_evidence,
    decisionSummary: value.decision_summary,
    observationCount: value.observation_count,
  };
}

function configRow(config: EveEngineeringMonitorConfig) {
  return {
    id: config.id,
    tenant_id: config.tenantId,
    monitor_type: config.type,
    enabled: config.enabled,
    paused: config.paused,
    source_type: config.source,
    schedule: config.schedule,
    threshold: config.threshold,
    severity_rules: config.severityRules,
    destination_policy: config.destinationPolicy,
    owner_key: config.owner,
    repo_owner: config.repoOwner,
    repo_name: config.repoName,
    dedupe_window_seconds: config.dedupeWindowSeconds,
    freshness_window_seconds: config.freshnessWindowSeconds,
    policy_version: config.policyVersion,
    checkpoint: config.checkpoint ?? null,
    next_run_at: config.nextRunAt,
  };
}

export async function ensureEveEngineeringMonitorConfigs(input: {
  configs: EveEngineeringMonitorConfig[];
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const { error } = await input.supabaseAdmin
    .from("eve_engineering_monitor_configs")
    .upsert(input.configs.map(configRow), {
      onConflict: "tenant_id,id",
      ignoreDuplicates: true,
    });
  if (error) throw new Error(error.message);
}

export async function claimDueEveEngineeringMonitors(input: {
  leaseSeconds: number;
  limit: number;
  now: string;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveEngineeringMonitorConfig[]> {
  const { data, error } = await input.supabaseAdmin.rpc(
    "claim_due_eve_engineering_monitors",
    {
      p_tenant_id: input.tenantId,
      p_now: input.now,
      p_limit: input.limit,
      p_lease_seconds: input.leaseSeconds,
    },
  );
  if (error) throw new Error(error.message);
  return z
    .array(configRowSchema)
    .parse(data ?? [])
    .map(toConfig);
}

export async function releaseEveEngineeringMonitorLease(input: {
  checkpoint?: string;
  config: EveEngineeringMonitorConfig;
  errorSummary?: string;
  nextRunAt: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  if (!input.config.leaseToken) {
    throw new Error("Engineering monitor lease token is missing.");
  }
  const { error } = await input.supabaseAdmin.rpc(
    "release_eve_engineering_monitor_lease",
    {
      p_tenant_id: input.config.tenantId,
      p_monitor_id: input.config.id,
      p_lease_token: input.config.leaseToken,
      p_next_run_at: input.nextRunAt,
      p_checkpoint: input.checkpoint ?? null,
      p_error_summary: input.errorSummary ?? null,
    },
  );
  if (error) throw new Error(error.message);
}

export async function createEveEngineeringMonitorRun(input: {
  config: EveEngineeringMonitorConfig;
  runId: string;
  sessionId: string;
  startedAt: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const { error } = await input.supabaseAdmin
    .from("eve_engineering_monitor_runs")
    .insert({
      id: input.runId,
      tenant_id: input.config.tenantId,
      monitor_id: input.config.id,
      session_id: input.sessionId,
      policy_version: input.config.policyVersion,
      status: "running",
      finding_count: 0,
      started_at: input.startedAt,
    });
  if (error) throw new Error(error.message);
}

export async function finishEveEngineeringMonitorRun(input: {
  completedAt: string;
  findingCount: number;
  reason?: string;
  runId: string;
  status: "blocked" | "failed" | "succeeded" | "suppressed";
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<void> {
  const { error } = await input.supabaseAdmin
    .from("eve_engineering_monitor_runs")
    .update({
      completed_at: input.completedAt,
      finding_count: input.findingCount,
      reason: input.reason ?? null,
      status: input.status,
    })
    .eq("tenant_id", input.tenantId)
    .eq("id", input.runId);
  if (error) throw new Error(error.message);
}

export async function loadEveEngineeringFindingByDedupe(input: {
  dedupeKey: string;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveEngineeringFinding | undefined> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_engineering_findings")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("dedupe_key", input.dedupeKey)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toFinding(data) : undefined;
}

export async function upsertEveEngineeringFinding(input: {
  finding: EveEngineeringFinding;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<EveEngineeringFinding> {
  const value = input.finding;
  const { data, error } = await input.supabaseAdmin.rpc(
    "upsert_eve_engineering_finding",
    {
      p_id: value.id,
      p_tenant_id: value.tenantId,
      p_monitor_id: value.monitorId,
      p_run_id: value.runId,
      p_signal_type: value.signalType,
      p_target_id: value.targetId,
      p_target_revision: value.targetRevision,
      p_observed_at: value.lastObservedAt,
      p_severity: value.severity,
      p_status: value.status,
      p_dedupe_key: value.dedupeKey,
      p_policy_version: value.policyVersion,
      p_safe_evidence: value.safeEvidence,
      p_decision_summary: value.decisionSummary,
    },
  );
  if (error || !data)
    throw new Error(error?.message ?? "Finding was not saved.");
  return toFinding(data);
}

export async function recordEveEngineeringFindingDownstreamOutcome(input: {
  findingId: string;
  outcome: Record<string, unknown>;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<void> {
  const { error } = await input.supabaseAdmin
    .from("eve_engineering_findings")
    .update({
      downstream_outcome: input.outcome,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("id", input.findingId);
  if (error) throw new Error(error.message);
}

export async function loadEveEngineeringMonitorAdminView(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveEngineeringMonitorAdminView> {
  const [configs, findings, runs] = await Promise.all([
    input.supabaseAdmin
      .from("eve_engineering_monitor_configs")
      .select("*")
      .eq("tenant_id", input.tenantId)
      .order("monitor_type"),
    input.supabaseAdmin
      .from("eve_engineering_findings")
      .select("*")
      .eq("tenant_id", input.tenantId)
      .order("last_observed_at", { ascending: false })
      .limit(50),
    input.supabaseAdmin
      .from("eve_engineering_monitor_runs")
      .select(
        "id, monitor_id, status, reason, finding_count, started_at, completed_at",
      )
      .eq("tenant_id", input.tenantId)
      .order("started_at", { ascending: false })
      .limit(50),
  ]);
  const error = configs.error ?? findings.error ?? runs.error;
  if (error) throw new Error(error.message);
  return {
    configs: (configs.data ?? []).map(toConfig),
    findings: (findings.data ?? []).map(toFinding),
    recentRuns: z
      .array(
        z.object({
          id: z.string().uuid(),
          monitor_id: z.string(),
          status: z.enum([
            "blocked",
            "failed",
            "running",
            "succeeded",
            "suppressed",
          ]),
          reason: z.string().nullable(),
          finding_count: z.number().int().nonnegative(),
          started_at: z.string(),
          completed_at: z.string().nullable(),
        }),
      )
      .parse(runs.data ?? [])
      .map((run) => ({
        id: run.id,
        monitorId: run.monitor_id,
        status: run.status,
        reason: run.reason ?? undefined,
        findingCount: run.finding_count,
        startedAt: run.started_at,
        completedAt: run.completed_at ?? undefined,
      })),
  };
}
