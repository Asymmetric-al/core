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
import { Inbox, LayoutGrid, LayoutList } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableToolbarResponsive } from "./data-table-toolbar-responsive";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableFloatingBar } from "./data-table-floating-bar";
import {
  DataTableSkeleton,
  DataTableLoadingOverlay,
} from "./data-table-skeleton";
import { DataTableCardView } from "./data-table-card-view";
import { useDataTableKeyboard, getKeyboardNavigationStyles } from "./hooks";
import type { DataTableFilterField, DataTableConfig } from "./types";
import type { AdvancedFilterState, FilterFieldDefinition } from "./filters";
import { createEmptyFilterState, createAdvancedFilterFn } from "./filters";

type ViewMode = "table" | "card";

interface DataTableResponsiveProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFields?: DataTableFilterField<TData>[];
  advancedFilterFields?: FilterFieldDefinition[];
  searchKey?: string;
  searchPlaceholder?: string;
  config?: DataTableConfig & {
    enableViewToggle?: boolean;
    defaultViewMode?: ViewMode;
    mobileBreakpoint?: number;
  };
  isLoading?: boolean;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onAdvancedFilterChange?: (filter: AdvancedFilterState) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onRowClick?: (row: Row<TData>) => void;
  floatingBarActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (rows: TData[]) => void;
    variant?: "default" | "destructive";
  }[];
  rowActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: TData) => void;
    variant?: "default" | "destructive";
  }[];
  mobileCardConfig?: {
    primaryField?: string;
    secondaryField?: string;
    tertiaryField?: string;
    badgeField?: string;
    avatarField?: string;
    renderCard?: (row: Row<TData>) => React.ReactNode;
  };
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
    advancedFilter?: AdvancedFilterState;
  };
}

