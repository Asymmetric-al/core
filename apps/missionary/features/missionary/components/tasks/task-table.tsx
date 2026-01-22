"use client";

import * as React from "react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import {
  MoreHorizontal,
  CheckCircle2,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@asym/lib/utils";
import type { Task } from "@/lib/missionary/types";
import { TASK_TYPE_CONFIG, PRIORITY_CONFIG } from "./task-config";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import { Button } from "@asym/ui/components/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { motion, AnimatePresence } from "motion/react";

interface TaskTableProps {
  tasks: Task[];
  selectedTaskIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onTaskClick: (task: Task) => void;
  onStatusChange: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskTable({
  tasks,
  selectedTaskIds,
  onToggleSelection,
  onSelectAll,
  onTaskClick,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskTableProps) {
  const allSelected =
    tasks.length > 0 && selectedTaskIds.length === tasks.length;
  const someSelected =
    selectedTaskIds.length > 0 && selectedTaskIds.length < tasks.length;

  const getDueDateLabel = (date?: string | null) => {
    if (!date) return { label: "No date", color: "text-muted-foreground" };
    const d = new Date(date);
    if (isToday(d))
      return { label: "Today", color: "text-amber-600 font-semibold" };
    if (isTomorrow(d))
      return { label: "Tomorrow", color: "text-foreground font-medium" };
    if (isPast(d))
      return {
        label: format(d, "MMM d"),
        color: "text-destructive font-semibold",
      };
    return { label: format(d, "MMM d"), color: "text-muted-foreground" };
  };

  return (
    <div className="w-full bg-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-14 px-4 py-4">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={(checked) => {
                    if (checked) onSelectAll(tasks.map((t) => t.id));
                    else onSelectAll([]);
                  }}
                  aria-label="Select all tasks"
                />
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Task
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Priority
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Due Date
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Partner
              </th>
              <th className="w-14 px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {tasks.map((task, idx) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const isCompleted = task.status === "completed";
                const typeConfig = TASK_TYPE_CONFIG[task.task_type];
                const priorityConfig = PRIORITY_CONFIG[task.priority];
                const dueDateInfo = getDueDateLabel(task.due_date);

                return (
                  <motion.tr
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: idx * 0.02 },
                    }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={cn(
                      "group transition-colors hover:bg-muted/50 cursor-pointer",
                      isSelected && "bg-muted/60",
                    )}
                    onClick={() => onTaskClick(task)}
                  >
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelection(task.id)}
                        aria-label={`Select ${task.title}`}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(task);
                          }}
                          className="flex-shrink-0 transition-transform active:scale-90"
                          aria-label={
                            isCompleted
                              ? "Mark as incomplete"
                              : "Mark as complete"
                          }
                        >
                          {isCompleted ? (
                            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-border group-hover:border-primary transition-colors" />
                          )}
                        </button>
                        <div className="flex flex-col min-w-0">
                          <span
                            className={cn(
                              "text-sm font-medium text-foreground truncate max-w-[280px]",
                              isCompleted &&
                                "text-muted-foreground line-through",
                            )}
                          >
                            {task.title}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <typeConfig.icon
                              className={cn("h-3 w-3", typeConfig.color)}
                            />
                            <span className="text-[11px] text-muted-foreground">
                              {typeConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium capitalize",
                          task.status === "not_started" &&
                            "bg-muted text-muted-foreground",
                          task.status === "in_progress" &&
                            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
                          task.status === "waiting" &&
                            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
                          task.status === "completed" &&
                            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
                          task.status === "deferred" &&
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
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
                        <span className="text-xs text-muted-foreground">
                          {priorityConfig.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon
                          className={cn("h-3.5 w-3.5", dueDateInfo.color)}
                        />
                        <span className={cn("text-xs", dueDateInfo.color)}>
                          {dueDateInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {task.donor ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={task.donor.avatar_url || undefined}
                            />
                            <AvatarFallback className="text-[10px] font-medium bg-muted">
                              {task.donor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-foreground truncate max-w-[100px]">
                            {task.donor.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => onEdit(task)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onStatusChange(task)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {isCompleted ? "Reopen" : "Complete"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(task)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
