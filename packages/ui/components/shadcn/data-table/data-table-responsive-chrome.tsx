"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import {
  type Row,
  type RowData,
  type Table as TanStackTable,
  flexRender,
} from "./tanstack";
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
  type UseDataTableKeyboardReturn,
} from "./hooks/use-data-table-keyboard";
import { useDataTableVirtualization } from "./hooks/use-data-table-virtualization";

import type {
  DataTableResponsiveProps,
  ViewMode,
} from "./data-table-responsive-types";
import type {
  AdvancedFilterState,
  FilterFieldDefinition,
} from "./filters/types";
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

export function DataTableResponsiveToolbar<TData extends RowData>({
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
  urlStatePending = false,
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
  urlStatePending?: boolean;
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
        urlStatePending={urlStatePending}
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

export function DataTableResponsiveTableView<TData extends RowData>({
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
  infiniteScroll,
  stickyHeader = false,
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
  enableVirtualization?: boolean;
  virtualRowHeight?: number;
  virtualOverscan?: number;
  virtualContainerHeight?: number | string;
  rowActions?: DataTableInteractiveRowAction<TData>[];
  infiniteScroll?: DataTableResponsiveProps<TData, unknown>["infiniteScroll"];
  stickyHeader?: boolean;
}) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const lastLoadTriggerRef = React.useRef<string | null>(null);
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

  const infiniteThreshold = infiniteScroll?.threshold ?? 8;

  React.useEffect(() => {
    if (
      !infiniteScroll ||
      !infiniteScroll.hasMore ||
      infiniteScroll.isFetchingMore ||
      rows.length === 0
    ) {
      return;
    }

    if (isVirtualized) {
      const lastVisibleIndex = virtualRows[virtualRows.length - 1]?.index ?? -1;
      if (lastVisibleIndex < rows.length - 1 - infiniteThreshold) {
        return;
      }

      const triggerKey = `${rows.length}:${lastVisibleIndex}`;
      if (lastLoadTriggerRef.current === triggerKey) {
        return;
      }

      lastLoadTriggerRef.current = triggerKey;
      infiniteScroll.onLoadMore();
    }
  }, [
    infiniteScroll,
    infiniteThreshold,
    isVirtualized,
    rows.length,
    virtualRows,
  ]);

  React.useEffect(() => {
    if (
      !infiniteScroll ||
      !infiniteScroll.hasMore ||
      infiniteScroll.isFetchingMore ||
      rows.length === 0 ||
      isVirtualized
    ) {
      return;
    }

    const el = tableContainerRef.current;
    if (!el) {
      return;
    }

    const onScroll = () => {
      if (
        !infiniteScroll?.hasMore ||
        infiniteScroll.isFetchingMore ||
        rows.length === 0
      ) {
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = el;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 120;
      if (!nearBottom) {
        return;
      }
      const triggerKey = `ns:${rows.length}:${Math.round(scrollTop)}`;
      if (lastLoadTriggerRef.current === triggerKey) {
        return;
      }
      lastLoadTriggerRef.current = triggerKey;
      infiniteScroll.onLoadMore();
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [infiniteScroll, isVirtualized, rows.length]);

  const actionsColumnCount = rowActions && rowActions.length > 0 ? 1 : 0;

  const renderDataRow = (row: Row<TData>, rowIndex: number) => {
    const rowProps = keyboard.getRowProps(rowIndex);
    const isSelected = row.getIsSelected();
    const isRowFocused = Boolean(rowProps["data-focused"]);
    return (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className={cn(
          "group hover:bg-muted/30 transition-colors border-border",
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
          const stickyStateClass = isSticky
            ? cn(
                "relative transition-colors",
                isSelected
                  ? "bg-muted/50"
                  : isRowFocused
                    ? "bg-muted/30"
                    : "bg-card group-hover:bg-muted/30",
                isSticky === "left" &&
                  "sticky left-0 z-10 shadow-[1px_0_0_0_var(--color-border)]",
                isSticky === "right" &&
                  "sticky right-0 z-10 shadow-[-1px_0_0_0_var(--color-border)]",
              )
            : undefined;
          const cellProps = keyboard.getCellProps(rowIndex, cellIndex);
          return (
            <TableCell
              key={cell.id}
              className={cn(
                "py-3 px-4",
                meta?.cellClassName,
                stickyStateClass,
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
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.stopPropagation();
                    }
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
                        stickyHeader && "sticky top-0 z-20 bg-muted/30",
                        meta?.headerClassName,
                        isSticky === "left" &&
                          "sticky left-0 z-30 bg-muted/30 shadow-[1px_0_0_0_var(--color-border)]",
                        isSticky === "right" &&
                          "sticky right-0 z-30 bg-muted/30 shadow-[-1px_0_0_0_var(--color-border)]",
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
                        colSpan={tableColumnsLength + actionsColumnCount}
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
                        colSpan={tableColumnsLength + actionsColumnCount}
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
                  colSpan={tableColumnsLength + actionsColumnCount}
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
      {infiniteScroll?.isFetchingMore ? (
        <div className="flex items-center justify-center border-t border-border/60 bg-card px-4 py-3 text-xs font-medium text-muted-foreground">
          {infiniteScroll.loadingContent ?? "Loading more..."}
        </div>
      ) : null}
    </div>
  );
}
