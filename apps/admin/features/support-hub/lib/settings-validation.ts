import type {
  SupportAutomationAction,
  SupportAutomationCondition,
} from "../types";

// Client-side completeness checks for inbox rule rows. They mirror the save
// schema (packages/api/src/admin/support-hub/schemas.ts) so staff see which
// row needs input instead of a generic "Invalid request payload." from the
// server.

const HOURS_ISSUE = "Enter a whole number of hours.";

function isWholeHours(hours: number): boolean {
  return Number.isInteger(hours) && hours > 0;
}

/** What a rule condition still needs before saving, or null. */
export function automationConditionIssue(
  condition: SupportAutomationCondition,
): string | null {
  switch (condition.kind) {
    case "inbox_is":
      return condition.inboxId ? null : "Pick an inbox.";
    case "label_includes":
      return condition.labelId ? null : "Pick a label.";
    case "from_domain_equals":
      return condition.domain.trim()
        ? null
        : "Enter a domain, such as example.org.";
    case "subject_contains":
    case "body_contains":
      return condition.value.trim() ? null : "Enter a word or phrase.";
    case "assignee_is_present":
    case "is_overdue":
    case "is_escalated":
      return null;
    default: {
      const _exhaustive: never = condition;
      void _exhaustive;
      return null;
    }
  }
}

/** What a rule action still needs before saving, or null. */
export function automationActionIssue(
  action: SupportAutomationAction,
): string | null {
  switch (action.kind) {
    case "assign_agent":
      return action.agentId ? null : "Pick an agent.";
    case "assign_team":
      return action.teamId ? null : "Pick a team.";
    case "add_label":
      return action.labelId ? null : "Pick a label.";
    case "run_macro":
      return action.macroId ? null : "Pick a macro.";
    case "snooze":
      return isWholeHours(action.hours) ? null : HOURS_ISSUE;
    case "set_priority":
    case "set_status":
    case "mark_escalated":
      return null;
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return null;
    }
  }
}

/** One-based numbers of the rows that still have a problem. */
export function incompleteRowNumbers(
  issues: readonly (string | null)[],
): number[] {
  return issues.flatMap((issue, index) => (issue ? [index + 1] : []));
}

function joinWithAnd(items: readonly string[]): string {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1) ?? ""}`;
}

interface IncompleteRowGroup {
  /** Singular row name, such as "action". */
  noun: string;
  numbers: readonly number[];
}

/**
 * Plain summary of the rows still to finish, such as "Finish condition 2 and
 * actions 1 and 3 before saving.", or null when every row is complete.
 */
export function describeIncompleteRows(
  groups: readonly IncompleteRowGroup[],
): string | null {
  const parts = groups
    .filter((group) => group.numbers.length > 0)
    .map((group) => {
      const noun = group.numbers.length === 1 ? group.noun : `${group.noun}s`;
      return `${noun} ${joinWithAnd(group.numbers.map(String))}`;
    });
  return parts.length > 0
    ? `Finish ${joinWithAnd(parts)} before saving.`
    : null;
}
