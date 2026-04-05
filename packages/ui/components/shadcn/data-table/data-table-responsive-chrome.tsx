"use client";

import {
  type Row,
  type Table as TanStackTable,
  flexRender,
} from "@tanstack/react-table";
import { LayoutGrid, LayoutList } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";
import { getDataTableRowActionKey } from "./data-table-row-action-key";
import { DataTableToolbarResponsive } from "./data-table-toolbar-responsive";
import {
  type getKeyboardNavigationStyles,
  useDataTableVirtualization,
  type UseDataTableKeyboardReturn,
} from "./hooks";

import type { ViewMode } from "./data-table-responsive-types";
import type { AdvancedFilterState, FilterFieldDefinition } from "./filters";
import type {
  DataTableConfig,
  DataTableFilterField,
  DataTableInteractiveRowAction,
} from "./types";

export function DataTableViewModeToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex items-center border rounded-xl p-0.5">
      <Button
        variant={viewMode === "table" ? "secondary" : "ghost"}
        size="icon"
        className="size-8 rounded-lg"
        onClick={() => onViewModeChange("table")}
      >
        <LayoutList className="size-4" />
      </Button>
      <Button
        variant={viewMode === "card" ? "secondary" : "ghost"}
        size="icon"
        className="size-8 rounded-lg"
        onClick={() => onViewModeChange("card")}
      >
        <LayoutGrid className="size-4" />
      </Button>
    </div>
  );
}

export function DataTableResponsiveToolbar<TData>({
  enableFilters,
  toolbar,
  table,
  filterFields,
  advancedFilterFields,
  advancedFilter,
  onAdvancedFilterChange,
  searchKey,
  searchPlaceholder,
  enableColumnVisibility,
  enableAdvancedFilters,
  enableExport,
  onExport,
  onRefresh,
  isLoading,
  enableViewToggle,
  isMobile,
  viewMode,
  onViewModeChange,
}: {
  enableFilters: boolean;
  toolbar?: React.ReactNode;
  table: TanStackTable<TData>;
  filterFields: DataTableFilterField<TData>[];
  advancedFilterFields: FilterFieldDefinition[];
  advancedFilter: AdvancedFilterState;
  onAdvancedFilterChange: (filter: AdvancedFilterState) => void;
  searchKey?: string;
  searchPlaceholder?: string;
  enableColumnVisibility: boolean;
  enableAdvancedFilters: boolean;
  enableExport: boolean;
  onExport?: () => void;
  onRefresh?: () => void;
  isLoading: boolean;
  enableViewToggle: boolean;
  isMobile: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  if (!enableFilters) return null;

  return (
    toolbar ?? (
      <DataTableToolbarResponsive
        table={table}
        filterFields={filterFields}
        advancedFilterFields={advancedFilterFields}
        advancedFilter={advancedFilter}
        onAdvancedFilterChange={onAdvancedFilterChange}
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
          <DataTableViewModeToggle
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        )}
      </DataTableToolbarResponsive>
    )
  );
}

