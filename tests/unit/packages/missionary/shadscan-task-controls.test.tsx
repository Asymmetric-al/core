/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TaskDetailsSheet } from "../../../../packages/missionary/components/tasks/task-details-sheet";
import { TaskViewTabs } from "../../../../packages/missionary/components/tasks/task-view-tabs";
import { TaskDialog } from "../../../../packages/missionary/components/task-dialog";
import { TaskKanbanBoard } from "../../../../packages/missionary/components/task-kanban-board";
import type { Task } from "../../../../packages/missionary/types";

vi.mock("@asym/database/supabase", () => ({ createBrowserClient: () => ({}) }));
vi.mock("@asym/lib/hooks", () => ({ useAuth: () => ({ profile: null }) }));

afterEach(cleanup);
const task: Task = {
  id: "task-1",
  missionary_id: "missionary-1",
  title: "Follow up",
  task_type: "call",
  status: "not_started",
  priority: "none",
  sort_key: 1,
  is_auto_generated: false,
  created_at: "2026-10-03T00:00:00Z",
  updated_at: "2026-10-03T00:00:00Z",
};

it("names the task details Sheet through its extracted header", () => {
  render(
    <TaskDetailsSheet
      task={task}
      open
      onOpenChange={vi.fn()}
      onStatusChange={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
    />,
  );
  expect(screen.getByRole("dialog", { name: "Follow up" })).toBeTruthy();
});

it("names the priority selector through SelectControlLabel", () => {
  render(<TaskDialog task={task} open onOpenChange={vi.fn()} />);
  expect(screen.getByRole("combobox", { name: "Priority" })).toBeTruthy();
});

it("offers task view filters directly without requiring a mobile site-navigation panel", () => {
  const onViewChange = vi.fn();
  render(<TaskViewTabs currentView="all" onViewChange={onViewChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Due Today" }));
  expect(onViewChange).toHaveBeenCalledWith("due_today");
});

it("names kanban creation and editing controls independently of their icons", () => {
  const onEditTask = vi.fn();
  render(
    <TaskKanbanBoard
      tasks={[task]}
      onEditTask={onEditTask}
      onMoveTask={vi.fn().mockResolvedValue(true)}
      onCompleteTask={vi.fn()}
      onDeleteTask={vi.fn()}
      onCreateTask={vi.fn()}
    />,
  );
  expect(
    screen.getByRole("button", { name: "Add task to To Do" }),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Move Follow up" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Edit Follow up" }));
  expect(onEditTask).toHaveBeenCalledWith(task);
});
