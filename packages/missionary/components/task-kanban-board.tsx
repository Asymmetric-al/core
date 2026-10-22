"use client";

import { useReducedMotion } from "@asym/lib/motion";
import { DURATION_STANDARD, EASE_OUT_SOFT } from "@asym/lib/motion-presets";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import { CollisionPriority } from "@dnd-kit/abstract";
import { Feedback, PointerActivationConstraints } from "@dnd-kit/dom";
import { OptimisticSortingPlugin } from "@dnd-kit/dom/sortable";
import { move } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
} from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { format } from "date-fns";
import {
  GripVertical,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  MoreHorizontal,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import type { Task, TaskStatus } from "../types";
import type { Plugins } from "@dnd-kit/abstract";
import type { SortableTransition } from "@dnd-kit/dom/sortable";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/react";

const DRAG_TRANSITION: SortableTransition = {
  duration: DURATION_STANDARD * 1000,
  easing: `cubic-bezier(${EASE_OUT_SOFT.join(",")})`,
};
const DRAG_SENSORS = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
  }),
  KeyboardSensor,
];

const boardPlugins = (defaults: Plugins): Plugins =>
  defaults.map((plugin) =>
    plugin === Feedback
      ? Feedback.configure({ keyboardTransition: null })
      : plugin,
  );

// React owns these controlled lists; the default plugin also reparents DOM nodes.
const controlledSortablePlugins = (defaults: Plugins): Plugins =>
  defaults.filter((plugin) => plugin !== OptimisticSortingPlugin);

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

const COLUMNS: {
  id: TaskStatus;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: "not_started",
    label: "To Do",
    icon: Clock,
    color: "text-muted-foreground bg-muted",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: AlertCircle,
    color: "text-info bg-info/10",
  },
  {
    id: "waiting",
    label: "Waiting",
    icon: PauseCircle,
    color: "text-warning bg-warning/10",
  },
  {
    id: "completed",
    label: "Done",
    icon: CheckCircle2,
    color: "text-success bg-success/10",
  },
];

interface TaskKanbanBoardProps {
  tasks: Task[];
  onMoveTask: (
    taskId: string,
    newStatus: TaskStatus,
    newIndex: number,
  ) => Promise<boolean>;
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCreateTask?: (status: TaskStatus) => void;
}

