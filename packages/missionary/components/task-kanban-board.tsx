"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

import type { Task, TaskStatus } from "../types";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

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
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
    (status: TaskStatus) => tasksByStatus[status] ?? [],
    [tasksByStatus],
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Find the status of the container we dropped over
    let overStatus: TaskStatus | null = null;
    let overIndex = -1;

    // Check if overId is a column ID
    const isOverColumn = COLUMNS.some((col) => col.id === overId);

    if (isOverColumn) {
      overStatus = overId as TaskStatus;
      overIndex = getTasksForStatus(overStatus).length;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        overStatus = overTask.status;
        overIndex = getTasksForStatus(overStatus).findIndex(
          (t) => t.id === overId,
        );
      }
    }

    if (!overStatus) return;

    // If dropped in same column and same index, do nothing
    const activeIndex = getTasksForStatus(activeTask.status).findIndex(
      (t) => t.id === activeId,
    );
    if (activeTask.status === overStatus && activeIndex === overIndex) return;

    await onMoveTask(activeId, overStatus, overIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-125 items-start gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.label}
            icon={column.icon}
            color={column.color}
            tasks={getTasksForStatus(column.id)}
            onEditTask={onEditTask}
            onCompleteTask={onCompleteTask}
            onDeleteTask={onDeleteTask}
            onCreateTask={onCreateTask}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}
      >
        {activeTask ? (
          <div className="w-80 rotate-2 scale-105 transition-transform">
            <KanbanCard
              task={activeTask}
              isOverlay
              onEdit={() => {}}
              onComplete={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  icon: React.ElementType;
  color: string;
  tasks: Task[];
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
  onEditTask,
  onCompleteTask,
  onDeleteTask,
  onCreateTask,
}: KanbanColumnProps) {
  return (
    <div className="flex h-full w-80 max-w-full shrink-0 flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-xl", color)}>
            <Icon className="size-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
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

      <SortableContext
        id={id}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="group flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-muted/30 p-2">
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
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
      </SortableContext>
    </div>
  );
}

interface KanbanCardProps {
  task: Task;
  isOverlay?: boolean;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function KanbanCard({ task, isOverlay, onEdit, onComplete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-35 rounded-2xl bg-muted/50 border-2 border-dashed border-border"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group select-none"
      data-drag-overlay={isOverlay}
    >
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              {...attributes}
              {...listeners}
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
