import { evaluateEveGovernance } from "../governance";

import type { EvePolicyConsultResult } from "../approval-budget/types";
import type { EveGovernanceSnapshot } from "../governance/types";

export type EveDynamicWorkflowControlDecision =
  | { allowed: true; reason: "workflow_allowed" }
  | {
      allowed: false;
      reason:
        | "approval_required"
        | "budget_blocked"
        | "context_conflict"
        | "governance_blocked"
        | "governance_changed";
    };

export function evaluateEveDynamicWorkflowControl(input: {
  approvalGranted: boolean;
  currentGovernance: EveGovernanceSnapshot | null;
  hasBlockingContextConflict: boolean;
  policy: EvePolicyConsultResult;
  preparedGovernanceStateVersion?: number;
  requiresApproval: boolean;
}): EveDynamicWorkflowControlDecision {
  if (!input.currentGovernance) {
    return { allowed: false, reason: "governance_blocked" };
  }
  const activeRuns = evaluateEveGovernance(input.currentGovernance, {
    domain: "active_runs",
  });
  const dynamicWorkflows = evaluateEveGovernance(input.currentGovernance, {
    domain: "dynamic_workflows",
  });
  if (!activeRuns.allowed || !dynamicWorkflows.allowed) {
    return { allowed: false, reason: "governance_blocked" };
  }
  if (
    input.preparedGovernanceStateVersion !== undefined &&
    input.preparedGovernanceStateVersion !==
      input.currentGovernance.stateVersion
  ) {
    return { allowed: false, reason: "governance_changed" };
  }
  if (input.hasBlockingContextConflict) {
    return { allowed: false, reason: "context_conflict" };
  }
  if (input.requiresApproval && !input.approvalGranted) {
    return { allowed: false, reason: "approval_required" };
  }
  if (input.policy.decision !== "allow") {
    return { allowed: false, reason: "budget_blocked" };
  }
  return { allowed: true, reason: "workflow_allowed" };
}
