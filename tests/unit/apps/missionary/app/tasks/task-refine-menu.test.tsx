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
import type { TaskKanbanBoard } from "@asym/missionary/components/task-kanban-board";

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

const hooks = vi.hoisted(() => ({ tasks: [] as Task[] }));

vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: null }),
  useTasks: () => ({
    tasks: hooks.tasks,
    filteredTasks: hooks.tasks,
    moveTask: vi.fn(),
    loading: false,
    error: null,
    stats: {
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
// The board stands in as a plain list of the tasks the filters let through.
vi.mock("@asym/missionary/components/task-kanban-board", () => ({
  TaskKanbanBoard: ({
    tasks,
  }: React.ComponentProps<typeof TaskKanbanBoard>) => (
    <output aria-label="Shown task IDs">
      {tasks.map((task) => task.id).join(",")}
    </output>
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
    id: "call-high",
    missionary_id: "missionary-refine-fixture",
    title: "Call partner",
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
      id: "email-low",
      title: "Email partner",
      task_type: "email",
      priority: "low",
      sort_key: 200,
    },
    {
      ...base,
      id: "meeting-none",
      title: "Meet partner",
      task_type: "meeting",
      priority: "none",
      sort_key: 300,
    },
  ];
});
afterEach(cleanup);

function shownTaskIds() {
  return screen.getByRole("status", { name: "Shown task IDs" }).textContent;
}

/** One of the Refine menu's labelled groups; the menu stays open after a choice. */
async function refineGroup(name: string) {
  if (!screen.queryByRole("menu")) {
    fireEvent.click(screen.getByRole("button", { name: "Refine" }));
  }
  return screen.findByRole("group", { name });
}

function choiceNames(group: HTMLElement) {
  return within(group)
    .getAllByRole("menuitemradio")
    .map((choice) => choice.textContent);
}

function checkedChoiceNames(group: HTMLElement) {
  return within(group)
    .getAllByRole("menuitemradio", { checked: true })
    .map((choice) => choice.textContent);
}

it("offers task type and priority as one-of-many choices that start unfiltered", async () => {
  render(<TasksPage />);

  const type = await refineGroup("Task type");
  expect(choiceNames(type)).toEqual([
    "All types",
    "Call",
    "Email",
    "To-do",
    "Follow Up",
    "Thank You",
    "Meeting",
  ]);
  expect(checkedChoiceNames(type)).toEqual(["All types"]);

  const priority = await refineGroup("Priority");
  expect(choiceNames(priority)).toEqual([
    "All priorities",
    "None",
    "Low",
    "Medium",
    "High",
  ]);
  expect(checkedChoiceNames(priority)).toEqual(["All priorities"]);

  // A checkbox would promise that several types can be on at once.
  expect(
    within(screen.getByRole("menu")).queryAllByRole("menuitemcheckbox"),
  ).toEqual([]);
});

it.each([
  ["Task type", "Email", "All types", "Type: Email"],
  ["Priority", "Low", "All priorities", "Priority: Low"],
] as const)(
  "filters by one %s choice and returns to every task from its all option",
  async (groupName, choice, allChoice, chip) => {
    render(<TasksPage />);
    expect(shownTaskIds()).toBe("call-high,email-low,meeting-none");
    const group = await refineGroup(groupName);

    fireEvent.click(within(group).getByRole("menuitemradio", { name: choice }));
    await waitFor(() => expect(shownTaskIds()).toBe("email-low"));
    expect(checkedChoiceNames(group)).toEqual([choice]);
    expect(screen.getByText(chip)).toBeTruthy();

    // Choosing the selected value again keeps it; it never leaves nothing chosen.
    fireEvent.click(within(group).getByRole("menuitemradio", { name: choice }));
    expect(checkedChoiceNames(group)).toEqual([choice]);
    expect(shownTaskIds()).toBe("email-low");

    fireEvent.click(
      within(group).getByRole("menuitemradio", { name: allChoice }),
    );
    await waitFor(() =>
      expect(shownTaskIds()).toBe("call-high,email-low,meeting-none"),
    );
    expect(checkedChoiceNames(group)).toEqual([allChoice]);
    expect(screen.queryByText(chip)).toBeNull();
  },
);

// "None" is a real priority (no priority set), not the absence of a filter.
it("filters to tasks without a priority from the None choice", async () => {
  render(<TasksPage />);
  const priority = await refineGroup("Priority");

  fireEvent.click(
    within(priority).getByRole("menuitemradio", { name: "None" }),
  );

  await waitFor(() => expect(shownTaskIds()).toBe("meeting-none"));
  expect(checkedChoiceNames(priority)).toEqual(["None"]);
  expect(screen.getByText("Priority: None")).toBeTruthy();
});
