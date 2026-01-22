"use client";

import * as React from "react";
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
import { cn } from "@asym/ui/lib/utils";
import type { Task } from "@/lib/missionary/types";
import { TASK_TYPE_CONFIG, PRIORITY_CONFIG } from "./task-config";
import { Button } from "@asym/ui/components/shadcn/button";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";

interface TaskDetailsSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
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
        <SheetHeader className="p-4 sm:p-6 pb-4 border-b bg-card shrink-0">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                typeConfig.bgColor,
              )}
            >
              <typeConfig.icon className={cn("h-5 w-5", typeConfig.color)} />
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
              className="h-8 w-8 shrink-0 absolute top-4 right-4"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Button
              onClick={() => onStatusChange(task)}
              size="sm"
              className={cn(
                "h-9",
                isCompleted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "",
              )}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                </>
              ) : (
                <>
                  <Circle className="mr-2 h-4 w-4" /> Mark Done
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-9"
            >
              <Edit2 className="mr-2 h-4 w-4" /> Edit
            </Button>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task)}
              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete task</span>
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Status
                </label>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium capitalize",
                    task.status === "not_started" &&
                      "bg-muted text-muted-foreground",
                    task.status === "in_progress" &&
                      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
                    task.status === "waiting" &&
                      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
                    task.status === "completed" &&
                      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
                  )}
                >
                  {task.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Priority
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      task.priority === "high"
                        ? "bg-destructive"
                        : task.priority === "medium"
                          ? "bg-amber-500"
                          : task.priority === "low"
                            ? "bg-blue-500"
                            : "bg-muted-foreground/30",
                    )}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {priorityConfig.label}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Due Date
                </label>
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {task.due_date
                      ? format(new Date(task.due_date), "MMM d, yyyy")
                      : "No deadline"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created
                </label>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {format(new Date(task.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Related Partner
              </label>
              {task.donor ? (
                <div className="p-3 sm:p-4 rounded-xl bg-muted/50 border flex items-center justify-between group hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={task.donor.avatar_url || undefined} />
                      <AvatarFallback className="text-sm font-medium bg-background">
                        {task.donor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {task.donor.name}
                      </p>
                      {task.donor.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {task.donor.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center">
                  <User className="h-6 w-6 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No partner linked
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </label>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-muted/50 border min-h-[80px] text-sm text-foreground leading-relaxed">
                {task.description || (
                  <span className="text-muted-foreground italic">
                    No description provided.
                  </span>
                )}
              </div>
            </div>

            {task.notes && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-amber-500" />
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Internal Notes
                  </label>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                  {task.notes}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30 shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Updated {format(new Date(task.updated_at), "MMM d, h:mm a")}
            </span>
            {task.completed_at && (
              <span className="text-emerald-600 dark:text-emerald-400">
                Completed {format(new Date(task.completed_at), "MMM d")}
              </span>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
