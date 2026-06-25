import type {
  AutomationContributionActionType,
  AutomationDonorNotificationActionType,
  PlannedAutomationAction,
} from "./types";
import type { MissionControlIssueType } from "../mission-control-tasks/types";

export function planContributionAutomationAction(input: {
  actionType: AutomationContributionActionType;
  contributionId: string;
}): Extract<PlannedAutomationAction, { kind: "contribution_action" }> {
  return {
    kind: "contribution_action",
    service: "contribution_operations" as const,
    method: "executeContributionAction" as const,
    input,
  };
}

export function planDonorNotificationAutomationAction(input: {
  actionType: AutomationDonorNotificationActionType;
  contributionId: string;
}): Extract<PlannedAutomationAction, { kind: "send_donor_notification" }> {
  return {
    kind: "send_donor_notification",
    service: "email_studio_notifications" as const,
    method: "sendContributionCorrectionNotification" as const,
    input,
  };
}

export function planTaskAutomationAction(input: {
  issueType: MissionControlIssueType;
  contributionId: string;
}): Extract<PlannedAutomationAction, { kind: "create_task" }> {
  return {
    kind: "create_task",
    service: "mission_control_tasks" as const,
    method: "createMissionControlTask" as const,
    input,
  };
}
