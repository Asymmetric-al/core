"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  CheckSquare,
  Clock,
  AlertCircle,
  ListTodo,
  ListFilter,
  CircleCheckBig,
} from "lucide-react";

import { Button } from "@asym/ui/components/shadcn/button";
import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { FilterBar } from "@asym/ui/components/shadcn/filter-bar";
import { DataTableWrapper } from "@asym/ui/components/shadcn/data-table/data-table-wrapper";
import { cn } from "@asym/ui/lib/utils";

import type { Task, TaskStatus } from "./types";
import { getPriorityConfig, getStatusConfig } from "./types";
import { MOCK_TASKS, MOCK_STAFF, MOCK_LINKED_ENTITIES } from "./data";
import { getTaskColumns } from "./task-columns";
import { TaskDrawer } from "./task-drawer";
import { TaskForm } from "./task-form";

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  onClick,
  isActive,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
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
        "flex items-center gap-4 px-6 py-5 rounded-[2rem] border transition-all cursor-pointer text-left shadow-sm min-w-[200px] flex-1",
        color,
        isActive
          ? "ring-2 ring-zinc-900 ring-offset-2 border-transparent"
          : "border-zinc-100/60 bg-white",
      )}
    >
      <div className={cn("p-3 rounded-2xl bg-white/50 shadow-sm")}>
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col">
        <motion.span
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-black tabular-nums tracking-tighter"
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

export function TasksPageContent() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my" | "overdue">("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    setSelectedTask(updatedTask);
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
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
    setIsModalOpen(false);
    setEditingTask(null);
  }, []);

  const columns = useMemo(
    () =>
      getTaskColumns({
        onViewTask: setSelectedTask,
        onEditTask: (task) => {
          setEditingTask(task);
          setIsModalOpen(true);
        },
        onDeleteTask: handleDeleteTask,
        onToggleComplete: handleToggleComplete,
      }),
    [handleDeleteTask, handleToggleComplete],
  );

  return (
    <PageShell
      title="Mission Pipeline"
      description="Coordinate donor outreach and field operations."
      badge="Task Management"
      actions={
        <Button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="h-12 px-8 font-black bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-200 uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all"
        >
          <Plus className="mr-2 size-4" />
          New Mission Task
        </Button>
      }
    >
      <div className="space-y-12">
        <div className="flex flex-wrap gap-6">
          <StatCard
            label="Critical"
            value={stats.overdue}
            icon={AlertCircle}
            color="text-rose-600 bg-rose-50/30"
            isActive={activeTab === "overdue"}
            onClick={() => setActiveTab("overdue")}
          />
          <StatCard
            label="Due Today"
            value={stats.dueToday}
            icon={Clock}
            color="text-amber-600 bg-amber-50/30"
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={ListTodo}
            color="text-blue-600 bg-blue-50/30"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckSquare}
            color="text-emerald-600 bg-emerald-50/30"
          />
        </div>

        <FilterBar
          search={{
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: "Search mission tasks...",
          }}
          filters={
            <div className="flex items-center gap-3">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
              >
                <TabsList className="bg-zinc-100/80 p-1 h-11 rounded-xl border border-zinc-200/50">
                  <TabsTrigger
                    value="all"
                    className="text-[9px] font-black uppercase tracking-widest px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    All Missions
                  </TabsTrigger>
                  <TabsTrigger
                    value="my"
                    className="text-[9px] font-black uppercase tracking-widest px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    My Work
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-zinc-200 font-bold uppercase tracking-widest text-[10px] gap-2"
                  >
                    <ListFilter className="size-4 text-zinc-400" />
                    Display
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl border-zinc-100 p-2 shadow-xl"
                >
                  <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    View Settings
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={showCompleted}
                    onCheckedChange={setShowCompleted}
                    className="rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    Include Completed
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />

        <Card className="rounded-[2.5rem] border-zinc-100/80 shadow-sm overflow-hidden bg-white">
          <div className="p-1">
            <DataTableWrapper
              columns={columns}
              data={filteredTasks}
              searchKey="title"
              config={{
                enableRowSelection: true,
                enableColumnVisibility: true,
                enablePagination: true,
                enableFilters: true,
                enableSorting: true,
              }}
              emptyState={{
                title: "No missions found",
                description:
                  "Try adjusting your search or filters to coordinate tasks.",
                icon: <CircleCheckBig className="size-10 text-zinc-200" />,
                action: (
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="outline"
                    className="mt-4 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                  >
                    Create First Task
                  </Button>
                ),
              }}
            />
          </div>
        </Card>
      </div>

      <TaskDrawer
        task={selectedTask}
        staffMembers={MOCK_STAFF}
        linkedEntities={MOCK_LINKED_ENTITIES}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      <TaskForm
        open={isModalOpen}
        task={editingTask}
        staffMembers={MOCK_STAFF}
        linkedEntities={MOCK_LINKED_ENTITIES}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </PageShell>
  );
}
