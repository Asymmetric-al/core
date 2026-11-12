// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
// eslint-disable-next-line no-restricted-imports -- AL-1958: Regression at the actual app control boundary.
import { TaskItem } from "../../../../apps/admin/components/dashboard/task-item";
import { TaskTable } from "@asym/missionary/components/tasks/task-table";

afterEach(cleanup);
it("names the task menu and retains its action", () => {
  const onMenuClick = vi.fn();
  render(
    <TaskItem
      title="Call donor"
      dueDate="Today"
      priority="high"
      onMenuClick={onMenuClick}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Actions for Call donor" }),
  );
  expect(onMenuClick).toHaveBeenCalledOnce();
});
it("names the task table and its actions column", () => {
  render(
    <TaskTable
      tasks={[]}
      selectedTaskIds={[]}
      onToggleSelection={vi.fn()}
      onSelectAll={vi.fn()}
      onTaskClick={vi.fn()}
      onStatusChange={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
    />,
  );
  expect(screen.getByRole("table", { name: "Tasks" })).toBeTruthy();
  expect(screen.getByRole("columnheader", { name: "Actions" })).toBeTruthy();
});
