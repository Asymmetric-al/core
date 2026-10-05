"use client";

import { useTasks } from "@asym/lib/hooks";
import { motion } from "@asym/lib/motion";
import { TaskDialog } from "@asym/missionary/components/task-dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
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
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null);
  const [deletePending, setDeletePending] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const deletionInFlight = React.useRef(false);
  const deleteActionRefs = React.useRef(new Map<string, HTMLElement>());
  const deleteReturnFocus = React.useRef<HTMLElement | null>(null);
  const cancelDeleteRef = React.useRef<HTMLButtonElement | null>(null);
  const addTaskRef = React.useRef<HTMLButtonElement | null>(null);

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

  const requestDelete = (task: Task, trigger?: HTMLElement) => {
    if (deletionInFlight.current) return;
    deleteReturnFocus.current =
      trigger ?? deleteActionRefs.current.get(task.id) ?? null;
    setDeleteError(null);
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (!taskToDelete || deletionInFlight.current) return;
    deletionInFlight.current = true;
    setDeletePending(true);
    setDeleteError(null);
    return deleteTask(taskToDelete.id)
      .then((deleted) => {
        if (deleted) setTaskToDelete(null);
        else setDeleteError("Could not delete this task. Please try again.");
      })
      .catch(() => {
        setDeleteError("Could not delete this task. Please try again.");
      })
      .finally(() => {
        deletionInFlight.current = false;
        setDeletePending(false);
      });
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
            <Button ref={addTaskRef} size="sm">
              <Plus className="mr-1.5 size-3.5" /> Add Task
            </Button>
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
          <p className="mt-1 max-w-60 text-xs text-zinc-400">
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
                    className="group flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 transition-colors hover:border-zinc-200"
                  >
                    <motion.div whileTap={{ scale: 0.97 }} className="mt-0.5">
                      <Checkbox
                        aria-label={`Complete ${task.title}`}
                        checked={false}
                        onCheckedChange={() => handleComplete(task)}
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
                          <Badge variant="destructive">High</Badge>
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
                    <div className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label="Open actions"
                          ref={(element) => {
                            if (element)
                              deleteActionRefs.current.set(task.id, element);
                            else deleteActionRefs.current.delete(task.id);
                          }}
                          render={
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
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
                            onClick={() => requestDelete(task)}
                            className="text-xs font-medium text-destructive focus:text-destructive"
                          >
                            <X className="mr-2 size-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
                        aria-label={`Complete ${task.title}`}
                        checked={true}
                        onCheckedChange={() => handleComplete(task)}
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
                    <div className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${task.title}`}
                        onClick={(event) =>
                          requestDelete(task, event.currentTarget)
                        }
                      >
                        <X className="size-4 text-zinc-400" />
                      </Button>
                    </div>
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
      <AlertDialog
        open={taskToDelete !== null}
        onOpenChange={(open, details) => {
          if (open) return;
          if (deletionInFlight.current) {
            details.cancel();
            return;
          }
          setTaskToDelete(null);
        }}
      >
        <AlertDialogContent
          initialFocus={cancelDeleteRef}
          finalFocus={() =>
            deleteReturnFocus.current?.isConnected
              ? deleteReturnFocus.current
              : addTaskRef.current
          }
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {taskToDelete?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this task from your task list? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deletePending ? (
            <p
              role="status"
              aria-atomic="true"
              className="text-sm text-muted-foreground"
            >
              Deleting {taskToDelete?.title}…
            </p>
          ) : null}
          {deleteError ? (
            <p role="alert" className="text-sm text-destructive">
              {deleteError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel ref={cancelDeleteRef} disabled={deletePending}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deletePending}
              focusableWhenDisabled={deletePending}
              onClick={() => void confirmDelete()}
            >
              {deletePending ? "Deleting…" : "Delete task"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
