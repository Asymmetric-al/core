import type { ContributionActionType } from "../contribution-operations/types";
import type { MissionControlIssueType } from "../mission-control-tasks/types";

export function planContributionAutomationAction(input: {
  actionType: ContributionActionType;
  contributionId: string;
}) {
  return {
    service: "contribution_operations" as const,
    method: "executeContributionAction" as const,
    input,
  };
}

export function planDonorNotificationAutomationAction(input: {
  actionType: ContributionActionType;
  contributionId: string;
}) {
  return {
    service: "email_studio_notifications" as const,
    method: "sendContributionCorrectionNotification" as const,
    input,
  };
}

export function planTaskAutomationAction(input: {
  issueType: MissionControlIssueType;
  contributionId: string;
}) {
  return {
    service: "mission_control_tasks" as const,
    method: "createMissionControlTask" as const,
    input,
  };
}
