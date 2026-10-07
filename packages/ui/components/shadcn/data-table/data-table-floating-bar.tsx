"use client";

import { useIsMobile } from "@asym/lib/hooks/use-mobile";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  motion as m,
  useReducedMotion,
} from "@asym/lib/motion";
import { transitionStandard } from "@asym/lib/motion-presets";
import { X, MoreHorizontal, Check } from "lucide-react";
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

interface FloatingActionBarAction<TData> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (rows: TData[]) => void;
  variant?: "default" | "destructive";
  hideOnMobile?: boolean;
}

interface DataTableFloatingBarProps<TData extends RowData> {
  table: Table<TData>;
  actions?: FloatingActionBarAction<TData>[];
  className?: string;
}

function DataTableFloatingBarImpl<TData extends RowData>({
  table,
  actions,
  className,
}: DataTableFloatingBarProps<TData>) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  // Focused subscriptions: the memo comparator below keeps parent broadcasts out,
  // so every state slice this chrome reads needs its own subscription.
  const atoms = getTableSliceAtoms(table);
  const rowSelectionSource: TableSelectionSource<
    RowSelectionState | undefined
  > = atoms?.rowSelection ?? EMPTY_TABLE_SELECTION_SOURCE;
  useSelector(rowSelectionSource);
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
  const allActions = actions ?? [];
  const visibleActions = allActions
    .filter((action) => !isMobile || !action.hideOnMobile)
    .slice(0, isMobile ? 1 : 2);
  const overflowActions = allActions.filter(
    (action) => !visibleActions.includes(action),
  );
  const hasActions = allActions.length > 0;

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        <m.div
          initial={false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.98 }
          }
          transition={reduceMotion ? { duration: 0 } : transitionStandard}
          role="toolbar"
          aria-label="Selected record actions"
          className={cn(
            "fixed inset-x-4 bottom-4 z-50 mx-auto w-fit max-w-full",
            "flex flex-wrap items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5",
            "bg-invert text-invert-foreground",
            "rounded-2xl shadow-2xl",
            className,
          )}
        >
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center size-6 rounded-full bg-invert-foreground/20">
              <Check className="size-3.5" />
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              {selectedCount} selected
            </span>
          </div>

          {hasActions && (
            <>
              <div className="w-px h-5 bg-invert-foreground/20 mx-1" />

              <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
                {visibleActions.map((action) => (
                  <Button
                    key={action.label}
                    aria-label={action.label}
                    variant={
                      action.variant === "destructive"
                        ? "ghost-inverse-destructive"
                        : "ghost-inverse"
                    }
                    size="sm"
                    className="max-w-full"
                    onClick={() => action.onClick(selectedOriginalRows)}
                  >
                    {action.icon && (
                      <action.icon className="size-4" aria-hidden="true" />
                    )}
                    <span
                      className={cn(
                        "max-w-40 truncate text-sm",
                        action.icon && "hidden sm:inline",
                      )}
                    >
                      {action.label}
                    </span>
                  </Button>
                ))}

                {overflowActions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Open actions"
                      render={
                        <Button variant="ghost-inverse" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      {overflowActions.map((action, index) => (
                        <React.Fragment key={action.label}>
                          {action.variant === "destructive" && index > 0 && (
                            <DropdownMenuSeparator />
                          )}
                          <DropdownMenuItem
                            onClick={() => action.onClick(selectedOriginalRows)}
                            variant={
                              action.variant === "destructive"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {action.icon && <action.icon className="size-4" />}
                            <span className="min-w-0 wrap-break-word">
                              {action.label}
                            </span>
                          </DropdownMenuItem>
                        </React.Fragment>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="w-px h-5 bg-invert-foreground/20 mx-1" />
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

const MemoizedDataTableFloatingBar = React.memo(
  DataTableFloatingBarImpl,
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
export const DataTableFloatingBar =
  MemoizedDataTableFloatingBar as typeof DataTableFloatingBarImpl;
