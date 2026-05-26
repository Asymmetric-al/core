import type { AutomationRecord, AutomationRule } from "./types";

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
      if (action.kind === "send_donor_notification") {
        return {
          kind: action.kind,
          via: "email_studio" as const,
          actionType: action.actionType,
        };
      }

      return action;
    }),
  };
}
