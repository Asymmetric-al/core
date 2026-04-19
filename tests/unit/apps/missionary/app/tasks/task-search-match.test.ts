import { describe, expect, it } from "vitest";

import { taskMatchesClientSearch } from "../../../../../../apps/missionary/app/tasks/task-search-match";

import type { Task } from "@asym/lib/hooks/use-tasks";

const baseTask: Task = {
  id: "t1",
  missionary_id: "m1",
  title: "Call donor",
  description: null,
  notes: null,
  task_type: "call",
  status: "not_started",
  priority: "medium",
  due_date: null,
  reminder_date: null,
  donor_id: null,
  donor: null,
  sort_key: 1,
  is_auto_generated: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  completed_at: null,
};

describe("taskMatchesClientSearch", () => {
  it("does not throw when donor is null and search is non-empty", () => {
    expect(() => taskMatchesClientSearch(baseTask, "anything")).not.toThrow();
    expect(taskMatchesClientSearch(baseTask, "call")).toBe(true);
    expect(taskMatchesClientSearch(baseTask, "missing")).toBe(false);
  });

  it("matches donor name when donor is present", () => {
    const task: Task = {
      ...baseTask,
      donor: {
        id: "d1",
        name: "Jordan Lee",
        email: "j@example.com",
        avatar_url: null,
      },
    };
    expect(taskMatchesClientSearch(task, "jordan")).toBe(true);
  });

  it("does not throw when description is null/undefined and search is non-empty", () => {
    const noDesc: Task = { ...baseTask, title: "x", description: null };
    expect(() => taskMatchesClientSearch(noDesc, "hello")).not.toThrow();
    expect(taskMatchesClientSearch(noDesc, "hello")).toBe(false);

    const undefDesc: Task = { ...baseTask, title: "x", description: undefined };
    expect(() => taskMatchesClientSearch(undefDesc, "hello")).not.toThrow();
  });

  it("matches description text when present", () => {
    const task: Task = {
      ...baseTask,
      description: "Follow up about quarterly report",
    };
    expect(taskMatchesClientSearch(task, "quarterly")).toBe(true);
  });

  it("treats donor with missing name as empty string for search", () => {
    const task: Task = {
      ...baseTask,
      title: "Task only",
      donor: { id: "d1", name: "" },
    };
    expect(() => taskMatchesClientSearch(task, "findme")).not.toThrow();
    expect(taskMatchesClientSearch(task, "task")).toBe(true);
  });
});
