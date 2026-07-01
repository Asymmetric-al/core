"use client";

import { AlertCircle, Inbox, RefreshCcw } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import { DataTableResponsive } from "./data-table-responsive";
import { DataTableSkeleton } from "./data-table-skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "../empty";

import type { ColumnDef, RowData } from "./tanstack";
import type {
  DataTableConfig,
  DataTableControlledState,
  DataTableFilterField,
  DataTableInteractiveRowAction,
  DataTableUrlStateConfig,
} from "./types";

interface DataTableWrapperProps<TData extends RowData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFields?: DataTableFilterField<TData>[];
  /**
   * TanStack column id for toolbar search.
   * @deprecated Use `searchColumnId`.
   */
  searchKey?: string;
  searchColumnId?: string;
  searchPlaceholder?: string;
  config?: DataTableConfig;
  isLoading?: boolean;
  getRowId?: (originalRow: TData, index: number) => string;
  state?: DataTableControlledState;
  urlState?: DataTableUrlStateConfig;
  isError?: boolean;
  error?: string | Error;
  onRetry?: () => void;
  onRowClick?: (row: TData) => void;
  rowActions?: DataTableInteractiveRowAction<TData>[];
  getRowActionAriaLabel?: (row: Row<TData>) => string;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  };
  className?: string;
  tableClassName?: string;
  toolbar?: React.ReactNode;
  /**
   * Unique TanStack Table devtools `key`. When set, the table registers with
   * TanStack Devtools (development builds only; the adapter no-ops in
   * production).
   */
  devtoolsKey?: string;
}

export function DataTableWrapper<TData extends RowData, TValue>({
  columns,
  data,
  filterFields,
  searchKey,
  searchColumnId,
  searchPlaceholder,
  config,
  isLoading,
  getRowId,
  state,
  urlState,
  isError,
  error,
  onRetry,
  onRowClick,
  rowActions,
  getRowActionAriaLabel,
  emptyState,
  className,
  tableClassName,
  toolbar,
  devtoolsKey,
}: DataTableWrapperProps<TData, TValue>) {
  if (isError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-20 text-center",
          className,
        )}
      >
        <div className="rounded-2xl bg-destructive/10 p-4 mb-4">
          <AlertCircle className="size-10 text-destructive" />
        </div>
        <h3 className="text-foreground text-lg font-semibold uppercase tracking-widest">
          Something went wrong
        </h3>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm font-medium">
          {error instanceof Error
            ? error.message
            : error || "We couldn't load the data. Please try again."}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="mt-6 h-11 px-6 rounded-xl font-semibold uppercase tracking-[0.2em] text-[10px]"
          >
            <RefreshCcw className="mr-2 size-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (isLoading && data.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <DataTableSkeleton columnCount={columns.length} />
      </div>
    );
  }

  const responsiveConfig = {
    enableViewToggle: false,
    defaultViewMode: "table" as const,
    mobileBreakpoint: 0,
    ...config,
  };

  const customEmptyState = emptyState ? (
    <Empty className="py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon">{emptyState.icon || <Inbox />}</EmptyMedia>
        <EmptyTitle className="text-foreground font-semibold uppercase tracking-widest">
          {emptyState.title || "No data found"}
        </EmptyTitle>
        <EmptyDescription className="font-medium">
          {emptyState.description ||
            "There are no items to display at this time."}
        </EmptyDescription>
      </EmptyHeader>
      {emptyState.action && <div className="mt-2">{emptyState.action}</div>}
    </Empty>
  ) : undefined;

  return (
    <div className={className}>
      <DataTableResponsive
        columns={columns}
        data={data}
        filterFields={filterFields}
        searchKey={searchKey}
        searchColumnId={searchColumnId}
        searchPlaceholder={searchPlaceholder}
        config={responsiveConfig}
        isLoading={isLoading}
        getRowId={getRowId}
        state={state}
        urlState={urlState}
        onRowClick={onRowClick ? (row) => onRowClick(row.original) : undefined}
        rowActions={rowActions}
        getRowActionAriaLabel={getRowActionAriaLabel}
        emptyState={customEmptyState}
        tableClassName={tableClassName}
        toolbar={toolbar}
        devtoolsKey={devtoolsKey}
      />
    </div>
  );
}
