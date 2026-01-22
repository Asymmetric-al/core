"use client";
"use no memo";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search, Inbox } from "lucide-react";

import { cn } from "@asym/ui/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";
import { Checkbox } from "../checkbox";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableActionBar } from "./data-table-action-bar";
import {
  DataTableSkeleton,
  DataTableLoadingOverlay,
} from "./data-table-skeleton";
import type { DataTableFilterField, DataTableConfig } from "./types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFields?: DataTableFilterField<TData>[];
  searchKey?: string;
  searchPlaceholder?: string;
  config?: DataTableConfig;
  isLoading?: boolean;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  actionBarActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (rows: TData[]) => void;
    variant?: "default" | "destructive";
  }[];
  className?: string;
  tableClassName?: string;
  emptyState?: React.ReactNode;
  toolbar?: React.ReactNode;
  initialState?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    rowSelection?: RowSelectionState;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterFields = [],
  searchKey,
  searchPlaceholder,
  config = {},
  isLoading = false,
  pageCount,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  onRowSelectionChange,
  actionBarActions,
  className,
  tableClassName,
  emptyState,
  toolbar,
  initialState = {},
}: DataTableProps<TData, TValue>) {
  const {
    enableRowSelection = true,
    enableColumnVisibility = true,
    enablePagination = true,
    enableFilters = true,
    enableSorting = true,
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
  } = config;

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    initialState.rowSelection ?? {},
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialState.columnVisibility ?? {});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialState.columnFilters ?? [],
  );
  const [sorting, setSorting] = React.useState<SortingState>(
    initialState.sorting ?? [],
  );
  const [pagination, setPagination] = React.useState<PaginationState>(
    initialState.pagination ?? {
      pageIndex: 0,
      pageSize: 10,
    },
  );

  const selectColumn = React.useMemo<ColumnDef<TData, unknown>>(
    () => ({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    }),
    [],
  );

  const tableColumns = React.useMemo(() => {
    if (enableRowSelection) {
      return [selectColumn, ...columns];
    }
    return columns;
  }, [columns, enableRowSelection, selectColumn]);

  // eslint-disable-next-line react-hooks/incompatible-library -- "use no memo" directive applied, warning acknowledged
  const table = useReactTable({
    data,
    columns: tableColumns,
    pageCount: pageCount ?? undefined,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection,
    enableSorting,
    manualPagination,
    manualSorting,
    manualFiltering,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      onRowSelectionChange?.(newSelection);
    },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  if (isLoading && data.length === 0) {
    return <DataTableSkeleton columnCount={columns.length} />;
  }

  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-2xl bg-muted/50 p-4 mb-4">
        <Inbox className="size-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No results found</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Try adjusting your search or filter criteria to find what you&apos;re
        looking for.
      </p>
    </div>
  );

  return (
    <div className={cn("w-full space-y-4", className)}>
      {enableFilters &&
        (toolbar ?? (
          <DataTableToolbar
            table={table}
            filterFields={filterFields}
            searchKey={searchKey}
            searchPlaceholder={searchPlaceholder}
            enableColumnVisibility={enableColumnVisibility}
          />
        ))}

      <div className="relative">
        <DataTableLoadingOverlay isLoading={isLoading} />
        <div
          className={cn(
            "rounded-2xl border border-border bg-card overflow-hidden shadow-sm",
            tableClassName,
          )}
        >
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-border"
                >
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta;
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "h-12 px-4 text-xs font-semibold text-muted-foreground",
                          meta?.headerClassName,
                        )}
                        style={{
                          width:
                            header.getSize() !== 150
                              ? header.getSize()
                              : undefined,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/30 transition-colors border-border data-[state=selected]:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn("py-4 px-4", meta?.cellClassName)}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="h-64">
                    {emptyState ?? defaultEmptyState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {enablePagination && (
        <DataTablePagination
          table={table}
          showSelectedCount={enableRowSelection}
        />
      )}

      {enableRowSelection && (
        <DataTableActionBar table={table} actions={actionBarActions} />
      )}
    </div>
  );
}

export { DataTable as default };
