"use client";

import * as React from "react";

import {
  mergeSearchColumnFilter,
  splitSearchColumnFilter,
} from "../data-table-search-column-bridge";
import { useDataTableUrlState } from "./use-data-table-url-state";

import type {
  DataTableControlledState,
  DataTableUrlStateConfig,
} from "../types";
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";

export interface DataTableInitialState {
  pagination?: PaginationState;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  rowSelection?: RowSelectionState;
}

export interface UseDataTableStateOptions {
  initialState?: DataTableInitialState;
  state?: DataTableControlledState;
  controlledState?: DataTableControlledState;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  urlState?: DataTableUrlStateConfig;
  searchKey?: string;
}

export interface UseDataTableStateReturn {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  pagination: PaginationState;
  setSorting: (updater: Updater<SortingState>) => void;
  setColumnFilters: (updater: Updater<ColumnFiltersState>) => void;
  setColumnVisibility: (updater: Updater<VisibilityState>) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  setPagination: (updater: Updater<PaginationState>) => void;
  state: {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    columnVisibility: VisibilityState;
    rowSelection: RowSelectionState;
    pagination: PaginationState;
  };
  handlers: {
    onSortingChange: (updater: Updater<SortingState>) => void;
    onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => void;
    onColumnVisibilityChange: (updater: Updater<VisibilityState>) => void;
    onRowSelectionChange: (updater: Updater<RowSelectionState>) => void;
    onPaginationChange: (updater: Updater<PaginationState>) => void;
  };
  getRowId: <TData>(originalRow: TData, index: number) => string;
  isUrlStatePending: boolean;
}

function resolveUpdater<T>(updater: Updater<T>, currentValue: T): T {
  return typeof updater === "function"
    ? (updater as (value: T) => T)(currentValue)
    : updater;
}

