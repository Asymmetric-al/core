"use client";

import { useTasks } from "@asym/lib/hooks";
import { motion } from "@asym/lib/motion";
import { TaskDialog } from "@asym/missionary/components/task-dialog";
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
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  MoreHorizontal,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import * as React from "react";

import { TASK_TYPE_CONFIG } from "./donors-model";

import type { Task } from "@asym/lib/hooks/use-tasks";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function DonorTasks({
  donorId,
  donorName,
}: {
  donorId: string;
  donorName: string;
}) {
  const {
    filteredTasks,
    loading,
    completeTask,
    reopenTask,
    deleteTask,
    refresh,
  } = useTasks({ donorId });
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const activeTasks = filteredTasks.filter(
    (task) => task.status !== "completed" && task.status !== "deferred",
  );
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "completed",
  );

  const handleComplete = async (task: Task) => {
    if (task.status === "completed") {
      await reopenTask(task.id);
      return;
    }

    await completeTask(task.id);
  };

  const handleTaskSuccess = () => {
    refresh();
    setEditingTask(null);
    setTaskDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-xl border bg-white p-4"
          >
            <div className="mt-0.5 size-5 rounded-md bg-zinc-200" />
            <div className="size-9 rounded-lg bg-zinc-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-zinc-200" />
              <div className="h-3 w-1/2 rounded bg-zinc-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Tasks</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Follow-ups and actions for {donorName}
          </p>
        </div>
        <TaskDialog
          task={editingTask}
          defaultDonorId={donorId}
          open={taskDialogOpen}
          onOpenChange={(open) => {
            setTaskDialogOpen(open);
            if (!open) {
              setEditingTask(null);
            }
          }}
          onSuccess={handleTaskSuccess}
          trigger={
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="sm" className="h-8 rounded-xl px-3 text-xs">
                <Plus className="mr-1.5 size-3.5" /> Add Task
              </Button>
            </motion.div>
          }
        />
      </motion.div>

      {filteredTasks.length === 0 ? (
        <motion.div
          {...fadeInUp}
          className="flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 py-12 text-center"
        >
          <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-white shadow-sm">
            <ListTodo className="size-6 text-zinc-300" />
          </div>
          <p className="text-sm font-semibold text-zinc-900">No tasks yet</p>
          <p className="mt-1 max-w-[240px] text-xs text-zinc-400">
            Create a task to track follow-ups with this partner.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {activeTasks.length > 0 ? (
            <div className="space-y-2">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Active ({activeTasks.length})
              </p>
              {activeTasks.map((task, index) => {
                const typeConfig =
                  TASK_TYPE_CONFIG[task.task_type] ?? TASK_TYPE_CONFIG.to_do;
                if (!typeConfig) {
                  return null;
                }

                const Icon = typeConfig.icon;
                const isOverdue =
                  task.due_date &&
                  makeDisplayDate(task.due_date) < makeDisplayDate();
                const isDueToday =
                  task.due_date &&
                  makeDisplayDate(task.due_date).toDateString() ===
                    makeDisplayDate().toDateString();

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 transition-all hover:border-zinc-200"
                  >
                    <motion.div whileTap={{ scale: 0.97 }} className="mt-0.5">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handleComplete(task)}
                        className="size-5 rounded-md"
                      />
                    </motion.div>
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        typeConfig.bgColor,
                        typeConfig.color,
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-900">
                          {task.title}
                        </p>
                        {task.priority === "high" ? (
                          <Badge className="h-4 border-0 bg-rose-50 px-1.5 text-[9px] font-semibold uppercase tracking-widest text-rose-600">
                            High
                          </Badge>
                        ) : null}
                      </div>
                      {task.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                          {task.description}
                        </p>
                      ) : null}
                      {task.due_date ? (
                        <div
                          className={cn(
                            "mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            isOverdue
                              ? "border-rose-100 bg-rose-50 text-rose-600"
                              : isDueToday
                                ? "border-amber-100 bg-amber-50 text-amber-600"
                                : "border-zinc-200 bg-zinc-100 text-zinc-600",
                          )}
                        >
                          <Clock className="size-3" />
                          {isOverdue
                            ? "Overdue"
                            : isDueToday
                              ? "Due Today"
                              : format(makeDisplayDate(task.due_date), "MMM d")}
                        </div>
                      ) : null}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingTask(task);
                            setTaskDialogOpen(true);
                          }}
                          className="text-xs font-medium"
                        >
                          <Pencil className="mr-2 size-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleComplete(task)}
                          className="text-xs font-medium"
                        >
                          <CheckCircle2 className="mr-2 size-3.5" /> Complete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteTask(task.id)}
                          className="text-xs font-medium text-destructive focus:text-destructive"
                        >
                          <X className="mr-2 size-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </div>
          ) : null}

          {completedTasks.length > 0 ? (
            <div className="space-y-2">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Completed ({completedTasks.length})
              </p>
              {completedTasks.slice(0, 5).map((task, index) => {
                const typeConfig =
                  TASK_TYPE_CONFIG[task.task_type] ?? TASK_TYPE_CONFIG.to_do;
                if (!typeConfig) {
                  return null;
                }

                const Icon = typeConfig.icon;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group flex items-start gap-3 rounded-xl border border-transparent bg-zinc-50/50 p-4"
                  >
                    <motion.div whileTap={{ scale: 0.97 }} className="mt-0.5">
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => handleComplete(task)}
                        className="size-5 rounded-md data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                      />
                    </motion.div>
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg opacity-50",
                        typeConfig.bgColor,
                        typeConfig.color,
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-400 line-through">
                        {task.title}
                      </p>
                      {task.completed_at ? (
                        <p className="mt-0.5 text-xs text-zinc-400">
                          Completed{" "}
                          {formatDistanceToNow(
                            makeDisplayDate(task.completed_at),
                            {
                              addSuffix: true,
                            },
                          )}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => deleteTask(task.id)}
                    >
                      <X className="size-4 text-zinc-400" />
                    </Button>
                  </motion.div>
                );
              })}
              {completedTasks.length > 5 ? (
                <p className="py-2 text-center text-xs text-zinc-400">
                  + {completedTasks.length - 5} more completed tasks
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
