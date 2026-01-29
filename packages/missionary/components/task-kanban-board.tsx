"use client";

import * as React from "react";
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
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
import { format } from "date-fns";

import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { cn } from "@asym/ui/lib/utils";
import type { Task, TaskStatus } from "@/lib/missionary/types";

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
    color: "text-zinc-500 bg-zinc-50",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: AlertCircle,
    color: "text-sky-600 bg-sky-50",
  },
  {
    id: "waiting",
    label: "Waiting",
    icon: PauseCircle,
    color: "text-amber-600 bg-amber-50",
  },
  {
    id: "completed",
    label: "Done",
    icon: CheckCircle2,
    color: "text-emerald-600 bg-emerald-50",
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
    const grouped = COLUMNS.reduce(
      (acc, col) => {
        acc[col.id] = tasks
          .filter((t) => t.status === col.id)
          .sort((a, b) => a.sort_key - b.sort_key);
        return acc;
      },
      {} as Record<TaskStatus, Task[]>,
    );
    return grouped;
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Logic for cross-column dragging if needed for visual feedback
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
      overIndex = tasksByStatus[overStatus].length;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        overStatus = overTask.status;
        overIndex = tasksByStatus[overStatus].findIndex((t) => t.id === overId);
      }
    }

    if (!overStatus) return;

    // If dropped in same column and same index, do nothing
    const activeIndex = tasksByStatus[activeTask.status].findIndex(
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
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-320px)] min-h-[500px] items-start scrollbar-hide">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.label}
            icon={column.icon}
            color={column.color}
            tasks={tasksByStatus[column.id]}
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
          <div className="w-[320px] rotate-2 scale-105 transition-transform">
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
    <div className="flex flex-col w-[320px] shrink-0 h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-xl", color)}>
            <Icon className="size-4" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">
            {title}
            <span className="ml-2 text-zinc-400 font-bold">{tasks.length}</span>
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg hover:bg-white"
          onClick={() => onCreateTask?.(id)}
        >
          <Plus className="size-4 text-zinc-400" />
        </Button>
      </div>

      <SortableContext
        id={id}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[150px] rounded-3xl group bg-zinc-100/30 p-2 border border-transparent hover:border-zinc-200/50 transition-colors">
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
            <div className="h-24 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-300">
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

  const priorityColor = {
    high: "text-rose-600 bg-rose-50 border-rose-100",
    medium: "text-amber-600 bg-amber-50 border-amber-100",
    low: "text-sky-600 bg-sky-50 border-sky-100",
    none: "text-zinc-500 bg-zinc-100 border-zinc-200",
  }[task.priority];

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[140px] rounded-2xl bg-zinc-100/50 border-2 border-dashed border-zinc-300"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border-zinc-200/60 shadow-sm hover:shadow-md transition-all group cursor-default select-none bg-white",
        isOverlay && "shadow-2xl border-zinc-900/10 ring-1 ring-zinc-900/5",
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing hover:text-zinc-900 text-zinc-300"
          >
            <GripVertical className="size-4" />
          </div>
          <div className="flex-1">
            <h4
              className={cn(
                "text-sm font-bold leading-tight line-clamp-2",
                task.status === "completed" && "text-zinc-400 line-through",
              )}
            >
              {task.title}
            </h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onEdit(task)}
          >
            <MoreHorizontal className="size-4 text-zinc-400" />
          </Button>
        </div>

        {task.description && (
          <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed font-medium">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {task.priority !== "none" && (
            <Badge
              variant="outline"
              className={cn(
                "text-[8px] h-5 font-black uppercase tracking-widest px-2 border",
                priorityColor,
              )}
            >
              {task.priority}
            </Badge>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-lg border border-zinc-100">
              <Calendar className="size-3" />
              {format(new Date(task.due_date), "MMM d")}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
          <div className="flex items-center gap-2">
            {task.donor && (
              <div className="flex items-center gap-2 max-w-[140px]">
                <Avatar className="size-5 ring-2 ring-white">
                  <AvatarImage src={task.donor.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[8px] font-black uppercase">
                    {task.donor.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 truncate">
                  {task.donor.name}
                </span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 rounded-lg text-[8px] font-black uppercase tracking-widest",
              task.status === "completed"
                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50",
            )}
            onClick={() => onComplete(task)}
          >
            {task.status === "completed" ? "Done" : "Mark Done"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
