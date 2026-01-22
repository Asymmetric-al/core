"use client";

import type { Table } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import { cn } from "@asym/lib/utils";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableRow,
} from "@asym/ui/components/shadcn/table";

interface DataTableSkeletonProps<TData> {
  table?: Table<TData>;
  columnCount?: number;
  rowCount?: number;
  showPagination?: boolean;
  className?: string;
}

export function DataTableSkeleton<TData>({
  table,
  columnCount = 5,
  rowCount = 10,
  showPagination = true,
  className,
}: DataTableSkeletonProps<TData>) {
  const columns = table?.getAllColumns().length || columnCount;
  const rows = table?.getState().pagination.pageSize || rowCount;

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-10 w-80 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
      <div className="rounded-2xl border overflow-hidden">
        <UITable>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="py-4">
                    <Skeleton
                      className={cn(
                        "h-5 rounded-lg",
                        colIndex === 0 ? "w-8" : "w-full max-w-32",
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </UITable>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-5 w-48 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
            <div className="flex gap-1">
              <Skeleton className="size-9 rounded-xl" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DataTableLoadingOverlayProps {
  isLoading?: boolean;
  className?: string;
}

export function DataTableLoadingOverlay({
  isLoading = false,
  className,
}: DataTableLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center",
        "bg-background/60 backdrop-blur-sm",
        "rounded-2xl",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Loading data...
        </span>
      </div>
    </div>
  );
}