export function DataTableResponsiveTableView<TData>({
  table,
  tableColumnsLength,
  keyboard,
  keyboardStyles,
  onRowClick,
  tableClassName,
  emptyState,
  defaultEmptyState,
  virtualization,
  enableVirtualization,
  virtualRowHeight,
  virtualOverscan,
  virtualContainerHeight,
  rowActions,
}: {
  table: TanStackTable<TData>;
  tableColumnsLength: number;
  keyboard: UseDataTableKeyboardReturn;
  keyboardStyles: ReturnType<typeof getKeyboardNavigationStyles>;
  onRowClick?: (row: Row<TData>) => void;
  tableClassName?: string;
  emptyState?: React.ReactNode;
  defaultEmptyState: React.ReactNode;
  virtualization?: DataTableConfig["virtualization"];
  enableVirtualization: boolean;
  virtualRowHeight: number;
  virtualOverscan: number;
  virtualContainerHeight: number | string;
  rowActions?: DataTableInteractiveRowAction<TData>[];
}) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const getVirtualRowKey = React.useCallback(
    (index: number) => rows[index]?.id ?? index,
    [rows],
  );
  const tableVirtualizationConfig = React.useMemo(
    () => ({
      ...virtualization,
      getItemKey: virtualization?.getItemKey ?? getVirtualRowKey,
    }),
    [virtualization, getVirtualRowKey],
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
    virtualization: tableVirtualizationConfig,
    legacy: {
      enabled: enableVirtualization,
      estimateSize: virtualRowHeight,
      overscan: virtualOverscan,
      containerHeight: virtualContainerHeight,
    },
    defaults: {
      enabled: false,
      estimateSize: 56,
      overscan: 8,
      containerHeight: 640,
    },
  });

  const renderDataRow = (row: Row<TData>, rowIndex: number) => {
    const rowProps = keyboard.getRowProps(rowIndex);
    return (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className={cn(
          "hover:bg-muted/30 transition-colors border-border",
          "data-[state=selected]:bg-muted/50",
          onRowClick && "cursor-pointer",
          rowProps["data-focused"] && keyboardStyles.focusedRow,
        )}
        ref={rowProps.ref}
        tabIndex={rowProps.tabIndex}
        onKeyDown={rowProps.onKeyDown}
        onFocus={rowProps.onFocus}
        onBlur={rowProps.onBlur}
        onClick={() => onRowClick?.(row)}
        role="row"
      >
        {row.getVisibleCells().map((cell, cellIndex) => {
          const meta = cell.column.columnDef.meta;
          const isSticky = meta?.sticky;
          const cellProps = keyboard.getCellProps(rowIndex, cellIndex);
          return (
            <TableCell
              key={cell.id}
              className={cn(
                "py-3 px-4",
                meta?.cellClassName,
                isSticky === "left" && "sticky left-0 z-10 bg-card",
                isSticky === "right" && "sticky right-0 z-10 bg-card",
                cellProps["data-cell-focused"] && keyboardStyles.focusedCell,
              )}
              tabIndex={cellProps.tabIndex}
              role="gridcell"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
        {rowActions && rowActions.length > 0 && (
          <TableCell className="py-3 px-4 text-right" role="gridcell">
            <div className="flex justify-end gap-1">
              {rowActions.map((action, actionIndex) => (
                <Button
                  key={getDataTableRowActionKey(action, actionIndex)}
                  type="button"
                  variant={
                    action.variant === "destructive" ? "destructive" : "ghost"
                  }
                  size="sm"
                  className="h-8 gap-2 rounded-lg"
                  onClick={(event) => {
                    event.stopPropagation();
                    action.onClick(row.original);
                  }}
                >
                  {action.icon && <action.icon className="size-4" />}
                  <span className="sr-only sm:not-sr-only">{action.label}</span>
                </Button>
              ))}
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <div
      ref={keyboard.containerRef as React.RefObject<HTMLDivElement>}
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden shadow-sm",
        tableClassName,
      )}
      role="region"
      aria-label="Data table"
    >
      <div
        ref={tableContainerRef}
        className={cn("overflow-x-auto", isVirtualized && "overflow-y-auto")}
        style={
          isVirtualized
            ? { maxHeight: resolvedVirtualization.containerHeight }
            : undefined
        }
      >
        <Table role="grid">
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-border"
                role="row"
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
                        isSticky === "left" && "sticky left-0 z-10 bg-muted/30",
                        isSticky === "right" &&
                          "sticky right-0 z-10 bg-muted/30",
                      )}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                      role="columnheader"
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
                {rowActions && rowActions.length > 0 && (
                  <TableHead
                    className="h-11 px-4 text-right text-xs font-semibold text-muted-foreground whitespace-nowrap"
                    role="columnheader"
                  >
                    Actions
                  </TableHead>
                )}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody role="rowgroup">
            {rows.length ? (
              isVirtualized ? (
                <>
                  {virtualPaddingTop > 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={tableColumnsLength}
                        className="p-0"
                        style={{ height: virtualPaddingTop }}
                      />
                    </TableRow>
                  )}
                  {virtualRows.map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return renderDataRow(row as Row<TData>, virtualRow.index);
                  })}
                  {virtualPaddingBottom > 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={tableColumnsLength}
                        className="p-0"
                        style={{ height: virtualPaddingBottom }}
                      />
                    </TableRow>
                  )}
                </>
              ) : (
                rows.map((row, rowIndex) =>
                  renderDataRow(row as Row<TData>, rowIndex),
                )
              )
            ) : (
              <TableRow role="row">
                <TableCell
                  colSpan={tableColumnsLength + (rowActions ? 1 : 0)}
                  className="h-64"
                  role="gridcell"
                >
                  {emptyState ?? defaultEmptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
