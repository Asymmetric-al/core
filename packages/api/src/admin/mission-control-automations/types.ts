import type {
  AUTOMATION_CONTRIBUTION_ACTION_TYPES,
  AUTOMATION_DONOR_NOTIFICATION_ACTION_TYPES,
} from "./schemas";
import type { MissionControlIssueType } from "../mission-control-tasks/types";

export type AutomationMode = "simple" | "advanced";
export type AutomationRunMode = "automatic" | "review_first";
export type AutomationActivationStatus =
  | "draft"
  | "ready"
  | "active"
  | "paused"
  | "disabled";

export type AutomationTrigger =
  | { kind: "contribution_issue_created" }
  | { kind: "contribution_action_completed" };

export type AutomationCondition =
  | { kind: "issue_type_is"; issueType: MissionControlIssueType }
  | { kind: "always" };

export type AutomationContributionActionType =
  (typeof AUTOMATION_CONTRIBUTION_ACTION_TYPES)[number];
export type AutomationDonorNotificationActionType =
  (typeof AUTOMATION_DONOR_NOTIFICATION_ACTION_TYPES)[number];

export type AutomationAction =
  | { kind: "create_task"; issueType: MissionControlIssueType }
  | {
      kind: "contribution_action";
      actionType: AutomationContributionActionType;
    }
  | {
      kind: "send_donor_notification";
      actionType: AutomationDonorNotificationActionType;
    };

export interface AutomationRule {
  id?: string;
  name: string;
  mode: AutomationMode;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  runMode: AutomationRunMode;
  enabled: boolean;
  activationStatus?: AutomationActivationStatus;
}

export interface AutomationRecord {
  id: string;
  eventKind: AutomationTrigger["kind"];
  issueType?: string;
}

export type PlannedAutomationAction =
  | {
      kind: "contribution_action";
      service: "contribution_operations";
      method: "executeContributionAction";
      input: {
        actionType: AutomationContributionActionType;
        contributionId: string;
      };
    }
  | {
      kind: "send_donor_notification";
      service: "email_studio_notifications";
      method: "sendContributionCorrectionNotification";
      input: {
        actionType: AutomationDonorNotificationActionType;
        contributionId: string;
      };
    }
  | {
      kind: "create_task";
      service: "mission_control_tasks";
      method: "createMissionControlTask";
      input: {
        issueType: MissionControlIssueType;
        contributionId: string;
      };
    };

export interface MissionControlAutomationSummary {
  totalRules: number;
  activeRules: number;
  pausedRules: number;
  readyRules: number;
  draftRules: number;
  invalidRules: number;
  executions24h: number;
  failedRuns24h: number;
  activityLogBacked: boolean;
  integrationHealthBacked: boolean;
}

export interface MissionControlAutomationDashboard {
  automationRules: AutomationRule[];
  summary: MissionControlAutomationSummary;
}
