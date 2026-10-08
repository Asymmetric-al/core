"use client";

import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  motion as m,
  useReducedMotion,
} from "@asym/lib/motion";
import { transitionStandard } from "@asym/lib/motion-presets";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import {
  areChromeTablePropsInterchangeable,
  areDataTableChromeActionsEqual,
  EMPTY_TABLE_SELECTION_SOURCE,
  getTableSliceAtoms,
} from "./data-table-chrome-memo";
import { useSelector } from "./tanstack";

import type {
  ColumnFiltersState,
  RowData,
  RowSelectionState,
  Table,
  TableSelectionSource,
} from "./tanstack";

interface DataTableActionBarProps<TData extends RowData> {
  table: Table<TData>;
  actions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (rows: TData[]) => void;
    variant?: "default" | "destructive";
  }[];
  className?: string;
}

function DataTableActionBarImpl<TData extends RowData>({
  table,
  actions,
  className,
}: DataTableActionBarProps<TData>) {
  const reduceMotion = useReducedMotion();
  // Focused subscriptions: the memo comparator below keeps parent broadcasts out,
  // so every state slice this chrome reads needs its own subscription.
  const atoms = getTableSliceAtoms(table);
  const rowSelectionSource: TableSelectionSource<
    RowSelectionState | undefined
  > = atoms?.rowSelection ?? EMPTY_TABLE_SELECTION_SOURCE;
  useSelector(rowSelectionSource);
  // Filtered selection is derived through the filtered row model; re-render when
  // filters change so counts and action payloads stay in sync.
  const columnFiltersSource: TableSelectionSource<
    ColumnFiltersState | undefined
  > = atoms?.columnFilters ?? EMPTY_TABLE_SELECTION_SOURCE;
  useSelector(columnFiltersSource);
  const globalFilterSource: TableSelectionSource<unknown> =
    atoms?.globalFilter ?? EMPTY_TABLE_SELECTION_SOURCE;
  useSelector(globalFilterSource);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  if (selectedCount === 0) return null;

  const selectedOriginalRows = selectedRows.map((row) => row.original);
  const visibleActions = actions ?? [];
  const hasActions = visibleActions.length > 0;

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        <m.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          transition={reduceMotion ? { duration: 0 } : transitionStandard}
          role="toolbar"
          aria-label="Selected record actions"
          className={cn(
            "fixed inset-x-4 bottom-6 z-50 mx-auto w-fit max-w-full",
            "flex flex-wrap items-center justify-center gap-3 px-4 py-3",
            "bg-invert text-invert-foreground",
            "rounded-2xl shadow-2xl",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{selectedCount}</span>
            <span className="text-sm">selected</span>
          </div>
          {hasActions && (
            <>
              <span
                aria-hidden="true"
                className="h-5 w-px bg-invert-foreground/20"
              />
              <div className="flex flex-wrap items-center justify-center gap-1">
                {visibleActions.map((action) => (
                  <Button
                    key={action.label}
                    variant={
                      action.variant === "destructive"
                        ? "ghost-inverse-destructive"
                        : "ghost-inverse"
                    }
                    size="sm"
                    onClick={() => action.onClick(selectedOriginalRows)}
                  >
                    {action.icon && (
                      <action.icon className="size-4" aria-hidden="true" />
                    )}
                    {action.label}
                  </Button>
                ))}
              </div>
              <span
                aria-hidden="true"
                className="h-5 w-px bg-invert-foreground/20"
              />
            </>
          )}
          <Button
            variant="ghost-inverse"
            size="icon-sm"
            onClick={() => table.toggleAllPageRowsSelected(false)}
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Clear selection</span>
          </Button>
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}

const MemoizedDataTableActionBar = React.memo(
  DataTableActionBarImpl,
  (previous, next) =>
    areChromeTablePropsInterchangeable(previous.table, next.table) &&
    areDataTableChromeActionsEqual(previous.actions, next.actions) &&
    previous.className === next.className,
);

/**
 * Memoized with a table-aware comparator (v9's `useTable` returns a fresh
 * wrapper object every parent render) so the bar only re-renders when row
 * selection — the one state slice it subscribes to — actually changes. The
 * cast restores the generic call signature `React.memo` erases; the public
 * props are unchanged.
 */
export const DataTableActionBar =
  MemoizedDataTableActionBar as typeof DataTableActionBarImpl;
