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
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import TasksPage from "../../../../../../apps/missionary/app/tasks/page-client";

import type { Task } from "@asym/lib/hooks/use-tasks";

// jsdom has no matchMedia; the page picks its first view from screen width.
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
});

function makeTask(overrides: Partial<Task>): Task {
  return {
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
    ...overrides,
  };
}

const state = vi.hoisted(() => ({
  tasks: [] as Task[],
  error: null as string | null,
  overdue: 0,
  dueToday: 0,
  loading: false,
}));

vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: null }),
  useTasks: () => ({
    refresh: vi.fn(),
    completeTask: vi.fn(),
    reopenTask: vi.fn(),
    deleteTask: vi.fn(),
    moveTask: vi.fn(),
    loading: state.loading,
    error: state.error,
    filteredTasks: state.tasks,
    stats: {
      notStarted: state.tasks.filter((t) => t.status === "not_started").length,
      inProgress: state.tasks.filter((t) => t.status === "in_progress").length,
      completed: state.tasks.filter((t) => t.status === "completed").length,
      overdue: state.overdue,
      dueToday: state.dueToday,
    },
  }),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({}),
}));
vi.mock("@asym/env", () => ({
  clientEnv: { NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: false },
}));

/** Opens the list and picks one of its filter tabs. */
function showListTab(name: string) {
  fireEvent.click(screen.getByRole("button", { name: "List view" }));
  fireEvent.click(
    within(screen.getByRole("tablist")).getByRole("tab", { name }),
  );
}

beforeEach(() => {
  state.tasks = [makeTask({})];
  state.error = null;
  state.overdue = 0;
  state.dueToday = 0;
  state.loading = false;
});
afterEach(cleanup);

it("keeps the board rendering when a task has a status it has no column for", () => {
  state.tasks = [
    makeTask({}),
    makeTask({ id: "task-2", title: "Legacy", status: "pending" as never }),
  ];
  render(<TasksPage />);
  expect(screen.getByRole("heading", { name: "To do 1" })).toBeTruthy();
});

// The summary figures only report; the board keeps its columns and no
// figure pretends to be a filter.
it("shows the summary as plain figures on the board", () => {
  state.overdue = 1;
  state.dueToday = 1;
  render(<TasksPage />);
  expect(
    screen.getByRole("button", { name: "Board view", pressed: true }),
  ).toBeTruthy();
  for (const label of ["Open", "Done", "Overdue", "Due today"]) {
    const term = screen.getByText(label, { selector: "dt" });
    expect(term.closest("button")).toBeNull();
  }
  expect(screen.queryByRole("button", { name: /^\d/ })).toBeNull();
});

// Cancelled tasks are read as deferred (the task model has no cancelled
// status), so the note names both.
it("tells the user about deferred tasks the board does not show", async () => {
  state.tasks = [
    makeTask({}),
    makeTask({
      id: "task-3",
      title: "Paused visit",
      status: "deferred",
      due_date: "2026-02-10T12:00:00",
    }),
  ];
  render(<TasksPage />);
  expect(
    screen.getByText("1 deferred task isn’t shown on the board."),
  ).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Show in list" }));

  // The note leaves with the board, so focus moves to the selected view.
  const listView = screen.getByRole("button", {
    name: "List view",
    pressed: true,
  });
  await waitFor(() => expect(document.activeElement).toBe(listView));
  expect(screen.getByText("Deferred only")).toBeTruthy();
  expect(
    await screen.findByRole("checkbox", { name: "Complete Paused visit" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("checkbox", { name: "Complete Call partner" }),
  ).toBeNull();
  // Deferred work is left out of the overdue count, so its row does not
  // carry an Overdue badge either (the Overdue filter tab aside).
  expect(
    screen.queryByText("Overdue", { selector: ":not([role='tab'])" }),
  ).toBeNull();
});

it("does not show zero task counts while the first load is in progress", () => {
  // The loading skeleton reads matchMedia and ResizeObserver, which jsdom lacks.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
  state.tasks = [];
  state.loading = true;
  render(<TasksPage />);
  expect(screen.queryByText("Open", { selector: "dt" })).toBeNull();
  vi.unstubAllGlobals();
});

// The Due Today count leaves out deferred tasks; the Due today tab must too.
it("shows a Due today list that matches the summary count", async () => {
  const today = new Date();
  const dueToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}T12:00:00`;
  state.dueToday = 1;
  state.tasks = [
    makeTask({ title: "Call today", due_date: dueToday }),
    makeTask({
      id: "task-4",
      title: "Deferred today",
      status: "deferred",
      due_date: dueToday,
    }),
  ];
  render(<TasksPage />);
  expect(
    screen.getByText("Due today", { selector: "dt" }).nextElementSibling
      ?.textContent,
  ).toBe("1");
  showListTab("Today");
  expect(
    await screen.findByRole("checkbox", { name: "Complete Call today" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("checkbox", { name: "Complete Deferred today" }),
  ).toBeNull();
});

it("does not show zero task counts when tasks failed to load", () => {
  state.tasks = [];
  state.error = "Could not load tasks.";
  render(<TasksPage />);
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(screen.queryByText("Open", { selector: "dt" })).toBeNull();
  expect(screen.queryByText("Done", { selector: "dt" })).toBeNull();
});

// The board's deferred note sits above the columns so it is seen without
// scrolling past every card.
it("shows the deferred note before the board columns", () => {
  state.tasks = [
    makeTask({}),
    makeTask({ id: "task-3", title: "Paused visit", status: "deferred" }),
  ];
  render(<TasksPage />);
  const note = screen.getByText("1 deferred task isn’t shown on the board.");
  const column = screen.getByRole("heading", { name: "To do 1" });
  expect(
    note.compareDocumentPosition(column) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

// Overdue has its own tab, so it is not named a second time as a chip, and
// Clear all is not offered for a tab choice.
it("filters overdue work from its tab without a duplicate chip", async () => {
  state.overdue = 1;
  state.tasks = [
    makeTask({ title: "Late call", due_date: "2026-02-10" }),
    makeTask({ id: "task-5", title: "Someday call" }),
  ];
  render(<TasksPage />);
  showListTab("Overdue");

  expect(
    await screen.findByRole("checkbox", { name: "Complete Late call" }),
  ).toBeTruthy();
  await waitFor(() =>
    expect(
      screen.queryByRole("checkbox", { name: "Complete Someday call" }),
    ).toBeNull(),
  );
  expect(screen.queryByText("Overdue only")).toBeNull();
  expect(screen.queryByRole("button", { name: "Clear all" })).toBeNull();

  fireEvent.click(
    within(screen.getByRole("tablist")).getByRole("tab", { name: "Open" }),
  );
  expect(
    await screen.findByRole("checkbox", { name: "Complete Someday call" }),
  ).toBeTruthy();
});

// The partner chip links to the partner; its name is the partner's name, not
// initials glued to it.
it("names the partner chip in list rows by the partner's name", async () => {
  state.tasks = [
    makeTask({
      donor_id: "donor-1",
      donor: {
        id: "donor-1",
        name: "Avery Lopez",
        email: null,
        avatar_url: null,
      },
    } as Partial<Task>),
  ];
  render(<TasksPage />);
  fireEvent.click(screen.getByRole("button", { name: "List view" }));
  const link = await screen.findByRole("link", { name: "Avery Lopez" });
  expect(link.getAttribute("href")).toBe("/donors?selected=donor-1");
});
