"use client";

import { useMediaQuery } from "@asym/lib/hooks/use-mobile";
import {
  type ColumnDef,
  type Row,
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
import { DataTableCardView } from "./data-table-card-view";
import { DataTableFloatingBar } from "./data-table-floating-bar";
import { DataTablePagination } from "./data-table-pagination";
import {
  DataTableResponsiveTableView,
  DataTableResponsiveToolbar,
} from "./data-table-responsive-chrome";
import {
  EMPTY_ADVANCED_FILTER_FIELDS,
  EMPTY_RESPONSIVE_DATA_TABLE_CONFIG,
  EMPTY_RESPONSIVE_FILTER_FIELDS,
  EMPTY_RESPONSIVE_INITIAL_STATE,
  type DataTableResponsiveProps,
} from "./data-table-responsive-types";
import {
  DataTableSkeleton,
  DataTableLoadingOverlay,
} from "./data-table-skeleton";
import {
  createEmptyFilterState,
  type AdvancedFilterState,
} from "./filters/types";
import { createAdvancedFilterFn } from "./filters/use-advanced-filter";
import {
  useDataTableKeyboard,
  getKeyboardNavigationStyles,
} from "./hooks/use-data-table-keyboard";

import type { UseDataTableStateReturn } from "./hooks/use-data-table-state";
import type { DataTableFilterField } from "./types";

type DataTableResponsiveBodyProps<TData, TValue> = Omit<
  DataTableResponsiveProps<TData, TValue>,
  "urlState"
>;

export function DataTableResponsiveInner<TData, TValue>({
  tableState,
  columns,
  data,
  filterFields = EMPTY_RESPONSIVE_FILTER_FIELDS as DataTableFilterField<TData>[],
  advancedFilterFields = EMPTY_ADVANCED_FILTER_FIELDS,
  searchKey,
  searchColumnId,
  searchPlaceholder,
  config = EMPTY_RESPONSIVE_DATA_TABLE_CONFIG,
  isLoading = false,
  pageCount,
  rowCount,
  getRowId,
  onAdvancedFilterChange,
  onRefresh,
  onExport,
  onRowClick,
  infiniteScroll,
  enableVirtualization,
  floatingBarActions,
  rowActions,
  mobileCardConfig,
  className,
  tableClassName,
  emptyState,
  toolbar,
  initialState = EMPTY_RESPONSIVE_INITIAL_STATE as NonNullable<
    DataTableResponsiveProps<TData, TValue>["initialState"]
  >,
}: DataTableResponsiveBodyProps<TData, TValue> & {
  tableState: UseDataTableStateReturn;
}) {
  const toolbarSearchColumnId = searchColumnId ?? searchKey;

  const {
    enableRowSelection = true,
    enableColumnVisibility = true,
    enablePagination = true,
    enableFilters = true,
    enableAdvancedFilters = false,
    enableSorting = true,
    enableMultiSort = true,
    enableColumnPinning = false,
    enableExport = false,
    enableKeyboardNavigation = true,
    enableViewToggle = true,
    defaultViewMode = "table",
    mobileBreakpoint = 768,
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
    enableVirtualization: configVirtualizationEnabled = false,
    virtualRowHeight = 56,
    virtualOverscan = 8,
    virtualContainerHeight = 640,
    stickyHeader = false,
  } = config;

  const [viewMode, setViewMode] = React.useState(defaultViewMode);
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint - 1}px)`);
  const resolvedEnableVirtualization =
    enableVirtualization ?? configVirtualizationEnabled;
  const [advancedFilter, setAdvancedFilter] = React.useState(
    initialState.advancedFilter ?? createEmptyFilterState(),
  );

  React.useEffect(() => {
    if (isMobile && viewMode === "table") {
      setViewMode("card");
    }
  }, [isMobile, viewMode]);

  const selectColumn = React.useMemo<ColumnDef<TData, unknown>>(
    () => ({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
          }}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
          className="translate-y-0.5"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 48,
      meta: {
        sticky: "left",
      },
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
        "[asym/ui] DataTableResponsive received both rowCount and pageCount. pageCount is ignored because rowCount is authoritative. Pass only one of these props.",
      );
    }
  }, [pageCount, rowCount]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    rowCount: resolvedRowCount,
    pageCount: resolvedPageCount,
    state: tableState.state,
    enableRowSelection,
    enableSorting,
    enableMultiSort,
    enableColumnPinning,
    manualPagination,
    manualSorting,
    manualFiltering,
    getRowId: getRowId ?? tableState.getRowId,
    onRowSelectionChange: tableState.handlers.onRowSelectionChange,
    onSortingChange: tableState.handlers.onSortingChange,
    onColumnFiltersChange: tableState.handlers.onColumnFiltersChange,
    onColumnVisibilityChange: tableState.handlers.onColumnVisibilityChange,
    onPaginationChange: tableState.handlers.onPaginationChange,
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
      <DataTableResponsiveToolbar
        enableFilters={enableFilters}
        toolbar={toolbar}
        table={table}
        filterFields={filterFields}
        advancedFilterFields={advancedFilterFields}
        advancedFilter={advancedFilter}
        onAdvancedFilterChange={handleAdvancedFilterChange}
        searchKey={toolbarSearchColumnId}
        searchPlaceholder={searchPlaceholder}
        enableColumnVisibility={enableColumnVisibility}
        enableAdvancedFilters={enableAdvancedFilters}
        enableExport={enableExport}
        onExport={onExport}
        onRefresh={onRefresh}
        isLoading={isLoading}
        enableViewToggle={enableViewToggle}
        isMobile={isMobile}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        urlStatePending={tableState.isUrlStatePending}
      />

      <div className="relative">
        <DataTableLoadingOverlay isLoading={isLoading} />

        {showTable && (
          <DataTableResponsiveTableView
            table={table}
            tableColumnsLength={tableColumns.length}
            keyboard={keyboard}
            keyboardStyles={keyboardStyles}
            onRowClick={onRowClick}
            tableClassName={tableClassName}
            emptyState={emptyState}
            defaultEmptyState={defaultEmptyState}
            virtualization={config.virtualization}
            enableVirtualization={resolvedEnableVirtualization}
            virtualRowHeight={virtualRowHeight}
            virtualOverscan={virtualOverscan}
            virtualContainerHeight={virtualContainerHeight}
            rowActions={rowActions}
            infiniteScroll={infiniteScroll}
            stickyHeader={stickyHeader}
          />
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
          urlStatePending={tableState.isUrlStatePending}
        />
      )}

      {enableRowSelection && (
        <DataTableFloatingBar table={table} actions={floatingBarActions} />
      )}
    </div>
  );
}
