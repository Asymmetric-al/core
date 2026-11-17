/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Activity } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { ReactNode } from "react";

type FixtureTask = {
  id: string;
  title: string;
  status: string;
  task_type: string;
  completed_at?: string | null;
};

const store = vi.hoisted(() => ({
  initial: [] as FixtureTask[],
  // Each status change waits for the test to settle it, like a request.
  settle: [] as ((ok: boolean) => void)[],
}));

// A stateful stand-in for useTasks: a successful change moves the task between
// the active and completed lists, as the real hook does.
vi.mock("@asym/lib/hooks", async () => {
  const React = await import("react");
  return {
    useTasks: () => {
      const [list, setList] = React.useState(() =>
        store.initial.map((task) => ({ ...task })),
      );
      const change = (id: string, status: string) =>
        new Promise<boolean>((resolve) => {
          store.settle.push((ok) => {
            if (ok) {
              setList((previous) =>
                previous.map((task) =>
                  task.id === id
                    ? {
                        ...task,
                        status,
                        completed_at:
                          status === "completed"
                            ? "2026-10-03T00:00:00.000Z"
                            : null,
                      }
                    : task,
                ),
              );
            }
            resolve(ok);
          });
        });
      return {
        filteredTasks: list,
        loading: false,
        completeTask: (id: string) => change(id, "completed"),
        reopenTask: (id: string) => change(id, "not_started"),
        deleteTask: vi.fn(),
        refresh: vi.fn(),
      };
    },
  };
});
// Editing is a separate service-backed flow; retain its actual trigger.
vi.mock("@asym/missionary/components/task-dialog", () => ({
  TaskDialog: ({ trigger }: { trigger: ReactNode }) => trigger,
}));

const { DonorTasks } =
  await import("../../../../apps/missionary/app/donors/donor-tasks");

function task(id: string, title: string, status = "not_started"): FixtureTask {
  return {
    id,
    title,
    status,
    task_type: "to_do",
    completed_at: status === "completed" ? "2026-10-01T00:00:00.000Z" : null,
  };
}

async function settleNext(ok = true) {
  await waitFor(() => expect(store.settle.length).toBeGreaterThan(0));
  const settle = store.settle.shift()!;
  await act(async () => settle(ok));
}

function checkbox(title: string, checked: boolean) {
  return screen.getByRole("checkbox", {
    name: `Mark ${title} complete`,
    checked,
  });
}

beforeEach(() => {
  store.settle = [];
  store.initial = [
    task("task-anna", "Call Anna"),
    task("task-ben", "Email Ben"),
    task("task-cara", "Thank Cara", "completed"),
  ];
});
afterEach(cleanup);

it("follows a completed task to its checkbox in the Completed list", async () => {
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  const active = checkbox("Call Anna", false);
  act(() => active.focus());
  fireEvent.click(active);

  await settleNext();

  expect(active.isConnected).toBe(false);
  expect(document.activeElement).toBe(checkbox("Call Anna", true));
});

it("follows a reopened task back to its checkbox in the active list", async () => {
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  const completed = checkbox("Thank Cara", true);
  act(() => completed.focus());
  fireEvent.click(completed);

  await settleNext();

  expect(completed.isConnected).toBe(false);
  expect(document.activeElement).toBe(checkbox("Thank Cara", false));
});

it("follows a task completed from its row menu once the request lands", async () => {
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  const trigger = screen.getByRole("button", { name: "Actions for Email Ben" });
  act(() => trigger.focus());
  fireEvent.click(trigger);
  fireEvent.click(await screen.findByRole("menuitem", { name: "Complete" }));
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));

  await settleNext();

  expect(trigger.isConnected).toBe(false);
  expect(document.activeElement).toBe(checkbox("Email Ben", true));
});

it("does not apply a handled completion again when the page is shown again", async () => {
  function Page({ mode }: { mode: "visible" | "hidden" }) {
    return (
      <Activity mode={mode}>
        <DonorTasks donorId="donor-anna" donorName="Anna" />
      </Activity>
    );
  }
  const { rerender } = render(<Page mode="visible" />);
  const active = checkbox("Call Anna", false);
  act(() => active.focus());
  fireEvent.click(active);
  await settleNext();
  expect(document.activeElement).toBe(checkbox("Call Anna", true));

  // Back from another route: Next hides the page with Activity and later shows
  // it again, by which time focus has fallen back to <body>.
  rerender(<Page mode="hidden" />);
  const otherRoute = document.body.appendChild(
    document.createElement("button"),
  );
  act(() => otherRoute.focus());
  otherRoute.remove();
  expect(document.activeElement).toBe(document.body);
  rerender(<Page mode="visible" />);

  expect(document.activeElement).toBe(document.body);
});

it("keeps focus on the checkbox when completing fails", async () => {
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  const active = checkbox("Call Anna", false);
  act(() => active.focus());
  fireEvent.click(active);

  await settleNext(false);

  expect(document.activeElement).toBe(checkbox("Call Anna", false));
});

it("leaves focus alone when the user has moved on before the request lands", async () => {
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  const active = checkbox("Call Anna", false);
  act(() => active.focus());
  fireEvent.click(active);
  const elsewhere = screen.getByRole("button", { name: "Add task" });
  act(() => elsewhere.focus());

  await settleNext();

  expect(document.activeElement).toBe(elsewhere);
});

// Only the five most recent completed tasks are listed.
it("falls back to the next active task when the completed one is not listed", async () => {
  store.initial = [
    ...Array.from({ length: 5 }, (_, index) =>
      task(`done-${index}`, `Done ${index}`, "completed"),
    ),
    task("task-anna", "Call Anna"),
    task("task-ben", "Email Ben"),
  ];
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  const active = checkbox("Call Anna", false);
  act(() => active.focus());
  fireEvent.click(active);

  await settleNext();

  expect(
    screen.queryByRole("checkbox", { name: "Mark Call Anna complete" }),
  ).toBeNull();
  expect(document.activeElement).toBe(checkbox("Email Ben", false));
});

it("falls back to Add task when no other task can take focus", async () => {
  store.initial = [
    ...Array.from({ length: 5 }, (_, index) =>
      task(`done-${index}`, `Done ${index}`, "completed"),
    ),
    task("task-anna", "Call Anna"),
  ];
  render(<DonorTasks donorId="donor-anna" donorName="Anna" />);
  const active = checkbox("Call Anna", false);
  act(() => active.focus());
  fireEvent.click(active);

  await settleNext();

  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Add task" }),
  );
});
