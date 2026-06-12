"use client";

import { Inbox } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowData,
  type RowSelectionState,
  type PaginationState,
  type Row,
  type TableOptions,
  createDataTableRowModels,
  dataTableFeatures,
  flexRender,
  useTable,
} from "./tanstack";
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
import { DataTableRowActions } from "./data-table-row-actions";
import {
  DataTableSkeleton,
  DataTableLoadingOverlay,
} from "./data-table-skeleton";
import { DataTableToolbar } from "./data-table-toolbar";
import {
  useDataTableStateCore,
  useDataTableStateWithUrl,
} from "./hooks/use-data-table-state";
import { useDataTableVirtualization } from "./hooks/use-data-table-virtualization";

import type { UseDataTableStateReturn } from "./hooks/use-data-table-state";
import type {
  DataTableControlledState,
  DataTableFilterField,
  DataTableConfig,
  DataTableInteractiveRowAction,
  DataTableUrlStateConfig,
} from "./types";

const EMPTY_DATA_TABLE_CONFIG: DataTableConfig = {};

export interface DataTableBodyWithTableStateProps<
  TData extends RowData,
  TValue,
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFields: DataTableFilterField<TData>[];
  toolbarSearchColumnId?: string;
  searchPlaceholder?: string;
  config?: DataTableConfig;
  isLoading: boolean;
  pageCount?: number;
  rowCount?: number;
  actionBarActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (rows: TData[]) => void;
    variant?: "default" | "destructive";
  }[];
  rowActions?: DataTableInteractiveRowAction<TData>[];
  onRowClick?: (row: Row<TData>) => void;
  getRowId?: TableOptions<TData>["getRowId"];
  className?: string;
  tableClassName?: string;
  emptyState?: React.ReactNode;
  toolbar?: React.ReactNode;
  tableState: UseDataTableStateReturn;
}

const EMPTY_DATA_TABLE_INITIAL_STATE: Record<string, never> = {};

export type DataTableBodyShellProps<TData extends RowData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFields?: DataTableFilterField<TData>[];
  searchKey?: string;
  searchColumnId?: string;
  searchPlaceholder?: string;
  config?: DataTableConfig;
  isLoading?: boolean;
  pageCount?: number;
  rowCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  actionBarActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (rows: TData[]) => void;
    variant?: "default" | "destructive";
  }[];
  rowActions?: DataTableInteractiveRowAction<TData>[];
  onRowClick?: (row: Row<TData>) => void;
  state?: DataTableControlledState;
  getRowId?: TableOptions<TData>["getRowId"];
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
};

export function DataTableBody<TData extends RowData, TValue>({
  columns,
  data,
  filterFields = [] as DataTableFilterField<TData>[],
  searchKey,
  searchColumnId,
  searchPlaceholder,
  config,
  isLoading = false,
  pageCount,
  rowCount,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  onRowSelectionChange,
  onColumnVisibilityChange,
  actionBarActions,
  rowActions,
  onRowClick,
  state,
  getRowId,
  className,
  tableClassName,
  emptyState,
  toolbar,
  initialState = EMPTY_DATA_TABLE_INITIAL_STATE as NonNullable<
    DataTableBodyShellProps<TData, TValue>["initialState"]
  >,
}: DataTableBodyShellProps<TData, TValue>) {
  const toolbarSearchColumnId = searchColumnId ?? searchKey;

  const tableState = useDataTableStateCore({
    initialState,
    controlledState: state,
    onSortingChange,
    onFiltersChange,
    onPaginationChange,
    onRowSelectionChange,
    onColumnVisibilityChange,
  });

  return (
    <DataTableBodyWithTableState
      columns={columns}
      data={data}
      filterFields={filterFields}
      toolbarSearchColumnId={toolbarSearchColumnId}
      searchPlaceholder={searchPlaceholder}
      config={config}
      isLoading={isLoading}
      pageCount={pageCount}
      rowCount={rowCount}
      actionBarActions={actionBarActions}
      rowActions={rowActions}
      onRowClick={onRowClick}
      getRowId={getRowId}
      className={className}
      tableClassName={tableClassName}
      emptyState={emptyState}
      toolbar={toolbar}
      tableState={tableState}
    />
  );
}

export function DataTableBodyWithUrl<TData extends RowData, TValue>({
  columns,
  data,
  filterFields = [] as DataTableFilterField<TData>[],
  searchKey,
  searchColumnId,
  searchPlaceholder,
  config,
  isLoading = false,
  pageCount,
  rowCount,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  onRowSelectionChange,
  onColumnVisibilityChange,
  actionBarActions,
  rowActions,
  onRowClick,
  state,
  getRowId,
  className,
  tableClassName,
  emptyState,
  toolbar,
  initialState = EMPTY_DATA_TABLE_INITIAL_STATE as NonNullable<
    DataTableBodyShellProps<TData, TValue>["initialState"]
  >,
  urlState,
}: DataTableBodyShellProps<TData, TValue> & {
  urlState: DataTableUrlStateConfig;
}) {
  const toolbarSearchColumnId = searchColumnId ?? searchKey;

  const tableState = useDataTableStateWithUrl({
    initialState,
    controlledState: state,
    onSortingChange,
    onFiltersChange,
    onPaginationChange,
    onRowSelectionChange,
    onColumnVisibilityChange,
    searchKey,
    searchColumnId,
    urlState,
  });

  return (
    <DataTableBodyWithTableState
      columns={columns}
      data={data}
      filterFields={filterFields}
      toolbarSearchColumnId={toolbarSearchColumnId}
      searchPlaceholder={searchPlaceholder}
      config={config}
      isLoading={isLoading}
      pageCount={pageCount}
      rowCount={rowCount}
      actionBarActions={actionBarActions}
      rowActions={rowActions}
      onRowClick={onRowClick}
      getRowId={getRowId}
      className={className}
      tableClassName={tableClassName}
      emptyState={emptyState}
      toolbar={toolbar}
      tableState={tableState}
    />
  );
}

