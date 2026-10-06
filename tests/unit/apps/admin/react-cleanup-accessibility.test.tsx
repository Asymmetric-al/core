// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
// eslint-disable-next-line no-restricted-imports -- AL-1958: Regression at the actual app control boundary.
import { TaskItem } from "../../../../apps/admin/components/dashboard/task-item";
// eslint-disable-next-line no-restricted-imports -- AL-1958: Regression at the actual app control boundary.
import { Checkbox } from "../../../../apps/admin/features/mission-control/care/components/UI";
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
it("connects the checkbox label and preserves caller IDs and refs", () => {
  const ref = React.createRef<HTMLInputElement>();
  render(<Checkbox ref={ref} id="custom-consent" label="Consent to contact" />);
  const checkbox = screen.getByRole("checkbox", { name: "Consent to contact" });
  expect(ref.current).toBe(checkbox);
  expect(checkbox.id).toBe("custom-consent");
  fireEvent.click(screen.getByText("Consent to contact"));
  expect(checkbox).toHaveProperty("checked", true);
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
