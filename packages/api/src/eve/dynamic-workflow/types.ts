import type { EveSpecialistId, EveWorkflowType } from "../subagent-catalog";

export const EVE_DYNAMIC_WORKFLOW_OPERATIONS = ["delegate_specialist"] as const;
export type EveDynamicWorkflowOperation =
  (typeof EVE_DYNAMIC_WORKFLOW_OPERATIONS)[number];

export const EVE_DYNAMIC_WORKFLOW_RISKS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;
export type EveDynamicWorkflowRisk =
  (typeof EVE_DYNAMIC_WORKFLOW_RISKS)[number];

export const EVE_DYNAMIC_WORKFLOW_FAILURE_SIGNALS = [
  "step_error",
  "dependency_invalidated",
  "protected_area",
  "suspicious_tool",
  "scope_violation",
  "secret_exposure",
  "identity_violation",
  "tenant_violation",
  "policy_bypass",
  "budget_exhausted",
  "governance_changed",
  "systemic_failure",
] as const;
export type EveDynamicWorkflowFailureSignal =
  (typeof EVE_DYNAMIC_WORKFLOW_FAILURE_SIGNALS)[number];

export interface EveDynamicWorkflowStep {
  declaredRisk: Exclude<EveDynamicWorkflowRisk, "critical">;
  dependsOn: string[];
  failurePolicy: "pause_workflow" | "retry_then_stop_branch";
  id: string;
  maxAttempts: number;
  operation: EveDynamicWorkflowOperation;
  output: {
    artifactType: "finding_set" | "plan" | "review" | "status";
    requiredFields: string[];
  };
  specialistId: EveSpecialistId;
  targetPaths: string[];
  task: string;
}

export interface EveDynamicWorkflowPlan {
  budget: {
    maxRetries: number;
    maxSubagentCalls: number;
  };
  goal: string;
  policySnapshot: {
    governanceStateVersion: number;
    policyId: string;
  };
  rootSessionId: string;
  schemaVersion: 1;
  scope: {
    repository: "Asymmetric-al/core";
    targetPaths: string[];
  };
  steps: EveDynamicWorkflowStep[];
  workflowId: string;
  workflowType: EveWorkflowType;
}

export interface EveValidatedDynamicWorkflowPlan {
  digest: string;
  plan: EveDynamicWorkflowPlan;
  protectedPaths: string[];
  requiresApproval: boolean;
  topologicalOrder: string[];
}

export type EveDynamicWorkflowStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "stopped";

export interface EveDynamicWorkflowStepState {
  attempts: number;
  callIds: string[];
  lastFailure?: EveDynamicWorkflowFailureAssessment;
  status: EveDynamicWorkflowStepStatus;
}

export interface EveDynamicWorkflowRuntimeState {
  dispatchedSubagents: number;
  expiresAt?: string;
  pause?: EveDynamicWorkflowFailureAssessment;
  plan?: EveDynamicWorkflowPlan;
  planDigest?: string;
  preparedGovernanceStateVersion?: number;
  status:
    | "idle"
    | "prepared"
    | "running"
    | "paused"
    | "completed"
    | "cancelled";
  steps: Record<string, EveDynamicWorkflowStepState>;
  ticketId?: string;
}

export interface EveDynamicWorkflowFailureAssessment {
  action: "retry_step" | "stop_branch" | "pause_workflow" | "pause_run";
  requestKillSwitchReview: boolean;
  risk: EveDynamicWorkflowRisk;
  signals: EveDynamicWorkflowFailureSignal[];
}

export type EveDynamicWorkflowValidationCode =
  | "budget_cap_exceeded"
  | "cyclic_graph"
  | "duplicate_step"
  | "invalid_plan"
  | "invalid_root_session"
  | "invalid_specialist"
  | "invalid_target_path"
  | "missing_dependency"
  | "unsupported_repository";

export class EveDynamicWorkflowValidationError extends Error {
  constructor(
    public readonly code: EveDynamicWorkflowValidationCode,
    message: string,
  ) {
    super(message);
    this.name = "EveDynamicWorkflowValidationError";
  }
}
