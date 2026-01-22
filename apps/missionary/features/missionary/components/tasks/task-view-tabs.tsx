"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@asym/lib/utils";

export type TaskView =
  | "all"
  | "my_tasks"
  | "due_today"
  | "overdue"
  | "upcoming"
  | "completed";

interface TaskViewTabsProps {
  currentView: TaskView;
  onViewChange: (view: TaskView) => void;
  counts?: {
    all?: number;
    my_tasks?: number;
    due_today?: number;
    overdue?: number;
    upcoming?: number;
    completed?: number;
  };
}

const views: { id: TaskView; label: string }[] = [
  { id: "all", label: "All" },
  { id: "my_tasks", label: "Active" },
  { id: "due_today", label: "Due Today" },
  { id: "overdue", label: "Overdue" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

export function TaskViewTabs({
  currentView,
  onViewChange,
  counts,
}: TaskViewTabsProps) {
  return (
    <div className="w-full border-b bg-card">
      <div className="container">
        <nav
          className="relative flex gap-1 overflow-x-auto pb-0 scrollbar-hide"
          aria-label="Task views"
        >
          {views.map((view) => {
            const isActive = currentView === view.id;
            const count = counts?.[view.id];
            const isOverdue = view.id === "overdue" && count && count > 0;

            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive ? "text-foreground" : "text-muted-foreground",
                  isOverdue && !isActive && "text-destructive",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{view.label}</span>
                {count !== undefined && (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isOverdue
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <motion.span
                    layoutId="task-tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full z-10"
                    style={{ bottom: 0, top: "auto" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
