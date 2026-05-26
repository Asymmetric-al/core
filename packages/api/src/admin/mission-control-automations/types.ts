import type { ContributionActionType } from "../contribution-operations/types";
import type { MissionControlIssueType } from "../mission-control-tasks/types";

export type AutomationMode = "simple" | "advanced";
export type AutomationRunMode = "automatic" | "review_first";

export type AutomationTrigger =
  | { kind: "contribution_issue_created" }
  | { kind: "contribution_action_completed" };

export type AutomationCondition =
  | { kind: "issue_type_is"; issueType: MissionControlIssueType }
  | { kind: "always" };

export type AutomationAction =
  | { kind: "create_task"; issueType: MissionControlIssueType }
  | { kind: "contribution_action"; actionType: ContributionActionType }
  | { kind: "send_donor_notification"; actionType: ContributionActionType };

export interface AutomationRule {
  id?: string;
  name: string;
  mode: AutomationMode;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  runMode: AutomationRunMode;
  enabled: boolean;
}

export interface AutomationRecord {
  id: string;
  issueType?: string;
}
