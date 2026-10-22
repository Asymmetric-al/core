/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { getFullTaskMoveIndex } from "../../../../packages/lib/hooks/task-move-index";
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
async function loadedTasks(rows = tasks) {
  fetchMock.mockResolvedValueOnce(json({ tasks: rows }));
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
  "restores the original tasks without a duplicate toast after a %s save failure",
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
    expect(toast.error).not.toHaveBeenCalled();
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

it("persists a filtered move after the last shown sibling in the full column", async () => {
  const rows: Task[] = [
    {
      ...tasks[0]!,
      id: "a",
      title: "Visible A",
      task_type: "call",
      sort_key: 100,
    },
    {
      ...tasks[0]!,
      id: "b",
      title: "Hidden B",
      task_type: "email",
      sort_key: 200,
    },
    {
      ...tasks[0]!,
      id: "c",
      title: "Visible C",
      task_type: "call",
      sort_key: 300,
    },
  ];
  const visible = rows.filter((task) => task.task_type === "call");
  expect(visible.map((task) => task.id)).toEqual(["a", "c"]);
  const { result } = await loadedTasks(rows);
  fetchMock.mockResolvedValueOnce(
    json({ task: { ...rows[0], sort_key: 400 } }),
  );
  await act(async () => {
    expect(
      await result.current.moveTask(
        "a",
        "not_started",
        getFullTaskMoveIndex(
          result.current.tasks,
          visible,
          "a",
          "not_started",
          1,
        ),
      ),
    ).toBe(true);
  });
  expect(fetchMock).toHaveBeenCalledWith("/api/missionary/tasks/a", {
    method: "PATCH",
    credentials: "same-origin",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ status: "not_started", sort_key: 400 }),
  });
  expect(result.current.tasks.map((task) => task.id)).toEqual(["b", "c", "a"]);
});

