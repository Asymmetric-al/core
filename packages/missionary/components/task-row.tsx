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
    color: "text-info",
    bgColor: "bg-info/10",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  to_do: {
    label: "To-do",
    icon: CheckSquare,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  follow_up: {
    label: "Follow Up",
    icon: UserPlus,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  thank_you: {
    label: "Thank You",
    icon: Heart,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  meeting: {
    label: "Meeting",
    icon: Users,
    color: "text-info",
    bgColor: "bg-info/10",
  },
};

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; badgeColor: string }
> = {
  none: {
    label: "None",
    color: "text-muted-foreground",
    badgeColor: "bg-muted text-muted-foreground border-border",
  },
  low: {
    label: "Low",
    color: "text-info",
    badgeColor: "bg-info/10 text-info border-info/20",
  },
  medium: {
    label: "Medium",
    color: "text-warning",
    badgeColor: "bg-warning/10 text-warning border-warning/20",
  },
  high: {
    label: "High",
    color: "text-destructive",
    badgeColor: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    variant: "secondary" | "info" | "warning" | "success";
  }
> = {
  not_started: { label: "Not Started", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "info" },
  waiting: { label: "Waiting", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  deferred: { label: "Deferred", variant: "secondary" },
};

function getDueDateStatus(dueDate: string | null | undefined) {
  if (!dueDate) return null;
  const date = makeDisplayDate(dueDate);
  const now = makeDisplayDate();
  now.setHours(0, 0, 0, 0);

  if (isPast(date) && !isToday(date)) {
    return {
      label: "Overdue",
      color: "bg-destructive/10 text-destructive border-destructive/20",
    };
  }
  if (isToday(date)) {
    return {
      label: "Due Today",
      color: "bg-warning/10 text-warning border-warning/20",
    };
  }
  if (isTomorrow(date)) {
    return {
      label: "Tomorrow",
      color: "bg-info/10 text-info border-info/20",
    };
  }
  if (isThisWeek(date)) {
    return {
      label: format(date, "EEEE"),
      color: "bg-muted text-foreground border-border",
    };
  }
  return {
    label: format(date, "MMM d"),
    color: "bg-muted text-foreground border-border",
  };
}

type TaskTypeVisual = (typeof TASK_TYPE_CONFIG)[TaskType];
type TaskPriorityVisual = (typeof PRIORITY_CONFIG)[TaskPriority];
type TaskStatusVisual = (typeof STATUS_CONFIG)[TaskStatus];
type DueDateStatus = ReturnType<typeof getDueDateStatus>;

function TaskRowTypeIcon({
  Icon,
  isCompleted,
  bgColor,
  color,
}: {
  Icon: React.ElementType;
  isCompleted: boolean;
  bgColor: string;
  color: string;
}) {
  return (
    <div
      className={cn(
        "flex size-10 items-center justify-center rounded-xl shrink-0",
        isCompleted ? "opacity-50" : "",
        bgColor,
        color,
      )}
    >
      <Icon className="size-4" />
    </div>
  );
}

function TaskRowTitle({
  task,
  isCompleted,
  priorityConfig,
}: {
  task: Task;
  isCompleted: boolean;
  priorityConfig: TaskPriorityVisual;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={cn(
              "font-semibold text-sm tracking-tight",
              isCompleted
                ? "line-through text-muted-foreground"
                : "text-foreground",
            )}
          >
            {task.title}
          </p>
          {task.priority !== "none" && !isCompleted && (
            <Badge
              variant={
                task.priority === "high"
                  ? "destructive"
                  : task.priority === "medium"
                    ? "warning"
                    : "info"
              }
            >
              {priorityConfig.label}
            </Badge>
          )}
          {task.is_auto_generated && !isCompleted && (
            <Badge variant="info">
              <Sparkles className="size-2.5" />
              Auto
            </Badge>
          )}
        </div>
        {task.description && !isCompleted && (
          <p className="text-xs font-medium text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
}

function TaskRowMeta({
  task,
  isCompleted,
  dueDateStatus,
  statusConfig,
}: {
  task: Task;
  isCompleted: boolean;
  dueDateStatus: DueDateStatus;
  statusConfig: TaskStatusVisual;
}) {
  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      {task.donor && (
        <Link href={`/donors?selected=${task.donor.id}`}>
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-muted border border-border hover:border-border transition-colors cursor-pointer">
            <Avatar className="size-4">
              <AvatarImage src={task.donor.avatar_url || undefined} />
              <AvatarFallback>
                {task.donor.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {task.donor.name}
            </span>
          </div>
        </Link>
      )}
      {dueDateStatus && !isCompleted && (
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium",
            dueDateStatus.color,
          )}
        >
          <Clock className="size-3" />
          {dueDateStatus.label}
        </div>
      )}
      {task.reminder_date && !isCompleted && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-info/10 border border-info/20 text-info text-xs font-medium">
          <Bell className="size-3" />
          {format(makeDisplayDate(task.reminder_date), "MMM d")}
        </div>
      )}
      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
    </div>
  );
}

function TaskRowMenu({
  task,
  isCompleted,
  onEdit,
  onComplete,
  onDelete,
}: {
  task: Task;
  isCompleted: boolean;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open actions"
        render={
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 size-3.5 text-muted-foreground" />
          Edit Task
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onComplete}>
          <CheckCircle2 className="mr-2 size-3.5 text-muted-foreground" />
          {isCompleted ? "Reopen Task" : "Mark Complete"}
        </DropdownMenuItem>
        {task.donor && (
          <DropdownMenuItem
            render={<Link href={`/donors?selected=${task.donor.id}`} />}
          >
            <User className="mr-2 size-3.5 text-muted-foreground" />
            View Partner
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} variant="destructive">
          <Trash2 className="mr-2 size-3.5" />
          Delete Task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
  const typeConfig: TaskTypeVisual =
    TASK_TYPE_CONFIG[task.task_type] ?? TASK_TYPE_CONFIG.to_do;
  const priorityConfig: TaskPriorityVisual =
    PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.none;
  const statusConfig: TaskStatusVisual =
    STATUS_CONFIG[task.status] ?? STATUS_CONFIG.not_started;
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
        "relative group flex items-start gap-3 rounded-xl border p-4",
        "transition-shadow duration-[var(--duration-micro)] ease-[var(--ease-out-soft)]",
        isCompleted
          ? "bg-muted/50 border-border"
          : "bg-card border-border hover-lift hover:border-border [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md",
      )}
    >
      <div className="mt-1 relative">
        <Checkbox
          aria-label={`Complete ${task.title}`}
          checked={isCompleted}
          onCheckedChange={onComplete}
        />
      </div>

      <TaskRowTypeIcon
        Icon={Icon}
        isCompleted={isCompleted}
        bgColor={typeConfig.bgColor}
        color={typeConfig.color}
      />

      <div className="flex-1 min-w-0">
        <TaskRowTitle
          task={task}
          isCompleted={isCompleted}
          priorityConfig={priorityConfig}
        />
        <TaskRowMeta
          task={task}
          isCompleted={isCompleted}
          dueDateStatus={dueDateStatus}
          statusConfig={statusConfig}
        />
      </div>

      <TaskRowMenu
        task={task}
        isCompleted={isCompleted}
        onEdit={onEdit}
        onComplete={onComplete}
        onDelete={onDelete}
      />
    </motion.div>
  );
}
