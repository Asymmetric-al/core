"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Plus, CheckCircle2, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  filter: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onCreateTask: () => void;
}

export function EmptyState({
  filter,
  hasFilters,
  onClearFilters,
  onCreateTask,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        {hasFilters ? (
          <FilterX className="h-8 w-8 text-muted-foreground" />
        ) : (
          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasFilters
          ? "No matching tasks"
          : filter === "all"
            ? "No tasks yet"
            : "All clear!"}
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {hasFilters
          ? "We couldn't find any tasks matching your current filters. Try adjusting your search or clearing filters."
          : filter === "all"
            ? "Get started by creating your first task to track partner engagements and follow-ups."
            : `No tasks found in the ${filter.replace("_", " ")} view. Great job staying on top of your work!`}
      </p>

      <div className="flex items-center gap-3">
        {hasFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        <Button onClick={onCreateTask}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>
    </motion.div>
  );
}
