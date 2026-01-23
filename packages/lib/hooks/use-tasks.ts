// @ts-nocheck
// TODO: This file has app-level imports and should be moved to the missionary app
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createBrowserClient } from "@asym/database/supabase";
import { useAuth } from "./use-auth";
import type {
  Task,
  TaskFormData,
  TaskFilters,
  TaskStatus,
} from "@/lib/missionary/types";
import { toast } from "sonner";

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

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { donorId, autoFetch = true } = options;
  const { profile } = useAuth();
  const supabase = useMemo(() => createBrowserClient(), []);
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
      let query = supabase
        .from("missionary_tasks")
        .select(
          `
          *,
          donor:donors!missionary_tasks_donor_id_fkey(id, name, email, avatar_url)
        `,
        )
        .eq("missionary_id", profile.id)
        .order("sort_key", { ascending: true })
        .order("created_at", { ascending: false });

      if (donorId) {
        query = query.eq("donor_id", donorId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedTasks: Task[] = (data || []).map((task) => ({
        ...task,
        donor: task.donor || null,
      }));

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
  }, [profile?.id, supabase, donorId]);

  useEffect(() => {
    if (autoFetch && profile?.id && !initialFetchDone.current) {
      fetchTasks();
    } else if (!profile?.id && !initialFetchDone.current) {
      setLoading(false);
    }
  }, [fetchTasks, autoFetch, profile?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel("missionary_tasks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "missionary_tasks",
          filter: `missionary_id=eq.${profile.id}`,
        },
        () => {
          fetchTasks();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, supabase, fetchTasks]);

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
          missionary_id: profile.id,
          title: data.title,
          description: data.description || null,
          notes: data.notes || null,
          task_type: data.task_type,
          status: data.status,
          priority: data.priority,
          due_date: data.due_date?.toISOString() || null,
          reminder_date: data.reminder_date?.toISOString() || null,
          donor_id: data.donor_id || null,
          sort_key: maxSortKey + 100,
          is_auto_generated: false,
        };

        const { data: newTask, error: insertError } = await supabase
          .from("missionary_tasks")
          .insert(insertData)
          .select(
            `
          *,
          donor:donors!missionary_tasks_donor_id_fkey(id, name, email, avatar_url)
        `,
          )
          .single();

        if (insertError) throw insertError;

        const formattedTask: Task = {
          ...newTask,
          donor: newTask.donor || null,
        };

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
    [profile?.id, supabase, tasks],
  );

  const updateTask = useCallback(
    async (
      id: string,
      data: Partial<TaskFormData | { sort_key: number }>,
    ): Promise<boolean> => {
      try {
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if ("title" in data) updateData.title = data.title;
        if ("description" in data)
          updateData.description = data.description || null;
        if ("notes" in data) updateData.notes = data.notes || null;
        if ("task_type" in data) updateData.task_type = data.task_type;
        if ("status" in data) updateData.status = data.status;
        if ("priority" in data) updateData.priority = data.priority;
        if ("due_date" in data && data.due_date instanceof Date)
          updateData.due_date = data.due_date.toISOString();
        else if ("due_date" in data) updateData.due_date = data.due_date;

        if ("reminder_date" in data && data.reminder_date instanceof Date)
          updateData.reminder_date = data.reminder_date.toISOString();
        else if ("reminder_date" in data)
          updateData.reminder_date = data.reminder_date;

        if ("donor_id" in data) updateData.donor_id = data.donor_id || null;
        if ("sort_key" in data) updateData.sort_key = data.sort_key;

        const { error: updateError } = await supabase
          .from("missionary_tasks")
          .update(updateData)
          .eq("id", id);

        if (updateError) throw updateError;

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
    [supabase, fetchTasks],
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
        const { error: updateError } = await supabase
          .from("missionary_tasks")
          .update({
            status: newStatus,
            sort_key: newSortKey,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskId);

        if (updateError) throw updateError;
        return true;
      } catch (err) {
        setTasks(oldTasks);
        toast.error("Failed to move task. Reverting...");
        console.error("Move task error:", err);
        return false;
      }
    },
    [tasks, supabase],
  );

  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase
          .from("missionary_tasks")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

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
    },
    [supabase],
  );

  const completeTask = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from("missionary_tasks")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) throw updateError;

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
    },
    [supabase],
  );

  const reopenTask = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from("missionary_tasks")
          .update({
            status: "not_started",
            completed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) throw updateError;

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
    },
    [supabase],
  );

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
