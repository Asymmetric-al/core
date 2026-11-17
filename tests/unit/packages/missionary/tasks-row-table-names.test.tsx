/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { TaskRow } from "../../../../packages/missionary/components/tasks/task-row";
import { TaskTable } from "../../../../packages/missionary/components/tasks/task-table";

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

const anna = makeTask({});
const ben = makeTask({
  id: "task-2",
  title: "Email Ben",
  task_type: "email",
  status: "completed",
});

it("names each task card's actions menu for its own task", async () => {
  render(
    <>
      {[anna, ben].map((task, index) => (
        <TaskRow
          key={task.id}
          task={task}
          index={index}
          onComplete={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      ))}
    </>,
  );

  const annaActions = screen.getByRole("button", {
    name: "Actions for Call Anna",
  });
  const benActions = screen.getByRole("button", {
    name: "Actions for Email Ben",
  });
  expect(annaActions).not.toBe(benActions);
  expect(screen.queryByRole("button", { name: "Task actions" })).toBeNull();

  fireEvent.click(benActions);
  expect(
    await screen.findByRole("menuitem", { name: "Reopen Task" }),
  ).toBeTruthy();
});

it("gives a task card's completion checkbox one name in both states", () => {
  const onComplete = vi.fn();
  render(
    <>
      {[anna, ben].map((task, index) => (
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

  const open = screen.getByRole("checkbox", {
    name: "Mark Call Anna complete",
  });
  const done = screen.getByRole("checkbox", {
    name: "Mark Email Ben complete",
  });
  expect(open.getAttribute("aria-checked")).toBe("false");
  expect(done.getAttribute("aria-checked")).toBe("true");
  expect(screen.queryByRole("checkbox", { name: /^Complete / })).toBeNull();

  fireEvent.click(done);
  expect(onComplete).toHaveBeenCalledWith("task-2");
});

it("names each table row's actions menu for its own task", async () => {
  const onEdit = vi.fn();
  render(
    <TaskTable
      tasks={[anna, ben]}
      selectedTaskIds={[]}
      onToggleSelection={vi.fn()}
      onSelectAll={vi.fn()}
      onTaskClick={vi.fn()}
      onStatusChange={vi.fn()}
      onEdit={onEdit}
      onDelete={vi.fn()}
    />,
  );

  const annaActions = screen.getByRole("button", {
    name: "Actions for Call Anna",
  });
  const benActions = screen.getByRole("button", {
    name: "Actions for Email Ben",
  });
  expect(annaActions).not.toBe(benActions);
  expect(screen.queryByRole("button", { name: "Open actions" })).toBeNull();

  fireEvent.click(benActions);
  fireEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
  expect(onEdit).toHaveBeenCalledWith(ben);
});
