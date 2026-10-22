/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import TasksPage from "../../../../../../apps/missionary/app/tasks/page-client";

import type { Task } from "@asym/lib/hooks/use-tasks";
import type { TaskKanbanBoard } from "@asym/missionary/components/task-kanban-board";

const hooks = vi.hoisted(() => ({
  tasks: [] as Task[],
  moveTask: vi.fn(),
}));
const board = vi.hoisted(() => ({ result: null as boolean | null }));

vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: null }),
  useTasks: () => ({
    tasks: hooks.tasks,
    filteredTasks: hooks.tasks,
    moveTask: hooks.moveTask,
    loading: false,
    error: null,
    stats: {
      total: hooks.tasks.length,
      notStarted: hooks.tasks.length,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      dueToday: 0,
    },
    completeTask: vi.fn(),
    reopenTask: vi.fn(),
    deleteTask: vi.fn(),
    refresh: vi.fn(),
  }),
}));
vi.mock("@asym/missionary/components/task-kanban-board", () => ({
  TaskKanbanBoard: ({
    tasks,
    onMoveTask,
  }: React.ComponentProps<typeof TaskKanbanBoard>) => (
    <div>
      <output aria-label="Shown task IDs">
        {tasks.map((task) => task.id).join(",")}
      </output>
      <button
        type="button"
        onClick={async () => {
          board.result = await onMoveTask("a", "not_started", 1);
        }}
      >
        Move A after C
      </button>
    </div>
  ),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({}),
}));
vi.mock("@asym/env", () => ({
  clientEnv: { NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: false },
}));

beforeEach(() => {
  const base: Task = {
    id: "a",
    missionary_id: "missionary-filtered-move-fixture",
    title: "Shown Alpha",
    task_type: "call",
    status: "not_started",
    priority: "high",
    sort_key: 100,
    is_auto_generated: false,
    created_at: "2026-10-05T00:00:00Z",
    updated_at: "2026-10-05T00:00:00Z",
  };
  hooks.tasks = [
    base,
    {
      ...base,
      id: "b",
      title: "Hidden Beta",
      task_type: "email",
      priority: "low",
      sort_key: 200,
    },
    { ...base, id: "c", title: "Shown Gamma", sort_key: 300 },
  ];
  hooks.moveTask.mockReset();
  board.result = null;
});
afterEach(cleanup);

it.each([
  ["type", true],
  ["type", false],
  ["priority", true],
  ["priority", false],
  ["search", true],
  ["search", false],
] as const)(
  "maps the actual page's %s-filtered board index before persistence and preserves result %s",
  async (filter, success) => {
    hooks.moveTask.mockResolvedValue(success);
    render(<TasksPage />);
    expect(
      screen.getByRole("status", { name: "Shown task IDs" }).textContent,
    ).toBe("a,b,c");

    if (filter === "search") {
      fireEvent.change(screen.getByRole("textbox", { name: "Search" }), {
        target: { value: "shown" },
      });
    } else {
      fireEvent.click(screen.getByRole("button", { name: "Refine" }));
      fireEvent.click(
        await screen.findByRole("menuitemcheckbox", {
          name: filter === "type" ? "Call" : "High",
          exact: true,
        }),
      );
    }
    await waitFor(() =>
      expect(
        screen.getByRole("status", { name: "Shown task IDs" }).textContent,
      ).toBe("a,c"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Move A after C" }));

    await waitFor(() => expect(board.result).toBe(success));
    expect(hooks.moveTask.mock.calls).toEqual([["a", "not_started", 2]]);
    expect(hooks.tasks.map((task) => [task.id, task.sort_key])).toEqual([
      ["a", 100],
      ["b", 200],
      ["c", 300],
    ]);
  },
);
