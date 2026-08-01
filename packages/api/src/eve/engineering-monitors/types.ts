import type { EveGovernanceSnapshot } from "../governance/types";
import type { EveSessionIdentity } from "../session-ownership/types";

export const EVE_ENGINEERING_MONITOR_TYPES = [
  "ci_failure",
  "stale_pull_request",
  "failing_eval",
  "dependency_security_alert",
  "protected_area_pull_request",
  "budget_rate_limit",
] as const;

export type EveEngineeringMonitorType =
  (typeof EVE_ENGINEERING_MONITOR_TYPES)[number];

export const EVE_ENGINEERING_FINDING_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;
export type EveEngineeringFindingSeverity =
  (typeof EVE_ENGINEERING_FINDING_SEVERITIES)[number];

export const EVE_ENGINEERING_FINDING_STATUSES = [
  "open",
  "acknowledged",
  "resolved",
  "stale",
] as const;
export type EveEngineeringFindingStatus =
  (typeof EVE_ENGINEERING_FINDING_STATUSES)[number];

export interface EveEngineeringMonitorConfig {
  id: string;
  tenantId: string;
  type: EveEngineeringMonitorType;
  enabled: boolean;
  paused: boolean;
  source: "event" | "schedule";
  schedule: string;
  threshold: Record<string, number | string | boolean>;
  severityRules: Record<string, EveEngineeringFindingSeverity>;
  destinationPolicy: {
    kind: "comment" | "issue" | "none";
    minimumSeverity: EveEngineeringFindingSeverity;
  };
  owner: string;
  repoOwner: "Asymmetric-al";
  repoName: "core";
  dedupeWindowSeconds: number;
  freshnessWindowSeconds: number;
  policyVersion: number;
  checkpoint?: string;
  nextRunAt: string;
  leaseToken?: string;
}

export interface EveEngineeringMonitorRunContext {
  config: EveEngineeringMonitorConfig;
  governance: EveGovernanceSnapshot;
  identity: EveSessionIdentity;
  runId: string;
  sessionId: string;
}

interface EveEngineeringEvidenceBase {
  observedAt: string;
  repository: "Asymmetric-al/core";
  safeUrl: string;
  targetId: string;
  targetRevision: string;
}

export type EveEngineeringMonitorEvidence =
  | (EveEngineeringEvidenceBase & {
      type: "ci_failure";
      checkId: string;
      conclusion: "failure" | "timed_out" | "cancelled" | "action_required";
      workflowName: string;
    })
  | (EveEngineeringEvidenceBase & {
      type: "stale_pull_request";
      blocked: boolean;
      draft: boolean;
      lastActivityAt: string;
      pullRequestNumber: number;
      thresholdSeconds: number;
    })
  | (EveEngineeringEvidenceBase & {
      type: "failing_eval";
      caseId: string;
      deterministicStatus: "failed";
      judgeStatus?: "failed" | "not_used";
      suite: string;
    })
  | (EveEngineeringEvidenceBase & {
      type: "dependency_security_alert";
      advisoryId: string;
      affectedScope: string;
      alertSource: "code_scanning" | "dependabot";
      advisorySeverity: EveEngineeringFindingSeverity;
    })
  | (EveEngineeringEvidenceBase & {
      type: "protected_area_pull_request";
      matchedRules: string[];
      pullRequestNumber: number;
      reviewState: string;
    })
  | (EveEngineeringEvidenceBase & {
      type: "budget_rate_limit";
      remaining: number;
      resetAt: string;
      scope: string;
      status: "near_limit" | "exhausted";
      total: number;
    });

export interface EveEngineeringFinding {
  id: string;
  tenantId: string;
  monitorId: string;
  runId: string;
  signalType: EveEngineeringMonitorType;
  targetId: string;
  targetRevision: string;
  firstObservedAt: string;
  lastObservedAt: string;
  severity: EveEngineeringFindingSeverity;
  status: EveEngineeringFindingStatus;
  dedupeKey: string;
  policyVersion: number;
  safeEvidence: Record<string, unknown>;
  decisionSummary: string;
  observationCount: number;
}

export interface EveEngineeringMonitorGateResult {
  allowed: boolean;
  reason:
    | "allowed"
    | "disabled"
    | "paused"
    | "repository_scope_mismatch"
    | "policy_version_mismatch"
    | "governance_blocked";
}

export interface EveEngineeringMonitorAdminView {
  configs: EveEngineeringMonitorConfig[];
  findings: EveEngineeringFinding[];
  recentRuns: Array<{
    id: string;
    monitorId: string;
    status: "blocked" | "failed" | "running" | "succeeded" | "suppressed";
    reason?: string;
    findingCount: number;
    startedAt: string;
    completedAt?: string;
  }>;
}
