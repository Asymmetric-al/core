"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@asym/ui/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  variant?: "default" | "warning" | "danger" | "muted";
  onClick?: () => void;
  isActive?: boolean;
}

export function StatCard({
  label,
  value,
  variant = "default",
  onClick,
  isActive,
}: StatCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 px-5 py-4 rounded-2xl border transition-all cursor-pointer text-left shadow-sm min-w-[120px] flex-1 md:flex-none relative overflow-hidden group",
        variant === "default" && "bg-card border-border text-foreground",
        variant === "warning" &&
          "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200",
        variant === "danger" &&
          "bg-destructive/10 border-destructive/20 text-destructive",
        variant === "muted" && "bg-muted border-border text-muted-foreground",
        isActive &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary",
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-stat-pill"
          className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary"
        />
      )}
      <motion.span
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-3xl font-bold tabular-nums tracking-tight"
      >
        {value}
      </motion.span>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </motion.button>
  );
}

interface TaskStatsProps {
  stats: {
    notStarted: number;
    inProgress: number;
    completed: number;
    overdue: number;
    dueToday: number;
    highPriority: number;
  };
  currentView: string;
  onViewChange: (view: string) => void;
}

export function TaskStats({
  stats,
  currentView,
  onViewChange,
}: TaskStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 lg:pb-0 lg:grid lg:grid-cols-5"
    >
      <StatCard
        label="Pending"
        value={stats.notStarted + stats.inProgress}
        variant="default"
        onClick={() => onViewChange("my_tasks")}
        isActive={currentView === "my_tasks"}
      />
      <StatCard
        label="Due Today"
        value={stats.dueToday}
        variant={stats.dueToday > 0 ? "warning" : "muted"}
        onClick={() => onViewChange("due_today")}
        isActive={currentView === "due_today"}
      />
      <StatCard
        label="Overdue"
        value={stats.overdue}
        variant={stats.overdue > 0 ? "danger" : "muted"}
        onClick={() => onViewChange("overdue")}
        isActive={currentView === "overdue"}
      />
      <StatCard
        label="High Priority"
        value={stats.highPriority}
        variant={stats.highPriority > 0 ? "default" : "muted"}
        onClick={() => onViewChange("all")}
        isActive={false}
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        variant="muted"
        onClick={() => onViewChange("completed")}
        isActive={currentView === "completed"}
      />
    </motion.div>
  );
}
