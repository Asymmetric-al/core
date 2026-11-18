/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { TaskRow } from "../../../../packages/missionary/components/task-row";

import type { Task } from "../../../../packages/missionary/types";

afterEach(cleanup);

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: "task-1",
    missionary_id: "missionary-1",
    title: "Call Anna",
    task_type: "call",
    status: "not_started",
    priority: "none",
    sort_key: 1,
    is_auto_generated: false,
    created_at: "2026-10-03T00:00:00Z",
    updated_at: "2026-10-03T00:00:00Z",
    ...overrides,
  };
}

function renderRows(tasks: Task[], onComplete = vi.fn()) {
  render(
    <>
      {tasks.map((task, index) => (
        <TaskRow
          key={task.id}
          task={task}
          index={index}
          onComplete={() => onComplete(task.id)}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      ))}
    </>,
  );
  return onComplete;
}

it("names each row's actions menu for its own task", async () => {
  renderRows([
    makeTask({}),
    makeTask({ id: "task-2", title: "Email Ben", task_type: "email" }),
  ]);

  const anna = screen.getByRole("button", { name: "Actions for Call Anna" });
  const ben = screen.getByRole("button", { name: "Actions for Email Ben" });
  expect(anna).not.toBe(ben);
  expect(screen.queryByRole("button", { name: "Open actions" })).toBeNull();

  fireEvent.click(ben);
  expect(
    await screen.findByRole("menuitem", { name: "Edit task" }),
  ).toBeTruthy();
});

// A real checkbox: the name stays put and the checked state says whether the
// task is complete, so unchecking a finished task is what reopens it.
it("names the completion checkbox the same way for open and finished tasks", () => {
  const onComplete = renderRows([
    makeTask({}),
    makeTask({ id: "task-2", title: "Thank Cara", status: "completed" }),
  ]);

  const open = screen.getByRole("checkbox", {
    name: "Mark Call Anna complete",
    checked: false,
  });
  const finished = screen.getByRole("checkbox", {
    name: "Mark Thank Cara complete",
    checked: true,
  });

  fireEvent.click(finished);
  fireEvent.click(open);
  expect(onComplete.mock.calls).toEqual([["task-2"], ["task-1"]]);
});
