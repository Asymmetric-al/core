"use client";

import { useTasks } from "@asym/lib/hooks";
import { getFullTaskMoveIndex } from "@asym/lib/hooks/task-move-index";
import { useMediaQuery } from "@asym/lib/hooks/use-mobile";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { TaskDialog } from "@asym/missionary/components/task-dialog";
import { TaskKanbanBoard } from "@asym/missionary/components/task-kanban-board";
import { TaskRow } from "@asym/missionary/components/task-row";
import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageHeader } from "@asym/ui/components/page-header";
import { FilterBar } from "@asym/ui/components/primitives/filter-bar";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenuGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
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
    color: "text-info",
    bgColor: "bg-info/10",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  to_do: {
    label: "To-do",
    icon: CheckSquare,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  follow_up: {
    label: "Follow Up",
    icon: UserPlus,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  thank_you: {
    label: "Thank You",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  meeting: {
    label: "Meeting",
    icon: Users,
    color: "text-info",
    bgColor: "bg-info/10",
  },
};

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; badgeColor: string }
> = {
  none: {
    label: "None",
    color: "text-muted-foreground",
    badgeColor: "bg-muted text-muted-foreground border-border",
  },
  low: {
    label: "Low",
    color: "text-info",
    badgeColor: "bg-info/10 text-info border-info/20",
  },
  medium: {
    label: "Medium",
    color: "text-warning",
    badgeColor: "bg-warning/10 text-warning border-warning/20",
  },
  high: {
    label: "High",
    color: "text-destructive",
    badgeColor: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-5 border border-border rounded-2xl bg-card"
        >
          <Skeleton className="size-5 rounded-md mt-1" />
          <Skeleton className="size-10 rounded-xl" />
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

function SummaryFigure({
  label,
  value,
  urgent = false,
}: {
  label: string;
  value: number;
  urgent?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3 sm:py-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-2xl font-semibold tabular-nums tracking-tight",
          urgent ? "text-destructive" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

type ViewFilter =
  "all" | "active" | "completed" | "overdue" | "today" | "deferred";
type ViewMode = "list" | "board";
type TasksPageState = {
  viewFilter: ViewFilter;
  /** Null until the missionary picks a view; until then it follows the screen. */
  viewMode: ViewMode | null;
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
  addTaskRef: React.RefObject<HTMLButtonElement | null>;
  listViewRef: React.RefObject<HTMLButtonElement | null>;
  editingTask: Task | null;
  initialStatus: TaskStatus | undefined;
  taskDialogOpen: boolean;
  setViewMode: (value: ViewMode) => void;
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
  addTaskRef,
  listViewRef,
  editingTask,
  initialStatus,
  taskDialogOpen,
  setViewMode,
  setTaskDialogOpen,
  setEditingTask,
  setInitialStatus,
}: TasksPageActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-border p-1">
        <Button
          aria-label="Board view"
          aria-pressed={viewMode === "board"}
          variant={viewMode === "board" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("board")}
        >
          <LayoutGrid className="size-4" />
        </Button>
        <Button
          ref={listViewRef}
          aria-label="List view"
          aria-pressed={viewMode === "list"}
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("list")}
        >
          <List className="size-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="icon"
        aria-label="Refresh tasks"
        onClick={refresh}
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
          <Button ref={addTaskRef}>
            <Plus aria-hidden data-icon="inline-start" />
            Add task
          </Button>
        }
      />
    </div>
  );
}

/**
 * The workload at a glance. These are plain figures: the list's tabs, which
 * use the same words, are the one control that filters.
 */
function TasksStatsGrid({ stats }: { stats: TasksStats }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryFigure label="Open" value={stats.notStarted + stats.inProgress} />
      <SummaryFigure label="Done" value={stats.completed} />
      {stats.overdue > 0 && (
        <SummaryFigure label="Overdue" value={stats.overdue} urgent />
      )}
      {stats.dueToday > 0 && (
        <SummaryFigure label="Due today" value={stats.dueToday} />
      )}
    </dl>
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
        placeholder: "Search tasks…",
      }}
      filters={
        <div className="flex flex-wrap items-center gap-2">
          {/* The filter row sizes to its content and can't scroll, so short
              tab names keep all five within a 320px phone. */}
          {viewMode === "list" && (
            <Tabs
              value={viewFilter}
              onValueChange={(v) => setViewFilter(v as ViewFilter)}
            >
              <TabsList aria-label="Show tasks">
                <TabsTrigger value="active">Open</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="completed">Done</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <ListFilter className="size-4 text-muted-foreground" />
                  Refine
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Task type</DropdownMenuLabel>
                {Object.entries(TASK_TYPE_CONFIG).map(([value, config]) => (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={typeFilter === value}
                    onCheckedChange={() => setTypeFilter(value as TaskType)}
                  >
                    <config.icon
                      className={cn("size-3.5 mr-2", config.color)}
                    />
                    {config.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Priority</DropdownMenuLabel>
                {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={priorityFilter === value}
                    onCheckedChange={() =>
                      setPriorityFilter(value as TaskPriority)
                    }
                  >
                    <Flag className={cn("size-3.5 mr-2", config.color)} />
                    {config.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
      activeFilters={activeFilterChips}
      onReset={
        activeFilterChips.length > 0 || searchTerm ? clearFilters : undefined
      }
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
  rememberTaskAction: (event: React.SyntheticEvent<HTMLDivElement>) => void;
  handleCreateInStatus: (status: TaskStatus) => void;
  setTaskDialogOpen: (value: React.SetStateAction<boolean>) => void;
  showDeferredInList: () => void;
};

/** The board has no Deferred column, so say how many tasks it leaves out. */
function DeferredTasksNote({
  count,
  showDeferredInList,
}: {
  count: number;
  showDeferredInList: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
      <p>
        {count === 1
          ? "1 deferred task isn’t shown on the board."
          : `${count} deferred tasks aren’t shown on the board.`}
      </p>
      <Button variant="link" onClick={showDeferredInList}>
        Show in list
      </Button>
    </div>
  );
}

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
  rememberTaskAction,
  handleCreateInStatus,
  setTaskDialogOpen,
  showDeferredInList,
}: TasksContentProps) {
  return (
    <AnimatePresence mode="wait">
      {error ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <Alert variant="destructive" role="alert">
            <AlertCircle aria-hidden />
            <AlertTitle>We couldn’t load your tasks</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={refresh} variant="outline">
            <RefreshCw aria-hidden data-icon="inline-start" />
            Try again
          </Button>
        </div>
      ) : loading && displayedTasks.length === 0 ? (
        <BoneyardSkeleton
          name="missionary-tasks-list"
          loading
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
          {/* Above the columns, so it is seen without scrolling past cards. */}
          <DeferredTasksNote
            count={
              displayedTasks.filter((task) => task.status === "deferred").length
            }
            showDeferredInList={showDeferredInList}
          />
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
          onClickCapture={rememberTaskAction}
          onFocusCapture={rememberTaskAction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // One shrinkable column: long partner names truncate instead of
          // widening every card past a phone screen.
          className="grid grid-cols-1 gap-3"
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
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckCircle2 aria-hidden />
            </EmptyMedia>
            <EmptyTitle role="heading" aria-level={2}>
              All caught up
            </EmptyTitle>
            <EmptyDescription>
              No tasks found for the current filters.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setTaskDialogOpen(true)}>
              <Plus aria-hidden data-icon="inline-start" />
              Add a task
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </AnimatePresence>
  );
}

type DeleteTaskDialogProps = {
  deleteDialogOpen: boolean;
  taskToDelete: Task | null;
  deleteError: string | null;
  deletePending: boolean;
  cancelRef: React.RefObject<HTMLButtonElement | null>;
  finalFocus: React.ComponentProps<typeof AlertDialogContent>["finalFocus"];
  onOpenChange: NonNullable<
    React.ComponentProps<typeof AlertDialog>["onOpenChange"]
  >;
  handleDeleteConfirm: () => void | Promise<void>;
};

function DeleteTaskDialog({
  deleteDialogOpen,
  taskToDelete,
  deleteError,
  deletePending,
  cancelRef,
  finalFocus,
  onOpenChange,
  handleDeleteConfirm,
}: DeleteTaskDialogProps) {
  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent initialFocus={cancelRef} finalFocus={finalFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{taskToDelete?.title}
            &quot;? This action cannot be undone.
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
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel ref={cancelRef} disabled={deletePending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={deletePending}
            focusableWhenDisabled={deletePending}
            onClick={(event) => {
              event.currentTarget.focus();
              void handleDeleteConfirm();
            }}
            variant="destructive"
          >
            {deletePending ? "Deleting…" : "Delete task"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function useTasksPageController() {
  const {
    tasks,
    loading,
    error,
    filteredTasks,
    stats,
    completeTask,
    reopenTask,
    deleteTask,
    moveTask: moveTaskInFullColumn,
    refresh,
  } = useTasks();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const deletionInFlight = React.useRef(false);
  const deletionSucceeded = React.useRef(false);
  const addTaskRef = React.useRef<HTMLButtonElement | null>(null);
  const listViewRef = React.useRef<HTMLButtonElement | null>(null);
  const focusListViewAfterSwitch = React.useRef(false);
  const cancelDeleteRef = React.useRef<HTMLButtonElement | null>(null);
  const deleteReturnFocus = React.useRef<HTMLButtonElement | null>(null);
  const deleteReturnTaskId = React.useRef<string | null>(null);

  const [state, setState] = useState<TasksPageState>({
    viewFilter: "active",
    viewMode: null,
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
    viewMode: chosenViewMode,
    searchTerm,
    taskDialogOpen,
    editingTask,
    initialStatus,
    deleteDialogOpen,
    taskToDelete,
    typeFilter,
    priorityFilter,
  } = state;
  // Phones open on the list: the board's columns would scroll sideways.
  const isPhone = useMediaQuery("(max-width: 767px)");
  const viewMode: ViewMode = chosenViewMode ?? (isPhone ? "list" : "board");

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
    (value: ViewMode) => setField("viewMode", value),
    [setField],
  );
  // The deferred note leaves with the board when the list opens, so focus
  // moves to the now-selected List view control instead of the page body.
  const showDeferredInList = useCallback(() => {
    focusListViewAfterSwitch.current = true;
    setField("viewFilter", "deferred");
    setField("viewMode", "list");
  }, [setField]);
  React.useEffect(() => {
    if (viewMode !== "list" || !focusListViewAfterSwitch.current) return;
    focusListViewAfterSwitch.current = false;
    listViewRef.current?.focus();
  }, [viewMode]);
  // Until tasks have loaded there are no counts to report; zeros would
  // misstate the workload (first load, retry after a failure, or an error).
  const showStats = !((loading || error) && filteredTasks.length === 0);
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
        case "deferred":
          result = result.filter((t) => t.status === "deferred");
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
          // Matches the Due Today count, which leaves out deferred tasks.
          result = result.filter((t) => {
            if (t.status === "completed" || t.status === "deferred")
              return false;
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

  const moveTask = useCallback(
    (taskId: string, status: TaskStatus, visibleIndex: number) =>
      moveTaskInFullColumn(
        taskId,
        status,
        getFullTaskMoveIndex(
          tasks,
          displayedTasks,
          taskId,
          status,
          visibleIndex,
        ),
      ),
    [tasks, displayedTasks, moveTaskInFullColumn],
  );

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
    if (deletionInFlight.current) return;
    deletionSucceeded.current = false;
    deleteReturnTaskId.current = task.id;
    setDeleteError(null);
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const rememberTaskAction = (event: React.SyntheticEvent<HTMLDivElement>) => {
    if (deleteDialogOpen || !(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>("button");
    if (button && event.currentTarget.contains(button)) {
      deleteReturnFocus.current = button;
    }
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete && !deletionInFlight.current) {
      deletionInFlight.current = true;
      setDeletePending(true);
      setDeleteError(null);
      try {
        const deleted = await deleteTask(taskToDelete.id);
        if (deleted === true) {
          deletionSucceeded.current = true;
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        } else {
          setDeleteError("Could not delete this task. Please try again.");
        }
      } catch {
        setDeleteError("Could not delete this task. Please try again.");
      }
      deletionInFlight.current = false;
      setDeletePending(false);
    }
  };

  const handleDeleteOpenChange: DeleteTaskDialogProps["onOpenChange"] = (
    open,
    details,
  ) => {
    if (!open && deletionInFlight.current) {
      details.cancel();
      return;
    }
    setDeleteDialogOpen(open);
    if (!open) {
      setTaskToDelete(null);
      setDeleteError(null);
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
    // Deferred has no tab (the board's note opens it), so it shows as a chip.
    if (viewMode === "list" && viewFilter === "deferred") {
      chips.push({
        label: "Deferred only",
        onRemove: () => setViewFilter("active"),
      });
    }
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
  }, [
    viewMode,
    viewFilter,
    typeFilter,
    priorityFilter,
    setViewFilter,
    setTypeFilter,
    setPriorityFilter,
  ]);

  const resolveDeleteFinalFocus = () => {
    const taskIsVisible = displayedTasks.some(
      (task) => task.id === deleteReturnTaskId.current,
    );
    return !deletionSucceeded.current &&
      !error &&
      taskIsVisible &&
      deleteReturnFocus.current?.isConnected
      ? deleteReturnFocus.current
      : addTaskRef.current;
  };
  return {
    viewMode,
    loading,
    refresh,
    addTaskRef,
    listViewRef,
    editingTask,
    initialStatus,
    taskDialogOpen,
    setViewMode,
    setTaskDialogOpen,
    setEditingTask,
    setInitialStatus,
    stats,
    showStats,
    viewFilter,
    setViewFilter,
    showDeferredInList,
    searchTerm,
    typeFilter,
    priorityFilter,
    activeFilterChips,
    setSearchTerm,
    setTypeFilter,
    setPriorityFilter,
    clearFilters,
    error,
    displayedTasks,
    moveTask,
    handleEdit,
    handleComplete,
    handleDeleteClick,
    rememberTaskAction,
    handleCreateInStatus,
    deleteDialogOpen,
    taskToDelete,
    deleteError,
    deletePending,
    cancelDeleteRef,
    resolveDeleteFinalFocus,
    handleDeleteOpenChange,
    handleDeleteConfirm,
  };
}

function TasksPageView() {
  const {
    viewMode,
    loading,
    refresh,
    addTaskRef,
    listViewRef,
    editingTask,
    initialStatus,
    taskDialogOpen,
    setViewMode,
    setTaskDialogOpen,
    setEditingTask,
    setInitialStatus,
    stats,
    showStats,
    viewFilter,
    setViewFilter,
    showDeferredInList,
    searchTerm,
    typeFilter,
    priorityFilter,
    activeFilterChips,
    setSearchTerm,
    setTypeFilter,
    setPriorityFilter,
    clearFilters,
    error,
    displayedTasks,
    moveTask,
    handleEdit,
    handleComplete,
    handleDeleteClick,
    rememberTaskAction,
    handleCreateInStatus,
    deleteDialogOpen,
    taskToDelete,
    deleteError,
    deletePending,
    cancelDeleteRef,
    resolveDeleteFinalFocus,
    handleDeleteOpenChange,
    handleDeleteConfirm,
  } = useTasksPageController();
  return (
    <div className="flex flex-col gap-6 pb-20">
      <PageHeader
        title="Tasks"
        description="Calls, emails and thank-yous that keep you close to your partners."
      >
        <TasksPageActions
          viewMode={viewMode}
          loading={loading}
          refresh={refresh}
          addTaskRef={addTaskRef}
          listViewRef={listViewRef}
          editingTask={editingTask}
          initialStatus={initialStatus}
          taskDialogOpen={taskDialogOpen}
          setViewMode={setViewMode}
          setTaskDialogOpen={setTaskDialogOpen}
          setEditingTask={setEditingTask}
          setInitialStatus={setInitialStatus}
        />
      </PageHeader>
      <div className="flex flex-col gap-6">
        {showStats && <TasksStatsGrid stats={stats} />}

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
          rememberTaskAction={rememberTaskAction}
          handleCreateInStatus={handleCreateInStatus}
          setTaskDialogOpen={setTaskDialogOpen}
          showDeferredInList={showDeferredInList}
        />

        <DeleteTaskDialog
          deleteDialogOpen={deleteDialogOpen}
          taskToDelete={taskToDelete}
          deleteError={deleteError}
          deletePending={deletePending}
          cancelRef={cancelDeleteRef}
          finalFocus={resolveDeleteFinalFocus}
          onOpenChange={handleDeleteOpenChange}
          handleDeleteConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}

export default function TasksPage() {
  return <TasksPageView />;
}
