/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TaskDialog } from "../../../../packages/missionary/components/task-dialog";
import type { Task } from "../../../../packages/missionary/types";

const mutation = vi.hoisted(() => ({
  write: vi.fn(),
  single: vi.fn(),
}));

vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: { id: "missionary-1" } }),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => {
    const query = {
      select: () => query,
      eq: () => query,
      order: async () => ({
        data: [{ id: "partner-1", name: "Existing partner" }],
        error: null,
      }),
      update: (payload: unknown) => {
        mutation.write(payload);
        return query;
      },
      insert: (payload: unknown) => {
        mutation.write(payload);
        return query;
      },
      single: mutation.single,
    };
    return { from: () => query };
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const task: Task = {
  id: "task-1",
  missionary_id: "missionary-1",
  title: "Call existing partner",
  task_type: "call",
  status: "not_started",
  priority: "none",
  sort_key: 1,
  is_auto_generated: false,
  created_at: "2026-10-03T00:00:00Z",
  updated_at: "2026-10-03T00:00:00Z",
};

it.each([
  { editing: false, action: "Create Task", pending: "Creating task…" },
  { editing: true, action: "Update Task", pending: "Updating task…" },
])(
  "names the pending $action while preserving its payload and single submission",
  async ({ editing, action, pending }) => {
    let finish!: (value: { data: Task; error: null }) => void;
    mutation.single.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const onSuccess = vi.fn();
    render(
      <TaskDialog
        open
        task={editing ? task : undefined}
        onOpenChange={vi.fn()}
        onSuccess={onSuccess}
      />,
    );
    if (!editing) {
      fireEvent.change(screen.getByRole("textbox", { name: /Task Title/ }), {
        target: { value: task.title },
      });
    }
    fireEvent.click(screen.getByRole("button", { name: action, exact: true }));
    const button = await screen.findByRole("button", {
      name: pending,
      exact: true,
    });
    expect(button).toHaveProperty("disabled", true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(button);
    expect(mutation.write).toHaveBeenCalledTimes(1);
    expect(mutation.write).toHaveBeenCalledWith(
      expect.objectContaining({
        missionary_id: "missionary-1",
        title: task.title,
      }),
    );
    await act(async () => {
      finish({ data: task, error: null });
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  },
);
