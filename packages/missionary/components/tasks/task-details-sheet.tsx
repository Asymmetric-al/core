"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { Separator } from "@asym/ui/components/shadcn/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { cn } from "@asym/ui/lib/utils";
import { format } from "date-fns";
import {
  X,
  Calendar,
  CheckCircle2,
  Circle,
  User,
  FileText,
  StickyNote,
  Clock,
  Trash2,
  Edit2,
  ExternalLink,
} from "lucide-react";
import * as React from "react";

import { TASK_TYPE_CONFIG, PRIORITY_CONFIG } from "./task-config";

import type { Task, TaskPriority, TaskStatus } from "../../types";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

interface TaskDetailsSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

type TaskTypeVisual = (typeof TASK_TYPE_CONFIG)[keyof typeof TASK_TYPE_CONFIG];
type TaskPriorityVisual =
  (typeof PRIORITY_CONFIG)[keyof typeof PRIORITY_CONFIG];

function taskStatusBadgeClass(status: TaskStatus): string {
  switch (status) {
    case "not_started":
      return "bg-muted text-muted-foreground";
    case "in_progress":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300";
    case "waiting":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300";
    case "deferred":
      return "";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function taskPriorityDotClass(priority: TaskPriority): string {
  switch (priority) {
    case "high":
      return "bg-destructive";
    case "medium":
      return "bg-amber-500";
    case "low":
      return "bg-blue-500";
    case "none":
      return "bg-muted-foreground/30";
    default: {
      const exhaustive: never = priority;
      return exhaustive;
    }
  }
}

function TaskDetailsSheetHeader({
  task,
  isCompleted,
  typeConfig,
  onOpenChange,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: Task;
  isCompleted: boolean;
  typeConfig: TaskTypeVisual;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <SheetHeader className="p-4 sm:p-6 pb-4 border-b bg-card shrink-0">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center shrink-0",
            typeConfig.bgColor,
          )}
        >
          <typeConfig.icon className={cn("size-5", typeConfig.color)} />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="font-medium">{typeConfig.label}</span>
            <span>•</span>
            <span className="font-mono">{task.id.slice(0, 8)}</span>
          </div>
          <SheetTitle className="text-base sm:text-lg font-semibold text-foreground leading-tight line-clamp-2">
            {task.title}
          </SheetTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="size-8 shrink-0 absolute top-4 right-4"
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <Button
          onClick={() => onStatusChange(task)}
          size="sm"
          className={cn(
            "h-9",
            isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "",
          )}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="mr-2 size-4" /> Completed
            </>
          ) : (
            <>
              <Circle className="mr-2 size-4" /> Mark Done
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(task)}
          className="h-9"
        >
          <Edit2 className="mr-2 size-4" /> Edit
        </Button>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task)}
          className="size-9 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Delete task</span>
        </Button>
      </div>
    </SheetHeader>
  );
}

function TaskDetailsMetaGrid({
  task,
  priorityConfig,
}: {
  task: Task;
  priorityConfig: TaskPriorityVisual;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Status
        </p>
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium capitalize",
            taskStatusBadgeClass(task.status),
          )}
        >
          {task.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Priority
        </p>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "size-2 rounded-full",
              taskPriorityDotClass(task.priority),
            )}
          />
          <span className="text-sm font-medium text-foreground">
            {priorityConfig.label}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Due Date
        </p>
        <div className="flex items-center gap-2 text-foreground">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-sm">
            {task.due_date
              ? format(makeDisplayDate(task.due_date), "MMM d, yyyy")
              : "No deadline"}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Created
        </p>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4" />
          <span className="text-sm">
            {format(makeDisplayDate(task.created_at), "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}

function TaskDetailsPartnerSection({ donor }: { donor: Task["donor"] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Related Partner
      </p>
      {donor ? (
        <div className="p-3 sm:p-4 rounded-xl bg-muted/50 border flex items-center justify-between group hover:bg-muted transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={donor.avatar_url || undefined} />
              <AvatarFallback className="text-sm font-medium bg-background">
                {donor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {donor.name}
              </p>
              {donor.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {donor.email}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center">
          <User className="size-6 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No partner linked</p>
        </div>
      )}
    </div>
  );
}

function TaskDetailsDescriptionSection({
  description,
}: {
  description: Task["description"];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Description
        </p>
      </div>
      <div className="p-3 sm:p-4 rounded-xl bg-muted/50 border min-h-[80px] text-sm text-foreground leading-relaxed">
        {description || (
          <span className="text-muted-foreground italic">
            No description provided.
          </span>
        )}
      </div>
    </div>
  );
}

function TaskDetailsNotesSection({ notes }: { notes: Task["notes"] }) {
  if (!notes) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StickyNote className="size-4 text-amber-500" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Internal Notes
        </p>
      </div>
      <div className="p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
        {notes}
      </div>
    </div>
  );
}

function TaskDetailsSheetFooter({ task }: { task: Task }) {
  return (
    <div className="p-4 border-t bg-muted/30 shrink-0">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Updated {format(makeDisplayDate(task.updated_at), "MMM d, h:mm a")}
        </span>
        {task.completed_at && (
          <span className="text-emerald-600 dark:text-emerald-400">
            Completed {format(makeDisplayDate(task.completed_at), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}

export function TaskDetailsSheet({
  task,
  open,
  onOpenChange,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskDetailsSheetProps) {
  if (!task) return null;

  const isCompleted = task.status === "completed";
  const typeConfig = TASK_TYPE_CONFIG[task.task_type];
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <TaskDetailsSheetHeader
          task={task}
          isCompleted={isCompleted}
          typeConfig={typeConfig}
          onOpenChange={onOpenChange}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 sm:p-6 space-y-6">
            <TaskDetailsMetaGrid task={task} priorityConfig={priorityConfig} />

            <Separator />

            <TaskDetailsPartnerSection donor={task.donor} />

            <TaskDetailsDescriptionSection description={task.description} />

            <TaskDetailsNotesSection notes={task.notes} />
          </div>
        </ScrollArea>

        <TaskDetailsSheetFooter task={task} />
      </SheetContent>
    </Sheet>
  );
}
