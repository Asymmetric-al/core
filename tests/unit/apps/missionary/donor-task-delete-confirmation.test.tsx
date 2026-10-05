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
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { ReactNode } from "react";

const tasks = vi.hoisted(() => ({
  deleteTask: vi.fn(),
  data: [] as unknown[],
  loading: false,
}));
vi.mock("@asym/lib/hooks", () => ({
  useTasks: () => ({
    filteredTasks: tasks.data,
    loading: tasks.loading,
    completeTask: vi.fn(),
    reopenTask: vi.fn(),
    deleteTask: tasks.deleteTask,
    refresh: vi.fn(),
  }),
}));
// Editing is a separate service-backed flow; retain its actual trigger.
vi.mock("@asym/missionary/components/task-dialog", () => ({
  TaskDialog: ({ trigger }: { trigger: ReactNode }) => trigger,
}));

const { DonorTasks } =
  await import("../../../../apps/missionary/app/donors/donor-tasks");

beforeEach(() => {
  tasks.loading = false;
  tasks.deleteTask.mockReset().mockResolvedValue(true);
  tasks.data = [
    {
      id: "task-anna",
      title: "Call Anna",
      status: "completed",
      task_type: "to_do",
      completed_at: "2026-10-03T00:00:00.000Z",
    },
  ];
});
afterEach(cleanup);

it("keeps confirmation and keyboard focus through a task refresh", async () => {
  const view = render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  fireEvent.click(screen.getByRole("button", { name: "Delete Call Anna" }));
  const dialog = await screen.findByRole("alertdialog", {
    name: "Delete Call Anna?",
  });
  const cancel = within(dialog).getByRole("button", { name: "Cancel" });
  await waitFor(() => expect(document.activeElement).toBe(cancel));

  tasks.loading = true;
  view.rerender(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  expect(screen.getByRole("alertdialog")).toBe(dialog);
  expect(document.activeElement).toBe(cancel);
  expect(tasks.deleteTask).not.toHaveBeenCalled();
  fireEvent.click(cancel);
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Add Task" }),
    ),
  );
});

it("retains pending deletion, error and retry through task refreshes", async () => {
  let finish = (_success: boolean) => {};
  tasks.deleteTask.mockImplementationOnce(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  );
  const view = render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  fireEvent.click(screen.getByRole("button", { name: "Delete Call Anna" }));
  const dialog = await screen.findByRole("alertdialog", {
    name: "Delete Call Anna?",
  });
  const confirm = within(dialog).getByRole("button", { name: "Delete task" });
  confirm.focus();
  fireEvent.click(confirm);

  tasks.loading = true;
  view.rerender(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  expect(screen.getByRole("alertdialog")).toBe(dialog);
  expect(document.activeElement).toBe(confirm);
  expect(within(dialog).getByRole("status").textContent).toContain(
    "Deleting Call Anna",
  );
  fireEvent.click(confirm);
  fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
  expect(tasks.deleteTask).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("alertdialog")).toBe(dialog);

  await act(async () => finish(false));
  expect(within(dialog).getByRole("alert").textContent).toContain(
    "Could not delete this task",
  );
  tasks.loading = false;
  view.rerender(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  expect(screen.getByRole("alertdialog")).toBe(dialog);
  expect(document.activeElement).toBe(confirm);
  expect(within(dialog).getByRole("alert").textContent).toContain(
    "Could not delete this task",
  );
  tasks.deleteTask.mockResolvedValue(true);
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete task" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(tasks.deleteTask).toHaveBeenCalledTimes(2);
  expect(tasks.deleteTask.mock.calls).toEqual([["task-anna"], ["task-anna"]]);
});

it("requires confirmation for the exact task and Cancel preserves it", async () => {
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  const trigger = screen.getByRole("button", { name: "Delete Call Anna" });
  trigger.focus();
  fireEvent.click(trigger);

  expect(tasks.deleteTask).not.toHaveBeenCalled();
  const dialog = await screen.findByRole("alertdialog", {
    name: "Delete Call Anna?",
  });
  expect(dialog.textContent).toContain("Call Anna");
  const cancel = screen.getByRole("button", { name: "Cancel" });
  await waitFor(() => expect(document.activeElement).toBe(cancel));
  fireEvent.click(cancel);
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(tasks.deleteTask).not.toHaveBeenCalled();
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("confirms menu deletion and restores focus to the still-mounted actions trigger", async () => {
  tasks.data = [
    {
      id: "task-anna",
      title: "Call Anna",
      status: "not_started",
      task_type: "to_do",
    },
  ];
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  const trigger = screen.getByRole("button", { name: "Open actions" });
  trigger.focus();
  fireEvent.click(trigger);
  fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
  expect(tasks.deleteTask).not.toHaveBeenCalled();
  await screen.findByRole("alertdialog", { name: "Delete Call Anna?" });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("performs one explicit deletion, keeps pending feedback and recovers focus after removal", async () => {
  let finish = (_success: boolean) => {};
  tasks.deleteTask.mockImplementation(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  );
  const view = render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  fireEvent.click(screen.getByRole("button", { name: "Delete Call Anna" }));
  expect(tasks.deleteTask).not.toHaveBeenCalled();
  const dialog = await screen.findByRole("alertdialog", {
    name: "Delete Call Anna?",
  });
  const confirm = within(dialog).getByRole("button", { name: "Delete task" });
  confirm.focus();
  act(() => {
    fireEvent.click(confirm);
    fireEvent.click(confirm);
  });

  expect(tasks.deleteTask).toHaveBeenCalledTimes(1);
  expect(tasks.deleteTask).toHaveBeenCalledWith("task-anna");
  await waitFor(() =>
    expect(confirm.getAttribute("aria-disabled")).toBe("true"),
  );
  expect(document.activeElement).toBe(confirm);
  expect(within(dialog).getByRole("status").textContent).toContain(
    "Deleting Call Anna",
  );
  fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
  expect(screen.getByRole("alertdialog")).toBeTruthy();

  await act(async () => {
    tasks.data = [];
    finish(true);
  });
  view.rerender(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Add Task" }),
    ),
  );
});

it.each(["false", "throw"])(
  "keeps the exact task open with an error when deletion returns %s",
  async (result) => {
    if (result === "false") tasks.deleteTask.mockResolvedValue(false);
    else tasks.deleteTask.mockRejectedValue(new Error("Offline fixture"));
    render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
    fireEvent.click(screen.getByRole("button", { name: "Delete Call Anna" }));
    expect(tasks.deleteTask).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete Call Anna?",
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete task" }),
    );
    expect((await within(dialog).findByRole("alert")).textContent).toContain(
      "Could not delete this task",
    );
    expect(tasks.deleteTask).toHaveBeenCalledTimes(1);
    expect(
      within(dialog)
        .getByRole("button", { name: "Delete task" })
        .getAttribute("aria-disabled"),
    ).not.toBe("true");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  },
);

it("Escape cancels an idle confirmation without deletion and restores focus", async () => {
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  const trigger = screen.getByRole("button", { name: "Delete Call Anna" });
  trigger.focus();
  fireEvent.click(trigger);
  expect(tasks.deleteTask).not.toHaveBeenCalled();
  const dialog = await screen.findByRole("alertdialog", {
    name: "Delete Call Anna?",
  });
  fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(tasks.deleteTask).not.toHaveBeenCalled();
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});
