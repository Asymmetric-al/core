import {
  executeEveRuntimePolicyConsult,
  type EvePolicyActionId,
} from "@asym/api/eve/approval-budget";
import {
  createEveAuditStore,
  createServiceEveAuditIdentity,
  traceEveAuditEvent,
} from "@asym/api/eve/audit";
import {
  claimDueEveEngineeringMonitors,
  createEveEngineeringFindingDedupeKey,
  createEveEngineeringMonitorDefaults,
  createEveEngineeringMonitorRun,
  ensureEveEngineeringMonitorConfigs,
  evaluateEveEngineeringMonitorGate,
  finishEveEngineeringMonitorRun,
  loadEveEngineeringFindingByDedupe,
  prepareEveEngineeringFinding,
  recordEveEngineeringFindingDownstreamOutcome,
  releaseEveEngineeringMonitorLease,
  upsertEveEngineeringFinding,
} from "@asym/api/eve/engineering-monitors";
import {
  createEveGovernanceStore,
  loadEveGovernanceSnapshot,
} from "@asym/api/eve/governance";
import { enqueueEveEngineeringFindingNotifications } from "@asym/api/eve/notifications";
import {
  claimEveSessionOwnership,
  createServiceEveSessionIdentity,
} from "@asym/api/eve/session-ownership";

import { collectEveEngineeringMonitorEvidence } from "./collect";
import {
  createEveMonitorGithubReader,
  runEveEngineeringMonitorFollowup,
} from "./github";

import type { EveEngineeringMonitorConfig } from "@asym/api/eve/engineering-monitors";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function requireRuntimeConfig() {
  const tenantId = process.env.EVE_GITHUB_TENANT_ID?.trim();
  const installation = process.env.EVE_GITHUB_INSTALLATION_ID?.trim();
  const installationId = Number(installation);
  if (
    !tenantId ||
    !UUID_PATTERN.test(tenantId) ||
    !Number.isSafeInteger(installationId) ||
    installationId <= 0
  ) {
    throw new Error(
      "Eve engineering monitor runtime configuration is unavailable.",
    );
  }
  return { installationId, tenantId };
}

function nextRunAt(now: Date, failed = false): string {
  return new Date(now.getTime() + (failed ? 15 : 5) * 60_000).toISOString();
}

export async function auditMonitor(input: {
  action: string;
  config: EveEngineeringMonitorConfig;
  evidence: Record<string, unknown>;
  result: "blocked" | "failed" | "skipped" | "started" | "succeeded";
  runId: string;
  supabaseAdmin: AdminSupabaseClient;
}) {
  const target = `${input.config.repoOwner}/${input.config.repoName}:${input.config.type}`;
  const blocked = input.result === "blocked" || input.result === "skipped";
  let status: "completed" | "failed" | "skipped" | "started" = "skipped";
  if (input.result === "started") status = "started";
  if (input.result === "succeeded") status = "completed";
  if (input.result === "failed") status = "failed";
  await createEveGovernanceStore(input.supabaseAdmin).recordDecision({
    id: input.runId,
    action: "engineering_monitor.run",
    target,
    decision: blocked ? "blocked" : "allowed",
    reason: blocked ? "policy_not_ready" : "governance_allowed",
    status,
    stateVersion: input.config.policyVersion,
    accountableTrigger: "engineering-health-monitor-schedule",
    summary: {
      auditAction: input.action,
      monitorType: input.config.type,
      ...input.evidence,
    },
  });
  await traceEveAuditEvent({
    store: createEveAuditStore(input.supabaseAdmin),
    event: {
      action: input.action,
      change: { monitorType: input.config.type },
      decision: {
        rationale: "App-owned engineering monitor policy was evaluated.",
        risk: "Background engineering evidence collection",
        reversalOrFollowUp: "Pause the monitor in Mission Control.",
      },
      evidence: input.evidence,
      identity: createServiceEveAuditIdentity({
        initiatorId: input.config.id,
        initiatorType: "schedule",
        serviceId: "eve-monitor-scheduler",
        tenantId: input.config.tenantId,
      }),
      modelRole: "not_used",
      policy: {
        id: "eve-engineering-health-monitors-v1",
        status: input.result,
      },
      result: input.result,
      runId: input.runId,
      target,
      toolName: "engineering_health_monitor",
    },
  });
}

