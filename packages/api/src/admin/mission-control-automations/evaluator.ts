import {
  planContributionAutomationAction,
  planDonorNotificationAutomationAction,
  planTaskAutomationAction,
} from "./adapters";

import type { AutomationRecord, AutomationRule } from "./types";

function triggerMatches(
  rule: AutomationRule,
  record: AutomationRecord,
): boolean {
  return record.eventKind === rule.trigger.kind;
}

function conditionMatches(
  condition: AutomationRule["conditions"][number],
  record: AutomationRecord,
): boolean {
  if (condition.kind === "always") {
    return true;
  }

  return record.issueType === condition.issueType;
}

export function evaluateAutomationRule(input: {
  rule: AutomationRule;
  record: AutomationRecord;
}) {
  const matches =
    input.rule.enabled !== false &&
    triggerMatches(input.rule, input.record) &&
    input.rule.conditions.every((condition) =>
      conditionMatches(condition, input.record),
    );

  if (!matches) {
    return {
      matches: false,
      plannedActions: [],
    };
  }

  return {
    matches: true,
    plannedActions: input.rule.actions.map((action) => {
      if (action.kind === "contribution_action") {
        return planContributionAutomationAction({
          actionType: action.actionType,
          contributionId: input.record.id,
        });
      }

      if (action.kind === "send_donor_notification") {
        return planDonorNotificationAutomationAction({
          actionType: action.actionType,
          contributionId: input.record.id,
        });
      }

      return planTaskAutomationAction({
        issueType: action.issueType,
        contributionId: input.record.id,
      });
    }),
  };
}
