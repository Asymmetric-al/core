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

function record(action: string) {
  document.dispatchEvent(
    new CustomEvent("fixture-task-toolbar-action", { detail: action }),
  );
}

export function useAuth() {
  return { profile: null };
}

export function useTasks() {
  return {
    loading: false,
    error: null,
    filteredTasks: [task],
    stats: {
      notStarted: 1,
      inProgress: 0,
      completed: 0,
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
    deleteTask: async () => {
      record("delete");
      return true;
    },
    moveTask: async () => {
      record("move");
      return true;
    },
  };
}
