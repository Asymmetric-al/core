"use client";

import {
  useTaskLinkedEntities,
  useTaskStaff,
  useTasksRows,
} from "@asym/database/hooks";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import { Plus } from "lucide-react";
import { useMemo, useCallback, useReducer } from "react";

import { getTaskColumns } from "./task-columns";
import { TaskDrawer } from "./task-drawer";
import { TaskForm } from "./task-form";
import {
  TasksFilterSection,
  TasksStatsCardsSection,
  TasksTableSection,
  type TasksViewTab,
} from "./tasks-content-sections";

import type { Task, TaskStatus } from "./types";

interface TasksUiState {
  selectedTask: Task | null;
  editingTask: Task | null;
  isModalOpen: boolean;
  activeTab: TasksViewTab;
  showCompleted: boolean;
  searchTerm: string;
}

type TasksUiAction =
  | { type: "set-selected-task"; task: Task | null }
  | { type: "open-create-modal" }
  | { type: "open-edit-modal"; task: Task }
  | { type: "close-modal" }
  | { type: "set-active-tab"; tab: TasksViewTab }
  | { type: "set-show-completed"; value: boolean }
  | { type: "set-search-term"; value: string };

const INITIAL_TASKS_UI_STATE: TasksUiState = {
  selectedTask: null,
  editingTask: null,
  isModalOpen: false,
  activeTab: "all",
  showCompleted: false,
  searchTerm: "",
};

function tasksUiReducer(
  state: TasksUiState,
  action: TasksUiAction,
): TasksUiState {
  switch (action.type) {
    case "set-selected-task":
      return { ...state, selectedTask: action.task };
    case "open-create-modal":
      return { ...state, editingTask: null, isModalOpen: true };
    case "open-edit-modal":
      return { ...state, editingTask: action.task, isModalOpen: true };
    case "close-modal":
      return { ...state, isModalOpen: false, editingTask: null };
    case "set-active-tab":
      return { ...state, activeTab: action.tab };
    case "set-show-completed":
      return { ...state, showCompleted: action.value };
    case "set-search-term":
      return { ...state, searchTerm: action.value };
    default:
      return state;
  }
}

