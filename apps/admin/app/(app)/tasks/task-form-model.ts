import { format } from "date-fns";
import { z } from "zod";

import type {
  LinkedEntityType,
  StaffMember,
  Task,
  TaskPriority,
  TaskReminder,
  TaskStatus,
  TaskType,
} from "./types";

const TASK_TYPE_VALUES = [
  "call",
  "email",
  "meeting",
  "follow_up",
  "todo",
  "review",
] as const satisfies readonly TaskType[];

const TASK_PRIORITY_VALUES = [
  "urgent",
  "high",
  "medium",
  "low",
] as const satisfies readonly TaskPriority[];

const TASK_STATUS_VALUES = [
  "todo",
  "in_progress",
  "completed",
  "cancelled",
] as const satisfies readonly TaskStatus[];

const TASK_REMINDER_TYPE_VALUES = [
  "email",
  "notification",
  "both",
] as const satisfies readonly TaskReminder["type"][];

const LINKED_ENTITY_TYPE_VALUES = [
  "donor",
  "missionary",
  "contact",
  "organization",
] as const satisfies readonly LinkedEntityType[];

export type TaskFormReminder = Pick<
  TaskReminder,
  "id" | "remind_at" | "type" | "sent"
>;

const linkedEntitySchema = z
  .object({
    id: z.string(),
    type: z.enum(LINKED_ENTITY_TYPE_VALUES),
    name: z.string(),
    avatar: z.string().optional(),
    email: z.string().optional(),
  })
  .optional();

export const taskReminderSchema = z.object({
  id: z.string().min(1, "Reminder id is required"),
  remind_at: z.string().min(1, "Reminder time is required"),
  type: z.enum(TASK_REMINDER_TYPE_VALUES),
  sent: z.boolean(),
});

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string(),
  type: z.enum(TASK_TYPE_VALUES),
  priority: z.enum(TASK_PRIORITY_VALUES),
  status: z.enum(TASK_STATUS_VALUES),
  dueDate: z.date().optional(),
  dueTime: z.string(),
  assignedTo: z.string().optional(),
  linkedEntity: linkedEntitySchema,
  reminders: z.array(taskReminderSchema),
  tags: z.array(z.string().trim().min(1)),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

function createReminderId(
  reminder: Partial<TaskReminder>,
  index: number,
): string {
  if (typeof reminder.id === "string" && reminder.id.trim().length > 0) {
    return reminder.id;
  }

  const reminderTimestamp = reminder.remind_at ?? `index-${index}`;
  const reminderType = reminder.type ?? "notification";
  return `rem-${reminderType}-${reminderTimestamp}-${index}`;
}

function createNewReminderId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `rem-${crypto.randomUUID()}`;
  }

  return `rem-new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeReminders(
  reminders: Partial<TaskReminder>[] | TaskReminder[] | undefined,
): TaskFormReminder[] {
  return (reminders ?? []).map((reminder, index) => ({
    id: createReminderId(reminder, index),
    remind_at: reminder.remind_at ?? "",
    type: reminder.type ?? "notification",
    sent: reminder.sent ?? false,
  }));
}

export function createDefaultReminder(
  dueDate?: Date,
  now = new Date(),
): TaskFormReminder {
  const reminderAt = dueDate
    ? new Date(dueDate.getTime() - 60 * 60 * 1000)
    : now;

  return {
    id: createNewReminderId(),
    remind_at: reminderAt.toISOString(),
    type: "notification",
    sent: false,
  };
}

export function createInitialTaskFormValues(
  task?: Task | null,
): TaskFormValues {
  if (task) {
    return {
      title: task.title,
      description: task.description ?? "",
      type: task.type,
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      dueTime: task.due_time ?? "",
      assignedTo: task.assigned_to,
      linkedEntity: task.linked_entity,
      reminders: normalizeReminders(task.reminders),
      tags: task.tags ?? [],
    };
  }

  return {
    title: "",
    description: "",
    type: "todo",
    priority: "medium",
    status: "todo",
    dueDate: new Date(),
    dueTime: "",
    assignedTo: undefined,
    linkedEntity: undefined,
    reminders: [],
    tags: [],
  };
}

interface ToTaskSavePayloadOptions {
  taskId?: string;
  staffMembers: StaffMember[];
  values: TaskFormValues;
}

export function toTaskSavePayload({
  taskId,
  staffMembers,
  values,
}: ToTaskSavePayloadOptions): Partial<Task> {
  const assignedStaff = staffMembers.find(
    (staffMember) => staffMember.id === values.assignedTo,
  );

  return {
    id: taskId,
    title: values.title,
    description: values.description.trim() || undefined,
    type: values.type,
    priority: values.priority,
    status: values.status,
    due_date: values.dueDate ? format(values.dueDate, "yyyy-MM-dd") : undefined,
    due_time: values.dueTime || undefined,
    assigned_to: values.assignedTo,
    assigned_to_name: assignedStaff?.name,
    assigned_to_avatar: assignedStaff?.avatar_url,
    linked_entity: values.linkedEntity,
    reminders: values.reminders as TaskReminder[],
    tags: values.tags,
  };
}
