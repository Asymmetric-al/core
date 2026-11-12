import { describe, expect, it } from "vitest";

import { taskDueState } from "../../../../packages/missionary/components/task-kanban-board";

const TODAY = new Date(2026, 10, 11, 9);

describe("taskDueState", () => {
  it("says a past due date is overdue, today is today, and later is a date", () => {
    expect(taskDueState("2026-11-07", "not_started", TODAY)).toEqual({
      label: "Overdue · Nov 7",
      overdue: true,
    });
    expect(taskDueState("2026-11-11", "in_progress", TODAY)).toEqual({
      label: "Due today",
      overdue: false,
    });
    expect(taskDueState("2026-11-20", "not_started", TODAY)).toEqual({
      label: "Due Nov 20",
      overdue: false,
    });
  });

  it("never calls a finished task overdue", () => {
    expect(taskDueState("2026-11-01", "completed", TODAY)).toEqual({
      label: "Due Nov 1",
      overdue: false,
    });
  });
});
