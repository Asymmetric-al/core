"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";

import { useAuth } from "./use-auth";

// Local type definitions (should match missionary app types)
export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "waiting"
  | "completed"
  | "deferred";
export type TaskPriority = "none" | "low" | "medium" | "high";
export type TaskType =
  | "call"
  | "email"
  | "to_do"
  | "follow_up"
  | "thank_you"
  | "meeting";

export interface Task {
  id: string;
  missionary_id: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  task_type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  reminder_date?: string | null;
  donor_id?: string | null;
  donor?: {
    id: string;
    name: string;
    email?: string;
    avatar_url?: string | null;
  } | null;
  sort_key: number;
  is_auto_generated: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface TaskFormData {
  title: string;
  description?: string;
  notes?: string;
  task_type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: Date | null;
  reminder_date?: Date | null;
  donor_id?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  task_type?: TaskType | "all";
  donor_id?: string | null;
  search?: string;
  due_date_range?: {
    start?: Date;
    end?: Date;
  };
}

interface UseTasksOptions {
  donorId?: string | null;
  autoFetch?: boolean;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  filteredTasks: Task[];
  stats: {
    total: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    overdue: number;
    dueToday: number;
    highPriority: number;
  };
  createTask: (data: TaskFormData) => Promise<Task | null>;
  updateTask: (
    id: string,
    data: Partial<TaskFormData | { sort_key: number }>,
  ) => Promise<boolean>;
  moveTask: (
    taskId: string,
    newStatus: TaskStatus,
    newIndex: number,
  ) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  completeTask: (id: string) => Promise<boolean>;
  reopenTask: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.error || `Request failed with status ${response.status}`,
    );
  }

  if (!payload) {
    throw new Error("Request returned an empty response.");
  }

  return payload;
}

