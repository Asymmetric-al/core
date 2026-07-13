"use client";

import { motion, useReducedMotion } from "@asym/lib/motion";
import { transitionStandard } from "@asym/lib/motion-presets";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { cn } from "@asym/ui/lib/utils";
import { format, isPast, isToday, isTomorrow, isThisWeek } from "date-fns";
import {
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Heart,
  Sparkles,
  Trash2,
  Phone,
  Mail,
  CheckSquare,
  UserPlus,
  Users,
  Bell,
  Pencil,
  User,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import type { Task, TaskType, TaskStatus, TaskPriority } from "../types";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

const TASK_TYPE_CONFIG: Record<
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

const PRIORITY_CONFIG: Record<
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

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
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

function getDueDateStatus(dueDate: string | null | undefined) {
  if (!dueDate) return null;
  const date = makeDisplayDate(dueDate);
  const now = makeDisplayDate();
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

export function TaskRow({
  task,
  onComplete,
  onEdit,
  onDelete,
  index,
}: {
  task: Task;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const typeConfig = TASK_TYPE_CONFIG[task.task_type] ?? TASK_TYPE_CONFIG.to_do;
  const priorityConfig = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.none;
  const statusConfig = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.not_started;
  const dueDateStatus = getDueDateStatus(task.due_date);
  const isCompleted = task.status === "completed";
  const Icon = typeConfig.icon;

  // Stagger entrance only — no per-row `layout`, no per-row hover
  // springs, no per-badge `whileHover` (those competed with the
  // existing CSS hover rules and ran on touch tap).
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { ...transitionStandard, delay: Math.min(index, 6) * 0.03 }
      }
      className={cn(
        "relative group flex items-start gap-4 p-5 border rounded-2xl",
        "transition-[border-color,box-shadow] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)]",
        isCompleted
          ? "bg-zinc-50/50 border-zinc-100"
          : "bg-white border-zinc-200 hover-lift hover:border-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md",
      )}
    >
      <div className="mt-1 relative">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onComplete}
          className="size-5 rounded-md border-zinc-300 data-checked:bg-emerald-500 data-checked:border-emerald-500"
        />
      </div>

      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl shrink-0",
          isCompleted ? "opacity-50" : "",
          typeConfig.bgColor,
          typeConfig.color,
        )}
      >
        <Icon className="size-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={cn(
                  "font-bold text-sm tracking-tight",
                  isCompleted ? "line-through text-zinc-400" : "text-zinc-900",
                )}
              >
                {task.title}
              </p>
              {task.priority !== "none" && !isCompleted && (
                <Badge
                  className={cn(
                    "border text-[9px] font-black uppercase tracking-widest px-1.5 h-4",
                    priorityConfig.badgeColor,
                  )}
                >
                  {priorityConfig.label}
                </Badge>
              )}
              {task.is_auto_generated && !isCompleted && (
                <Badge className="bg-violet-50 text-violet-700 border border-violet-200 text-[9px] font-black uppercase tracking-widest px-1.5 h-4 gap-1">
                  <Sparkles className="size-2.5" />
                  Auto
                </Badge>
              )}
            </div>
            {task.description && !isCompleted && (
              <p className="text-xs font-medium text-zinc-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {task.donor && (
            <Link href={`/donors?selected=${task.donor.id}`}>
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-100 border border-zinc-200 hover:border-zinc-300 transition-colors cursor-pointer">
                <Avatar className="size-4">
                  <AvatarImage src={task.donor.avatar_url || undefined} />
                  <AvatarFallback className="text-[8px] font-bold bg-zinc-200 text-zinc-600">
                    {task.donor.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                  {task.donor.name}
                </span>
              </div>
            </Link>
          )}
          {dueDateStatus && !isCompleted && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                dueDateStatus.color,
              )}
            >
              <Clock className="size-3" />
              {dueDateStatus.label}
            </div>
          )}
          {task.reminder_date && !isCompleted && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-bold uppercase tracking-wider">
              <Bell className="size-3" />
              {format(makeDisplayDate(task.reminder_date), "MMM d")}
            </div>
          )}
          <Badge
            className={cn(
              "border text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
              statusConfig.color,
            )}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent
          align="end"
          className="rounded-xl border-zinc-200 p-1.5 shadow-xl min-w-[160px]"
        >
          <DropdownMenuItem
            onClick={onEdit}
            className="rounded-lg text-xs font-medium py-2 cursor-pointer"
          >
            <Pencil className="mr-2 size-3.5 text-zinc-400" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onComplete}
            className="rounded-lg text-xs font-medium py-2 cursor-pointer"
          >
            <CheckCircle2 className="mr-2 size-3.5 text-zinc-400" />
            {isCompleted ? "Reopen Task" : "Mark Complete"}
          </DropdownMenuItem>
          {task.donor && (
            <DropdownMenuItem
              render={<Link href={`/donors?selected=${task.donor.id}`} />}
              className="rounded-lg text-xs font-medium py-2 cursor-pointer"
            >
              <User className="mr-2 size-3.5 text-zinc-400" />
              View Partner
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="my-1 bg-zinc-100" />
          <DropdownMenuItem
            onClick={onDelete}
            className="rounded-lg text-xs font-medium py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="mr-2 size-3.5" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
