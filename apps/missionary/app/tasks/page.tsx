"use client";

import { useTasks } from "@asym/lib/hooks";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { TaskDialog } from "@asym/missionary/components/task-dialog";
import { TaskKanbanBoard } from "@asym/missionary/components/task-kanban-board";
import { TaskRow } from "@asym/missionary/components/task-row";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { FilterBar } from "@asym/ui/components/shadcn/filter-bar";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";
import { isToday, isPast } from "date-fns";
import {
  Plus,
  CheckCircle2,
  Phone,
  Mail,
  CheckSquare,
  UserPlus,
  Users,
  Flag,
  RefreshCw,
  ListFilter,
  AlertCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import * as React from "react";

import { MissionaryTasksListBoneyardFixture } from "./boneyard-fixture";
import { taskMatchesClientSearch } from "./task-search-match";

import type {
  Task,
  TaskType,
  TaskStatus,
  TaskPriority,
} from "@asym/lib/hooks/use-tasks";

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

const TASK_TYPE_CONFIG: Record<
  TaskType,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  call: {
    label: "Call",
    icon: Phone,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  to_do: {
    label: "To-do",
    icon: CheckSquare,
    color: "text-zinc-600",
    bgColor: "bg-zinc-100",
  },
  follow_up: {
    label: "Follow Up",
    icon: UserPlus,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  thank_you: {
    label: "Thank You",
    icon: CheckCircle2,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  meeting: {
    label: "Meeting",
    icon: Users,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
};

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; badgeColor: string }
> = {
  none: {
    label: "None",
    color: "text-zinc-400",
    badgeColor: "bg-zinc-100 text-zinc-500 border-zinc-200",
  },
  low: {
    label: "Low",
    color: "text-sky-500",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  medium: {
    label: "Medium",
    color: "text-amber-500",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  high: {
    label: "High",
    color: "text-rose-500",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-5 border border-zinc-200 rounded-2xl bg-white"
        >
          <Skeleton className="h-5 w-5 rounded-md mt-1" />
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  onClick,
  isActive,
}: {
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={springTransition}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all cursor-pointer text-left shadow-sm min-w-[160px]",
        color,
        isActive
          ? "ring-2 ring-zinc-900 ring-offset-2 border-transparent"
          : "border-zinc-100",
      )}
    >
      <div className="flex flex-col">
        <motion.span
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-black tabular-nums tracking-tight"
        >
          {value}
        </motion.span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mt-0.5">
          {label}
        </span>
      </div>
    </motion.button>
  );
}

type ViewFilter = "all" | "active" | "completed" | "overdue" | "today";
type ViewMode = "list" | "board";
type TasksPageState = {
  viewFilter: ViewFilter;
  viewMode: ViewMode;
  searchTerm: string;
  taskDialogOpen: boolean;
  editingTask: Task | null;
  initialStatus: TaskStatus | undefined;
  deleteDialogOpen: boolean;
  taskToDelete: Task | null;
  typeFilter: TaskType | "all";
  priorityFilter: TaskPriority | "all";
};

type TasksStats = {
  notStarted: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueToday: number;
};

type ActiveFilterChip = {
  label: string;
  onRemove: () => void;
};

type TasksPageActionsProps = {
  viewMode: ViewMode;
  loading: boolean;
  refresh: () => void | Promise<void>;
  editingTask: Task | null;
  initialStatus: TaskStatus | undefined;
  taskDialogOpen: boolean;
  setViewMode: (value: React.SetStateAction<ViewMode>) => void;
  setTaskDialogOpen: (value: React.SetStateAction<boolean>) => void;
  setEditingTask: (value: React.SetStateAction<Task | null>) => void;
  setInitialStatus: (
    value: React.SetStateAction<TaskStatus | undefined>,
  ) => void;
};

function TasksPageActions({
  viewMode,
  loading,
  refresh,
  editingTask,
  initialStatus,
  taskDialogOpen,
  setViewMode,
  setTaskDialogOpen,
  setEditingTask,
  setInitialStatus,
}: TasksPageActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 mr-2">
        <Button
          variant={viewMode === "board" ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "size-9 rounded-lg",
            viewMode === "board" && "bg-white shadow-sm",
          )}
          onClick={() => setViewMode("board")}
        >
          <LayoutGrid className="size-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "size-9 rounded-lg",
            viewMode === "list" && "bg-white shadow-sm",
          )}
          onClick={() => setViewMode("list")}
        >
          <List className="size-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={refresh}
        className="h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 transition-all"
      >
        <RefreshCw className={cn("size-4", loading && "animate-spin")} />
      </Button>
      <TaskDialog
        task={editingTask}
        initialStatus={initialStatus}
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) {
            setEditingTask(null);
            setInitialStatus(undefined);
          }
        }}
        onSuccess={refresh}
        trigger={
          <Button className="h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-200">
            <Plus className="mr-2 size-4" />
            Add Task
          </Button>
        }
      />
    </div>
  );
}

