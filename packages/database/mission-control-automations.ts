export type MissionControlAutomationActivationStatus =
  | "draft"
  | "ready"
  | "active"
  | "paused"
  | "disabled";

export type MissionControlAutomationDisplayStatus =
  | "Active"
  | "Invalid"
  | "Paused"
  | "Disabled"
  | "Ready"
  | "Draft";

export type MissionControlAutomationSummaryBucket =
  | "activeRules"
  | "invalidRules"
  | "pausedRules"
  | "readyRules"
  | "draftRules";

export interface MissionControlAutomationLifecycleRule {
  enabled: boolean;
  activationStatus?: MissionControlAutomationActivationStatus;
}

export function resolveMissionControlAutomationLifecycle(
  rule: MissionControlAutomationLifecycleRule,
): {
  displayStatus: MissionControlAutomationDisplayStatus;
  summaryBucket: MissionControlAutomationSummaryBucket;
} {
  if (rule.enabled && rule.activationStatus === "active") {
    return { displayStatus: "Active", summaryBucket: "activeRules" };
  }

  if (rule.activationStatus === "active") {
    return { displayStatus: "Invalid", summaryBucket: "invalidRules" };
  }

  if (rule.activationStatus === "paused") {
    return { displayStatus: "Paused", summaryBucket: "pausedRules" };
  }

  if (rule.activationStatus === "disabled") {
    return { displayStatus: "Disabled", summaryBucket: "pausedRules" };
  }

  if (rule.activationStatus === "ready") {
    return { displayStatus: "Ready", summaryBucket: "readyRules" };
  }

  return { displayStatus: "Draft", summaryBucket: "draftRules" };
}
