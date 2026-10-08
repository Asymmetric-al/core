/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

import TasksPage from "../../../../../../apps/missionary/app/tasks/page-client";

import type { Task } from "@asym/lib/hooks/use-tasks";

const tasks = vi.hoisted(() => ({
  refresh: vi.fn(),
  completeTask: vi.fn(),
  reopenTask: vi.fn(),
  deleteTask: vi.fn(),
  moveTask: vi.fn(),
}));

const task: Task = {
  id: "task-toolbar-fixture",
  missionary_id: "missionary-toolbar-fixture",
  title: "Call partner",
  task_type: "call",
  status: "not_started",
  priority: "none",
  sort_key: 1,
  is_auto_generated: false,
  created_at: "2026-10-04T00:00:00Z",
  updated_at: "2026-10-04T00:00:00Z",
};

vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: null }),
  useTasks: () => ({
    ...tasks,
    loading: false,
    error: null,
    filteredTasks: [task],
    stats: {
      notStarted: 1,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      dueToday: 0,
    },
  }),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({}),
}));
vi.mock("@asym/env", () => ({
  clientEnv: { NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: false },
}));

afterEach(cleanup);

it("names the actual task page's icon-only view and refresh controls", () => {
  render(<TasksPage />);

  expect(
    screen.getByRole("button", { name: "Board view", exact: true }),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "List view", exact: true }),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Refresh tasks", exact: true }),
  ).toBeTruthy();
});

it("exposes the selected view while switching the actual task page content", async () => {
  render(<TasksPage />);

  const board = screen.getByRole("button", {
    name: "Board view",
    pressed: true,
  });
  const list = screen.getByRole("button", {
    name: "List view",
    pressed: false,
  });
  expect(screen.getByRole("heading", { name: "To Do 1" })).toBeTruthy();

  fireEvent.click(list);
  expect(list.getAttribute("aria-pressed")).toBe("true");
  expect(board.getAttribute("aria-pressed")).toBe("false");
  expect(
    await screen.findByRole("checkbox", { name: "Complete Call partner" }),
  ).toBeTruthy();
  await waitFor(() =>
    expect(screen.queryByRole("heading", { name: "To Do 1" })).toBeNull(),
  );

  fireEvent.click(board);
  expect(board.getAttribute("aria-pressed")).toBe("true");
  expect(list.getAttribute("aria-pressed")).toBe("false");
  expect(await screen.findByRole("heading", { name: "To Do 1" })).toBeTruthy();
  await waitFor(() =>
    expect(
      screen.queryByRole("checkbox", { name: "Complete Call partner" }),
    ).toBeNull(),
  );
});

it("keeps the named refresh control connected to the existing task refresh", () => {
  render(<TasksPage />);

  fireEvent.click(
    screen.getByRole("button", { name: "Refresh tasks", exact: true }),
  );

  expect(tasks.refresh).toHaveBeenCalledOnce();
  expect(tasks.completeTask).not.toHaveBeenCalled();
  expect(tasks.reopenTask).not.toHaveBeenCalled();
  expect(tasks.deleteTask).not.toHaveBeenCalled();
  expect(tasks.moveTask).not.toHaveBeenCalled();
});

it("exposes the current task filter on its summary controls", async () => {
  render(<TasksPage />);

  expect(
    screen.getByRole("button", { name: "1 Active", pressed: true }),
  ).toBeTruthy();
  const completed = screen.getByRole("button", {
    name: "0 Completed",
    pressed: false,
  });
  fireEvent.click(completed);

  expect(completed.getAttribute("aria-pressed")).toBe("true");
  expect(
    screen.getByRole("button", { name: "1 Active", pressed: false }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "List view" }));
  expect(
    await screen.findByRole("heading", { name: "All caught up" }),
  ).toBeTruthy();
});
