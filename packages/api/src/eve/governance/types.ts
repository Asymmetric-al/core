export const EVE_POLICY_STATUSES = [
  "not_configured",
  "ready",
  "blocked",
  "degraded",
] as const;

export type EvePolicyStatus = (typeof EVE_POLICY_STATUSES)[number];

export const EVE_KILL_SWITCH_KEYS = [
  "all_automation",
  "active_runs",
  "github_actions",
  "production_writes",
  "sandbox_networking",
  "dynamic_workflows",
  "model_policy_changes",
  "force_approval",
] as const;

export type EveKillSwitchKey = (typeof EVE_KILL_SWITCH_KEYS)[number];

export const EVE_AUTONOMOUS_DOMAINS = [
  "active_runs",
  "github_actions",
  "production_writes",
  "sandbox_networking",
  "dynamic_workflows",
  "model_policy_changes",
] as const;

export type EveAutonomousDomain = (typeof EVE_AUTONOMOUS_DOMAINS)[number];
export type EveKillSwitchState = Record<EveKillSwitchKey, boolean>;

export function createClearedEveKillSwitchState(): EveKillSwitchState {
  return {
    all_automation: false,
    active_runs: false,
    github_actions: false,
    production_writes: false,
    sandbox_networking: false,
    dynamic_workflows: false,
    model_policy_changes: false,
    force_approval: false,
  };
}

export type EveGovernanceBlockReason =
  | "decision_record_failed"
  | "approval_required"
  | "emergency_off"
  | "governance_unavailable"
  | "kill_switch_active"
  | "policy_not_ready"
  | "release_disabled";

export interface EveGovernanceSnapshot {
  source: "missing" | "persisted";
  releaseEnabled: boolean;
  emergencyOff: boolean;
  killSwitchState: EveKillSwitchState;
  policyStatus: EvePolicyStatus;
  policySummary?: string;
  stateVersion: number;
  updatedAt: string;
}

export interface EveGovernanceDecisionRecord {
  id: string;
  action: string;
  target?: string;
  decision: "allowed" | "blocked";
  reason: EveGovernanceBlockReason | "governance_allowed";
  status: "completed" | "failed" | "skipped" | "started" | "stopped";
  stateVersion?: number;
  initiatedByProfileId?: string;
  accountableTrigger?: string;
  summary?: Record<string, unknown>;
}

export interface EveGovernanceStore {
  loadSnapshot(): Promise<EveGovernanceSnapshot | null>;
  recordDecision(record: EveGovernanceDecisionRecord): Promise<void>;
}

export interface EveRunSummary {
  id: string;
  action: string;
  target?: string;
  decision: "allowed" | "blocked";
  reason: string;
  status: "completed" | "failed" | "skipped" | "started" | "stopped";
  updatedAt: string;
}

export interface EveGovernanceAdminView {
  system: EveGovernanceSnapshot;
  recentRuns: EveRunSummary[];
}

export interface EveKillSwitchMutationResult {
  auditId: string;
  changed: boolean;
  enabled: boolean;
  killSwitchState: EveKillSwitchState;
  stateVersion: number;
  switchKey: EveKillSwitchKey;
  updatedAt: string;
}