type TasksStatsGridProps = {
  stats: TasksStats;
  viewFilter: ViewFilter;
  setViewFilter: (value: React.SetStateAction<ViewFilter>) => void;
};

function TasksStatsGrid({
  stats,
  viewFilter,
  setViewFilter,
}: TasksStatsGridProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <StatCard
        label="Active"
        value={stats.notStarted + stats.inProgress}
        color="bg-sky-50 text-sky-700"
        onClick={() => setViewFilter("active")}
        isActive={viewFilter === "active"}
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        color="bg-emerald-50 text-emerald-700"
        onClick={() => setViewFilter("completed")}
        isActive={viewFilter === "completed"}
      />
      {stats.overdue > 0 && (
        <StatCard
          label="Overdue"
          value={stats.overdue}
          color="bg-rose-50 text-rose-700"
          onClick={() => setViewFilter("overdue")}
          isActive={viewFilter === "overdue"}
        />
      )}
      {stats.dueToday > 0 && (
        <StatCard
          label="Due Today"
          value={stats.dueToday}
          color="bg-amber-50 text-amber-700"
          onClick={() => setViewFilter("today")}
          isActive={viewFilter === "today"}
        />
      )}
    </div>
  );
}

type TasksFilterBarProps = {
  viewMode: ViewMode;
  viewFilter: ViewFilter;
  searchTerm: string;
  typeFilter: TaskType | "all";
  priorityFilter: TaskPriority | "all";
  activeFilterChips: ActiveFilterChip[];
  setSearchTerm: (value: React.SetStateAction<string>) => void;
  setViewFilter: (value: React.SetStateAction<ViewFilter>) => void;
  setTypeFilter: (value: React.SetStateAction<TaskType | "all">) => void;
  setPriorityFilter: (
    value: React.SetStateAction<TaskPriority | "all">,
  ) => void;
  clearFilters: () => void;
};

