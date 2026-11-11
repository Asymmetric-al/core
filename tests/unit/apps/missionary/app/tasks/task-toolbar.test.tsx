/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

import TasksPage from "../../../../../../apps/missionary/app/tasks/page-client";

import type { Task } from "@asym/lib/hooks/use-tasks";

// jsdom has no matchMedia; the page picks its first view from screen width.
const media = vi.hoisted(() => ({ phone: false }));
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: media.phone && query.includes("max-width"),
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
}));

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
  expect(screen.getByRole("heading", { name: "To do 1" })).toBeTruthy();

  fireEvent.click(list);
  expect(list.getAttribute("aria-pressed")).toBe("true");
  expect(board.getAttribute("aria-pressed")).toBe("false");
  expect(
    await screen.findByRole("checkbox", { name: "Complete Call partner" }),
  ).toBeTruthy();
  await waitFor(() =>
    expect(screen.queryByRole("heading", { name: "To do 1" })).toBeNull(),
  );

  fireEvent.click(board);
  expect(board.getAttribute("aria-pressed")).toBe("true");
  expect(list.getAttribute("aria-pressed")).toBe("false");
  expect(await screen.findByRole("heading", { name: "To do 1" })).toBeTruthy();
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

/** The value shown under a summary figure's label. */
function figure(label: string) {
  return screen.getByText(label, { selector: "dt" }).nextElementSibling
    ?.textContent;
}

// One control filters the list. The summary figures report counts; the tabs
// filter, and use the same words as the figures.
it("filters with the tabs only, while the summary figures just report", async () => {
  render(<TasksPage />);

  expect(figure("Open")).toBe("1");
  expect(figure("Done")).toBe("0");
  expect(
    screen.queryByRole("button", { name: /^\d+ (Open|Done)$/ }),
  ).toBeNull();
  expect(
    screen.getByText("Open", { selector: "dt" }).closest("button"),
  ).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "List view" }));
  const tabs = screen.getByRole("tablist");
  expect(
    within(tabs)
      .getAllByRole("tab")
      .map((tab) => tab.textContent),
  ).toEqual(["Open", "Overdue", "Today", "Done", "All"]);
  // Short names keep all five tabs within a 320px phone.
  expect(
    within(tabs).getByRole("tab", { name: "Open", selected: true }),
  ).toBeTruthy();

  fireEvent.click(within(tabs).getByRole("tab", { name: "Done" }));
  expect(
    within(tabs).getByRole("tab", { name: "Done", selected: true }),
  ).toBeTruthy();
  expect(
    await screen.findByRole("heading", { name: "All caught up" }),
  ).toBeTruthy();
});

it("uses the same page header as the other missionary pages", () => {
  const { container } = render(<TasksPage />);

  expect(screen.getByRole("heading", { level: 1, name: "Tasks" })).toBeTruthy();
  expect(container.querySelector('[data-slot="page-shell-header"]')).toBeNull();
});

it("leaves no empty filter row when nothing is filtered", () => {
  render(<TasksPage />);

  expect(screen.queryByRole("button", { name: "Clear all" })).toBeNull();
  const search = screen.getByRole("textbox", { name: "Search" });
  const bar = search.closest('[tabindex="-1"]');
  expect(bar?.children).toHaveLength(1);
});

it("opens on the list on phones, where the board would scroll sideways", () => {
  media.phone = true;
  render(<TasksPage />);
  expect(
    screen
      .getByRole("button", { name: "List view", exact: true })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  media.phone = false;
});
