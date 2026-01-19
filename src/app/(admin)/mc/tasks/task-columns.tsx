"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Phone,
  Mail,
  Users,
  MessageSquare,
  CheckSquare,
  FileText,
  Clock,
  Calendar,
  Bell,
  AlertCircle,
  Check,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { Task, TaskType, TaskPriority, TaskStatus } from "./types";
import { getPriorityConfig, getStatusConfig } from "./types";

const TYPE_ICONS: Record<
  TaskType,
  React.ComponentType<{ className?: string }>
> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  follow_up: MessageSquare,
  todo: CheckSquare,
  review: FileText,
};

function formatDueDate(dateStr?: string, timeStr?: string) {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  const isOverdue = dateOnly < today;
  const isToday = dateOnly.getTime() === today.getTime();
  const isTomorrow = dateOnly.getTime() === tomorrow.getTime();

  let label = "";
  if (isToday) {
    label = "Today";
  } else if (isTomorrow) {
    label = "Tomorrow";
  } else if (isOverdue) {
    label = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  } else {
    const diffDays = Math.ceil(
      (dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays <= 7) {
      label = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
        date,
      );
    } else {
      label = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    }
  }

  if (timeStr) {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours ?? "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    label += ` at ${displayHour}:${minutes} ${ampm}`;
  }

  return { label, isOverdue, isToday };
}

interface ColumnOptions {
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (task: Task) => void;
}

export function getTaskColumns({
  onViewTask,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
}: ColumnOptions): ColumnDef<Task>[] {
  return [
    {
      id: "complete",
      header: "",
      cell: ({ row }) => {
        const task = row.original;
        const isCompleted = task.status === "completed";
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task);
            }}
            className={cn(
              "size-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
              isCompleted
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-muted-foreground/30 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
            )}
          >
            {isCompleted && <Check className="size-3" />}
          </button>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => {
        const task = row.original;
        const TypeIcon = TYPE_ICONS[task.type];
        const isCompleted = task.status === "completed";
        return (
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "mt-0.5 p-1.5 rounded-lg shrink-0",
                isCompleted
                  ? "bg-muted text-muted-foreground"
                  : "bg-muted/50 text-foreground",
              )}
            >
              <TypeIcon className="size-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <button
                onClick={() => onViewTask(task)}
                className={cn(
                  "font-medium text-sm text-left leading-tight hover:text-primary hover:underline decoration-primary/30 underline-offset-4 transition-all truncate",
                  isCompleted && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </button>
              {task.linked_entity && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Avatar className="size-4">
                    <AvatarImage src={task.linked_entity.avatar} />
                    <AvatarFallback className="text-[8px] bg-muted">
                      {task.linked_entity.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {task.linked_entity.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      },
      meta: { label: "Task" },
      size: 350,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as TaskStatus;
        const config = getStatusConfig(status)!;
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] uppercase font-semibold tracking-wide px-2 py-0.5 h-5 shadow-none rounded-lg border",
              config.color,
            )}
          >
            {config.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: {
        label: "Status",
        filterVariant: "select",
        filterOptions: [
          { label: "To Do", value: "todo" },
          { label: "In Progress", value: "in_progress" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
        ],
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.getValue("priority") as TaskPriority;
        const config = getPriorityConfig(priority)!;
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] uppercase font-semibold tracking-wide px-2 py-0.5 h-5 shadow-none rounded-lg border",
              config.color,
            )}
          >
            {config.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: {
        label: "Priority",
        filterVariant: "select",
        filterOptions: [
          { label: "Urgent", value: "urgent" },
          { label: "High", value: "high" },
          { label: "Medium", value: "medium" },
          { label: "Low", value: "low" },
        ],
      },
    },
    {
      accessorKey: "due_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => {
        const task = row.original;
        const formatted = formatDueDate(task.due_date, task.due_time);
        if (!formatted)
          return <span className="text-xs text-muted-foreground">No date</span>;

        const isCompleted = task.status === "completed";
        return (
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              formatted.isOverdue && !isCompleted
                ? "text-red-600 dark:text-red-400"
                : formatted.isToday && !isCompleted
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground",
            )}
          >
            {formatted.isOverdue && !isCompleted && (
              <AlertCircle className="size-3" />
            )}
            <Calendar className="size-3" />
            <span>{formatted.label}</span>
          </div>
        );
      },
      meta: { label: "Due Date" },
    },
    {
      accessorKey: "assigned_to_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To" />
      ),
      cell: ({ row }) => {
        const task = row.original;
        if (!task.assigned_to_name) {
          return (
            <span className="text-xs text-muted-foreground italic">
              Unassigned
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6 border border-border">
              <AvatarImage src={task.assigned_to_avatar} />
              <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">
                {task.assigned_to_name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">
              {task.assigned_to_name}
            </span>
          </div>
        );
      },
      meta: { label: "Assigned To" },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as TaskType;
        const TypeIcon = TYPE_ICONS[type];
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
            <TypeIcon className="size-3.5" />
            <span>{type.replace("_", " ")}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: {
        label: "Type",
        filterVariant: "select",
        filterOptions: [
          { label: "Call", value: "call" },
          { label: "Email", value: "email" },
          { label: "Meeting", value: "meeting" },
          { label: "Follow Up", value: "follow_up" },
          { label: "To-Do", value: "todo" },
          { label: "Review", value: "review" },
        ],
      },
      enableHiding: true,
    },
    {
      accessorKey: "reminders",
      header: "Reminders",
      cell: ({ row }) => {
        const reminders = row.original.reminders;
        if (!reminders?.length) return null;
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bell className="size-3" />
            <span>{reminders.length}</span>
          </div>
        );
      },
      enableHiding: true,
      meta: { label: "Reminders" },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="size-8 p-0 text-muted-foreground hover:text-foreground rounded-xl"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-2xl border-border p-2"
              >
                <DropdownMenuItem
                  onClick={() => onViewTask(task)}
                  className="rounded-xl px-3 py-2 text-sm"
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEditTask(task)}
                  className="rounded-xl px-3 py-2 text-sm"
                >
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onToggleComplete(task)}
                  className="rounded-xl px-3 py-2 text-sm"
                >
                  {task.status === "completed"
                    ? "Mark Incomplete"
                    : "Mark Complete"}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border my-1" />
                <DropdownMenuItem
                  onClick={() => onDeleteTask(task.id)}
                  className="rounded-xl px-3 py-2 text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