type FilteredMoveCase = {
  name: string;
  rows: { id: string; rank: number; shown: boolean; status?: TaskStatus }[];
  status: TaskStatus;
  index: number;
  rank: number;
  order: string[];
};
const filteredMoves: FilteredMoveCase[] = [
  {
    name: "hidden middle sibling",
    rows: [
      { id: "a", rank: 100, shown: true },
      { id: "b", rank: 200, shown: false },
      { id: "c", rank: 300, shown: true },
    ],
    status: "not_started",
    index: 1,
    rank: 400,
    order: ["b", "c", "a"],
  },
  {
    name: "hidden first sibling",
    rows: [
      { id: "h", rank: 50, shown: false },
      { id: "a", rank: 100, shown: true },
      { id: "c", rank: 300, shown: true },
    ],
    status: "not_started",
    index: 1,
    rank: 400,
    order: ["h", "c", "a"],
  },
  {
    name: "hidden last sibling",
    rows: [
      { id: "a", rank: 100, shown: true },
      { id: "c", rank: 300, shown: true },
      { id: "h", rank: 400, shown: false },
    ],
    status: "not_started",
    index: 1,
    rank: 350,
    order: ["c", "a", "h"],
  },
  {
    name: "cross-column insertion before the next shown anchor",
    rows: [
      { id: "a", rank: 100, shown: true },
      { id: "h1", rank: 50, shown: false, status: "waiting" },
      { id: "c", rank: 100, shown: true, status: "waiting" },
      { id: "h2", rank: 150, shown: false, status: "waiting" },
      { id: "d", rank: 200, shown: true, status: "waiting" },
    ],
    status: "waiting",
    index: 1,
    rank: 175,
    order: ["h1", "c", "h2", "a", "d"],
  },
  {
    name: "cross-column insertion after the last shown anchor",
    rows: [
      { id: "a", rank: 100, shown: true },
      { id: "c", rank: 100, shown: true, status: "waiting" },
      { id: "h", rank: 200, shown: false, status: "waiting" },
    ],
    status: "waiting",
    index: 1,
    rank: 150,
    order: ["c", "a", "h"],
  },
  {
    name: "no shown destination siblings",
    rows: [
      { id: "a", rank: 100, shown: true },
      { id: "h1", rank: 100, shown: false, status: "waiting" },
      { id: "h2", rank: 200, shown: false, status: "waiting" },
    ],
    status: "waiting",
    index: 0,
    rank: 300,
    order: ["h1", "h2", "a"],
  },
  {
    name: "first shown position after hidden leading siblings",
    rows: [
      { id: "a", rank: 100, shown: true },
      { id: "h1", rank: 50, shown: false, status: "waiting" },
      { id: "c", rank: 100, shown: true, status: "waiting" },
      { id: "h2", rank: 200, shown: false, status: "waiting" },
    ],
    status: "waiting",
    index: 0,
    rank: 75,
    order: ["h1", "a", "c", "h2"],
  },
  {
    name: "unfiltered final position",
    rows: [
      { id: "a", rank: 100, shown: true },
      { id: "b", rank: 200, shown: true },
      { id: "c", rank: 300, shown: true },
    ],
    status: "not_started",
    index: 2,
    rank: 400,
    order: ["b", "c", "a"],
  },
  {
    name: "empty full destination",
    rows: [{ id: "a", rank: 100, shown: true }],
    status: "waiting",
    index: 0,
    rank: 2000,
    order: ["a"],
  },
];
const visibilityFilters = [
  { name: "type", matches: (task: Task) => task.task_type === "call" },
  { name: "priority", matches: (task: Task) => task.priority === "high" },
  {
    name: "search",
    matches: (task: Task) => task.title.toLowerCase().includes("shown"),
  },
];
it.each(
  filteredMoves.flatMap((scenario) =>
    visibilityFilters.map((filter) => ({
      ...scenario,
      filter: filter.name,
      matches: filter.matches,
    })),
  ),
)(
  "preserves $name through the $filter filter and actual HTTP hook",
  async (scenario) => {
    const rows: Task[] = scenario.rows.map((row) => ({
      ...tasks[0]!,
      id: row.id,
      title: `${row.shown ? "Shown" : "Hidden"} ${row.id}`,
      task_type: row.shown ? "call" : "email",
      priority: row.shown ? "high" : "none",
      status: row.status ?? "not_started",
      sort_key: row.rank,
    }));
    const visible = rows.filter(scenario.matches);
    expect(visible.map((task) => task.id)).toEqual(
      scenario.rows.filter((row) => row.shown).map((row) => row.id),
    );
    const { result } = await loadedTasks(rows);
    const before = structuredClone(result.current.tasks);
    const index = getFullTaskMoveIndex(
      result.current.tasks,
      visible,
      "a",
      scenario.status,
      scenario.index,
    );
    expect(result.current.tasks).toEqual(before);
    fetchMock.mockResolvedValueOnce(
      json({
        task: { ...rows[0], status: scenario.status, sort_key: scenario.rank },
      }),
    );
    await act(async () => {
      expect(await result.current.moveTask("a", scenario.status, index)).toBe(
        true,
      );
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/missionary/tasks/a", {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: scenario.status,
        sort_key: scenario.rank,
      }),
    });
    expect(
      result.current.tasks
        .filter((task) => task.status === scenario.status)
        .map((task) => task.id),
    ).toEqual(scenario.order);
    const byId = (left: Task, right: Task) => left.id.localeCompare(right.id);
    expect(
      result.current.tasks.filter((task) => task.id !== "a").sort(byId),
    ).toEqual(rows.filter((task) => task.id !== "a").sort(byId));
    expect(toast.error).not.toHaveBeenCalled();
  },
);

it.each([-1, 0.5, 99])(
  "rejects a stale or invalid displayed position %s without changing input",
  (index) => {
    const before = structuredClone(tasks);
    expect(() =>
      getFullTaskMoveIndex(tasks, tasks, "a", "not_started", index),
    ).toThrow(RangeError);
    expect(tasks).toEqual(before);
    expect(fetchMock).not.toHaveBeenCalled();
  },
);
