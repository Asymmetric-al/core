"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { DEFAULT_PAGE_SIZES } from "./types";

import type { RowData, Table } from "./tanstack";

interface DataTablePaginationProps<TData extends RowData> {
  table: Table<TData>;
  pageSizes?: readonly number[];
  showSelectedCount?: boolean;
  className?: string;
  /** When true, pagination controls are disabled during URL query transitions (nuqs). */
  urlStatePending?: boolean;
}

export function DataTablePagination<TData extends RowData>({
  table,
  pageSizes = DEFAULT_PAGE_SIZES,
  showSelectedCount = true,
  className,
  urlStatePending = false,
}: DataTablePaginationProps<TData>) {
  // v9 removed `table.getState()`; `table.state` is the render-read surface.
  const { pagination } = table.state;
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
