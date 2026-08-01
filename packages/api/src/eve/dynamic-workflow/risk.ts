import type {
  EveDynamicWorkflowFailureAssessment,
  EveDynamicWorkflowFailureSignal,
  EveDynamicWorkflowRisk,
} from "./types";

const SIGNAL_RISK: Record<
  EveDynamicWorkflowFailureSignal,
  EveDynamicWorkflowRisk
> = {
  step_error: "low",
  dependency_invalidated: "medium",
  protected_area: "high",
  suspicious_tool: "high",
  scope_violation: "high",
  secret_exposure: "critical",
  identity_violation: "critical",
  tenant_violation: "critical",
  policy_bypass: "critical",
  budget_exhausted: "medium",
  governance_changed: "high",
  systemic_failure: "critical",
};

const RISK_ORDER: Record<EveDynamicWorkflowRisk, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export function classifyEveDynamicWorkflowFailure(input: {
  attempts: number;
  failurePolicy: "pause_workflow" | "retry_then_stop_branch";
  maxAttempts: number;
  signals: EveDynamicWorkflowFailureSignal[];
}): EveDynamicWorkflowFailureAssessment {
  const signals = [...new Set(input.signals)];
  const risk = signals.reduce<EveDynamicWorkflowRisk>((highest, signal) => {
    const candidate = SIGNAL_RISK[signal];
    return RISK_ORDER[candidate] > RISK_ORDER[highest] ? candidate : highest;
  }, "low");

  if (risk === "critical") {
    return {
      risk,
      signals,
      action: "pause_run",
      requestKillSwitchReview: true,
    };
  }
  if (risk === "high") {
    return {
      risk,
      signals,
      action: "pause_run",
      requestKillSwitchReview: false,
    };
  }
  if (risk === "medium" || input.failurePolicy === "pause_workflow") {
    return {
      risk,
      signals,
      action: "pause_workflow",
      requestKillSwitchReview: false,
    };
  }
  return {
    risk,
    signals,
    action: input.attempts < input.maxAttempts ? "retry_step" : "stop_branch",
    requestKillSwitchReview: false,
  };
}
