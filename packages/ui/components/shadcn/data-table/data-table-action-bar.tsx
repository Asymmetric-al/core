"use client";

import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  motion as m,
} from "@asym/lib/motion";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import { Separator } from "../separator";
import {
  areChromeTablePropsInterchangeable,
  EMPTY_TABLE_SELECTION_SOURCE,
  getTableSliceAtoms,
} from "./data-table-chrome-memo";
import { useSelector } from "./tanstack";

import type {
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
  // Focused subscription: row selection is the only table state this bar
  // renders. The memo comparator below keeps parent broadcasts out; selected
  // rows and the count re-derive from the live row model on each change.
  const atoms = getTableSliceAtoms(table);
  const rowSelectionSource: TableSelectionSource<
    RowSelectionState | undefined
  > = atoms?.rowSelection ?? EMPTY_TABLE_SELECTION_SOURCE;
  useSelector(rowSelectionSource);

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
          {hasActions && (
            <>
              <Separator
                orientation="vertical"
                className="h-5 bg-primary-foreground/20"
              />
              <div className="flex items-center gap-1">
                {visibleActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="ghost"
                    size="sm"
                    onClick={() => action.onClick(selectedOriginalRows)}
                    className={cn(
                      "h-8 gap-2 rounded-xl text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
                      action.variant === "destructive" &&
                        "hover:bg-destructive/20",
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
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => table.toggleAllPageRowsSelected(false)}
            className="size-8 rounded-xl text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
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
    previous.actions === next.actions &&
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
