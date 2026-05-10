"use client";

import { X, MoreHorizontal, Check } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

import type { Table } from "@tanstack/react-table";

interface FloatingActionBarAction<TData> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (rows: TData[]) => void;
  variant?: "default" | "destructive";
  hideOnMobile?: boolean;
}

interface DataTableFloatingBarProps<TData> {
  table: Table<TData>;
  actions?: FloatingActionBarAction<TData>[];
  className?: string;
}

export function DataTableFloatingBar<TData>({
  table,
  actions,
  className,
}: DataTableFloatingBarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  if (selectedCount === 0) return null;

  const selectedOriginalRows = selectedRows.map((row) => row.original);
  const allActions = actions ?? [];
  const visibleActions = allActions
    .filter((action) => !action.hideOnMobile)
    .slice(0, 2);
  const overflowActions = allActions.slice(2);
  const hasActions = allActions.length > 0;

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        <m.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
            "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5",
            "bg-foreground text-background",
            "rounded-2xl shadow-2xl",
            "max-w-[calc(100vw-2rem)]",
            className,
          )}
        >
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center size-6 rounded-full bg-background/20">
              <Check className="size-3.5" />
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              {selectedCount} selected
            </span>
          </div>

          {hasActions && (
            <>
              <div className="w-px h-5 bg-background/20 mx-1" />

              <div className="flex items-center gap-1">
                {visibleActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="ghost"
                    size="sm"
                    onClick={() => action.onClick(selectedOriginalRows)}
                    className={cn(
                      "h-8 px-2 sm:px-3 gap-1.5 rounded-xl",
                      "text-background hover:bg-background/10 hover:text-background",
                      action.variant === "destructive" &&
                        "hover:bg-destructive/20 hover:text-destructive-foreground",
                    )}
                  >
                    {action.icon && (
                      <action.icon className="size-4" aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline text-sm">
                      {action.label}
                    </span>
                  </Button>
                ))}

                {overflowActions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-xl text-background hover:bg-background/10 hover:text-background"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      {overflowActions.map((action, index) => (
                        <React.Fragment key={action.label}>
                          {action.variant === "destructive" && index > 0 && (
                            <DropdownMenuSeparator />
                          )}
                          <DropdownMenuItem
                            onClick={() => action.onClick(selectedOriginalRows)}
                            className={cn(
                              "rounded-lg gap-2",
                              action.variant === "destructive" &&
                                "text-destructive focus:text-destructive",
                            )}
                          >
                            {action.icon && <action.icon className="size-4" />}
                            {action.label}
                          </DropdownMenuItem>
                        </React.Fragment>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="w-px h-5 bg-background/20 mx-1" />
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => table.toggleAllPageRowsSelected(false)}
            className="size-8 rounded-xl text-background hover:bg-background/10 hover:text-background shrink-0"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Clear selection</span>
          </Button>
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