export function TasksPageContent() {
  const [uiState, dispatchUi] = useReducer(
    tasksUiReducer,
    INITIAL_TASKS_UI_STATE,
  );
  const tasksQuery = useTasksRows();
  const staffQuery = useTaskStaff();
  const linkedEntitiesQuery = useTaskLinkedEntities();
  const {
    selectedTask,
    editingTask,
    isModalOpen,
    activeTab,
    showCompleted,
    searchTerm,
  } = uiState;
  const tasks = useMemo(
    () => (tasksQuery.data ?? []) as Task[],
    [tasksQuery.data],
  );
  const staffMembers = staffQuery.data ?? [];
  const linkedEntities = linkedEntitiesQuery.data ?? [];
  const isLoading =
    tasksQuery.isLoading ||
    staffQuery.isLoading ||
    linkedEntitiesQuery.isLoading;
  const tasksCollection = tasksQuery.collection;

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = tasks.filter(
      (t) =>
        t.status !== "completed" && t.due_date && new Date(t.due_date) < today,
    ).length;

    const dueToday = tasks.filter(
      (t) =>
        t.status !== "completed" &&
        t.due_date &&
        new Date(t.due_date).toDateString() === today.toDateString(),
    ).length;

    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;

    return { overdue, dueToday, inProgress, completed };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search) ||
          t.assigned_to_name?.toLowerCase().includes(search) ||
          t.linked_entity?.name.toLowerCase().includes(search),
      );
    }

    if (!showCompleted) {
      filtered = filtered.filter(
        (t) => t.status !== "completed" && t.status !== "cancelled",
      );
    }

    if (activeTab === "my") {
      filtered = filtered.filter((t) => t.assigned_to === "staff-1");
    } else if (activeTab === "overdue") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(
        (t) =>
          t.status !== "completed" &&
          t.due_date &&
          new Date(t.due_date) < today,
      );
    }

    return filtered;
  }, [tasks, activeTab, showCompleted, searchTerm]);

  const handleToggleComplete = useCallback(
    (task: Task) => {
      if (!tasksCollection) {
        return;
      }

      const newStatus: TaskStatus =
        task.status === "completed" ? "todo" : "completed";
      const timestamp = new Date().toISOString();
      const tx = tasksCollection.update(task.id, (draft) => {
        draft.status = newStatus;
        draft.completed_at = newStatus === "completed" ? timestamp : undefined;
        draft.updated_at = timestamp;
      });

      void tx.isPersisted.promise;
    },
    [tasksCollection],
  );

  const handleUpdateTask = useCallback(
    (updatedTask: Task) => {
      if (!tasksCollection) {
        return;
      }

      const tx = tasksCollection.update(updatedTask.id, (draft) => {
        Object.assign(draft, updatedTask);
      });

      void tx.isPersisted.promise;
      dispatchUi({ type: "set-selected-task", task: updatedTask });
    },
    [tasksCollection],
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      if (!tasksCollection) {
        return;
      }

      const tx = tasksCollection.delete(taskId);
      void tx.isPersisted.promise;
      dispatchUi({ type: "set-selected-task", task: null });
    },
    [tasksCollection],
  );

  const handleSaveTask = useCallback(
    (taskData: Partial<Task>) => {
      if (!tasksCollection) {
        return;
      }

      if (taskData.id) {
        const tx = tasksCollection.update(taskData.id, (draft) => {
          Object.assign(draft, taskData, {
            updated_at: new Date().toISOString(),
          });
        });

        void tx.isPersisted.promise;
      } else {
        const newTask: Task = {
          ...(taskData as Task),
          id: crypto.randomUUID(),
          tenant_id: "tenant-1",
          created_by: "staff-1",
          reminders: taskData.reminders || [],
          comments: [],
          tags: taskData.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const tx = tasksCollection.insert(newTask);
        void tx.isPersisted.promise;
      }
      dispatchUi({ type: "close-modal" });
    },
    [tasksCollection],
  );

  const handleViewTask = useCallback((task: Task) => {
    dispatchUi({ type: "set-selected-task", task });
  }, []);

  const handleOpenEditTask = useCallback((task: Task) => {
    dispatchUi({ type: "open-edit-modal", task });
  }, []);

  const columns = useMemo(
    () =>
      getTaskColumns({
        onViewTask: handleViewTask,
        onEditTask: handleOpenEditTask,
        onDeleteTask: handleDeleteTask,
        onToggleComplete: handleToggleComplete,
      }),
    [
      handleDeleteTask,
      handleOpenEditTask,
      handleToggleComplete,
      handleViewTask,
    ],
  );

  return (
    <PageShell
      title="Mission Pipeline"
      description="Coordinate donor outreach and field operations."
      actions={
        <Button
          onClick={() => dispatchUi({ type: "open-create-modal" })}
          className="h-12 px-8 font-black bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-200 uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all"
        >
          <Plus className="mr-2 size-4" />
          New Mission Task
        </Button>
      }
    >
      <div className="space-y-12">
        <TasksStatsCardsSection
          activeTab={activeTab}
          stats={stats}
          onOverdueClick={() =>
            dispatchUi({ type: "set-active-tab", tab: "overdue" })
          }
        />

        <TasksFilterSection
          activeTab={activeTab}
          searchTerm={searchTerm}
          showCompleted={showCompleted}
          onSearchChange={(value) =>
            dispatchUi({ type: "set-search-term", value })
          }
          onTabChange={(tab) => dispatchUi({ type: "set-active-tab", tab })}
          onShowCompletedChange={(value) =>
            dispatchUi({
              type: "set-show-completed",
              value,
            })
          }
        />

        <TasksTableSection
          columns={columns}
          data={filteredTasks}
          isLoading={isLoading}
          onCreateTask={() => dispatchUi({ type: "open-create-modal" })}
        />
      </div>

      <TaskDrawer
        task={selectedTask}
        staffMembers={staffMembers}
        linkedEntities={linkedEntities}
        onClose={() => dispatchUi({ type: "set-selected-task", task: null })}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      <TaskForm
        open={isModalOpen}
        task={editingTask}
        staffMembers={staffMembers}
        linkedEntities={linkedEntities}
        onClose={() => dispatchUi({ type: "close-modal" })}
        onSave={handleSaveTask}
      />
    </PageShell>
  );
}
