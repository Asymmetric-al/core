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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
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

  const handleRegisterDeleteAction = (
    taskId: string,
    element: HTMLElement | null,
  ) => {
    if (element) deleteActionRefs.current.set(taskId, element);
    else deleteActionRefs.current.delete(taskId);
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        exit={fadeInUp.exit}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Follow-ups and actions for {donorName}
          </p>
        </div>
        <TaskDialog
          task={editingTask}
          defaultDonorId={donorId}
          open={taskDialogOpen}
          onOpenChange={(open) => {
            if (open && loading) return;
            setTaskDialogOpen(open);
            if (!open) {
              setEditingTask(null);
            }
          }}
          onSuccess={handleTaskSuccess}
          trigger={
            <Button
              ref={addTaskRef}
              size="sm"
              disabled={loading}
              focusableWhenDisabled={loading}
            >
              <Plus className="mr-1.5 size-3.5" data-icon="inline-start" /> Add
              Task
            </Button>
          }
        />
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border bg-card p-4"
            >
              <Skeleton className="mt-0.5 size-5 rounded-md" />
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListTodo aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No tasks yet</EmptyTitle>
            <EmptyDescription>
              Create a task to track follow-ups with {donorName}.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {activeTasks.length > 0 ? (
            <ActiveDonorTasks
              activeTasks={activeTasks}
              handleComplete={handleComplete}
              setEditingTask={setEditingTask}
              setTaskDialogOpen={setTaskDialogOpen}
              requestDelete={requestDelete}
              onRegisterDeleteAction={handleRegisterDeleteAction}
            />
          ) : null}

          {completedTasks.length > 0 ? (
            <CompletedDonorTasks
              completedTasks={completedTasks}
              handleComplete={handleComplete}
              requestDelete={requestDelete}
            />
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

function ActiveDonorTasks({
  activeTasks,
  handleComplete,
  setEditingTask,
  setTaskDialogOpen,
  requestDelete,
  onRegisterDeleteAction,
}: {
  activeTasks: Task[];
  handleComplete: (task: Task) => Promise<void>;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
  setTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  requestDelete: (task: Task, trigger?: HTMLElement) => void;
  onRegisterDeleteAction: (taskId: string, element: HTMLElement | null) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
          task.due_date && makeDisplayDate(task.due_date) < makeDisplayDate();
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
            className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border"
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
                <p className="text-sm font-semibold text-foreground">
                  {task.title}
                </p>
                {task.priority === "high" ? (
                  <Badge variant="destructive">High</Badge>
                ) : null}
              </div>
              {task.description ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {task.description}
                </p>
              ) : null}
              {task.due_date ? (
                <div
                  className={cn(
                    "mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
                    isOverdue
                      ? "border-destructive/20 bg-destructive/10 text-destructive"
                      : isDueToday
                        ? "border-warning/20 bg-warning/10 text-warning"
                        : "border-border bg-muted text-muted-foreground",
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
            <div className="transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Open actions"
                  ref={(element) => onRegisterDeleteAction(task.id, element)}
                  render={
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingTask(task);
                      setTaskDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 size-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleComplete(task)}>
                    <CheckCircle2 className="mr-2 size-3.5" /> Complete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => requestDelete(task)}
                    variant="destructive"
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
  );
}

function CompletedDonorTasks({
  completedTasks,
  handleComplete,
  requestDelete,
}: {
  completedTasks: Task[];
  handleComplete: (task: Task) => Promise<void>;
  requestDelete: (task: Task, trigger?: HTMLElement) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
            className="group flex items-start gap-3 rounded-xl border border-transparent bg-muted/50 p-4"
          >
            <motion.div whileTap={{ scale: 0.97 }} className="mt-0.5">
              <Checkbox
                aria-label={`Complete ${task.title}`}
                checked
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
              <p className="text-sm font-medium text-muted-foreground line-through">
                {task.title}
              </p>
              {task.completed_at ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Completed{" "}
                  {formatDistanceToNow(makeDisplayDate(task.completed_at), {
                    addSuffix: true,
                  })}
                </p>
              ) : null}
            </div>
            <div className="transition-opacity">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${task.title}`}
                onClick={(event) => requestDelete(task, event.currentTarget)}
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </motion.div>
        );
      })}
      {completedTasks.length > 5 ? (
        <p className="py-2 text-center text-xs text-muted-foreground">
          + {completedTasks.length - 5} more completed tasks
        </p>
      ) : null}
    </div>
  );
}