export function DataTableResponsive<TData, TValue>({
  columns,
  data,
  filterFields = [],
  advancedFilterFields = [],
  searchKey,
  searchPlaceholder,
  config = {},
  isLoading = false,
  pageCount,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  onRowSelectionChange,
  onAdvancedFilterChange,
  onRefresh,
  onExport,
  onRowClick,
  floatingBarActions,
  rowActions,
  mobileCardConfig,
  className,
  tableClassName,
  emptyState,
  toolbar,
  initialState = {},
}: DataTableResponsiveProps<TData, TValue>) {
  const {
    enableRowSelection = true,
    enableColumnVisibility = true,
    enablePagination = true,
    enableFilters = true,
    enableAdvancedFilters = false,
    enableSorting = true,
    enableExport = false,
    enableKeyboardNavigation = true,
    enableViewToggle = true,
    defaultViewMode = "table",
    mobileBreakpoint = 768,
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
  } = config;

  const [viewMode, setViewMode] = React.useState<ViewMode>(defaultViewMode);
  const [isMobile, setIsMobile] = React.useState(false);
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
  const [advancedFilter, setAdvancedFilter] =
    React.useState<AdvancedFilterState>(
      initialState.advancedFilter ?? createEmptyFilterState(),
    );

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < mobileBreakpoint;
      setIsMobile(mobile);
      if (mobile && viewMode === "table") {
        setViewMode("card");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [mobileBreakpoint, viewMode]);

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
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 48,
    }),
    [],
  );

  const tableColumns = React.useMemo(() => {
    if (enableRowSelection) {
      return [selectColumn, ...columns];
    }
    return columns;
  }, [columns, enableRowSelection, selectColumn]);

  const advancedFilterFn = React.useMemo(() => {
    if (!enableAdvancedFilters || advancedFilter.conditions.length === 0) {
      return undefined;
    }
    return createAdvancedFilterFn<TData>(advancedFilter);
  }, [enableAdvancedFilters, advancedFilter]);

  const filteredData = React.useMemo(() => {
    if (!advancedFilterFn) return data;
    return data.filter((row) =>
      advancedFilterFn(row, (r, columnId) => {
        const original = r as Record<string, unknown>;
        return original[columnId];
      }),
    );
  }, [data, advancedFilterFn]);

  // eslint-disable-next-line react-hooks/incompatible-library -- "use no memo" directive applied
  const table = useReactTable({
    data: filteredData,
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

  const keyboard = useDataTableKeyboard(table, {
    enabled: enableKeyboardNavigation && viewMode === "table",
    onEnterRow: (row) => {
      if (onRowClick) {
        onRowClick(row as Row<TData>);
      }
    },
    enableRowSelection,
  });

  const keyboardStyles = getKeyboardNavigationStyles();

  const handleAdvancedFilterChange = React.useCallback(
    (filter: AdvancedFilterState) => {
      setAdvancedFilter(filter);
      onAdvancedFilterChange?.(filter);
    },
    [onAdvancedFilterChange],
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

  const showTable = viewMode === "table" && !isMobile;
  const showCards = viewMode === "card" || isMobile;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {enableFilters &&
        (toolbar ?? (
          <DataTableToolbarResponsive
            table={table}
            filterFields={filterFields}
            advancedFilterFields={advancedFilterFields}
            advancedFilter={advancedFilter}
            onAdvancedFilterChange={handleAdvancedFilterChange}
            searchKey={searchKey}
            searchPlaceholder={searchPlaceholder}
            enableColumnVisibility={enableColumnVisibility && !isMobile}
            enableAdvancedFilter={enableAdvancedFilters}
            enableExport={enableExport}
            onExport={onExport}
            onRefresh={onRefresh}
            isLoading={isLoading}
          >
            {enableViewToggle && !isMobile && (
              <div className="flex items-center border rounded-xl p-0.5">
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="icon"
                  className="size-8 rounded-lg"
                  onClick={() => setViewMode("table")}
                >
                  <LayoutList className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "card" ? "secondary" : "ghost"}
                  size="icon"
                  className="size-8 rounded-lg"
                  onClick={() => setViewMode("card")}
                >
                  <LayoutGrid className="size-4" />
                </Button>
              </div>
            )}
          </DataTableToolbarResponsive>
        ))}

      <div className="relative">
        <DataTableLoadingOverlay isLoading={isLoading} />

        {showTable && (
          <div
            ref={keyboard.containerRef as React.RefObject<HTMLDivElement>}
            className={cn(
              "rounded-2xl border border-border bg-card overflow-hidden shadow-sm",
              tableClassName,
            )}
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent border-border"
                    >
                      {headerGroup.headers.map((header) => {
                        const meta = header.column.columnDef.meta;
                        const isSticky = meta?.sticky;
                        return (
                          <TableHead
                            key={header.id}
                            className={cn(
                              "h-11 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap",
                              meta?.headerClassName,
                              isSticky === "left" &&
                                "sticky left-0 z-10 bg-muted/30",
                              isSticky === "right" &&
                                "sticky right-0 z-10 bg-muted/30",
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
                    table.getRowModel().rows.map((row, rowIndex) => {
                      const rowProps = keyboard.getRowProps(rowIndex);
                      return (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className={cn(
                            "hover:bg-muted/30 transition-colors border-border",
                            "data-[state=selected]:bg-muted/50",
                            onRowClick && "cursor-pointer",
                            rowProps["data-focused"] &&
                              keyboardStyles.focusedRow,
                          )}
                          tabIndex={rowProps.tabIndex}
                          onKeyDown={rowProps.onKeyDown}
                          onFocus={rowProps.onFocus}
                          onBlur={rowProps.onBlur}
                          onClick={() => onRowClick?.(row)}
                        >
                          {row.getVisibleCells().map((cell, cellIndex) => {
                            const meta = cell.column.columnDef.meta;
                            const isSticky = meta?.sticky;
                            const cellProps = keyboard.getCellProps(
                              rowIndex,
                              cellIndex,
                            );
                            return (
                              <TableCell
                                key={cell.id}
                                className={cn(
                                  "py-3 px-4",
                                  meta?.cellClassName,
                                  isSticky === "left" &&
                                    "sticky left-0 z-10 bg-card",
                                  isSticky === "right" &&
                                    "sticky right-0 z-10 bg-card",
                                  cellProps["data-cell-focused"] &&
                                    keyboardStyles.focusedCell,
                                )}
                                tabIndex={cellProps.tabIndex}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
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
        )}

        {showCards && (
          <DataTableCardView
            rows={table.getRowModel().rows}
            primaryField={mobileCardConfig?.primaryField}
            secondaryField={mobileCardConfig?.secondaryField}
            tertiaryField={mobileCardConfig?.tertiaryField}
            badgeField={mobileCardConfig?.badgeField}
            avatarField={mobileCardConfig?.avatarField}
            enableRowSelection={enableRowSelection}
            onRowClick={onRowClick}
            rowActions={rowActions}
            renderCard={mobileCardConfig?.renderCard}
          />
        )}
      </div>

      {enablePagination && (
        <DataTablePagination
          table={table}
          showSelectedCount={enableRowSelection}
        />
      )}

      {enableRowSelection && (
        <DataTableFloatingBar table={table} actions={floatingBarActions} />
      )}
    </div>
  );
}
