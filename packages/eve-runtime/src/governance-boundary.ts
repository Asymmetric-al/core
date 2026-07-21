import { evaluateEveGovernance } from "@asym/api/eve/governance";

import type { EvePolicyConsultResult } from "@asym/api/eve/approval-budget/types";
import type {
  EveAutonomousDomain,
  EveGovernanceSnapshot,
} from "@asym/api/eve/governance/types";
import type { EveModelResolution } from "@asym/api/eve/model-policy/types";

export type EveRuntimeActivationPlan =
  | {
      enabled: false;
      reason:
        | "approval_budget_blocked"
        | "governance_blocked"
        | "invalid_model_policy"
        | "model_policy_blocked"
        | "release_disabled";
    }
  | {
      enabled: true;
      limits: {
        maxInputTokensPerSession: number;
        maxOutputTokensPerSession: number;
        maxRequestsPerMinute: number;
        maxUsdMicros: number;
      };
      model: string;
      reasoning: "low" | "medium" | "high";
      role: string;
      route: "vercel_ai_gateway";
    };

function governanceAllowsRuntime(
  governance: EveGovernanceSnapshot,
  domain: EveAutonomousDomain,
): boolean {
  if (governance.source !== "persisted") {
    return false;
  }

  return evaluateEveGovernance(governance, { domain }).allowed;
}

/**
 * Converts app-owned governance decisions into the narrow configuration that a
 * future Eve host may consume. This function never reads prompts, memory, or
 * provider output as governance and performs no model or provider call.
 *
 * Direct-provider fallbacks are deliberately excluded from the foundation.
 * Their provider clients and live fallback actuation require later, separately
 * accepted runtime work.
 */
export function prepareEveRuntimeActivation(input: {
  approvalBudget: EvePolicyConsultResult;
  domain: EveAutonomousDomain;
  governance: EveGovernanceSnapshot;
  modelResolution: EveModelResolution;
}): EveRuntimeActivationPlan {
  if (!input.governance.releaseEnabled) {
    return { enabled: false, reason: "release_disabled" };
  }

  if (!governanceAllowsRuntime(input.governance, input.domain)) {
    return { enabled: false, reason: "governance_blocked" };
  }

  if (!input.modelResolution.allowed) {
    return { enabled: false, reason: "model_policy_blocked" };
  }

  if (input.approvalBudget.decision !== "allow") {
    return { enabled: false, reason: "approval_budget_blocked" };
  }

  const { budget, primary, reasoning, role } = input.modelResolution;
  const validModel = primary.modelId.trim().length > 0;
  const validBudget =
    budget.maxInputTokens > 0 &&
    budget.maxOutputTokens > 0 &&
    budget.maxRequestsPerMinute > 0 &&
    budget.maxUsdMicros > 0;

  if (primary.route !== "vercel_ai_gateway" || !validModel || !validBudget) {
    return { enabled: false, reason: "invalid_model_policy" };
  }

  return {
    enabled: true,
    limits: {
      maxInputTokensPerSession: budget.maxInputTokens,
      maxOutputTokensPerSession: budget.maxOutputTokens,
      maxRequestsPerMinute: budget.maxRequestsPerMinute,
      maxUsdMicros: budget.maxUsdMicros,
    },
    model: primary.modelId,
    reasoning,
    role,
    route: primary.route,
  };
}
