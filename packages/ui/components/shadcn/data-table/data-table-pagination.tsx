"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import {
  areChromeTablePropsInterchangeable,
  EMPTY_TABLE_SELECTION_SOURCE,
  getTableSliceAtoms,
} from "./data-table-chrome-memo";
import { useSelector } from "./tanstack";
import { DEFAULT_PAGE_SIZES } from "./types";

import type {
  ColumnFiltersState,
  PaginationState,
  RowData,
  RowSelectionState,
  Table,
  TableSelectionSource,
} from "./tanstack";

interface DataTablePaginationProps<TData extends RowData> {
  table: Table<TData>;
  pageSizes?: readonly number[];
  showSelectedCount?: boolean;
  className?: string;
  /** When true, pagination controls are disabled during URL query transitions (nuqs). */
  urlStatePending?: boolean;
}

function DataTablePaginationImpl<TData extends RowData>({
  table,
  pageSizes = DEFAULT_PAGE_SIZES,
  showSelectedCount = true,
  className,
  urlStatePending = false,
}: DataTablePaginationProps<TData>) {
  // Focused subscriptions: the memo comparator below stops this component
  // from re-rendering with its table-owning parent, so every state slice it
  // renders needs its own subscription. Do not read `table.state` here — the
  // memoized `table` prop can be an older wrapper whose `.state` snapshot is
  // stale; the slice atoms are always live.
  const atoms = getTableSliceAtoms(table);

  const paginationSource: TableSelectionSource<PaginationState | undefined> =
    atoms?.pagination ?? EMPTY_TABLE_SELECTION_SOURCE;
  const subscribedPagination = useSelector(paginationSource);

  // The selected-row count is the only row-selection read; skip that
  // subscription entirely when the count is not rendered.
  const rowSelectionSource: TableSelectionSource<
    RowSelectionState | undefined
  > =
    showSelectedCount && atoms !== undefined
      ? atoms.rowSelection
      : EMPTY_TABLE_SELECTION_SOURCE;
  useSelector(rowSelectionSource);

  // The filtered row count and page count are derived through the filtered
  // row model, so filter-state changes must re-render this chrome too. Data
  // changes are covered by the memo comparator (`options.data` identity).
  const columnFiltersSource: TableSelectionSource<
    ColumnFiltersState | undefined
  > = atoms?.columnFilters ?? EMPTY_TABLE_SELECTION_SOURCE;
  useSelector(columnFiltersSource);
  const globalFilterSource: TableSelectionSource<unknown> =
    atoms?.globalFilter ?? EMPTY_TABLE_SELECTION_SOURCE;
  useSelector(globalFilterSource);

  // Minimal table doubles in tests have no slice atoms; fall back to the
  // wrapper snapshot, which is current for a non-memoized double.
  const pagination = subscribedPagination ?? table.state.pagination;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4",
        className,
      )}
      aria-busy={urlStatePending || undefined}
    >
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {showSelectedCount && (
          <div className="flex-1 whitespace-nowrap">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            disabled={urlStatePending}
          >
            <SelectTrigger className="h-9 w-[72px] rounded-xl">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="rounded-xl">
              {pageSizes.map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className="rounded-lg"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
          Page {pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            className="hidden size-9 p-0 lg:flex rounded-xl"
            onClick={() => table.setPageIndex(0)}
            disabled={urlStatePending || !table.getCanPreviousPage()}
          >
            <ChevronsLeft className="size-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            className="size-9 p-0 rounded-xl"
            onClick={() => table.previousPage()}
            disabled={urlStatePending || !table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            className="size-9 p-0 rounded-xl"
            onClick={() => table.nextPage()}
            disabled={urlStatePending || !table.getCanNextPage()}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            className="hidden size-9 p-0 lg:flex rounded-xl"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={urlStatePending || !table.getCanNextPage()}
          >
            <ChevronsRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const MemoizedDataTablePagination = React.memo(
  DataTablePaginationImpl,
  (previous, next) =>
    areChromeTablePropsInterchangeable(previous.table, next.table) &&
    previous.pageSizes === next.pageSizes &&
    previous.showSelectedCount === next.showSelectedCount &&
    previous.className === next.className &&
    previous.urlStatePending === next.urlStatePending,
);

/**
 * Memoized with a table-aware comparator: v9's `useTable` returns a fresh
 * wrapper object on every parent render, so a plain identity compare of the
 * `table` prop would defeat `React.memo`. Combined with the focused slice
 * subscriptions above, this chrome stops re-rendering on unrelated table
 * state changes (e.g. sorting or column visibility).
 *
 * The cast restores the generic call signature that `React.memo` erases; the
 * public props are unchanged.
 */
export const DataTablePagination =
  MemoizedDataTablePagination as typeof DataTablePaginationImpl;
