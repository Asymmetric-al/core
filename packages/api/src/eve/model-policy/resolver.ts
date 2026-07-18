import type {
  EveModelBudget,
  EveModelBudgetOverride,
  EveModelPolicyRecord,
  EveModelResolution,
  EveModelUsageSnapshot,
} from "./types";
import type { EveGovernanceSnapshot } from "../governance/types";

function addBudgetOverride(
  budget: EveModelBudget,
  overrides: EveModelBudgetOverride[],
): EveModelBudget {
  return overrides.reduce(
    (current, override) => ({
      maxInputTokens: current.maxInputTokens + override.additionalInputTokens,
      maxOutputTokens:
        current.maxOutputTokens + override.additionalOutputTokens,
      maxRequestsPerMinute:
        current.maxRequestsPerMinute + override.additionalRequests,
      maxUsdMicros: current.maxUsdMicros + override.additionalUsdMicros,
    }),
    budget,
  );
}

export function resolveEveModelRole(input: {
  governance: EveGovernanceSnapshot;
  now?: Date;
  overrides?: EveModelBudgetOverride[];
  policy: EveModelPolicyRecord;
  requestedRole: string;
  subagentName?: string;
  usage: EveModelUsageSnapshot;
}): EveModelResolution {
  if (
    input.policy.status !== "active" ||
    input.policy.evalStatus !== "passed"
  ) {
    return { allowed: false, reason: "policy_inactive" };
  }

  const subagentOverride = input.subagentName
    ? input.policy.policy.subagentOverrides[input.subagentName]
    : undefined;
  const roleName = subagentOverride?.role ?? input.requestedRole;
  const role = input.policy.policy.roles[roleName];
  if (!role) {
    return { allowed: false, reason: "role_missing" };
  }

  const baseBudget = { ...role.budget, ...subagentOverride?.budget };
  const now = input.now ?? new Date();
  const activeOverrides = (input.overrides ?? []).filter(
    (override) =>
      override.policyId === input.policy.id &&
      new Date(override.expiresAt) > now &&
      ((override.scopeType === "role" && override.scopeId === roleName) ||
        (override.scopeType === "subagent" &&
          override.scopeId === input.subagentName)),
  );
  const budget = addBudgetOverride(baseBudget, activeOverrides);

  if (input.usage.requestsInCurrentMinute >= budget.maxRequestsPerMinute) {
    return { allowed: false, reason: "rate_limit_exhausted" };
  }

  if (
    input.usage.usdMicros >= budget.maxUsdMicros ||
    input.usage.inputTokens >= budget.maxInputTokens ||
    input.usage.outputTokens >= budget.maxOutputTokens
  ) {
    return { allowed: false, reason: "budget_exhausted" };
  }

  const fallbacksRevoked =
    input.governance.emergencyOff ||
    input.governance.killSwitchState.all_automation ||
    input.governance.killSwitchState.model_policy_changes;
  const selectedFallback = subagentOverride?.fallbackProviderId
    ? role.fallbacks.find(
        (fallback) =>
          fallback.enabled &&
          fallback.providerId === subagentOverride.fallbackProviderId,
      )
    : role.fallbacks.find((fallback) => fallback.enabled);

  return {
    allowed: true,
    role: roleName,
    primary: role.primary,
    directFallback: fallbacksRevoked ? undefined : selectedFallback,
    evalGate: subagentOverride?.evalGate ?? role.evalGate,
    reasoning: subagentOverride?.reasoning ?? role.reasoning,
    budget,
  };
}
