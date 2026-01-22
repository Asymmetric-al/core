"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { X, Trash2, Download, RefreshCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@asym/lib/utils";
import { Button } from "@asym/ui/components/shadcn/button";
import { Separator } from "@asym/ui/components/shadcn/separator";

interface DataTableActionBarProps<TData> {
  table: Table<TData>;
  actions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (rows: TData[]) => void;
    variant?: "default" | "destructive";
  }[];
  className?: string;
}

export function DataTableActionBar<TData>({
  table,
  actions,
  className,
}: DataTableActionBarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  if (selectedCount === 0) return null;

  const defaultActions = [
    {
      label: "Export",
      icon: Download,
      onClick: () => {
        console.log(
          "Export selected rows:",
          selectedRows.map((r) => r.original),
        );
      },
      variant: "default" as const,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: () => {
        console.log(
          "Delete selected rows:",
          selectedRows.map((r) => r.original),
        );
      },
      variant: "destructive" as const,
    },
  ];

  const allActions = actions || defaultActions;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-3 px-4 py-3",
          "bg-primary text-primary-foreground",
          "rounded-2xl shadow-2xl",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{selectedCount}</span>
          <span className="text-sm">selected</span>
        </div>
        <Separator
          orientation="vertical"
          className="h-5 bg-primary-foreground/20"
        />
        <div className="flex items-center gap-1">
          {allActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              onClick={() =>
                action.onClick(selectedRows.map((row) => row.original))
              }
              className={cn(
                "h-8 gap-2 rounded-xl text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
                action.variant === "destructive" && "hover:bg-destructive/20",
              )}
            >
              {action.icon && (
                <action.icon className="size-4" aria-hidden="true" />
              )}
              {action.label}
            </Button>
          ))}
        </div>
        <Separator
          orientation="vertical"
          className="h-5 bg-primary-foreground/20"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => table.toggleAllPageRowsSelected(false)}
          className="size-8 rounded-xl text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
