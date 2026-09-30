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
  DropdownMenuGroup,
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
import type { ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";
import type React from "react";

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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm press-feedback hover-lift",
        color,
        isActive
          ? "border-primary ring-2 ring-primary/20"
          : "border-border bg-card",
      )}
    >
      <div className="rounded-xl bg-background/70 p-2 shadow-sm ring-1 ring-border">
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
        <span className="mt-0.5 text-sm font-bold leading-none text-foreground">
          {label}
        </span>
        <span className="mt-1 text-xs font-medium leading-snug text-muted-foreground">
          {helper}
        </span>
      </div>
    </button>
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
        color="bg-destructive/10 text-destructive"
        isActive={activeTab === "overdue"}
        onClick={onOverdueClick}
      />
      <StatCard
        label="Due Today"
        value={stats.dueToday}
        helper="Scheduled for today"
        icon={Clock}
        color="bg-accent text-accent-foreground"
      />
      <StatCard
        label="In Progress"
        value={stats.inProgress}
        helper="Currently being worked"
        icon={ListTodo}
        color="bg-primary/10 text-primary"
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        helper="Closed mission tasks"
        icon={CheckSquare}
        color="bg-secondary text-secondary-foreground"
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
            <TabsList>
              <TabsTrigger value="all">All Missions</TabsTrigger>
              <TabsTrigger value="my">My Work</TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <ListFilter className="size-4 text-muted-foreground" />
                  Display
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>View Settings</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={showCompleted}
                  onCheckedChange={(value) =>
                    onShowCompletedChange(Boolean(value))
                  }
                >
                  Include Completed
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
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
    <Card>
      <div className="p-1">
        <DataTableWrapper
          columns={columns}
          data={data}
          devtoolsKey="admin-tasks"
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
            icon: <CircleCheckBig className="size-10 text-muted-foreground" />,
            action: (
              <Button onClick={onCreateTask} variant="outline" className="mt-4">
                Create First Task
              </Button>
            ),
          }}
        />
      </div>
    </Card>
  );
}