export function DataTableBodyWithTableState<TData extends RowData, TValue>({
  columns,
  data,
  filterFields,
  toolbarSearchColumnId,
  searchPlaceholder,
  config = EMPTY_DATA_TABLE_CONFIG,
  isLoading,
  pageCount,
  rowCount,
  actionBarActions,
  rowActions,
  onRowClick,
  getRowId,
  className,
  tableClassName,
  emptyState,
  toolbar,
  tableState,
}: DataTableBodyWithTableStateProps<TData, TValue>) {
  const {
    enableRowSelection = true,
    enableColumnVisibility = true,
    enablePagination = true,
    enableFilters = true,
    enableSorting = true,
    enableMultiSort = true,
    enableColumnPinning = false,
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
  } = config;

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
          disabled={!row.getCanSelect()}
          onClick={(event) => event.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    }),
    [],
  );

  const tableColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    // Columns with heterogeneous TValue collapse to `unknown` for the engine,
    // mirroring v8's `ColumnDef<TData, any>[]` table option.
    const baseColumns = columns as ColumnDef<TData, unknown>[];
    if (enableRowSelection) {
      return [selectColumn, ...baseColumns];
    }
    return baseColumns;
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
        "[asym/ui] DataTable received both rowCount and pageCount. pageCount is ignored because rowCount is authoritative. Pass only one of these props.",
      );
    }
  }, [pageCount, rowCount]);

  const table = useTable({
    features: dataTableFeatures,
    // The core row model is automatic in v9; manual flags skip the matching
    // client-side row model just like the v8 `get*RowModel: undefined` paths.
    rowModels: createDataTableRowModels<TData>({
      filtering: !manualFiltering,
      pagination: !manualPagination,
      sorting: !manualSorting,
    }),
    data,
    columns: tableColumns,
    rowCount: resolvedRowCount,
    pageCount: resolvedPageCount,
    getRowId: getRowId ?? tableState.getRowId,
    state: tableState.state,
    enableRowSelection,
    enableSorting,
    enableMultiSort,
    enableColumnPinning,
    manualPagination,
    manualSorting,
    manualFiltering,
    onRowSelectionChange: tableState.handlers.onRowSelectionChange,
    onSortingChange: tableState.handlers.onSortingChange,
    onColumnFiltersChange: tableState.handlers.onColumnFiltersChange,
    onColumnVisibilityChange: tableState.handlers.onColumnVisibilityChange,
    onPaginationChange: tableState.handlers.onPaginationChange,
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

  const rowActionsColumnCount = rowActions?.length ? 1 : 0;

  const renderRowActionsCell = (row: Row<TData>) => {
    if (!rowActions?.length) {
      return null;
    }

    return (
      <TableCell className="w-0 p-4 text-right">
        <DataTableRowActions row={row} actions={rowActions} />
      </TableCell>
    );
  };

  const renderRow = (row: Row<TData>) => (
    <TableRow
      key={row.id}
      data-state={row.getIsSelected() && "selected"}
      className={cn(
        "hover:bg-muted/30 transition-colors border-border data-[state=selected]:bg-muted/50",
        onRowClick && "cursor-pointer",
      )}
      tabIndex={onRowClick ? 0 : undefined}
      onClick={() => onRowClick?.(row)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRowClick?.(row);
        }
      }}
    >
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta;
        return (
          <TableCell key={cell.id} className={cn("p-4", meta?.cellClassName)}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
      {renderRowActionsCell(row)}
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
            searchKey={toolbarSearchColumnId}
            searchPlaceholder={searchPlaceholder}
            enableColumnVisibility={enableColumnVisibility}
            urlStatePending={tableState.isUrlStatePending}
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
            ref={tableContainerRef}
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
                    {rowActionsColumnCount > 0 && (
                      <TableHead className="h-12 px-4 text-right text-xs font-semibold text-muted-foreground">
                        Actions
                      </TableHead>
                    )}
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
                            colSpan={
                              tableColumns.length + rowActionsColumnCount
                            }
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
                            colSpan={
                              tableColumns.length + rowActionsColumnCount
                            }
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
                    <TableCell
                      colSpan={tableColumns.length + rowActionsColumnCount}
                      className="h-64"
                    >
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
          urlStatePending={tableState.isUrlStatePending}
        />
      )}

      {enableRowSelection && (
        <DataTableActionBar table={table} actions={actionBarActions} />
      )}
    </div>
  );
}
