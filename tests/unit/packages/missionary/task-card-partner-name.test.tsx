/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { TaskKanbanBoard } from "../../../../packages/missionary/components/task-kanban-board";

import type { Task } from "../../../../packages/missionary/types";

afterEach(cleanup);

const LONG_NAME = "Grace Community Church of the Willamette Valley";

const task = {
  id: "task-partner-name",
  missionary_id: "missionary-1",
  title: "Call Grace",
  task_type: "call",
  status: "not_started",
  priority: "none",
  sort_key: 1,
  is_auto_generated: false,
  created_at: "2026-10-04T00:00:00Z",
  updated_at: "2026-10-04T00:00:00Z",
  donor_id: "donor-grace",
  donor: {
    id: "donor-grace",
    name: LONG_NAME,
    email: null,
    avatar_url: null,
  },
} as unknown as Task;

function renderBoard() {
  return render(
    <TaskKanbanBoard
      tasks={[task]}
      onMoveTask={vi.fn().mockResolvedValue(true)}
      onEditTask={vi.fn()}
      onCompleteTask={vi.fn()}
      onDeleteTask={vi.fn()}
    />,
  );
}

// At laptop widths four columns share the row, so long partner names used to
// cut off after one line ("Grace Communit…"), yet wrapping without a limit
// stretched cards to five lines. Names get two lines, and the full name stays
// in the text and its tooltip.
it("shows a long partner name on up to two lines, keeping the full name", () => {
  renderBoard();
  const name = screen.getByText(LONG_NAME);
  expect(name.className).not.toMatch(/\btruncate\b/);
  expect(name.className).toContain("wrap-break-word");
  expect(name.className).toContain("line-clamp-2");
  expect(name.getAttribute("title")).toBe(LONG_NAME);

  // No ancestor inside the card caps the name's width.
  const card = name.closest('[data-slot="card"]');
  expect(card).not.toBeNull();
  for (
    let element = name.parentElement;
    element && element !== card;
    element = element.parentElement
  ) {
    expect(element.className).not.toMatch(/\bmax-w-/);
  }
});
