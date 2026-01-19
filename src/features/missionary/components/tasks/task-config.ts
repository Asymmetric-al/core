import * as React from "react";
import {
  Phone,
  Mail,
  CheckSquare,
  UserPlus,
  Heart,
  Users,
  Clock,
} from "lucide-react";
import { format, isToday, isPast, isTomorrow, isThisWeek } from "date-fns";
import type {
  TaskType,
  TaskStatus,
  TaskPriority,
} from "@/lib/missionary/types";

export const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export const TASK_TYPE_CONFIG: Record<
  TaskType,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  call: {
    label: "Call",
    icon: Phone,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  to_do: {
    label: "To-do",
    icon: CheckSquare,
    color: "text-zinc-600",
    bgColor: "bg-zinc-100",
  },
  follow_up: {
    label: "Follow Up",
    icon: UserPlus,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  thank_you: {
    label: "Thank You",
    icon: Heart,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  meeting: {
    label: "Meeting",
    icon: Users,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
};

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; badgeColor: string }
> = {
  none: {
    label: "None",
    color: "text-zinc-400",
    badgeColor: "bg-zinc-100 text-zinc-500 border-zinc-200",
  },
  low: {
    label: "Low",
    color: "text-sky-500",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  medium: {
    label: "Medium",
    color: "text-amber-500",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  high: {
    label: "High",
    color: "text-rose-500",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string }
> = {
  not_started: {
    label: "Not Started",
    color: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  waiting: {
    label: "Waiting",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  deferred: {
    label: "Deferred",
    color: "bg-zinc-100 text-zinc-500 border-zinc-200",
  },
};

export function getDueDateStatus(dueDate: string | null | undefined) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (isPast(date) && !isToday(date)) {
    return {
      label: "Overdue",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }
  if (isToday(date)) {
    return {
      label: "Due Today",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  if (isTomorrow(date)) {
    return {
      label: "Tomorrow",
      color: "bg-sky-50 text-sky-700 border-sky-200",
    };
  }
  if (isThisWeek(date)) {
    return {
      label: format(date, "EEEE"),
      color: "bg-zinc-100 text-zinc-700 border-zinc-200",
    };
  }
  return {
    label: format(date, "MMM d"),
    color: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };
}
