import type { EveNotificationChannelConfig } from "./types";
import type { EveEngineeringFindingSeverity } from "../engineering-monitors/types";
import type { EveGovernanceSnapshot } from "../governance/types";

const severityRank: Record<EveEngineeringFindingSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export function evaluateEveNotificationGate(input: {
  config: EveNotificationChannelConfig;
  governance: EveGovernanceSnapshot;
  severity: EveEngineeringFindingSeverity;
  now: string;
  sourcePolicyVersion: number;
  expiresAt: string;
}): { allowed: boolean; reason: string } {
  if (!input.config.enabled)
    return { allowed: false, reason: "channel_disabled" };
  if (input.config.paused) return { allowed: false, reason: "channel_paused" };
  if (!input.governance.releaseEnabled || input.governance.emergencyOff) {
    return { allowed: false, reason: "release_blocked" };
  }
  if (
    input.governance.source !== "persisted" ||
    input.governance.policyStatus !== "ready" ||
    input.governance.killSwitchState.all_automation ||
    input.governance.killSwitchState.active_runs
  ) {
    return { allowed: false, reason: "governance_blocked" };
  }
  if (
    input.config.policyVersion !== input.governance.stateVersion ||
    input.sourcePolicyVersion !== input.governance.stateVersion
  ) {
    return { allowed: false, reason: "policy_version_mismatch" };
  }
  if (Date.parse(input.expiresAt) <= Date.parse(input.now)) {
    return { allowed: false, reason: "notification_expired" };
  }
  if (
    severityRank[input.severity] < severityRank[input.config.minimumSeverity]
  ) {
    return { allowed: false, reason: "below_severity_threshold" };
  }
  return { allowed: true, reason: "allowed" };
}
