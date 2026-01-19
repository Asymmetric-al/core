"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Trash2, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskStatus } from "@/lib/missionary/types";

interface TaskBulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onUpdateStatus: (status: TaskStatus) => void;
  onDelete: () => void;
}

export function TaskBulkActionsBar({
  selectedCount,
  onClear,
  onUpdateStatus,
  onDelete,
}: TaskBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-primary text-primary-foreground rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear selection</span>
          </Button>

          <span className="text-sm font-medium">{selectedCount} selected</span>

          <div className="h-4 w-px bg-primary-foreground/20" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateStatus("completed")}
            className="h-8 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Complete
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                Status
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => onUpdateStatus("not_started")}>
                Not Started
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("in_progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("waiting")}>
                Waiting
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("deferred")}>
                Deferred
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-primary-foreground/20" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 text-destructive-foreground hover:text-destructive-foreground hover:bg-destructive/80"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
