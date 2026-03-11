"use client";

import { motion } from "@asym/lib/motion";
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
import { FilterBar } from "@asym/ui/components/shadcn/filter-bar";
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
      <div className="p-3 rounded-2xl bg-white/50 shadow-sm">
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
    <div className="flex flex-wrap gap-6">
      <StatCard
        label="Critical"
        value={stats.overdue}
        icon={AlertCircle}
        color="text-rose-600 bg-rose-50/30"
        isActive={activeTab === "overdue"}
        onClick={onOverdueClick}
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
  onCreateTask: () => void;
}

export function TasksTableSection({
  columns,
  data,
  onCreateTask,
}: TasksTableSectionProps) {
  return (
    <Card className="rounded-[2.5rem] border-zinc-100/80 shadow-sm overflow-hidden bg-white">
      <div className="p-1">
        <DataTableWrapper
          columns={columns}
          data={data}
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
                onClick={onCreateTask}
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
  );
}
