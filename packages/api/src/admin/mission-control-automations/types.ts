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
  issueType?: string;
}

export interface MissionControlAutomationSummary {
  totalRules: number;
  activeRules: number;
  pausedRules: number;
  draftRules: number;
  executions24h: number;
  failedRuns24h: number;
  activityLogBacked: boolean;
  integrationHealthBacked: boolean;
}

export interface MissionControlAutomationDashboard {
  automationRules: AutomationRule[];
  summary: MissionControlAutomationSummary;
}
