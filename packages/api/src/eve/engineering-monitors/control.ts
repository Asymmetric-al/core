import { evaluateEveGovernance } from "../governance";

import type {
  EveEngineeringMonitorConfig,
  EveEngineeringMonitorGateResult,
} from "./types";
import type { EveGovernanceSnapshot } from "../governance/types";

export function evaluateEveEngineeringMonitorGate(input: {
  config: EveEngineeringMonitorConfig;
  governance: EveGovernanceSnapshot;
}): EveEngineeringMonitorGateResult {
  if (!input.config.enabled) return { allowed: false, reason: "disabled" };
  if (input.config.paused) return { allowed: false, reason: "paused" };
  if (
    input.config.repoOwner !== "Asymmetric-al" ||
    input.config.repoName !== "core"
  ) {
    return { allowed: false, reason: "repository_scope_mismatch" };
  }
  if (input.config.policyVersion !== input.governance.stateVersion) {
    return { allowed: false, reason: "policy_version_mismatch" };
  }
  const governance = evaluateEveGovernance(input.governance, {
    domain: "active_runs",
  });
  return governance.allowed
    ? { allowed: true, reason: "allowed" }
    : { allowed: false, reason: "governance_blocked" };
}
