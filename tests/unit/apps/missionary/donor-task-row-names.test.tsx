/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { ReactNode } from "react";

const tasks = vi.hoisted(() => ({
  completeTask: vi.fn(),
  reopenTask: vi.fn(),
}));
vi.mock("@asym/lib/hooks", () => ({
  useTasks: () => ({
    filteredTasks: [
      {
        id: "task-anna",
        title: "Call Anna",
        status: "not_started",
        task_type: "call",
      },
      {
        id: "task-ben",
        title: "Email Ben",
        status: "in_progress",
        task_type: "email",
      },
      {
        id: "task-cara",
        title: "Thank Cara",
        status: "completed",
        task_type: "thank_you",
        completed_at: "2026-10-03T00:00:00.000Z",
      },
    ],
    loading: false,
    completeTask: tasks.completeTask,
    reopenTask: tasks.reopenTask,
    deleteTask: vi.fn(),
    refresh: vi.fn(),
  }),
}));
// Editing is a separate service-backed flow; retain its actual trigger.
vi.mock("@asym/missionary/components/task-dialog", () => ({
  TaskDialog: ({ trigger }: { trigger: ReactNode }) => trigger,
}));

const { DonorTasks } =
  await import("../../../../apps/missionary/app/donors/donor-tasks");

beforeEach(() => {
  tasks.completeTask.mockReset();
  tasks.reopenTask.mockReset();
});
afterEach(cleanup);

it("names each active task's actions menu for its own task", async () => {
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);

  const anna = screen.getByRole("button", { name: "Actions for Call Anna" });
  const ben = screen.getByRole("button", { name: "Actions for Email Ben" });
  expect(anna).not.toBe(ben);
  expect(screen.queryByRole("button", { name: "Open actions" })).toBeNull();

  fireEvent.click(ben);
  fireEvent.click(await screen.findByRole("menuitem", { name: "Complete" }));
  expect(tasks.completeTask).toHaveBeenCalledExactlyOnceWith("task-ben");
});

// A real checkbox: the name stays put and the checked state says whether the
// task is complete, so unchecking a finished task is what reopens it.
it("names the completion checkbox the same way for active and completed tasks", () => {
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);

  const active = screen.getByRole("checkbox", {
    name: "Mark Call Anna complete",
    checked: false,
  });
  const completed = screen.getByRole("checkbox", {
    name: "Mark Thank Cara complete",
    checked: true,
  });
  expect(screen.queryByRole("checkbox", { name: /^Complete / })).toBeNull();

  fireEvent.click(completed);
  expect(tasks.reopenTask).toHaveBeenCalledExactlyOnceWith("task-cara");
  expect(tasks.completeTask).not.toHaveBeenCalled();

  fireEvent.click(active);
  expect(tasks.completeTask).toHaveBeenCalledExactlyOnceWith("task-anna");
});
