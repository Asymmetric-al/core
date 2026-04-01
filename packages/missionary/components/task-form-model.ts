import { z } from "zod";

import type { Task, TaskPriority, TaskStatus, TaskType } from "../types";

const TASK_TYPE_VALUES = [
  "call",
  "email",
  "to_do",
  "follow_up",
  "thank_you",
  "meeting",
] as const satisfies readonly TaskType[];

const TASK_STATUS_VALUES = [
  "not_started",
  "in_progress",
  "waiting",
  "completed",
  "deferred",
] as const satisfies readonly TaskStatus[];

const TASK_PRIORITY_VALUES = [
  "none",
  "low",
  "medium",
  "high",
] as const satisfies readonly TaskPriority[];

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  description: z.string(),
  notes: z.string(),
  task_type: z.enum(TASK_TYPE_VALUES),
  status: z.enum(TASK_STATUS_VALUES),
  priority: z.enum(TASK_PRIORITY_VALUES),
  due_date: z.date().nullable(),
  reminder_date: z.date().nullable(),
  donor_id: z.string(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

interface CreateInitialTaskFormValuesOptions {
  defaultDonorId?: string | null;
  initialStatus?: TaskStatus;
  task?: Task | null;
}

export function createInitialTaskFormValues({
  defaultDonorId,
  initialStatus,
  task,
}: CreateInitialTaskFormValuesOptions): TaskFormValues {
  if (task) {
    return {
      title: task.title || "",
      description: task.description || "",
      notes: task.notes || "",
      task_type: task.task_type || "to_do",
      status: task.status || "not_started",
      priority: task.priority || "none",
      due_date: task.due_date ? new Date(task.due_date) : null,
      reminder_date: task.reminder_date ? new Date(task.reminder_date) : null,
      donor_id: task.donor_id || defaultDonorId || "",
    };
  }

  return {
    title: "",
    description: "",
    notes: "",
    task_type: "to_do",
    status: initialStatus || "not_started",
    priority: "none",
    due_date: null,
    reminder_date: null,
    donor_id: defaultDonorId || "",
  };
}

export function toMissionaryTaskPayload({
  missionaryId,
  values,
}: {
  missionaryId: string;
  values: TaskFormValues;
}) {
  return {
    missionary_id: missionaryId,
    title: values.title.trim(),
    description: values.description.trim() || null,
    notes: values.notes.trim() || null,
    task_type: values.task_type,
    status: values.status,
    priority: values.priority,
    due_date: values.due_date?.toISOString() || null,
    reminder_date: values.reminder_date?.toISOString() || null,
    donor_id: values.donor_id.trim() || null,
    is_auto_generated: false,
    updated_at: new Date().toISOString(),
  };
}