function TasksFilterBar({
  viewMode,
  viewFilter,
  searchTerm,
  typeFilter,
  priorityFilter,
  activeFilterChips,
  setSearchTerm,
  setViewFilter,
  setTypeFilter,
  setPriorityFilter,
  clearFilters,
}: TasksFilterBarProps) {
  return (
    <FilterBar
      search={{
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: "Search mission tasks...",
      }}
      filters={
        <div className="flex items-center gap-2">
          {viewMode === "list" && (
            <Tabs
              value={viewFilter}
              onValueChange={(v) => setViewFilter(v as ViewFilter)}
              className="hidden md:block"
            >
              <TabsList className="bg-zinc-100/80 p-1 h-11 rounded-xl border border-zinc-200/50">
                <TabsTrigger
                  value="active"
                  className="text-[9px] font-black uppercase tracking-widest px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="text-[9px] font-black uppercase tracking-widest px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Done
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="text-[9px] font-black uppercase tracking-widest px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 rounded-xl border-zinc-200 font-bold uppercase tracking-widest text-[10px] gap-2"
              >
                <ListFilter className="size-4 text-zinc-400" />
                Refine
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl border-zinc-100 p-2 shadow-xl"
            >
              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Task Type
              </DropdownMenuLabel>
              {Object.entries(TASK_TYPE_CONFIG).map(([value, config]) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={typeFilter === value}
                  onCheckedChange={() => setTypeFilter(value as TaskType)}
                  className="rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <config.icon
                    className={cn("h-3.5 w-3.5 mr-2", config.color)}
                  />
                  {config.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator className="bg-zinc-100 mx-1 my-2" />
              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Priority
              </DropdownMenuLabel>
              {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={priorityFilter === value}
                  onCheckedChange={() =>
                    setPriorityFilter(value as TaskPriority)
                  }
                  className="rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <Flag className={cn("h-3.5 w-3.5 mr-2", config.color)} />
                  {config.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
      activeFilters={activeFilterChips}
      onReset={clearFilters}
    />
  );
}

type TasksContentProps = {
  error: string | null;
  loading: boolean;
  displayedTasks: Task[];
  viewMode: ViewMode;
  viewFilter: ViewFilter;
  refresh: () => void | Promise<void>;
  moveTask: React.ComponentProps<typeof TaskKanbanBoard>["onMoveTask"];
  handleEdit: (task: Task) => void;
  handleComplete: (task: Task) => void | Promise<void>;
  handleDeleteClick: (task: Task) => void;
  handleCreateInStatus: (status: TaskStatus) => void;
  setTaskDialogOpen: (value: React.SetStateAction<boolean>) => void;
};

function TasksContent({
  error,
  loading,
  displayedTasks,
  viewMode,
  viewFilter,
  refresh,
  moveTask,
  handleEdit,
  handleComplete,
  handleDeleteClick,
  handleCreateInStatus,
  setTaskDialogOpen,
}: TasksContentProps) {
  return (
    <AnimatePresence mode="wait">
      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-zinc-100 rounded-3xl">
          <div className="size-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
            <AlertCircle className="size-8 text-rose-500" />
          </div>
          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
            Sync failed
          </h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm font-medium">
            {error}
          </p>
          <Button
            onClick={refresh}
            variant="outline"
            className="mt-6 h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
          >
            <RefreshCw className="mr-2 size-4" />
            Retry Sync
          </Button>
        </div>
      ) : loading && displayedTasks.length === 0 ? (
        <BoneyardSkeleton
          name="missionary-tasks-list"
          loading={true}
          fallback={<TaskListSkeleton />}
          fixture={<MissionaryTasksListBoneyardFixture />}
          snapshotConfig={{
            excludeSelectors: ["[data-no-skeleton]", "svg.lucide", "svg"],
            excludeTags: ["footer"],
          }}
        >
          {/* Overlay uses captured bones + fixture; keep children minimal to avoid duplicating the full task list. */}
          <div />
        </BoneyardSkeleton>
      ) : viewMode === "board" ? (
        <motion.div
          key="board-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={smoothTransition}
        >
          <TaskKanbanBoard
            tasks={displayedTasks}
            onMoveTask={moveTask}
            onEditTask={handleEdit}
            onCompleteTask={handleComplete}
            onDeleteTask={handleDeleteClick}
            onCreateTask={handleCreateInStatus}
          />
        </motion.div>
      ) : displayedTasks.length > 0 ? (
        <motion.div
          key={`list-view-${viewFilter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid gap-3"
        >
          {displayedTasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={() => handleComplete(task)}
              onEdit={() => handleEdit(task)}
              onDelete={() => handleDeleteClick(task)}
              index={index}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-32 bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-[2.5rem]">
          <div className="size-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-zinc-100">
            <CheckCircle2 className="size-10 text-zinc-200" />
          </div>
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
            All caught up
          </h3>
          <p className="text-sm text-zinc-500 mt-2 font-medium">
            No tasks found for the current filters.
          </p>
          <Button
            onClick={() => setTaskDialogOpen(true)}
            className="mt-8 h-12 px-8 rounded-xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px]"
          >
            <Plus className="mr-2 size-4" />
            Create New Task
          </Button>
        </div>
      )}
    </AnimatePresence>
  );
}

type DeleteTaskDialogProps = {
  deleteDialogOpen: boolean;
  taskToDelete: Task | null;
  setDeleteDialogOpen: (value: React.SetStateAction<boolean>) => void;
  handleDeleteConfirm: () => void | Promise<void>;
};

function DeleteTaskDialog({
  deleteDialogOpen,
  taskToDelete,
  setDeleteDialogOpen,
  handleDeleteConfirm,
}: DeleteTaskDialogProps) {
  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent className="rounded-4xl border-zinc-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-black tracking-tight text-zinc-900 uppercase">
            Delete Task
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium text-zinc-500">
            Are you sure you want to delete &quot;{taskToDelete?.title}
            &quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-xl border-zinc-200 font-bold uppercase tracking-widest text-[10px] h-11">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold uppercase tracking-widest text-[10px] h-11 border-none"
          >
            Delete Task
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TasksPageView() {
  const {
    loading,
    error,
    filteredTasks,
    stats,
    completeTask,
    reopenTask,
    deleteTask,
    moveTask,
    refresh,
  } = useTasks();

  const [state, setState] = useState<TasksPageState>({
    viewFilter: "active",
    viewMode: "board",
    searchTerm: "",
    taskDialogOpen: false,
    editingTask: null,
    initialStatus: undefined,
    deleteDialogOpen: false,
    taskToDelete: null,
    typeFilter: "all",
    priorityFilter: "all",
  });
  const {
    viewFilter,
    viewMode,
    searchTerm,
    taskDialogOpen,
    editingTask,
    initialStatus,
    deleteDialogOpen,
    taskToDelete,
    typeFilter,
    priorityFilter,
  } = state;

  const setField = useCallback(
    <K extends keyof TasksPageState>(
      key: K,
      value: React.SetStateAction<TasksPageState[K]>,
    ) => {
      setState((prev) => ({
        ...prev,
        [key]:
          typeof value === "function"
            ? (value as (prevValue: TasksPageState[K]) => TasksPageState[K])(
                prev[key],
              )
            : value,
      }));
    },
    [],
  );

  const setViewFilter = useCallback(
    (value: React.SetStateAction<ViewFilter>) => setField("viewFilter", value),
    [setField],
  );
  const setViewMode = useCallback(
    (value: React.SetStateAction<ViewMode>) => setField("viewMode", value),
    [setField],
  );
  const setSearchTerm = useCallback(
    (value: React.SetStateAction<string>) => setField("searchTerm", value),
    [setField],
  );
  const setTaskDialogOpen = useCallback(
    (value: React.SetStateAction<boolean>) => setField("taskDialogOpen", value),
    [setField],
  );
  const setEditingTask = useCallback(
    (value: React.SetStateAction<Task | null>) =>
      setField("editingTask", value),
    [setField],
  );
  const setInitialStatus = useCallback(
    (value: React.SetStateAction<TaskStatus | undefined>) =>
      setField("initialStatus", value),
    [setField],
  );
  const setDeleteDialogOpen = useCallback(
    (value: React.SetStateAction<boolean>) =>
      setField("deleteDialogOpen", value),
    [setField],
  );
  const setTaskToDelete = useCallback(
    (value: React.SetStateAction<Task | null>) =>
      setField("taskToDelete", value),
    [setField],
  );
  const setTypeFilter = useCallback(
    (value: React.SetStateAction<TaskType | "all">) =>
      setField("typeFilter", value),
    [setField],
  );
  const setPriorityFilter = useCallback(
    (value: React.SetStateAction<TaskPriority | "all">) =>
      setField("priorityFilter", value),
    [setField],
  );

  const displayedTasks = useMemo(() => {
    let result = [...filteredTasks];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((t) => taskMatchesClientSearch(t, search));
    }

    if (typeFilter !== "all") {
      result = result.filter((t) => t.task_type === typeFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (viewMode === "list") {
      switch (viewFilter) {
        case "active":
          result = result.filter(
            (t) => t.status !== "completed" && t.status !== "deferred",
          );
          break;
        case "completed":
          result = result.filter((t) => t.status === "completed");
          break;
        case "overdue":
          result = result.filter((t) => {
            if (t.status === "completed" || t.status === "deferred")
              return false;
            if (!t.due_date) return false;
            return (
              isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))
            );
          });
          break;
        case "today":
          result = result.filter((t) => {
            if (t.status === "completed") return false;
            if (!t.due_date) return false;
            return isToday(new Date(t.due_date));
          });
          break;
      }

      result.sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        return a.sort_key - b.sort_key;
      });
    }

    return result;
  }, [
    filteredTasks,
    viewFilter,
    viewMode,
    searchTerm,
    typeFilter,
    priorityFilter,
  ]);

  const handleComplete = async (task: Task) => {
    if (task.status === "completed") {
      await reopenTask(task.id);
    } else {
      await completeTask(task.id);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleCreateInStatus = (status: TaskStatus) => {
    setInitialStatus(status);
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setPriorityFilter("all");
    setViewFilter("active");
  };

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (typeFilter !== "all") {
      chips.push({
        label: `Type: ${TASK_TYPE_CONFIG[typeFilter].label}`,
        onRemove: () => setTypeFilter("all"),
      });
    }
    if (priorityFilter !== "all") {
      chips.push({
        label: `Priority: ${PRIORITY_CONFIG[priorityFilter].label}`,
        onRemove: () => setPriorityFilter("all"),
      });
    }
    return chips;
  }, [typeFilter, priorityFilter, setTypeFilter, setPriorityFilter]);

  return (
    <PageShell
      title="Mission Tasks"
      description="Manage follow-ups, calls, and partner communications."
      badge="Personal Workflow"
      actions={
        <TasksPageActions
          viewMode={viewMode}
          loading={loading}
          refresh={refresh}
          editingTask={editingTask}
          initialStatus={initialStatus}
          taskDialogOpen={taskDialogOpen}
          setViewMode={setViewMode}
          setTaskDialogOpen={setTaskDialogOpen}
          setEditingTask={setEditingTask}
          setInitialStatus={setInitialStatus}
        />
      }
    >
      <div className="space-y-10">
        <TasksStatsGrid
          stats={stats}
          viewFilter={viewFilter}
          setViewFilter={setViewFilter}
        />

        <TasksFilterBar
          viewMode={viewMode}
          viewFilter={viewFilter}
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          priorityFilter={priorityFilter}
          activeFilterChips={activeFilterChips}
          setSearchTerm={setSearchTerm}
          setViewFilter={setViewFilter}
          setTypeFilter={setTypeFilter}
          setPriorityFilter={setPriorityFilter}
          clearFilters={clearFilters}
        />

        <TasksContent
          error={error}
          loading={loading}
          displayedTasks={displayedTasks}
          viewMode={viewMode}
          viewFilter={viewFilter}
          refresh={refresh}
          moveTask={moveTask}
          handleEdit={handleEdit}
          handleComplete={handleComplete}
          handleDeleteClick={handleDeleteClick}
          handleCreateInStatus={handleCreateInStatus}
          setTaskDialogOpen={setTaskDialogOpen}
        />

        <DeleteTaskDialog
          deleteDialogOpen={deleteDialogOpen}
          taskToDelete={taskToDelete}
          setDeleteDialogOpen={setDeleteDialogOpen}
          handleDeleteConfirm={handleDeleteConfirm}
        />
      </div>
    </PageShell>
  );
}

export default function TasksPage() {
  return <TasksPageView />;
}
