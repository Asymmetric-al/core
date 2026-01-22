"use client";

import * as React from "react";
import { AlertCircle, Inbox, RefreshCcw } from "lucide-react";
import { cn } from "@asym/lib/utils";
import { Button } from "@asym/ui/components/shadcn/button";
import { DataTable } from "./data-table";
import { DataTableSkeleton } from "./data-table-skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@asym/ui/components/shadcn/empty";
import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableFilterField, DataTableConfig } from "./types";

interface DataTableWrapperProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFields?: DataTableFilterField<TData>[];
  searchKey?: string;
  searchPlaceholder?: string;
  config?: DataTableConfig;
  isLoading?: boolean;
  isError?: boolean;
  error?: string | Error;
  onRetry?: () => void;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  };
  className?: string;
  tableClassName?: string;
  toolbar?: React.ReactNode;
}

export function DataTableWrapper<TData, TValue>({
  columns,
  data,
  filterFields,
  searchKey,
  searchPlaceholder,
  config,
  isLoading,
  isError,
  error,
  onRetry,
  emptyState,
  className,
  tableClassName,
  toolbar,
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
        <h3 className="text-lg font-black uppercase tracking-widest text-zinc-900">
          Something went wrong
        </h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm font-medium">
          {error instanceof Error
            ? error.message
            : error || "We couldn't load the data. Please try again."}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="mt-6 h-11 px-6 rounded-xl font-black uppercase tracking-[0.2em] text-[10px]"
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

  const customEmptyState = emptyState ? (
    <Empty className="py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon">{emptyState.icon || <Inbox />}</EmptyMedia>
        <EmptyTitle className="font-black uppercase tracking-widest text-zinc-900">
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
      <DataTable
        columns={columns}
        data={data}
        filterFields={filterFields}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        config={config}
        isLoading={isLoading}
        emptyState={customEmptyState}
        className={tableClassName}
        toolbar={toolbar}
      />
    </div>
  );
}