export function useDataTableState({
  initialState,
  state,
  controlledState,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  onColumnVisibilityChange,
  onRowSelectionChange,
  urlState,
  searchKey,
}: UseDataTableStateOptions): UseDataTableStateReturn {
  const resolvedControlledState = state ?? controlledState;
  const effectiveSearchColumnKey = urlState?.searchColumnKey ?? searchKey;
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>(initialState?.rowSelection ?? {});
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>(initialState?.columnVisibility ?? {});
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>(initialState?.columnFilters ?? []);
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    initialState?.sorting ?? [],
  );
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>(
      initialState?.pagination ?? {
        pageIndex: 0,
        pageSize: 10,
      },
    );

  const urlTableState = useDataTableUrlState({
    defaultPageSize:
      urlState?.defaultPageSize ?? initialState?.pagination?.pageSize ?? 10,
    pageIndexKey: urlState?.pageIndexKey,
    pageSizeKey: urlState?.pageSizeKey,
    sortKey: urlState?.sortKey,
    filterKey: urlState?.filterKey,
    searchKey: urlState?.searchKey,
    visibilityKey: urlState?.visibilityKey,
    debounceMs: urlState?.debounceMs,
    shallow: urlState?.shallow,
    scroll: urlState?.scroll,
    history: urlState?.history,
    clearOnDefault: urlState?.clearOnDefault,
  });

  const urlStateEnabled = Boolean(urlState);

  const sorting =
    resolvedControlledState?.sorting ??
    (urlStateEnabled ? urlTableState.sorting : internalSorting);
  const pagination =
    resolvedControlledState?.pagination ??
    (urlStateEnabled ? urlTableState.pagination : internalPagination);
  const columnVisibility =
    resolvedControlledState?.columnVisibility ??
    (urlStateEnabled
      ? urlTableState.columnVisibility
      : internalColumnVisibility);
  const columnFilters =
    resolvedControlledState?.columnFilters ??
    (urlStateEnabled
      ? mergeSearchColumnFilter(
          urlTableState.columnFilters,
          urlTableState.globalFilter,
          effectiveSearchColumnKey,
        )
      : internalColumnFilters);
  const rowSelection =
    resolvedControlledState?.rowSelection ?? internalRowSelection;

  const setSorting = React.useCallback(
    (updater: Updater<SortingState>) => {
      const nextSorting = resolveUpdater(updater, sorting);

      if (resolvedControlledState?.sorting === undefined && !urlStateEnabled) {
        setInternalSorting(nextSorting);
      }

      if (urlStateEnabled) {
        urlTableState.setSorting(nextSorting);
      }

      onSortingChange?.(nextSorting);
    },
    [
      resolvedControlledState?.sorting,
      onSortingChange,
      sorting,
      urlStateEnabled,
      urlTableState,
    ],
  );

  const setPagination = React.useCallback(
    (updater: Updater<PaginationState>) => {
      const nextPagination = resolveUpdater(updater, pagination);

      if (
        resolvedControlledState?.pagination === undefined &&
        !urlStateEnabled
      ) {
        setInternalPagination(nextPagination);
      }

      if (urlStateEnabled) {
        urlTableState.setPagination(nextPagination);
      }

      onPaginationChange?.(nextPagination);
    },
    [
      resolvedControlledState?.pagination,
      onPaginationChange,
      pagination,
      urlStateEnabled,
      urlTableState,
    ],
  );

  const setColumnFilters = React.useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      const nextFilters = resolveUpdater(updater, columnFilters);

      if (
        resolvedControlledState?.columnFilters === undefined &&
        !urlStateEnabled
      ) {
        setInternalColumnFilters(nextFilters);
      }

      if (urlStateEnabled) {
        const { searchValue, remainingFilters } = splitSearchColumnFilter(
          nextFilters,
          effectiveSearchColumnKey,
        );
        urlTableState.setColumnFilters(remainingFilters);
        urlTableState.setGlobalFilter(searchValue);
      }

      onFiltersChange?.(nextFilters);
    },
    [
      columnFilters,
      resolvedControlledState?.columnFilters,
      onFiltersChange,
      effectiveSearchColumnKey,
      urlStateEnabled,
      urlTableState,
    ],
  );

  const setColumnVisibility = React.useCallback(
    (updater: Updater<VisibilityState>) => {
      const nextVisibility = resolveUpdater(updater, columnVisibility);

      if (
        resolvedControlledState?.columnVisibility === undefined &&
        !urlStateEnabled
      ) {
        setInternalColumnVisibility(nextVisibility);
      }

      if (urlStateEnabled) {
        urlTableState.setColumnVisibility(nextVisibility);
      }

      onColumnVisibilityChange?.(nextVisibility);
    },
    [
      columnVisibility,
      resolvedControlledState?.columnVisibility,
      onColumnVisibilityChange,
      urlStateEnabled,
      urlTableState,
    ],
  );

  const setRowSelection = React.useCallback(
    (updater: Updater<RowSelectionState>) => {
      const nextSelection = resolveUpdater(updater, rowSelection);

      if (resolvedControlledState?.rowSelection === undefined) {
        setInternalRowSelection(nextSelection);
      }

      onRowSelectionChange?.(nextSelection);
    },
    [resolvedControlledState?.rowSelection, onRowSelectionChange, rowSelection],
  );

  const getRowId = React.useCallback(
    <TData>(originalRow: TData, index: number) => {
      if (typeof originalRow === "object" && originalRow !== null) {
        const candidate = originalRow as Record<string, unknown>;
        const id =
          candidate.id ??
          candidate.uuid ??
          candidate._id ??
          candidate.key ??
          candidate.slug;
        if (typeof id === "string" || typeof id === "number") {
          return String(id);
        }
      }

      return String(index);
    },
    [],
  );

  return {
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    pagination,
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    setRowSelection,
    setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    handlers: {
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      onPaginationChange: setPagination,
    },
    getRowId,
    isUrlStatePending: urlStateEnabled ? urlTableState.isPending : false,
  };
}
