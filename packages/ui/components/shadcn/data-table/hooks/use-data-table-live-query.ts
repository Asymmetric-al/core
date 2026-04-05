/* eslint-disable react-hooks/incompatible-library -- TanStack Table API is intentionally non-memoizable */
"use client";

import * as React from "react";
import type { Context, InitialQueryBuilder, QueryBuilder } from "@tanstack/db";
import { useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "@tanstack/react-db";
import {
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  type ColumnDef,
  type TableOptions,
} from "@tanstack/react-table";
import { Checkbox } from "../../checkbox";
import type {
  AdvancedFilterState,
  FilterFieldDefinition,
} from "../filters/types";
import { createEmptyFilterState, createAdvancedFilterFn } from "../filters";

type LiveQueryBuilder<TContext extends Context> = (
  q: InitialQueryBuilder,
) => QueryBuilder<TContext>;

type RefetchableLiveQueryCollection = {
  utils?: {
    refetch?: () => Promise<void>;
    lastError?: unknown;
  };
  preload?: () => Promise<void>;
};

export function resolveLiveQueryError(
  isError: boolean,
  status: string,
  collection: RefetchableLiveQueryCollection | undefined,
): Error | null {
  if (!isError) return null;
  const last = collection?.utils?.lastError;
  if (last instanceof Error) return last;
  if (last != null && typeof last === "object" && "message" in last) {
    return new Error(String((last as { message: unknown }).message));
  }
  if (last != null) return new Error(String(last));
  return new Error(`Live query error (${String(status)})`);
}

export async function refetchLiveQuerySource({
  collection,
  invalidateQuery,
}: {
  collection?: RefetchableLiveQueryCollection;
  invalidateQuery?: () => Promise<void>;
}): Promise<void> {
  const collectionRefetch = collection?.utils?.refetch;
  if (typeof collectionRefetch === "function") {
    await collectionRefetch();
    return;
  }

  if (invalidateQuery) {
    await invalidateQuery();
    return;
  }

  const preload = collection?.preload;
  if (typeof preload === "function") {
    await preload();
  }
}

interface UseDataTableWithLiveQueryOptions<
  TData,
  TValue,
  TContext extends Context = Context,
> {
  columns: ColumnDef<TData, TValue>[];
  queryBuilder: LiveQueryBuilder<TContext>;
  /** When set, `refetch()` invalidates these keys (must match query-db `queryKey` for source collections). */
  queryKey?: string[];
  /** Dependencies forwarded to `useLiveQuery` so the query re-runs when inputs change. */
  liveQueryDeps?: unknown[];
  advancedFilterFields?: FilterFieldDefinition[];
  initialState?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    rowSelection?: RowSelectionState;
    advancedFilter?: AdvancedFilterState;
  };
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  getRowId?: (row: TData) => string;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  onAdvancedFilterChange?: (filter: AdvancedFilterState) => void;
}

interface UseDataTableWithLiveQueryReturn<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
  data: TData[];
  isLoading: boolean;
  error: Error | null;
  /** TanStack DB collection status string (e.g. ready, error). */
  liveQueryStatus: string;
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  advancedFilter: AdvancedFilterState;
  setAdvancedFilter: React.Dispatch<React.SetStateAction<AdvancedFilterState>>;
  totalRows: number;
  selectedRows: TData[];
  clearSelection: () => void;
  refetch: () => Promise<void>;
}

export function useDataTableWithLiveQuery<
  TData,
  TValue = unknown,
  TContext extends Context = Context,
>({
  columns,
  queryBuilder,
  queryKey,
  liveQueryDeps,
  initialState = {},
  enableRowSelection = true,
  enableMultiRowSelection = true,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  pageSize = 10,
  getRowId,
  onRowSelectionChange,
  onSortingChange,
  onFiltersChange,
  onAdvancedFilterChange,
}: UseDataTableWithLiveQueryOptions<
  TData,
  TValue,
  TContext
>): UseDataTableWithLiveQueryReturn<TData> {
  const queryClient = useQueryClient();
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
    initialState.pagination ?? { pageIndex: 0, pageSize },
  );
  const [advancedFilter, setAdvancedFilter] =
    React.useState<AdvancedFilterState>(
      initialState.advancedFilter ?? createEmptyFilterState(),
    );

  const { data, isLoading, isError, status, collection } = useLiveQuery(
    queryBuilder as never,
    liveQueryDeps ?? [],
  );

  const rawData = React.useMemo(() => {
    if (data === undefined || data === null) return [] as TData[];
    if (Array.isArray(data)) return data as TData[];
    return [data] as TData[];
  }, [data]);

  const error = React.useMemo(
    () =>
      resolveLiveQueryError(
        isError,
        String(status),
        collection as RefetchableLiveQueryCollection,
      ),
    [isError, status, collection],
  );

  const advancedFilterFn = React.useMemo(() => {
    if (advancedFilter.conditions.length === 0) return null;
    return createAdvancedFilterFn<TData>(advancedFilter);
  }, [advancedFilter]);

  const filteredData = React.useMemo(() => {
    if (!advancedFilterFn) return rawData;
    return rawData.filter((row) =>
      advancedFilterFn(row, (r, columnId) => {
        const original = r as Record<string, unknown>;
        return original[columnId];
      }),
    );
  }, [rawData, advancedFilterFn]);

  React.useEffect(() => {
    onRowSelectionChange?.(rowSelection);
  }, [rowSelection, onRowSelectionChange]);

  React.useEffect(() => {
    onSortingChange?.(sorting);
  }, [sorting, onSortingChange]);

  React.useEffect(() => {
    onFiltersChange?.(columnFilters);
  }, [columnFilters, onFiltersChange]);

  React.useEffect(() => {
    onAdvancedFilterChange?.(advancedFilter);
  }, [advancedFilter, onAdvancedFilterChange]);

  const selectColumn = React.useMemo<ColumnDef<TData, unknown>>(
    () => ({
      id: "select",
      header: ({ table }) =>
        React.createElement(Checkbox, {
          checked:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate"),
          onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
          "aria-label": "Select all",
          className: "translate-y-0.5",
        }),
      cell: ({ row }) =>
        React.createElement(Checkbox, {
          checked: row.getIsSelected(),
          onCheckedChange: (value) => row.toggleSelected(!!value),
          "aria-label": "Select row",
          className: "translate-y-0.5",
        }),
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

  const tableOptions: TableOptions<TData> = {
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection,
    enableMultiRowSelection,
    enableSorting,
    getRowId,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  };

  const table = useReactTable(tableOptions);

  const selectedRows = React.useMemo(() => {
    return table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  }, [table]);

  const clearSelection = React.useCallback(() => {
    setRowSelection({});
  }, []);

  const refetch = React.useCallback(async () => {
    await refetchLiveQuerySource({
      collection: collection as RefetchableLiveQueryCollection | undefined,
      invalidateQuery:
        queryKey && queryKey.length > 0
          ? async () => {
              await queryClient.invalidateQueries({ queryKey });
            }
          : undefined,
    });
  }, [queryClient, queryKey, collection]);

  return {
    table,
    data: filteredData,
    isLoading,
    error,
    liveQueryStatus: String(status),
    rowSelection,
    setRowSelection,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    pagination,
    setPagination,
    advancedFilter,
    setAdvancedFilter,
    totalRows: filteredData.length,
    selectedRows,
    clearSelection,
    refetch,
  };
}
