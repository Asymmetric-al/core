export const EVE_POLICY_STATUSES = [
  "not_configured",
  "ready",
  "blocked",
  "degraded",
] as const;

export type EvePolicyStatus = (typeof EVE_POLICY_STATUSES)[number];

export type EveGovernanceBlockReason =
  | "decision_record_failed"
  | "emergency_off"
  | "governance_unavailable"
  | "kill_switch_active"
  | "policy_not_ready"
  | "release_disabled";

export interface EveGovernanceSnapshot {
  source: "missing" | "persisted";
  releaseEnabled: boolean;
  emergencyOff: boolean;
  killSwitchState: Record<string, boolean>;
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
