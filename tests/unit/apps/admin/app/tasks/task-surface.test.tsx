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
import { afterEach, describe, expect, it, vi } from "vitest";

import { TaskDrawer } from "../../../../../../apps/admin/app/(app)/tasks/task-drawer";
import { TaskForm } from "../../../../../../apps/admin/app/(app)/tasks/task-form";

import type { Task } from "../../../../../../apps/admin/app/(app)/tasks/types";

const task: Task = {
  id: "task-1",
  tenant_id: "tenant-1",
  title: "Call partner",
  description: "Discuss next steps",
  type: "call",
  priority: "high",
  status: "todo",
  created_by: "staff-1",
  reminders: [
    {
      id: "reminder-1",
      task_id: "task-1",
      remind_at: "2030-04-01T09:00:00.000Z",
      type: "email",
      sent: false,
    },
  ],
  comments: [],
  tags: ["major-donor"],
  created_at: "2026-01-01T12:00:00.000Z",
  updated_at: "2026-01-01T12:00:00.000Z",
};

afterEach(cleanup);

describe("admin task form and detail interactions", () => {
  it("preserves edit values and saves the existing reminder and task identity", async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <TaskForm
        open
        task={task}
        staffMembers={[]}
        linkedEntities={[]}
        onSave={onSave}
        onClose={onClose}
      />,
    );
    expect(
      (
        screen.getByRole("textbox", {
          name: "Task Title *",
        }) as HTMLInputElement
      ).value,
    ).toBe("Call partner");
    expect(
      screen.getByRole("combobox", { name: "Task Type" }).textContent,
    ).toContain("Call");
    expect(
      screen.getByRole("combobox", { name: "Priority" }).textContent,
    ).toContain("High");
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({
      id: "task-1",
      title: "Call partner",
      priority: "high",
      status: "todo",
      reminders: [{ id: "reminder-1", type: "email", sent: false }],
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows the reminder channel before opening its select and names the removal control", () => {
    render(
      <TaskForm
        open
        task={task}
        staffMembers={[]}
        linkedEntities={[]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(
      within(
        screen.getByRole("combobox", { name: "Reminder 1 channel" }),
      ).getByText("Email", { exact: true }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove reminder 1" }));
    expect(
      screen.queryByRole("button", { name: "Remove reminder 1" }),
    ).toBeNull();
  });

  it("adds reminders through an independently named action", () => {
    render(
      <TaskForm
        open
        task={task}
        staffMembers={[]}
        linkedEntities={[]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Add Reminder", exact: true }),
    );
    expect(
      screen.getByRole("combobox", { name: "Reminder 2 channel", exact: true }),
    ).toBeTruthy();
  });

  it("requires a title and saves a valid new task", async () => {
    const onSave = vi.fn();
    render(
      <TaskForm
        open
        staffMembers={[]}
        linkedEntities={[]}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );
    const title = screen.getByRole("textbox", { name: "Task Title *" });
    fireEvent.change(title, { target: { value: " " } });
    fireEvent.blur(title);
    await screen.findByText("Task title is required");
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.change(title, { target: { value: "Plan follow up" } });
    fireEvent.blur(title);
    await waitFor(() =>
      expect(screen.queryByText("Task title is required")).toBeNull(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({
      title: "Plan follow up",
      status: "todo",
      reminders: [],
      tags: [],
    });
  });

  it("resets a canceled create draft when the dialog reopens", () => {
    const props = {
      staffMembers: [],
      linkedEntities: [],
      onSave: vi.fn(),
      onClose: vi.fn(),
    };
    const { rerender } = render(<TaskForm open {...props} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Task Title *" }), {
      target: { value: "Discard this" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(props.onClose).toHaveBeenCalledOnce();
    rerender(<TaskForm open={false} {...props} />);
    rerender(<TaskForm open {...props} />);
    expect(
      (
        screen.getByRole("textbox", {
          name: "Task Title *",
        }) as HTMLInputElement
      ).value,
    ).toBe("");
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it("opens an edited task calendar at its selected month", async () => {
    render(
      <TaskForm
        open
        task={{ ...task, due_date: "2000-01-01" }}
        staffMembers={[]}
        linkedEntities={[]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "January 1st, 2000", exact: true }),
    );
    expect(
      await screen.findByRole("grid", { name: "January 2000", exact: true }),
    ).toBeTruthy();
    expect(
      await screen.findByRole("dialog", {
        name: "Choose due date",
        exact: true,
      }),
    ).toBeTruthy();
  });

  it("announces overdue dates only for tasks that still need completion", () => {
    const props = {
      staffMembers: [],
      linkedEntities: [],
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
      onClose: vi.fn(),
    };
    const overdueTask: Task = { ...task, due_date: "2000-01-01" };
    const { rerender } = render(<TaskDrawer task={overdueTask} {...props} />);
    expect(screen.getByText("Overdue:", { exact: true })).toBeTruthy();
    rerender(
      <TaskDrawer task={{ ...overdueTask, status: "completed" }} {...props} />,
    );
    expect(screen.queryByText("Overdue:", { exact: true })).toBeNull();
  });

  it("preserves completion updates from the detail status menu", async () => {
    const onUpdate = vi.fn();
    render(
      <TaskDrawer
        task={task}
        staffMembers={[]}
        linkedEntities={[]}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "To Do", exact: true }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Completed", exact: true }),
    );
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        ...task,
        status: "completed",
        completed_at: expect.any(String),
        updated_at: expect.any(String),
      }),
    );
  });

  it("keeps comment trimming and deletion callbacks local to the selected task", async () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    render(
      <TaskDrawer
        task={task}
        staffMembers={[]}
        linkedEntities={[]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={vi.fn()}
      />,
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Comment",
          exact: true,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.change(screen.getByPlaceholderText("Add a comment..."), {
      target: { value: "  Local note  " },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Comment", exact: true }),
    );
    expect(onUpdate.mock.calls[0]?.[0]).toMatchObject({
      id: task.id,
      comments: [{ task_id: task.id, content: "Local note", user_name: "You" }],
    });
    expect(
      (screen.getByPlaceholderText("Add a comment...") as HTMLTextAreaElement)
        .value,
    ).toBe("");
    fireEvent.click(
      screen.getByRole("button", { name: "Delete", exact: true }),
    );
    expect(onDelete).toHaveBeenCalledWith(task.id);
  });
});
