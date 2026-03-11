"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { Plus } from "lucide-react";
import { useState, useMemo, useCallback, useReducer } from "react";

import { MOCK_TASKS, MOCK_STAFF, MOCK_LINKED_ENTITIES } from "./data";
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
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [uiState, dispatchUi] = useReducer(
    tasksUiReducer,
    INITIAL_TASKS_UI_STATE,
  );
  const {
    selectedTask,
    editingTask,
    isModalOpen,
    activeTab,
    showCompleted,
    searchTerm,
  } = uiState;

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

  const handleToggleComplete = useCallback((task: Task) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === task.id) {
          const newStatus: TaskStatus =
            t.status === "completed" ? "todo" : "completed";
          return {
            ...t,
            status: newStatus,
            completed_at:
              newStatus === "completed" ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      }),
    );
  }, []);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
    dispatchUi({ type: "set-selected-task", task: updatedTask });
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    dispatchUi({ type: "set-selected-task", task: null });
  }, []);

  const handleSaveTask = useCallback((taskData: Partial<Task>) => {
    if (taskData.id) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? { ...t, ...taskData, updated_at: new Date().toISOString() }
            : t,
        ),
      );
    } else {
      const newTask: Task = {
        ...(taskData as Task),
        id: `task-${Date.now()}`,
        tenant_id: "tenant-1",
        created_by: "staff-1",
        reminders: taskData.reminders || [],
        comments: [],
        tags: taskData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    dispatchUi({ type: "close-modal" });
  }, []);

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
      badge="Task Management"
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
          onCreateTask={() => dispatchUi({ type: "open-create-modal" })}
        />
      </div>

      <TaskDrawer
        task={selectedTask}
        staffMembers={MOCK_STAFF}
        linkedEntities={MOCK_LINKED_ENTITIES}
        onClose={() => dispatchUi({ type: "set-selected-task", task: null })}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      <TaskForm
        open={isModalOpen}
        task={editingTask}
        staffMembers={MOCK_STAFF}
        linkedEntities={MOCK_LINKED_ENTITIES}
        onClose={() => dispatchUi({ type: "close-modal" })}
        onSave={handleSaveTask}
      />
    </PageShell>
  );
}
