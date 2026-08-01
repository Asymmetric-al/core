import type {
  EveActionCatalogEntry,
  EveApprovalMode,
  EveBudgetRecord,
  EvePolicyConsultResult,
} from "./types";
import type { EveGovernanceSnapshot } from "../governance/types";

function governanceAllows(
  snapshot: EveGovernanceSnapshot,
  action: EveActionCatalogEntry | null,
): boolean {
  const domain = action?.domain ?? "production_writes";
  return (
    snapshot.releaseEnabled &&
    !snapshot.emergencyOff &&
    snapshot.policyStatus === "ready" &&
    !snapshot.killSwitchState.all_automation &&
    !snapshot.killSwitchState[domain]
  );
}

export function evaluateEveApprovalBudgetPolicy(input: {
  action: EveActionCatalogEntry | null;
  approvalLevel?: "strict" | "zone";
  budget: EveBudgetRecord | null;
  governance: EveGovernanceSnapshot;
  operationalMode?: EveApprovalMode;
}): EvePolicyConsultResult {
  const fallback = {
    actionId: "unknown",
    trustZone: "product_admin",
    writeClass: "business_data",
  } as const;
  const action = input.action ?? fallback;
  const identity = {
    actionId: action.actionId,
    trustZone: action.trustZone,
    writeClass: action.writeClass,
  };
  if (!governanceAllows(input.governance, input.action))
    return { ...identity, decision: "deny", reason: "governance_blocked" };
  if (!input.action)
    return { ...identity, decision: "deny", reason: "unknown_action" };

  const strictApproval = input.approvalLevel === "strict";
  const anyApproval = strictApproval || input.approvalLevel === "zone";
  if (input.action.writeClass === "business_data" && !strictApproval) {
    return { ...identity, decision: "deny", reason: "approval_required" };
  }
  if (input.action.writeClass === "operational") {
    if (input.operationalMode === "deny" || !input.operationalMode)
      return { ...identity, decision: "deny", reason: "policy_denied" };
    if (
      (input.operationalMode === "require_approval" ||
        input.governance.killSwitchState.force_approval) &&
      !anyApproval
    ) {
      return { ...identity, decision: "deny", reason: "approval_required" };
    }
  }
  if (!input.budget)
    return { ...identity, decision: "pause", reason: "budget_exhausted" };
  const costs = input.action;
  const budget = input.budget;
  const exceeded =
    budget.usedRequests + costs.requestCost >
      budget.maxRequests + budget.additionalRequests ||
    budget.usedUsdMicros + costs.usdMicrosCost >
      budget.maxUsdMicros + budget.additionalUsdMicros ||
    budget.usedInputTokens + costs.inputTokenCost >
      budget.maxInputTokens + budget.additionalInputTokens ||
    budget.usedOutputTokens + costs.outputTokenCost >
      budget.maxOutputTokens + budget.additionalOutputTokens;
  return exceeded
    ? { ...identity, decision: "pause", reason: "budget_exhausted" }
    : { ...identity, decision: "allow", reason: "operational_policy_allowed" };
}
