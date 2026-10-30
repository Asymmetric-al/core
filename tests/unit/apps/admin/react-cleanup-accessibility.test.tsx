// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TaskTable } from "@asym/missionary/components/tasks/task-table";

afterEach(cleanup);
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