async function runClaimedMonitor(input: {
  config: EveEngineeringMonitorConfig;
  installationId: number;
  now: Date;
  supabaseAdmin: AdminSupabaseClient;
}) {
  const runId = crypto.randomUUID();
  const sessionId = `schedule:${runId}`;
  const identity = createServiceEveSessionIdentity({
    initiatorId: input.config.id,
    initiatorType: "schedule",
    serviceId: "eve-monitor-scheduler",
    tenantId: input.config.tenantId,
  });
  await claimEveSessionOwnership({
    identity,
    sessionId,
    supabaseAdmin: input.supabaseAdmin,
  });
  await createEveEngineeringMonitorRun({
    config: input.config,
    runId,
    sessionId,
    startedAt: input.now.toISOString(),
    supabaseAdmin: input.supabaseAdmin,
  });
  let findingCount = 0;
  try {
    const governance = await loadEveGovernanceSnapshot({
      supabaseAdmin: input.supabaseAdmin,
    });
    if (!governance) throw new Error("Eve governance state is unavailable.");
    const gate = evaluateEveEngineeringMonitorGate({
      config: input.config,
      governance,
    });
    if (!gate.allowed) {
      await finishEveEngineeringMonitorRun({
        completedAt: new Date().toISOString(),
        findingCount: 0,
        reason: gate.reason,
        runId,
        status: "suppressed",
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.config.tenantId,
      });
      await auditMonitor({
        action: "engineering_monitor.run_suppressed",
        config: input.config,
        evidence: { reason: gate.reason },
        result: "skipped",
        runId,
        supabaseAdmin: input.supabaseAdmin,
      });
      return;
    }
    const consult = (actionId: EvePolicyActionId, targetKey: string) =>
      executeEveRuntimePolicyConsult({
        actionId,
        identity,
        sessionId,
        supabaseAdmin: input.supabaseAdmin,
        targetKey,
      });
    const collectionPolicy = await consult(
      "engineering.monitor.collect",
      `engineering_monitor:${input.config.id}:${runId}`,
    );
    if (collectionPolicy.decision !== "allow") {
      await finishEveEngineeringMonitorRun({
        completedAt: new Date().toISOString(),
        findingCount: 0,
        reason: collectionPolicy.reason,
        runId,
        status: "blocked",
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.config.tenantId,
      });
      return;
    }
    await auditMonitor({
      action: "engineering_monitor.collection_started",
      config: input.config,
      evidence: { policyVersion: input.config.policyVersion },
      result: "started",
      runId,
      supabaseAdmin: input.supabaseAdmin,
    });
    const evidence = await collectEveEngineeringMonitorEvidence({
      config: input.config,
      github: createEveMonitorGithubReader(input.installationId),
      now: input.now,
    });
    for (const item of evidence) {
      const dedupeKey = createEveEngineeringFindingDedupeKey({
        evidence: item,
        monitorId: input.config.id,
      });
      const existing = await loadEveEngineeringFindingByDedupe({
        dedupeKey,
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.config.tenantId,
      });
      const finding = await upsertEveEngineeringFinding({
        finding: prepareEveEngineeringFinding({
          config: input.config,
          evidence: item,
          existing,
          now: input.now.toISOString(),
          runId,
        }),
        supabaseAdmin: input.supabaseAdmin,
      });
      findingCount += 1;
      const outcome = await runEveEngineeringMonitorFollowup({
        auditStore: createEveAuditStore(input.supabaseAdmin),
        config: input.config,
        finding,
        governanceStore: createEveGovernanceStore(input.supabaseAdmin),
        installationId: input.installationId,
        policyConsult: (actionId, targetKey) => consult(actionId, targetKey),
      });
      await recordEveEngineeringFindingDownstreamOutcome({
        findingId: finding.id,
        outcome: { ...outcome },
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.config.tenantId,
      });
      await enqueueEveEngineeringFindingNotifications({
        request: { finding, sourceTrigger: `engineering-monitor:${runId}` },
        supabaseAdmin: input.supabaseAdmin,
      });
    }
    await finishEveEngineeringMonitorRun({
      completedAt: new Date().toISOString(),
      findingCount,
      runId,
      status: "succeeded",
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.config.tenantId,
    });
    await auditMonitor({
      action: "engineering_monitor.collection_completed",
      config: input.config,
      evidence: { findingCount },
      result: "succeeded",
      runId,
      supabaseAdmin: input.supabaseAdmin,
    });
  } catch (error) {
    const reason =
      error instanceof Error ? error.message.slice(0, 500) : "Monitor failed.";
    await finishEveEngineeringMonitorRun({
      completedAt: new Date().toISOString(),
      findingCount,
      reason,
      runId,
      status: "failed",
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.config.tenantId,
    }).catch(() => undefined);
    await auditMonitor({
      action: "engineering_monitor.collection_failed",
      config: input.config,
      evidence: { reason },
      result: "failed",
      runId,
      supabaseAdmin: input.supabaseAdmin,
    }).catch(() => undefined);
    throw error;
  }
}

export async function runEveEngineeringMonitorSweep(now = new Date()) {
  const runtime = requireRuntimeConfig();
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client)
    throw new Error("Eve engineering monitor store is unavailable.");
  const governance = await loadEveGovernanceSnapshot({
    supabaseAdmin: admin.client,
  });
  if (!governance) throw new Error("Eve governance state is unavailable.");
  await ensureEveEngineeringMonitorConfigs({
    configs: createEveEngineeringMonitorDefaults({
      now: now.toISOString(),
      policyVersion: governance.stateVersion,
      tenantId: runtime.tenantId,
    }),
    supabaseAdmin: admin.client,
  });
  const configs = await claimDueEveEngineeringMonitors({
    leaseSeconds: 300,
    limit: 6,
    now: now.toISOString(),
    supabaseAdmin: admin.client,
    tenantId: runtime.tenantId,
  });
  for (const config of configs) {
    try {
      await runClaimedMonitor({
        config,
        installationId: runtime.installationId,
        now,
        supabaseAdmin: admin.client,
      });
      await releaseEveEngineeringMonitorLease({
        checkpoint: now.toISOString(),
        config,
        nextRunAt: nextRunAt(now),
        supabaseAdmin: admin.client,
      });
    } catch (error) {
      const errorSummary =
        error instanceof Error
          ? error.message.slice(0, 500)
          : "Monitor failed.";
      await releaseEveEngineeringMonitorLease({
        config,
        errorSummary,
        nextRunAt: nextRunAt(now, true),
        supabaseAdmin: admin.client,
      });
    }
  }
  return { claimed: configs.length };
}
