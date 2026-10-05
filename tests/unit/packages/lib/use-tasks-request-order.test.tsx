/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { useTasks } from "../../../../packages/lib/hooks/use-tasks";

import type { Task } from "../../../../packages/lib/hooks/use-tasks";

const auth: { id: string | null } = vi.hoisted(() => ({
  id: "missionary-fixture",
}));
vi.mock("../../../../packages/lib/hooks/use-auth", () => ({
  useAuth: () => ({ profile: auth.id ? { id: auth.id } : null }),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const created: Task = {
  id: "created-task",
  missionary_id: "missionary-fixture",
  donor_id: "donor-fixture",
  title: "Call partner",
  task_type: "call",
  status: "not_started",
  priority: "none",
  sort_key: 1,
  is_auto_generated: false,
  created_at: "2026-10-05T00:00:00Z",
  updated_at: "2026-10-05T00:00:00Z",
};

function pendingResponse() {
  return Promise.withResolvers<Response>();
}

function response(tasks: Task[]) {
  return new Response(JSON.stringify({ tasks }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  auth.id = "missionary-fixture";
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

it("keeps the post-save refresh after auth bootstrap starts the initial fetch", async () => {
  auth.id = null;
  const older = pendingResponse();
  const newer = pendingResponse();
  fetchMock
    .mockReturnValueOnce(older.promise)
    .mockReturnValueOnce(newer.promise);
  const { result, rerender } = renderHook(() =>
    useTasks({ donorId: "donor-fixture" }),
  );
  expect(result.current.loading).toBe(false);
  expect(fetchMock).not.toHaveBeenCalled();

  auth.id = "missionary-fixture";
  rerender();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  let refresh = Promise.resolve();
  act(() => {
    refresh = result.current.refresh();
  });
  await act(async () => {
    newer.resolve(response([created]));
    await refresh;
  });
  await act(async () => {
    older.resolve(response([]));
  });
  expect(result.current.filteredTasks.map((task) => task.id)).toEqual([
    "created-task",
  ]);
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBeNull();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("keeps the newest refresh result when an older empty response arrives last", async () => {
  const older = pendingResponse();
  const newer = pendingResponse();
  fetchMock
    .mockReturnValueOnce(older.promise)
    .mockReturnValueOnce(newer.promise);
  const { result } = renderHook(() =>
    useTasks({ donorId: "donor-fixture", autoFetch: false }),
  );
  let first = Promise.resolve();
  let second = Promise.resolve();
  act(() => {
    first = result.current.refresh();
    second = result.current.refresh();
  });
  await act(async () => {
    newer.resolve(response([created]));
    await second;
  });
  expect(result.current.filteredTasks.map((task) => task.id)).toEqual([
    "created-task",
  ]);
  await act(async () => {
    older.resolve(response([]));
    await first;
  });
  expect(result.current.filteredTasks.map((task) => task.id)).toEqual([
    "created-task",
  ]);
  expect(result.current.error).toBeNull();
  expect(result.current.loading).toBe(false);
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    "/api/missionary/tasks?donorId=donor-fixture",
    "/api/missionary/tasks?donorId=donor-fixture",
  ]);
});

it("ignores an older failure while the newest refresh is pending", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const older = pendingResponse();
  const newer = pendingResponse();
  fetchMock
    .mockReturnValueOnce(older.promise)
    .mockReturnValueOnce(newer.promise);
  const { result } = renderHook(() => useTasks({ autoFetch: false }));
  let first = Promise.resolve();
  let second = Promise.resolve();
  act(() => {
    first = result.current.refresh();
    second = result.current.refresh();
  });
  await act(async () => {
    older.resolve(
      new Response(JSON.stringify({ error: "Older failure" }), { status: 500 }),
    );
    await first;
  });
  expect(result.current.loading).toBe(true);
  expect(result.current.error).toBeNull();
  await act(async () => {
    newer.resolve(response([created]));
    await second;
  });
  expect(result.current.tasks.map((task) => task.id)).toEqual(["created-task"]);
  expect(result.current.loading).toBe(false);
});

it("preserves the newest error when an older success arrives afterward", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const older = pendingResponse();
  const newer = pendingResponse();
  fetchMock
    .mockReturnValueOnce(older.promise)
    .mockReturnValueOnce(newer.promise);
  const { result } = renderHook(() => useTasks({ autoFetch: false }));
  let first = Promise.resolve();
  let second = Promise.resolve();
  act(() => {
    first = result.current.refresh();
    second = result.current.refresh();
  });
  await act(async () => {
    newer.resolve(
      new Response(JSON.stringify({ error: "Current failure" }), {
        status: 500,
      }),
    );
    await second;
  });
  await act(async () => {
    older.resolve(response([created]));
    await first;
  });
  expect(result.current.tasks).toEqual([]);
  expect(result.current.error).toBe("Current failure");
  expect(result.current.loading).toBe(false);
});
