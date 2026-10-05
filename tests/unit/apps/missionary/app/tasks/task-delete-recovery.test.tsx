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

import type { Task } from "@asym/lib/hooks/use-tasks";

const tasks = vi.hoisted(() => ({
  data: [] as Task[],
  deleteTask: vi.fn(),
  refresh: vi.fn(),
  completeTask: vi.fn(),
  reopenTask: vi.fn(),
  moveTask: vi.fn(),
}));

const task: Task = {
  id: "task-delete-fixture",
  missionary_id: "missionary-delete-fixture",
  title: "Call partner",
  task_type: "call",
  status: "not_started",
  priority: "none",
  sort_key: 1,
  is_auto_generated: false,
  created_at: "2026-10-05T00:00:00Z",
  updated_at: "2026-10-05T00:00:00Z",
};

vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: null }),
  useTasks: () => ({
    ...tasks,
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

beforeEach(() => {
  tasks.data = [task];
  tasks.deleteTask.mockReset().mockResolvedValue(true);
});
afterEach(cleanup);

async function openDeleteConfirmation() {
  fireEvent.click(screen.getByRole("button", { name: "List view" }));
  const trigger = await screen.findByRole("button", { name: "Open actions" });
  trigger.focus();
  fireEvent.click(trigger);
  fireEvent.click(
    await screen.findByRole("menuitem", { name: "Delete Task", exact: true }),
  );
  const dialog = await screen.findByRole("alertdialog", {
    name: "Delete Task",
  });
  expect(dialog.textContent).toContain(task.title);
  expect(tasks.deleteTask).not.toHaveBeenCalled();
  return { dialog, trigger };
}

it("keeps the same task confirmation open with an error when deletion returns false", async () => {
  tasks.deleteTask.mockResolvedValue(false);
  render(<TasksPage />);
  const { dialog } = await openDeleteConfirmation();

  fireEvent.click(within(dialog).getByRole("button", { name: "Delete Task" }));

  expect((await within(dialog).findByRole("alert")).textContent).toContain(
    "Could not delete this task",
  );
  expect(screen.getByRole("alertdialog", { name: "Delete Task" })).toBe(dialog);
  expect(tasks.deleteTask).toHaveBeenCalledOnce();
  expect(tasks.deleteTask).toHaveBeenCalledWith(task.id);
});

it.each(["false", "rejection", "throw"])(
  "announces a %s deletion failure and retries the same task successfully",
  async (result) => {
    if (result === "false") tasks.deleteTask.mockResolvedValueOnce(false);
    else if (result === "rejection")
      tasks.deleteTask.mockRejectedValueOnce(new Error("Offline fixture"));
    else
      tasks.deleteTask.mockImplementationOnce(() => {
        throw new Error("Offline fixture");
      });
    render(<TasksPage />);
    const { dialog } = await openDeleteConfirmation();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete Task" }),
    );
    expect((await within(dialog).findByRole("alert")).textContent).toContain(
      "Could not delete this task",
    );
    expect(screen.getByRole("alertdialog", { name: "Delete Task" })).toBe(
      dialog,
    );
    expect(dialog.textContent).toContain(task.title);

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete Task" }),
    );
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(tasks.deleteTask.mock.calls).toEqual([[task.id], [task.id]]);
    expect(tasks.completeTask).not.toHaveBeenCalled();
    expect(tasks.reopenTask).not.toHaveBeenCalled();
    expect(tasks.moveTask).not.toHaveBeenCalled();
  },
);

it("keeps one pending deletion focused and prevents Cancel or Escape from abandoning it", async () => {
  let finish = (_success: boolean) => {};
  tasks.deleteTask.mockImplementation(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  );
  render(<TasksPage />);
  const { dialog } = await openDeleteConfirmation();
  const confirm = within(dialog).getByRole("button", { name: "Delete Task" });
  await waitFor(() =>
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: "Cancel" }),
    ),
  );
  act(() => {
    fireEvent.click(confirm);
    fireEvent.click(confirm);
  });

  expect(tasks.deleteTask).toHaveBeenCalledOnce();
  expect(confirm.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(confirm);
  expect(within(dialog).getByRole("status").textContent).toContain(
    "Deleting Call partner",
  );
  fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
  expect(screen.getByRole("alertdialog")).toBe(dialog);

  await act(async () => finish(false));
  expect((await within(dialog).findByRole("alert")).textContent).toContain(
    "Could not delete this task",
  );
  expect(within(dialog).queryByRole("status")).toBeNull();
  expect(
    within(dialog)
      .getByRole("button", { name: "Delete Task" })
      .getAttribute("aria-disabled"),
  ).not.toBe("true");
  expect(tasks.deleteTask).toHaveBeenCalledOnce();
});

it.each(["Cancel", "Escape"])(
  "%s preserves the task without deletion and restores its actions trigger",
  async (action) => {
    render(<TasksPage />);
    const { dialog, trigger } = await openDeleteConfirmation();
    const cancel = within(dialog).getByRole("button", { name: "Cancel" });
    await waitFor(() => expect(document.activeElement).toBe(cancel));

    if (action === "Cancel") fireEvent.click(cancel);
    else fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(tasks.deleteTask).not.toHaveBeenCalled();
    expect(
      screen.getByRole("checkbox", { name: "Complete Call partner" }),
    ).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  },
);

it("closes only after successful deletion and focuses Add Task after the row is removed", async () => {
  let finish = (_success: boolean) => {};
  tasks.deleteTask.mockImplementation(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  );
  const view = render(<TasksPage />);
  const { dialog } = await openDeleteConfirmation();
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete Task" }));
  expect(screen.getByRole("alertdialog")).toBe(dialog);
  expect(screen.getByRole("status").textContent).toContain(
    "Deleting Call partner",
  );

  await act(async () => {
    tasks.data = [];
    finish(true);
  });
  view.rerender(<TasksPage />);

  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(
    screen.queryByRole("checkbox", { name: "Complete Call partner" }),
  ).toBeNull();
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Add Task" }),
    ),
  );
  expect(tasks.deleteTask).toHaveBeenCalledOnce();
});

it("recovers focus when refreshed task data removes the row from the active filter", async () => {
  const view = render(<TasksPage />);
  const { dialog, trigger } = await openDeleteConfirmation();
  tasks.data = [{ ...task, status: "completed" }];
  view.rerender(<TasksPage />);
  await waitFor(() => expect(trigger.isConnected).toBe(false));
  expect(screen.getByRole("alertdialog")).toBe(dialog);

  fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(tasks.deleteTask).not.toHaveBeenCalled();
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Add Task" }),
    ),
  );
});
