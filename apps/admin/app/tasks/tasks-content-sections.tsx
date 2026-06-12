"use client";

import { motion } from "@asym/lib/motion";
import { FilterBar } from "@asym/ui/components/primitives/filter-bar";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import { DataTableWrapper } from "@asym/ui/components/shadcn/data-table/data-table-wrapper";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import {
  AlertCircle,
  CheckSquare,
  CircleCheckBig,
  Clock,
  ListFilter,
  ListTodo,
} from "lucide-react";

import type { Task } from "./types";
import type { ColumnDef } from "@tanstack/react-table";
import type React from "react";

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export type TasksViewTab = "all" | "my" | "overdue";

interface TasksStats {
  overdue: number;
  dueToday: number;
  inProgress: number;
  completed: number;
}

const isTasksViewTab = (value: string): value is TasksViewTab =>
  value === "all" || value === "my" || value === "overdue";

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  color,
  onClick,
  isActive,
}: {
  label: string;
  value: number;
  helper: string;
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
        "flex flex-1 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition-[border-color,box-shadow,transform]",
        color,
        isActive
          ? "border-zinc-900 ring-2 ring-zinc-900/10"
          : "border-zinc-100/70 bg-white",
      )}
    >
      <div className="rounded-xl bg-white/70 p-2 shadow-sm ring-1 ring-black/5">
        <Icon className="size-5" />
      </div>
      <div className="flex min-w-0 flex-col">
        <motion.span
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-black tabular-nums tracking-tight"
        >
          {value}
        </motion.span>
        <span className="mt-0.5 text-sm font-bold leading-none text-zinc-900">
          {label}
        </span>
        <span className="mt-1 text-xs font-medium leading-snug text-zinc-600">
          {helper}
        </span>
      </div>
    </motion.button>
  );
}

interface TasksStatsCardsSectionProps {
  activeTab: TasksViewTab;
  stats: TasksStats;
  onOverdueClick: () => void;
}

export function TasksStatsCardsSection({
  activeTab,
  stats,
  onOverdueClick,
}: TasksStatsCardsSectionProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Critical"
        value={stats.overdue}
        helper="Past due and still open"
        icon={AlertCircle}
        color="bg-rose-50/70 text-rose-700"
        isActive={activeTab === "overdue"}
        onClick={onOverdueClick}
      />
      <StatCard
        label="Due Today"
        value={stats.dueToday}
        helper="Scheduled for today"
        icon={Clock}
        color="bg-amber-50/70 text-amber-700"
      />
      <StatCard
        label="In Progress"
        value={stats.inProgress}
        helper="Currently being worked"
        icon={ListTodo}
        color="bg-blue-50/70 text-blue-700"
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        helper="Closed mission tasks"
        icon={CheckSquare}
        color="bg-emerald-50/70 text-emerald-700"
      />
    </div>
  );
}

interface TasksFilterSectionProps {
  activeTab: TasksViewTab;
  searchTerm: string;
  showCompleted: boolean;
  onSearchChange: (value: string) => void;
  onTabChange: (tab: TasksViewTab) => void;
  onShowCompletedChange: (value: boolean) => void;
}

export function TasksFilterSection({
  activeTab,
  searchTerm,
  showCompleted,
  onSearchChange,
  onTabChange,
  onShowCompletedChange,
}: TasksFilterSectionProps) {
  return (
    <FilterBar
      search={{
        value: searchTerm,
        onChange: onSearchChange,
        placeholder: "Search mission tasks...",
      }}
      filters={
        <div className="flex items-center gap-3">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (isTasksViewTab(value)) {
                onTabChange(value);
              }
            }}
          >
            <TabsList className="bg-zinc-100/80 p-1 h-11 rounded-xl border border-zinc-200/50">
              <TabsTrigger
                value="all"
                className="rounded-lg px-4 text-xs font-semibold data-active:bg-white data-active:shadow-sm"
              >
                All Missions
              </TabsTrigger>
              <TabsTrigger
                value="my"
                className="rounded-lg px-4 text-xs font-semibold data-active:bg-white data-active:shadow-sm"
              >
                My Work
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="h-11 gap-2 rounded-xl border-zinc-200 text-xs font-semibold"
                />
              }
            >
              <ListFilter className="size-4 text-zinc-500" />
              Display
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl border-zinc-100 p-2 shadow-xl"
            >
              <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-zinc-600">
                View Settings
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showCompleted}
                onCheckedChange={(value) =>
                  onShowCompletedChange(Boolean(value))
                }
                className="rounded-lg px-3 py-2 text-sm font-medium"
              >
                Include Completed
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    />
  );
}

interface TasksTableSectionProps {
  columns: ColumnDef<Task>[];
  data: Task[];
  isLoading?: boolean;
  onCreateTask: () => void;
}

export function TasksTableSection({
  columns,
  data,
  isLoading,
  onCreateTask,
}: TasksTableSectionProps) {
  return (
    <Card className="rounded-2xl border-zinc-100/80 bg-white shadow-sm">
      <div className="p-1">
        <DataTableWrapper
          columns={columns}
          data={data}
          isLoading={isLoading}
          searchColumnId="title"
          getRowId={(task) => task.id}
          config={{
            enableRowSelection: true,
            enableColumnVisibility: true,
            enablePagination: true,
            enableFilters: true,
            enableSorting: true,
            enableKeyboardNavigation: true,
          }}
          emptyState={{
            title: "No missions found",
            description:
              "Try adjusting your search or filters to coordinate tasks.",
            icon: <CircleCheckBig className="size-10 text-zinc-200" />,
            action: (
              <Button
                onClick={onCreateTask}
                variant="outline"
                className="mt-4 rounded-xl text-xs font-semibold"
              >
                Create First Task
              </Button>
            ),
          }}
        />
      </div>
    </Card>
  );
}