function taskPayloadFromFormData(
  data: Partial<TaskFormData | { sort_key: number }>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if ("title" in data) payload.title = data.title;
  if ("description" in data) payload.description = data.description || null;
  if ("task_type" in data) payload.task_type = data.task_type;
  if ("status" in data) payload.status = data.status;
  if ("priority" in data) payload.priority = data.priority;
  if ("due_date" in data && data.due_date instanceof Date) {
    payload.due_date = data.due_date.toISOString();
  } else if ("due_date" in data) {
    payload.due_date = data.due_date ?? null;
  }
  if ("donor_id" in data) payload.donor_id = data.donor_id || null;
  if ("sort_key" in data) payload.sort_key = data.sort_key;

  return payload;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { donorId, autoFetch = true } = options;
  const { profile } = useAuth();
  const mountedRef = useRef(true);
  const initialFetchDone = useRef(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    task_type: "all",
    donor_id: donorId || null,
    search: "",
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (donorId) params.set("donorId", donorId);
      const response = await fetch(`/api/missionary/tasks?${params}`, {
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
        method: "GET",
      });
      const { tasks: formattedTasks } = await parseJsonResponse<{
        tasks: Task[];
      }>(response);

      if (mountedRef.current) {
        setTasks(formattedTasks);
        initialFetchDone.current = true;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch tasks";
      if (mountedRef.current) {
        setError(message);
      }
      console.error("Tasks fetch error:", err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [profile?.id, donorId]);

  useEffect(() => {
    if (autoFetch && profile?.id && !initialFetchDone.current) {
      fetchTasks();
    } else if (!profile?.id && !initialFetchDone.current) {
      setLoading(false);
    }
  }, [fetchTasks, autoFetch, profile?.id]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (
        filters.status &&
        filters.status !== "all" &&
        task.status !== filters.status
      ) {
        return false;
      }
      if (
        filters.priority &&
        filters.priority !== "all" &&
        task.priority !== filters.priority
      ) {
        return false;
      }
      if (
        filters.task_type &&
        filters.task_type !== "all" &&
        task.task_type !== filters.task_type
      ) {
        return false;
      }
      if (filters.donor_id && task.donor_id !== filters.donor_id) {
        return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDescription = task.description
          ?.toLowerCase()
          .includes(searchLower);
        const matchesDonor = task.donor?.name
          .toLowerCase()
          .includes(searchLower);
        if (!matchesTitle && !matchesDescription && !matchesDonor) {
          return false;
        }
      }
      if (filters.due_date_range) {
        if (task.due_date) {
          const dueDate = new Date(task.due_date);
          if (
            filters.due_date_range.start &&
            dueDate < filters.due_date_range.start
          ) {
            return false;
          }
          if (
            filters.due_date_range.end &&
            dueDate > filters.due_date_range.end
          ) {
            return false;
          }
        }
      }
      return true;
    });
  }, [tasks, filters]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      total: tasks.length,
      notStarted: tasks.filter((t) => t.status === "not_started").length,
      inProgress: tasks.filter(
        (t) => t.status === "in_progress" || t.status === "waiting",
      ).length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter((t) => {
        if (t.status === "completed" || t.status === "deferred") return false;
        if (!t.due_date) return false;
        return new Date(t.due_date) < today;
      }).length,
      dueToday: tasks.filter((t) => {
        if (t.status === "completed" || t.status === "deferred") return false;
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return dueDate >= today && dueDate < tomorrow;
      }).length,
      highPriority: tasks.filter(
        (t) => t.priority === "high" && t.status !== "completed",
      ).length,
    };
  }, [tasks]);

  const createTask = useCallback(
    async (data: TaskFormData): Promise<Task | null> => {
      if (!profile?.id) {
        toast.error("Not authenticated");
        return null;
      }

      try {
        // Get the highest sort_key for the new task
        const maxSortKey =
          tasks.length > 0
            ? Math.max(...tasks.map((t) => t.sort_key))
            : Date.now() / 1000;

        const insertData = {
          ...taskPayloadFromFormData(data),
          sort_key: maxSortKey + 100,
        };

        const response = await fetch("/api/missionary/tasks", {
          body: JSON.stringify(insertData),
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const { task: formattedTask } = await parseJsonResponse<{ task: Task }>(
          response,
        );

        if (mountedRef.current) {
          setTasks((prev) =>
            [...prev, formattedTask].sort((a, b) => a.sort_key - b.sort_key),
          );
        }
        toast.success("Task created successfully");
        return formattedTask;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create task";
        toast.error(message);
        console.error("Task create error:", err);
        return null;
      }
    },
    [profile?.id, tasks],
  );

  const updateTask = useCallback(
    async (
      id: string,
      data: Partial<TaskFormData | { sort_key: number }>,
    ): Promise<boolean> => {
      try {
        const response = await fetch(`/api/missionary/tasks/${id}`, {
          body: JSON.stringify(taskPayloadFromFormData(data)),
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "PATCH",
        });

        await parseJsonResponse<{ task: Task }>(response);

        await fetchTasks();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update task";
        toast.error(message);
        console.error("Task update error:", err);
        return false;
      }
    },
    [fetchTasks],
  );

  const moveTask = useCallback(
    async (
      taskId: string,
      newStatus: TaskStatus,
      newIndex: number,
    ): Promise<boolean> => {
      const oldTasks = [...tasks];
      const taskToMove = tasks.find((t) => t.id === taskId);
      if (!taskToMove) return false;

      // Optimistic UI update
      const columnTasks = tasks
        .filter((t) => t.status === newStatus && t.id !== taskId)
        .sort((a, b) => a.sort_key - b.sort_key);

      let newSortKey: number;

      if (columnTasks.length === 0) {
        newSortKey = Date.now() / 1000;
      } else if (newIndex === 0) {
        const firstTask = columnTasks[0];
        newSortKey = firstTask ? firstTask.sort_key - 100 : Date.now() / 1000;
      } else if (newIndex >= columnTasks.length) {
        const lastTask = columnTasks[columnTasks.length - 1];
        newSortKey = lastTask ? lastTask.sort_key + 100 : Date.now() / 1000;
      } else {
        const prevTask = columnTasks[newIndex - 1];
        const nextTask = columnTasks[newIndex];
        newSortKey =
          prevTask && nextTask
            ? (prevTask.sort_key + nextTask.sort_key) / 2
            : Date.now() / 1000;
      }

      const newTasks = tasks
        .map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, sort_key: newSortKey }
            : t,
        )
        .sort((a, b) => a.sort_key - b.sort_key);

      setTasks(newTasks);

      try {
        const response = await fetch(`/api/missionary/tasks/${taskId}`, {
          body: JSON.stringify({
            status: newStatus,
            sort_key: newSortKey,
          }),
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "PATCH",
        });

        await parseJsonResponse<{ task: Task }>(response);
        return true;
      } catch (err) {
        setTasks(oldTasks);
        toast.error("Failed to move task. Reverting...");
        console.error("Move task error:", err);
        return false;
      }
    },
    [tasks],
  );

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/missionary/tasks/${id}`, {
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
        method: "DELETE",
      });

      await parseJsonResponse<{ success: true }>(response);

      if (mountedRef.current) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
      toast.success("Task deleted");
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete task";
      toast.error(message);
      console.error("Task delete error:", err);
      return false;
    }
  }, []);

  const completeTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/missionary/tasks/${id}`, {
        body: JSON.stringify({ status: "completed" }),
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      await parseJsonResponse<{ task: Task }>(response);

      if (mountedRef.current) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "completed" as TaskStatus,
                  completed_at: new Date().toISOString(),
                }
              : t,
          ),
        );
      }
      toast.success("Task completed");
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to complete task";
      toast.error(message);
      console.error("Task complete error:", err);
      return false;
    }
  }, []);

  const reopenTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/missionary/tasks/${id}`, {
        body: JSON.stringify({ status: "not_started" }),
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      await parseJsonResponse<{ task: Task }>(response);

      if (mountedRef.current) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "not_started" as TaskStatus,
                  completed_at: null,
                }
              : t,
          ),
        );
      }
      toast.success("Task reopened");
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reopen task";
      toast.error(message);
      console.error("Task reopen error:", err);
      return false;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    filters,
    setFilters,
    filteredTasks,
    stats,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    completeTask,
    reopenTask,
    refresh: fetchTasks,
  };
}
