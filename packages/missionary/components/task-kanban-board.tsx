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
import {
  Accessibility,
  Feedback,
  PointerActivationConstraints,
} from "@dnd-kit/dom";
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
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/react";

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

type Columns = Record<TaskStatus, Task[]>;
type BoardAnnouncements = {
  dragstart: (event: DragStartEvent) => string | undefined;
  dragover: (event: DragOverEvent) => string | undefined;
  dragend: (event: DragEndEvent) => string | undefined;
};

const SCREEN_READER_INSTRUCTIONS = {
  draggable:
    "To pick up a task, press Space or Enter. While dragging, use the up and down arrow keys to change its position in a column and the left and right arrow keys to move it to another column. Press Space or Enter again to drop it, or press Escape to cancel.",
};

// The plugin announces before the board's own dragover handler runs; both
// apply the same move once, whichever runs first.
const movedByEvent = new WeakMap<DragOverEvent, Columns>();
function moveOnce(columns: Columns, event: DragOverEvent): Columns {
  let next = movedByEvent.get(event);
  if (!next) {
    next = move(columns, event);
    movedByEvent.set(event, next);
  }
  return next;
}

function boardAnnouncements(
  view: () => { tasks: Task[]; committed: Columns; draft: Columns | null },
): BoardAnnouncements {
  const titleOf = (id: unknown) =>
    view().tasks.find((task) => task.id === id)?.title;
  const placeOf = (columns: Columns, id: unknown) => {
    for (const column of COLUMNS) {
      const list = columns[column.id];
      const index = list.findIndex((task) => task.id === id);
      if (index !== -1) {
        return `${column.label}, position ${index + 1} of ${list.length}`;
      }
    }
    return undefined;
  };
  return {
    dragstart({ operation: { source } }) {
      const { committed, draft } = view();
      const title = titleOf(source?.id);
      const place = placeOf(draft ?? committed, source?.id);
      return title && place ? `Picked up ${title}. ${place}.` : undefined;
    },
    dragover(event) {
      const { source, target } = event.operation;
      const { draft } = view();
      if (!source || !target || source.id === target.id || !draft) return;
      const title = titleOf(source.id);
      const place = placeOf(moveOnce(draft, event), source.id);
      return title && place ? `${title} is in ${place}.` : undefined;
    },
    dragend({ operation: { source, target }, canceled }) {
      const { committed, draft } = view();
      const title = titleOf(source?.id);
      if (canceled || !target) {
        const place = placeOf(committed, source?.id);
        return title && place
          ? `Move cancelled. ${title} returned to ${place}.`
          : undefined;
      }
      const place = placeOf(draft ?? committed, source?.id);
      return title && place ? `Dropped ${title} in ${place}.` : undefined;
    },
  };
}

// dnd-kit's default announcements read out raw ids; these name the task,
// its column and its position. Options must keep one identity per board, or
// the provider rebuilds the plugin (and its live region) on every render.
const boardPlugins =
  (announcements: BoardAnnouncements) =>
  (defaults: Plugins): Plugins =>
    defaults.map((plugin) => {
      if (plugin === Feedback) {
        return Feedback.configure({ keyboardTransition: null });
      }
      if (plugin === Accessibility) {
        return Accessibility.configure({
          announcements,
          screenReaderInstructions: SCREEN_READER_INSTRUCTIONS,
        });
      }
      return plugin;
    });

// React owns these controlled lists; the default plugin also reparents DOM nodes.
const controlledSortablePlugins = (defaults: Plugins): Plugins =>
  defaults.filter((plugin) => plugin !== OptimisticSortingPlugin);

const SHORT_DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/**
 * How a task's due date reads on the board. Dates are calendar days, so they
 * compare as YYYY-MM-DD strings in local time. Finished tasks are never late.
 */
export function taskDueState(
  dueDate: string,
  status: string,
  today: Date = new Date(),
): { label: string; overdue: boolean } {
  const day = dueDate.slice(0, 10);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [year, month, date] = day.split("-").map(Number);
  const pretty = SHORT_DAY.format(new Date(year!, (month ?? 1) - 1, date ?? 1));
  const open = status !== "completed" && status !== "deferred";
  if (open && day < todayKey) {
    return { label: `Overdue · ${pretty}`, overdue: true };
  }
  if (open && day === todayKey) return { label: "Due today", overdue: false };
  return { label: `Due ${pretty}`, overdue: false };
}

