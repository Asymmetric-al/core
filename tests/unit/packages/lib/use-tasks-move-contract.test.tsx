/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { useTasks } from "../../../../packages/lib/hooks/use-tasks";

import type {
  Task,
  TaskStatus,
} from "../../../../packages/lib/hooks/use-tasks";

vi.mock("../../../../packages/lib/hooks/use-auth", () => ({
  useAuth: () => ({ profile: { id: "missionary-fixture" } }),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const tasks: Task[] = [
  {
    id: "a",
    missionary_id: "missionary-fixture",
    title: "Call Anna",
    task_type: "call",
    status: "not_started",
    priority: "none",
    sort_key: 100,
    is_auto_generated: false,
    created_at: "2026-10-22T00:00:00Z",
    updated_at: "2026-10-22T00:00:00Z",
  },
  {
    id: "b",
    missionary_id: "missionary-fixture",
    title: "Send newsletter",
    task_type: "email",
    status: "not_started",
    priority: "none",
    sort_key: 200,
    is_auto_generated: false,
    created_at: "2026-10-22T00:00:00Z",
    updated_at: "2026-10-22T00:00:00Z",
  },
  {
    id: "c",
    missionary_id: "missionary-fixture",
    title: "Earlier waiting",
    task_type: "to_do",
    status: "waiting",
    priority: "none",
    sort_key: 100,
    is_auto_generated: false,
    created_at: "2026-10-22T00:00:00Z",
    updated_at: "2026-10-22T00:00:00Z",
  },
  {
    id: "d",
    missionary_id: "missionary-fixture",
    title: "Later waiting",
    task_type: "to_do",
    status: "waiting",
    priority: "none",
    sort_key: 300,
    is_auto_generated: false,
    created_at: "2026-10-22T00:00:00Z",
    updated_at: "2026-10-22T00:00:00Z",
  },
];
const fetchMock = vi.fn<typeof fetch>();
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
async function loadedTasks() {
  fetchMock.mockResolvedValueOnce(json({ tasks }));
  const hook = renderHook(() => useTasks({ autoFetch: false }));
  await act(async () => {
    await hook.result.current.refresh();
  });
  fetchMock.mockClear();
  return hook;
}
beforeEach(() => {
  fetchMock.mockReset();
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(Date, "now").mockReturnValue(2_000_000);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it.each<{
  name: string;
  status: TaskStatus;
  index: number;
  sortKey: number;
  order: string[];
}>([
  {
    name: "same-column final index",
    status: "not_started",
    index: 1,
    sortKey: 300,
    order: ["b", "a"],
  },
  {
    name: "between two destination tasks",
    status: "waiting",
    index: 1,
    sortKey: 200,
    order: ["c", "a", "d"],
  },
  {
    name: "empty destination",
    status: "in_progress",
    index: 0,
    sortKey: 2000,
    order: ["a"],
  },
])(
  "preserves the HTTP and optimistic-save contract for $name",
  async ({ status, index, sortKey, order }) => {
    const { result } = await loadedTasks();
    const response = Promise.withResolvers<Response>();
    fetchMock.mockReturnValueOnce(response.promise);
    let saved = Promise.resolve(false);
    let settled = false;
    act(() => {
      saved = result.current.moveTask("a", status, index).then((value) => {
        settled = true;
        return value;
      });
    });
    expect(settled).toBe(false);
    expect(
      result.current.tasks
        .filter((task) => task.status === status)
        .map((task) => task.id),
    ).toEqual(order);
    expect(result.current.tasks.find((task) => task.id === "a")).toMatchObject({
      status,
      sort_key: sortKey,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/missionary/tasks/a", {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, sort_key: sortKey }),
    });
    await act(async () => {
      response.resolve(
        json({ task: { ...tasks[0], status, sort_key: sortKey } }),
      );
      expect(await saved).toBe(true);
    });
    expect(
      result.current.tasks
        .filter((task) => task.status === status)
        .map((task) => task.id),
    ).toEqual(order);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  },
);

it.each(["denied", "network"] as const)(
  "restores the original tasks after a %s save failure",
  async (failure) => {
    const { result } = await loadedTasks();
    const response = Promise.withResolvers<Response>();
    fetchMock.mockReturnValueOnce(response.promise);
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    let saved = Promise.resolve(true);
    act(() => {
      saved = result.current.moveTask("a", "waiting", 1);
    });
    expect(result.current.tasks.find((task) => task.id === "a")?.status).toBe(
      "waiting",
    );
    await act(async () => {
      if (failure === "denied")
        response.resolve(json({ error: "No task access" }, 403));
      else response.reject(new Error("Network unavailable"));
      expect(await saved).toBe(false);
    });
    expect(result.current.tasks).toEqual(tasks);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      "Failed to move task. Reverting...",
    );
    expect(logged).toHaveBeenCalledTimes(1);
  },
);

it("does not submit a missing task", async () => {
  const { result } = await loadedTasks();
  await act(async () => {
    expect(await result.current.moveTask("missing", "waiting", 0)).toBe(false);
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(result.current.tasks).toEqual(tasks);
});
