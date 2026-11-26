/** @vitest-environment jsdom */

import {
  act,
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

import type { Task, TaskStatus } from "@asym/lib/hooks/use-tasks";

// jsdom has no matchMedia; the page picks its first view from screen width.
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

const tasks = vi.hoisted(() => ({
  data: [] as Task[],
  deleteTask: vi.fn(),
  refresh: vi.fn(),
  completeTask: vi.fn(),
  reopenTask: vi.fn(),
  moveTask: vi.fn(),
}));

vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: null }),
  useTasks: () => ({
    ...tasks,
    tasks: tasks.data,
    loading: false,
    error: null,
    filteredTasks: tasks.data,
    stats: {
      notStarted: tasks.data.length,
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

function makeTask(id: string, title: string, sortKey: number): Task {
  return {
    id,
    missionary_id: "missionary-completion-fixture",
    title,
    task_type: "call",
    status: "not_started",
    priority: "none",
    sort_key: sortKey,
    is_auto_generated: false,
    created_at: "2026-10-05T00:00:00Z",
    updated_at: "2026-10-05T00:00:00Z",
  };
}

const anna = makeTask("task-anna", "Call Anna", 1);
const ben = makeTask("task-ben", "Email Ben", 2);
const cara = makeTask("task-cara", "Thank Cara", 3);

// The hook flips the status only after the PATCH resolves; the test resolves
// it by hand so the update lands after the click, as it does in the app.
let finishStatusChange: (saved: boolean) => void = () => {};
function holdStatusChange(status: TaskStatus) {
  return (id: string) =>
    new Promise<boolean>((resolve) => {
      finishStatusChange = (saved) => {
        if (saved) {
          tasks.data = tasks.data.map((task) =>
            task.id === id ? { ...task, status } : task,
          );
        }
        resolve(saved);
      };
    });
}

async function settle(view: ReturnType<typeof render>, saved = true) {
  await act(async () => finishStatusChange(saved));
  view.rerender(<TasksPage />);
}

function showList() {
  fireEvent.click(screen.getByRole("button", { name: "List view" }));
}

beforeEach(() => {
  tasks.data = [anna, ben, cara];
  tasks.completeTask
    .mockReset()
    .mockImplementation(holdStatusChange("completed"));
  tasks.reopenTask
    .mockReset()
    .mockImplementation(holdStatusChange("not_started"));
});
afterEach(cleanup);

it("moves focus to the next row's checkbox when a completed task leaves the list", async () => {
  const view = render(<TasksPage />);
  showList();
  const checkbox = await screen.findByRole("checkbox", {
    name: "Mark Call Anna complete",
  });
  checkbox.focus();
  fireEvent.click(checkbox);
  expect(tasks.completeTask).toHaveBeenCalledWith(anna.id);

  await settle(view);

  await waitFor(() =>
    expect(
      screen.queryByRole("checkbox", { name: "Mark Call Anna complete" }),
    ).toBeNull(),
  );
  expect(document.activeElement).toBe(
    screen.getByRole("checkbox", { name: "Mark Email Ben complete" }),
  );
});

it("moves focus to the previous row when the last row is completed", async () => {
  const view = render(<TasksPage />);
  showList();
  const checkbox = await screen.findByRole("checkbox", {
    name: "Mark Thank Cara complete",
  });
  checkbox.focus();
  fireEvent.click(checkbox);

  await settle(view);

  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("checkbox", { name: "Mark Email Ben complete" }),
    ),
  );
});

it("moves focus to Add task when the only row is completed", async () => {
  tasks.data = [anna];
  const view = render(<TasksPage />);
  showList();
  const checkbox = await screen.findByRole("checkbox", {
    name: "Mark Call Anna complete",
  });
  checkbox.focus();
  fireEvent.click(checkbox);

  await settle(view);

  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Add task" }),
    ),
  );
  expect(await screen.findByText("All caught up")).toBeTruthy();
});

it("moves focus to the next row's actions after Mark Complete in the row menu", async () => {
  const view = render(<TasksPage />);
  showList();
  const trigger = await screen.findByRole("button", {
    name: "Actions for Email Ben",
  });
  trigger.focus();
  fireEvent.click(trigger);
  const menu = await screen.findByRole("menu");
  await waitFor(() =>
    expect(within(menu).getAllByRole("menuitem")).toContain(
      document.activeElement,
    ),
  );
  fireEvent.click(
    within(menu).getByRole("menuitem", { name: "Mark Complete" }),
  );
  expect(tasks.completeTask).toHaveBeenCalledWith(ben.id);
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));

  await settle(view);

  await waitFor(() =>
    expect(
      screen.queryByRole("button", { name: "Actions for Email Ben" }),
    ).toBeNull(),
  );
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Actions for Thank Cara" }),
  );
});

