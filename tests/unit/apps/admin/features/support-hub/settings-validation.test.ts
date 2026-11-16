import { describe, expect, it } from "vitest";

import {
  automationActionIssue,
  automationConditionIssue,
  describeIncompleteRows,
  incompleteRowNumbers,
} from "../../../../../../apps/admin/features/support-hub/lib/settings-validation";
import {
  automationActionSchema,
  automationConditionSchema,
} from "../../../../../../packages/api/src/admin/support-hub/schemas";

import type {
  SupportAutomationAction,
  SupportAutomationCondition,
} from "../../../../../../apps/admin/features/support-hub/types";

describe("inbox rule validation", () => {
  it("flags empty rule conditions and actions but not yes/no conditions", () => {
    expect(
      automationConditionIssue({ kind: "subject_contains", value: "" }),
    ).toBe("Enter a word or phrase.");
    expect(automationConditionIssue({ kind: "inbox_is", inboxId: "" })).toBe(
      "Pick an inbox.",
    );
    expect(
      automationConditionIssue({ kind: "is_overdue", value: false }),
    ).toBeNull();
    expect(automationActionIssue({ kind: "run_macro", macroId: "" })).toBe(
      "Pick a macro.",
    );
    expect(automationActionIssue({ kind: "snooze", hours: 1.5 })).toBe(
      "Enter a whole number of hours.",
    );
    expect(automationActionIssue({ kind: "mark_escalated" })).toBeNull();
  });

  it("summarizes the rows to finish in plain words", () => {
    expect(
      incompleteRowNumbers([null, "Pick an agent.", null, "Pick a label."]),
    ).toEqual([2, 4]);
    expect(describeIncompleteRows([{ noun: "action", numbers: [2] }])).toBe(
      "Finish action 2 before saving.",
    );
    expect(
      describeIncompleteRows([
        { noun: "condition", numbers: [1] },
        { noun: "action", numbers: [1, 3, 4] },
      ]),
    ).toBe("Finish condition 1 and actions 1, 3 and 4 before saving.");
    expect(
      describeIncompleteRows([{ noun: "action", numbers: [] }]),
    ).toBeNull();
  });

  // Every row the client lets through must be one the server accepts, and
  // every row it flags must be one the server would reject.
  const conditions: SupportAutomationCondition[] = [
    { kind: "inbox_is", inboxId: "" },
    { kind: "inbox_is", inboxId: "inbox-1" },
    { kind: "label_includes", labelId: "" },
    { kind: "label_includes", labelId: "label-1" },
    { kind: "from_domain_equals", domain: "" },
    { kind: "from_domain_equals", domain: "example.org" },
    { kind: "assignee_is_present", value: false },
    { kind: "is_overdue", value: true },
    { kind: "is_escalated", value: false },
    { kind: "subject_contains", value: "" },
    { kind: "subject_contains", value: "receipt" },
    { kind: "body_contains", value: "" },
    { kind: "body_contains", value: "refund" },
  ];
  const actions: SupportAutomationAction[] = [
    { kind: "assign_agent", agentId: "" },
    { kind: "assign_agent", agentId: "agent-1" },
    { kind: "assign_team", teamId: "" },
    { kind: "assign_team", teamId: "team-1" },
    { kind: "add_label", labelId: "" },
    { kind: "add_label", labelId: "label-1" },
    { kind: "set_priority", priority: "high" },
    { kind: "set_status", status: "pending" },
    { kind: "snooze", hours: 0 },
    { kind: "snooze", hours: 2.5 },
    { kind: "snooze", hours: 24 },
    { kind: "mark_escalated" },
    { kind: "run_macro", macroId: "" },
    { kind: "run_macro", macroId: "macro-1" },
  ];

  it.each(conditions)(
    "agrees with the server about condition %o",
    (condition) => {
      expect(automationConditionIssue(condition) === null).toBe(
        automationConditionSchema.safeParse(condition).success,
      );
    },
  );

  it.each(actions)("agrees with the server about action %o", (action) => {
    expect(automationActionIssue(action) === null).toBe(
      automationActionSchema.safeParse(action).success,
    );
  });
});
