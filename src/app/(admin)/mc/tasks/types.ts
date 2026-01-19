export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";
export type TaskType =
  | "call"
  | "email"
  | "meeting"
  | "follow_up"
  | "todo"
  | "review";

export type LinkedEntityType =
  | "donor"
  | "missionary"
  | "contact"
  | "organization";

export interface LinkedEntity {
  id: string;
  type: LinkedEntityType;
  name: string;
  avatar?: string;
  email?: string;
}

export interface TaskReminder {
  id: string;
  task_id: string;
  remind_at: string;
  type: "email" | "notification" | "both";
  sent: boolean;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  due_date?: string;
  due_time?: string;
  created_by: string;
  assigned_to?: string;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  linked_entity?: LinkedEntity;
  reminders: TaskReminder[];
  comments: TaskComment[];
  tags: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
}

export const TASK_PRIORITIES: {
  value: TaskPriority;
  label: string;
  color: string;
}[] = [
  {
    value: "urgent",
    label: "Urgent",
    color:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400",
  },
  {
    value: "high",
    label: "High",
    color:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400",
  },
  {
    value: "medium",
    label: "Medium",
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400",
  },
  {
    value: "low",
    label: "Low",
    color:
      "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/50 dark:text-slate-400",
  },
];

export const TASK_STATUSES: {
  value: TaskStatus;
  label: string;
  color: string;
}[] = [
  {
    value: "todo",
    label: "To Do",
    color:
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/50 dark:text-slate-400",
  },
  {
    value: "in_progress",
    label: "In Progress",
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400",
  },
  {
    value: "completed",
    label: "Completed",
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color:
      "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-950/50 dark:text-zinc-500",
  },
];

export const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "follow_up", label: "Follow Up" },
  { value: "todo", label: "To-Do" },
  { value: "review", label: "Review" },
];

export function getPriorityConfig(priority: TaskPriority) {
  return (
    TASK_PRIORITIES.find((p) => p.value === priority) || TASK_PRIORITIES[2]
  );
}

export function getStatusConfig(status: TaskStatus) {
  return TASK_STATUSES.find((s) => s.value === status) || TASK_STATUSES[0];
}
