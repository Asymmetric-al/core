/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import TasksPage from "../../../../../../apps/missionary/app/tasks/page-client";

import type { Task } from "@asym/lib/hooks/use-tasks";

const state = vi.hoisted(() => ({
  tasks: [] as Task[],
  error: null as string | null,
  loading: false,
  refresh: vi.fn(),
}));

vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: null }),
  useTasks: () => ({
    refresh: state.refresh,
    completeTask: vi.fn(),
    reopenTask: vi.fn(),
    deleteTask: vi.fn(),
    moveTask: vi.fn(),
    loading: state.loading,
    error: state.error,
    filteredTasks: state.tasks,
    stats: {
      notStarted: 0,
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

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }));
  // The loading skeleton measures itself.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  state.tasks = [];
  state.error = "Fixture load failure";
  state.loading = false;
  state.refresh.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const task: Task = {
  id: "task-1",
  missionary_id: "missionary-1",
  title: "Call partner",
  task_type: "call",
  status: "not_started",
  priority: "none",
  sort_key: 1,
  is_auto_generated: false,
  created_at: "2026-10-04T00:00:00Z",
  updated_at: "2026-10-04T00:00:00Z",
};

function startRetry() {
  const view = render(<TasksPage />);
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  expect(state.refresh).toHaveBeenCalledOnce();
  state.error = null;
  state.loading = true;
  view.rerender(<TasksPage />);
  expect(button.isConnected).toBe(true);
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  return { view, button };
}

it("keeps focus on Try again while tasks reload, then lands on the page heading", () => {
  const { view, button } = startRetry();
  state.loading = false;
  state.tasks = [task];
  view.rerender(<TasksPage />);
  expect(button.isConnected).toBe(false);
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { level: 1, name: "Tasks" }),
  );
});

it("leaves focus on Try again when the tasks still can't load", () => {
  const { view, button } = startRetry();
  state.loading = false;
  state.error = "Still failing";
  view.rerender(<TasksPage />);
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).not.toBe("true");
  expect(screen.getByRole("alert").textContent).toContain("Still failing");
});

it("announces again when the tasks fail with the same message", () => {
  const view = render(<TasksPage />);
  const firstAlert = screen.getByRole("alert");
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  state.error = null;
  state.loading = true;
  view.rerender(<TasksPage />);
  state.loading = false;
  state.error = "Fixture load failure";
  view.rerender(<TasksPage />);
  expect(document.activeElement).toBe(button);
  const alert = screen.getByRole("alert");
  // A new alert node, so the unchanged message is read out again.
  expect(alert).not.toBe(firstAlert);
  expect(alert.textContent).toContain("Fixture load failure");
});