export function TaskKanbanBoard({
  tasks,
  onMoveTask,
  onEditTask,
  onCompleteTask,
  onDeleteTask,
  onCreateTask,
}: TaskKanbanBoardProps) {
  const reducedMotion = useReducedMotion();
  const [keyboardInteraction, setKeyboardInteraction] = React.useState(false);
  const moveErrorToastId = React.useRef<string | number | undefined>(undefined);
  const [draftTasks, setDraftTasks] = React.useState<Record<
    TaskStatus,
    Task[]
  > | null>(null);
  const draftRef = React.useRef<Record<TaskStatus, Task[]> | null>(null);
  const dragHandles = React.useRef(new Map<string, HTMLButtonElement>());
  const keyboardSourceId = React.useRef<string | null>(null);
  const restoreFocusId = React.useRef<string | null>(null);
  const registerHandle = React.useCallback(
    (taskId: string, element: HTMLButtonElement | null) => {
      if (element) dragHandles.current.set(taskId, element);
      else dragHandles.current.delete(taskId);
    },
    [],
  );
  const transition =
    reducedMotion || keyboardInteraction ? null : DRAG_TRANSITION;

  const tasksByStatus = React.useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      not_started: [],
      in_progress: [],
      waiting: [],
      completed: [],
      deferred: [],
    };

    for (const task of tasks) {
      grouped[task.status].push(task);
    }

    for (const status of Object.keys(grouped) as TaskStatus[]) {
      grouped[status].sort((a, b) => a.sort_key - b.sort_key);
    }

    return grouped;
  }, [tasks]);

  const getTasksForStatus = React.useCallback(
    (status: TaskStatus) => (draftTasks ?? tasksByStatus)[status] ?? [],
    [draftTasks, tasksByStatus],
  );

  React.useLayoutEffect(() => {
    if (draftTasks !== null || !restoreFocusId.current) return;
    const id = restoreFocusId.current;
    restoreFocusId.current = null;
    const handle = dragHandles.current.get(id);
    if (
      document.activeElement === document.body ||
      document.activeElement === handle
    )
      handle?.focus();
  }, [draftTasks]);

  function resetDraft() {
    const sourceId = keyboardSourceId.current;
    const focused = document.activeElement;
    restoreFocusId.current =
      sourceId &&
      (focused === document.body ||
        focused === dragHandles.current.get(sourceId))
        ? sourceId
        : null;
    keyboardSourceId.current = null;
    draftRef.current = null;
    setDraftTasks(null);
  }

  function handleDragOver(event: DragOverEvent) {
    if (!draftRef.current || !event.operation.source || !event.operation.target)
      return;
    const next = move(draftRef.current, event);
    draftRef.current = next;
    setDraftTasks(next);
  }

  function reportMoveError() {
    moveErrorToastId.current = toast.error(
      "Task move failed. Please try again.",
      {
        id: moveErrorToastId.current,
      },
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { source, target } = event.operation;
    if (event.canceled || !source || !target || !isSortable(source)) {
      resetDraft();
      return;
    }
    const activeId = source.id;
    const activeTask = tasks.find((task) => task.id === activeId);
    const draft = draftRef.current;
    const status = COLUMNS.find((column) =>
      draft?.[column.id].some((task) => task.id === activeId),
    )?.id;
    if (typeof activeId !== "string" || !activeTask || !draft || !status) {
      resetDraft();
      return;
    }
    const index = draft[status].findIndex((task) => task.id === activeId);
    const originalIndex = tasksByStatus[activeTask.status].findIndex(
      (task) => task.id === activeId,
    );
    if (status === activeTask.status && index === originalIndex) {
      resetDraft();
      return;
    }
    const pending = event.suspend();
    try {
      if (!(await onMoveTask(activeId, status, index))) reportMoveError();
    } catch {
      reportMoveError();
    } finally {
      resetDraft();
      pending.resume();
    }
  }

  return (
    <DragDropProvider
      sensors={DRAG_SENSORS}
      plugins={boardPlugins}
      onDragStart={(event) => {
        if (moveErrorToastId.current !== undefined)
          toast.dismiss(moveErrorToastId.current);
        const keyboard = event.nativeEvent instanceof KeyboardEvent;
        setKeyboardInteraction(keyboard);
        keyboardSourceId.current =
          keyboard && typeof event.operation.source?.id === "string"
            ? event.operation.source.id
            : null;
        draftRef.current = tasksByStatus;
        setDraftTasks(tasksByStatus);
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="task-board-height flex min-h-125 items-start gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.label}
            icon={column.icon}
            color={column.color}
            tasks={getTasksForStatus(column.id)}
            transition={transition}
            registerHandle={registerHandle}
            onEditTask={onEditTask}
            onCompleteTask={onCompleteTask}
            onDeleteTask={onDeleteTask}
            onCreateTask={onCreateTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={transition}>
        {(source) => {
          const task = tasks.find((candidate) => candidate.id === source.id);
          return task ? (
            <div
              inert
              aria-hidden="true"
              className={cn("w-80", transition && "rotate-2 scale-105")}
            >
              <KanbanCard
                task={task}
                isOverlay
                onEdit={() => {}}
                onComplete={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null;
        }}
      </DragOverlay>
    </DragDropProvider>
  );
}

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  icon: React.ElementType;
  color: string;
  tasks: Task[];
  transition: SortableTransition | null;
  registerHandle: (taskId: string, element: HTMLButtonElement | null) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCreateTask?: (status: TaskStatus) => void;
}

function KanbanColumn({
  id,
  title,
  icon: Icon,
  color,
  tasks,
  transition,
  registerHandle,
  onEditTask,
  onCompleteTask,
  onDeleteTask,
  onCreateTask,
}: KanbanColumnProps) {
  const { ref } = useDroppable({
    id,
    accept: "task",
    collisionPriority: CollisionPriority.Low,
  });
  return (
    <section
      aria-label={title}
      className="flex h-full w-80 max-w-full shrink-0 flex-col"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-xl", color)}>
            <Icon className="size-4" />
          </div>
          <h3
            aria-label={`${title} ${tasks.length}`}
            className="text-sm font-semibold text-foreground"
          >
            {title}
            <span className="ml-2 text-muted-foreground font-semibold">
              {tasks.length}
            </span>
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Add task to ${title}`}
          onClick={() => onCreateTask?.(id)}
        >
          <Plus className="size-4 text-muted-foreground" />
        </Button>
      </div>

      <div
        ref={ref}
        className="group flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-muted/30 p-2"
      >
        {tasks.map((task, index) => (
          <SortableKanbanCard
            key={task.id}
            task={task}
            index={index}
            group={id}
            transition={transition}
            registerHandle={registerHandle}
            onEdit={onEditTask}
            onComplete={onCompleteTask}
            onDelete={onDeleteTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            Drop tasks here
          </div>
        )}
      </div>
    </section>
  );
}

interface KanbanCardProps {
  task: Task;
  isOverlay?: boolean;
  handleRef?: React.Ref<HTMLButtonElement>;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function SortableKanbanCard({
  task,
  index,
  group,
  transition,
  registerHandle,
  onEdit,
  onComplete,
  onDelete,
}: KanbanCardProps & {
  index: number;
  group: TaskStatus;
  transition: SortableTransition | null;
  registerHandle: (taskId: string, element: HTMLButtonElement | null) => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: task.id,
    index,
    group,
    type: "task",
    accept: "task",
    transition,
    plugins: controlledSortablePlugins,
  });
  const setHandle = React.useCallback(
    (element: HTMLButtonElement | null) => {
      handleRef(element);
      registerHandle(task.id, element);
    },
    [handleRef, registerHandle, task.id],
  );
  return (
    <div
      ref={ref}
      className={cn("group select-none", isDragging && "opacity-50")}
    >
      <KanbanCard
        task={task}
        handleRef={setHandle}
        onEdit={onEdit}
        onComplete={onComplete}
        onDelete={onDelete}
      />
    </div>
  );
}

function KanbanCard({
  task,
  isOverlay,
  handleRef,
  onEdit,
  onComplete,
}: KanbanCardProps) {
  return (
    <div data-drag-overlay={isOverlay}>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              ref={handleRef}
              disabled={isOverlay}
              aria-label={`Move ${task.title}`}
            >
              <GripVertical className="size-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h4
                className={cn(
                  "text-sm font-semibold leading-tight line-clamp-2",
                  task.status === "completed" &&
                    "text-muted-foreground line-through",
                )}
              >
                {task.title}
              </h4>
            </div>
            <div className="transition-opacity">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${task.title}`}
                onClick={() => onEdit(task)}
              >
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {task.priority !== "none" && (
              <Badge
                variant={task.priority === "high" ? "destructive" : "secondary"}
              >
                {task.priority}
              </Badge>
            )}
            {task.due_date && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-lg border border-border">
                <Calendar className="size-3" />
                {format(makeDisplayDate(task.due_date), "MMM d")}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              {task.donor && (
                <div className="flex items-center gap-2 max-w-35">
                  <Avatar className="size-5">
                    <AvatarImage src={task.donor.avatar_url ?? undefined} />
                    <AvatarFallback>{task.donor.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {task.donor.name}
                  </span>
                </div>
              )}
            </div>

            <Button
              variant={task.status === "completed" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => onComplete(task)}
            >
              {task.status === "completed" ? "Done" : "Mark Done"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