async function markBenCompleteFromMenuWithFocusOn(
  focusTarget: (parts: {
    trigger: HTMLElement;
    menu: HTMLElement;
  }) => HTMLElement,
) {
  const trigger = await screen.findByRole("button", {
    name: "Actions for Email Ben",
  });
  trigger.focus();
  fireEvent.click(trigger);
  const menu = await screen.findByRole("menu");
  const markComplete = within(menu).getByRole("menuitem", {
    name: "Mark Complete",
  });
  const focused = focusTarget({ trigger, menu });
  focused.focus();
  expect(document.activeElement).toBe(focused);
  fireEvent.click(markComplete);
  expect(tasks.completeTask).toHaveBeenCalledWith(ben.id);
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
}

it.each([
  ["the trigger", ({ trigger }: { trigger: HTMLElement }) => trigger],
  ["the menu", ({ menu }: { menu: HTMLElement }) => menu],
])(
  "moves focus to the next row's actions after Mark Complete in the row menu while focus is on %s",
  async (_where, focusTarget) => {
    const view = render(<TasksPage />);
    showList();
    await markBenCompleteFromMenuWithFocusOn(focusTarget);

    await settle(view);

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Actions for Email Ben" }),
      ).toBeNull(),
    );
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Actions for Thank Cara" }),
    );
  },
);

it("moves focus to the next done task when a task is reopened from Done", async () => {
  tasks.data = [
    { ...anna, status: "completed" },
    { ...ben, status: "completed" },
    cara,
  ];
  const view = render(<TasksPage />);
  showList();
  fireEvent.click(
    within(screen.getByRole("tablist")).getByRole("tab", { name: "Done" }),
  );
  const checkbox = await screen.findByRole("checkbox", {
    name: "Mark Call Anna complete",
  });
  await waitFor(() =>
    expect(
      screen.queryByRole("checkbox", { name: "Mark Thank Cara complete" }),
    ).toBeNull(),
  );
  checkbox.focus();
  fireEvent.click(checkbox);
  expect(tasks.reopenTask).toHaveBeenCalledWith(anna.id);

  await settle(view);

  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("checkbox", { name: "Mark Email Ben complete" }),
    ),
  );
});

it("keeps focus on the completed task when it stays in the All list", async () => {
  const view = render(<TasksPage />);
  showList();
  fireEvent.click(
    within(screen.getByRole("tablist")).getByRole("tab", { name: "All" }),
  );
  const checkbox = await screen.findByRole("checkbox", {
    name: "Mark Call Anna complete",
  });
  checkbox.focus();
  fireEvent.click(checkbox);

  await settle(view);

  await waitFor(() =>
    expect(
      screen
        .getByRole("checkbox", { name: "Mark Call Anna complete" })
        .getAttribute("aria-checked"),
    ).toBe("true"),
  );
  expect(document.activeElement).toBe(
    screen.getByRole("checkbox", { name: "Mark Call Anna complete" }),
  );
});

it("leaves focus on another control in a row that stays in the All list", async () => {
  tasks.data = [{ ...anna, status: "completed" }, ben, cara];
  const view = render(<TasksPage />);
  showList();
  fireEvent.click(
    within(screen.getByRole("tablist")).getByRole("tab", { name: "All" }),
  );
  const checkbox = await screen.findByRole("checkbox", {
    name: "Mark Call Anna complete",
  });
  checkbox.focus();
  fireEvent.click(checkbox);
  expect(tasks.reopenTask).toHaveBeenCalledWith(anna.id);
  // The user tabs on before the PATCH resolves; the reopened row sorts first
  // and React moves the other rows, so this trigger keeps focus.
  const trigger = screen.getByRole("button", { name: "Actions for Call Anna" });
  trigger.focus();

  await settle(view);

  await waitFor(() =>
    expect(
      screen
        .getByRole("checkbox", { name: "Mark Call Anna complete" })
        .getAttribute("aria-checked"),
    ).toBe("false"),
  );
  expect(document.activeElement).toBe(trigger);
});

it("leaves focus alone when the change fails and on later unrelated updates", async () => {
  const view = render(<TasksPage />);
  showList();
  const checkbox = await screen.findByRole("checkbox", {
    name: "Mark Call Anna complete",
  });
  checkbox.focus();
  fireEvent.click(checkbox);

  await settle(view, false);
  expect(document.activeElement).toBe(checkbox);

  // A later refresh that removes the row must not reuse the failed attempt.
  const search = screen.getByRole("textbox", { name: "Search" });
  search.focus();
  tasks.data = [ben, cara];
  view.rerender(<TasksPage />);
  await waitFor(() =>
    expect(
      screen.queryByRole("checkbox", { name: "Mark Call Anna complete" }),
    ).toBeNull(),
  );
  expect(document.activeElement).toBe(search);
});
