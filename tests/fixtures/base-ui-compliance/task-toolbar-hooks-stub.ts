import { useSyncExternalStore } from "react";

import type { Task } from "../../../packages/lib/hooks/use-tasks";

const task: Task = {
  id: "task-toolbar-fixture",
  missionary_id: "missionary-toolbar-fixture",
  title: "Call partner",
  task_type: "call",
  status: "not_started",
  priority: "none",
  sort_key: 1,
  is_auto_generated: false,
  created_at: "2026-10-04T00:00:00Z",
  updated_at: "2026-10-04T00:00:00Z",
};

export type FixtureDeleteMode = "success" | "false" | "throw" | "deferred";

let snapshot = {
  tasks: [task],
  deleteMode: "success" as FixtureDeleteMode,
  deletePending: false,
};
const listeners = new Set<() => void>();
let pendingDelete: { id: string; resolve: (success: boolean) => void } | null =
  null;

function publish(next: typeof snapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useTaskDeleteFixtureState() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

export function setTaskDeleteFixtureMode(mode: FixtureDeleteMode) {
  if (pendingDelete) return;
  publish({ ...snapshot, deleteMode: mode });
}

export function settleTaskDeleteFixture(success: boolean) {
  const pending = pendingDelete;
  if (!pending) return;
  pendingDelete = null;
  publish({
    ...snapshot,
    tasks: success
      ? snapshot.tasks.filter((item) => item.id !== pending.id)
      : snapshot.tasks,
    deletePending: false,
  });
  pending.resolve(success);
}

export function completeTaskDeleteFixtureFromRefresh() {
  publish({
    ...snapshot,
    tasks: snapshot.tasks.map((item) => ({ ...item, status: "completed" })),
  });
}

function record(action: string) {
  document.dispatchEvent(
    new CustomEvent("fixture-task-toolbar-action", { detail: action }),
  );
}

export function useAuth() {
  return { profile: null };
}

export function useTasks() {
  const current = useTaskDeleteFixtureState();
  return {
    loading: false,
    error: null,
    filteredTasks: current.tasks,
    stats: {
      notStarted: current.tasks.filter((item) => item.status === "not_started")
        .length,
      inProgress: 0,
      completed: current.tasks.filter((item) => item.status === "completed")
        .length,
      overdue: 0,
      dueToday: 0,
    },
    refresh: () => record("refresh"),
    completeTask: async () => {
      record("complete");
      return true;
    },
    reopenTask: async () => {
      record("reopen");
      return true;
    },
    deleteTask: async (id: string) => {
      record("delete");
      if (snapshot.deleteMode === "false") return false;
      if (snapshot.deleteMode === "throw") throw new Error("Offline fixture");
      if (snapshot.deleteMode === "deferred") {
        publish({ ...snapshot, deletePending: true });
        return new Promise<boolean>((resolve) => {
          pendingDelete = { id, resolve };
        });
      }
      publish({
        ...snapshot,
        tasks: snapshot.tasks.filter((item) => item.id !== id),
      });
      return true;
    },
    moveTask: async () => {
      record("move");
      return true;
    },
  };
}
