"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Inbox } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Checkbox } from "../checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";
import { DataTableActionBar } from "./data-table-action-bar";
import { DataTablePagination } from "./data-table-pagination";
import {
  DataTableSkeleton,
  DataTableLoadingOverlay,
} from "./data-table-skeleton";
import { DataTableToolbar } from "./data-table-toolbar";
import { useDataTableVirtualization } from "./hooks";

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
  rowCount?: number;
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

const EMPTY_FILTER_FIELDS: DataTableFilterField<unknown>[] = [];
const EMPTY_DATA_TABLE_CONFIG: DataTableConfig = {};
const EMPTY_DATA_TABLE_INITIAL_STATE: NonNullable<
  DataTableProps<unknown, unknown>["initialState"]
> = {};

export function DataTable<TData, TValue>({
  columns,
  data,
  filterFields = EMPTY_FILTER_FIELDS as DataTableFilterField<TData>[],
  searchKey,
  searchPlaceholder,
  config = EMPTY_DATA_TABLE_CONFIG,
  isLoading = false,
  pageCount,
  rowCount,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  onRowSelectionChange,
  actionBarActions,
  className,
  tableClassName,
  emptyState,
  toolbar,
  initialState = EMPTY_DATA_TABLE_INITIAL_STATE as NonNullable<
    DataTableProps<TData, TValue>["initialState"]
  >,
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

  const resolvedRowCount = rowCount ?? undefined;
  const resolvedPageCount =
    rowCount == null ? (pageCount ?? undefined) : undefined;

  React.useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      rowCount != null &&
      pageCount != null
    ) {
      console.warn(
        "[asym/ui] DataTable received both rowCount and pageCount. pageCount is ignored when rowCount is provided.",
      );
    }
  }, [pageCount, rowCount]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    rowCount: resolvedRowCount,
    pageCount: resolvedPageCount,
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

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const getVirtualRowKey = React.useCallback(
    (index: number) => rows[index]?.id ?? index,
    [rows],
  );
  const virtualizationConfig = React.useMemo(
    () => ({
      ...config.virtualization,
      getItemKey: config.virtualization?.getItemKey ?? getVirtualRowKey,
    }),
    [config.virtualization, getVirtualRowKey],
  );
  const {
    config: resolvedVirtualization,
    virtualItems: virtualRows,
    paddingTop: virtualPaddingTop,
    paddingBottom: virtualPaddingBottom,
    isEnabled: isVirtualized,
  } = useDataTableVirtualization({
    count: rows.length,
    scrollElementRef: tableContainerRef,
    virtualization: virtualizationConfig,
    legacy: {
      enabled: config.enableVirtualization,
      estimateSize: config.virtualRowHeight,
      overscan: config.virtualOverscan,
      containerHeight: config.virtualContainerHeight,
    },
    defaults: {
      enabled: false,
      estimateSize: 56,
      overscan: 8,
      containerHeight: 640,
    },
  });

  const renderRow = (row: Row<TData>) => (
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
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );

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
          <div
            ref={isVirtualized ? tableContainerRef : undefined}
            className={cn(isVirtualized && "overflow-y-auto")}
            style={
              isVirtualized
                ? { maxHeight: resolvedVirtualization.containerHeight }
                : undefined
            }
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
                {rows.length ? (
                  isVirtualized ? (
                    <>
                      {virtualPaddingTop > 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={tableColumns.length}
                            className="p-0"
                            style={{ height: virtualPaddingTop }}
                          />
                        </TableRow>
                      )}
                      {virtualRows.map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        return renderRow(row as Row<TData>);
                      })}
                      {virtualPaddingBottom > 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={tableColumns.length}
                            className="p-0"
                            style={{ height: virtualPaddingBottom }}
                          />
                        </TableRow>
                      )}
                    </>
                  ) : (
                    rows.map((row) => renderRow(row as Row<TData>))
                  )
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