const COLUMNS: {
  id: TaskStatus;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: "not_started",
    label: "To do",
    icon: Clock,
    color: "text-muted-foreground bg-muted",
  },
  {
    id: "in_progress",
    label: "In progress",
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
  onCompleteTask: (task: Task) => void | Promise<boolean>;
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
  const movedFocus = React.useRef<{
    taskId: string;
    status: TaskStatus;
  } | null>(null);
  const completeButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const completionFocus = React.useRef<{
    taskId: string;
    status: TaskStatus;
  } | null>(null);
  const registerHandle = React.useCallback(
    (taskId: string, element: HTMLButtonElement | null) => {
      if (element) dragHandles.current.set(taskId, element);
      else dragHandles.current.delete(taskId);
    },
    [],
  );
  const registerCompleteButton = React.useCallback(
    (taskId: string, element: HTMLButtonElement | null) => {
      if (element) completeButtons.current.set(taskId, element);
      else completeButtons.current.delete(taskId);
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
      // An unexpected status has no column; skip it rather than crash the
      // page (the API normalises known legacy values on read).
      grouped[task.status]?.push(task);
    }

    for (const status of Object.keys(grouped) as TaskStatus[]) {
      grouped[status].sort((a, b) => a.sort_key - b.sort_key);
    }

    return grouped;
  }, [tasks]);

  const latest = React.useRef({ tasks, committed: tasksByStatus });
  React.useLayoutEffect(() => {
    latest.current = { tasks, committed: tasksByStatus };
  });
  const [plugins] = React.useState(() =>
    boardPlugins(
      boardAnnouncements(() => ({
        ...latest.current,
        draft: draftRef.current,
      })),
    ),
  );

  // Done and reopened cards change column, so React remounts them and the
  // focused button goes with them; focus the same button on the moved card.
  React.useLayoutEffect(() => {
    const pending = completionFocus.current;
    if (!pending) return;
    const task = tasks.find((candidate) => candidate.id === pending.taskId);
    if (task?.status === pending.status) return;
    completionFocus.current = null;
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected) return;
    (
      completeButtons.current.get(pending.taskId) ??
      dragHandles.current.get(pending.taskId)
    )?.focus();
  }, [tasks]);

  // dnd-kit runs onDragEnd in a transition, so a saved move can reach `tasks`
  // after the preview is cleared and remount the card in its new column once
  // more; focus its handle there if that took focus away.
  React.useLayoutEffect(() => {
    const pending = movedFocus.current;
    if (!pending) return;
    const task = tasks.find((candidate) => candidate.id === pending.taskId);
    if (task && task.status !== pending.status) return;
    movedFocus.current = null;
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected) return;
    dragHandles.current.get(pending.taskId)?.focus();
  }, [tasks]);

  async function completeTask(task: Task) {
    completionFocus.current = { taskId: task.id, status: task.status };
    const forget = () => {
      if (completionFocus.current?.taskId === task.id) {
        completionFocus.current = null;
      }
    };
    try {
      if ((await onCompleteTask(task)) === false) forget();
    } catch (error) {
      forget();
      throw error;
    }
  }

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
    const next = moveOnce(draftRef.current, event);
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
      else if (
        keyboardSourceId.current === activeId &&
        latest.current.tasks.find((task) => task.id === activeId)?.status !==
          status
      )
        movedFocus.current = { taskId: activeId, status };
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
      plugins={plugins}
      onDragStart={(event) => {
        if (moveErrorToastId.current !== undefined)
          toast.dismiss(moveErrorToastId.current);
        const keyboard = event.nativeEvent instanceof KeyboardEvent;
        movedFocus.current = null;
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
            registerCompleteButton={registerCompleteButton}
            onEditTask={onEditTask}
            onCompleteTask={completeTask}
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
              className={cn("w-full", transition && "rotate-2 scale-105")}
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
  registerCompleteButton: (
    taskId: string,
    element: HTMLButtonElement | null,
  ) => void;
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
  registerCompleteButton,
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
      // From xl the four columns share the width so Done is not clipped at
      // laptop widths; narrower screens keep fixed columns and scroll.
      className="flex h-full w-80 max-w-full shrink-0 flex-col xl:w-auto xl:min-w-52 xl:flex-1"
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
            registerCompleteButton={registerCompleteButton}
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
  completeRef?: React.Ref<HTMLButtonElement>;
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
  registerCompleteButton,
  onEdit,
  onComplete,
  onDelete,
}: KanbanCardProps & {
  index: number;
  group: TaskStatus;
  transition: SortableTransition | null;
  registerHandle: (taskId: string, element: HTMLButtonElement | null) => void;
  registerCompleteButton: (
    taskId: string,
    element: HTMLButtonElement | null,
  ) => void;
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
  const setCompleteButton = React.useCallback(
    (element: HTMLButtonElement | null) =>
      registerCompleteButton(task.id, element),
    [registerCompleteButton, task.id],
  );
  return (
    <div
      ref={ref}
      className={cn("group select-none", isDragging && "opacity-50")}
    >
      <KanbanCard
        task={task}
        handleRef={setHandle}
        completeRef={setCompleteButton}
        onEdit={onEdit}
        onComplete={onComplete}
        onDelete={onDelete}
      />
    </div>
  );
}

function DueBadge({ task }: { task: Task }) {
  const due = taskDueState(task.due_date!, task.status);
  return (
    <Badge variant={due.overdue ? "destructive-subtle" : "outline"}>
      <Calendar data-icon="inline-start" aria-hidden />
      {due.label}
    </Badge>
  );
}

function KanbanCard({
  task,
  isOverlay,
  handleRef,
  completeRef,
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
                  "text-sm font-semibold leading-snug text-pretty",
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
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            )}
            {task.due_date ? <DueBadge task={task} /> : null}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
            {/* Long partner names take up to two lines rather than cutting
                off after one, and the action keeps its full label beside them. */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {task.donor && (
                <>
                  <Avatar className="size-5">
                    <AvatarImage src={task.donor.avatar_url ?? undefined} />
                    <AvatarFallback>{task.donor.name[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    title={task.donor.name}
                    className="line-clamp-2 min-w-0 text-xs font-medium text-pretty wrap-break-word text-muted-foreground"
                  >
                    {task.donor.name}
                  </span>
                </>
              )}
            </div>

            {/* Completing a finished task reopens it, so it says so. */}
            <Button
              ref={completeRef}
              variant="ghost"
              size="xs"
              onClick={() => onComplete(task)}
              aria-label={
                task.status === "completed"
                  ? `Reopen: ${task.title}`
                  : `Mark done: ${task.title}`
              }
            >
              {task.status === "completed" ? "Reopen" : "Mark done"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
