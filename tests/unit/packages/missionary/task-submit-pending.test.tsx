/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TaskDialog } from "../../../../packages/missionary/components/task-dialog";
import type { Task } from "../../../../packages/missionary/types";

/**
 * WP2b, AL-2675: the dialog saves through the missionary workspace's task
 * routes (server commands, behind the own-API wrapper) instead of writing
 * `missionary_tasks` with the browser client, and lists partners from the
 * redacted partner route. `write` records each task request's method, path
 * and body; `single` stands for the route's response, as it stood for the
 * table write's result before.
 */
const mutation = vi.hoisted(() => ({
  write: vi.fn(),
  single: vi.fn(),
}));

vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: { id: "missionary-1" } }),
}));
vi.mock("@asym/database/own-api", () => ({
  ownApiFetch: async (path: string, init: RequestInit = {}) => {
    if (path.startsWith("/api/missionary/donors")) {
      return Response.json({
        donors: [{ id: "partner-1", name: "Existing partner" }],
        hasMore: false,
        nextOffset: null,
      });
    }
    mutation.write({
      method: init.method,
      path,
      body: JSON.parse(String(init.body)),
    });
    const { data, error } = (await mutation.single()) as {
      data: unknown;
      error: { message: string } | null;
    };
    return error
      ? Response.json({ error: error.message }, { status: 500 })
      : Response.json({ task: data });
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
      fireEvent.change(screen.getByRole("textbox", { name: /Title/ }), {
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
    // The route takes the missionary from the resolved assignment, so the
    // body names the task and never the missionary.
    expect(mutation.write).toHaveBeenCalledWith({
      method: editing ? "PATCH" : "POST",
      path: editing ? "/api/missionary/tasks/task-1" : "/api/missionary/tasks",
      body: expect.objectContaining({ title: task.title }),
    });
    expect(mutation.write.mock.calls[0]![0].body).not.toHaveProperty(
      "missionary_id",
    );
    await act(async () => {
      finish({ data: task, error: null });
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  },
);

/** Opens the dialog and waits for its first field to take focus. */
async function openTaskDialog() {
  render(<TaskDialog open onOpenChange={vi.fn()} />);
  const title = screen.getByRole("textbox", { name: /Title/ });
  await waitFor(() => expect(document.activeElement).toBe(title));
  return title;
}

it("parks focus on the form while saving, then returns it to Create Task on failure", async () => {
  let finish!: (value: { data: null; error: { message: string } }) => void;
  mutation.single.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const title = await openTaskDialog();
  fireEvent.change(title, { target: { value: task.title } });
  const save = screen.getByRole("button", { name: "Create Task", exact: true });
  save.focus();
  fireEvent.click(save);
  await screen.findByRole("button", { name: "Creating task…", exact: true });
  const form = screen.getByRole("dialog").querySelector("form");
  expect(document.activeElement).toBe(form);
  expect(form?.tabIndex).toBe(-1);
  await act(async () => {
    finish({ data: null, error: { message: "Fixture rejected task" } });
  });
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Create Task", exact: true }),
    ),
  );
});

it("moves focus to the title when validation stops the save", async () => {
  const title = await openTaskDialog();
  const save = screen.getByRole("button", { name: "Create Task", exact: true });
  save.focus();
  fireEvent.click(save);
  await waitFor(() => expect(document.activeElement).toBe(title));
  expect(title.getAttribute("aria-invalid")).toBe("true");
  expect(mutation.write).not.toHaveBeenCalled();
});
