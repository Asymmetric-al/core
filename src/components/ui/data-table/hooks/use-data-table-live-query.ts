/* eslint-disable react-hooks/incompatible-library -- TanStack Table API is intentionally non-memoizable */
"use client"

import * as React from "react"
import { useLiveQuery } from "@tanstack/react-db"
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
} from "@tanstack/react-table"
import type {
  AdvancedFilterState,
  FilterFieldDefinition,
} from "../filters/types"
import {
  createEmptyFilterState,
  createAdvancedFilterFn,
} from "../filters"

type LiveQueryBuilder<TData> = (
  q: {
    from: (arg: Record<string, unknown>) => {
      where: (fn: (args: unknown) => boolean) => unknown
      join: (collection: Record<string, unknown>, fn: (args: unknown) => boolean) => unknown
      select: (fn: (args: unknown) => TData) => unknown
      orderBy: (fn: (args: unknown) => unknown, dir?: "asc" | "desc") => unknown
    }
  }
) => unknown

interface UseDataTableWithLiveQueryOptions<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  queryBuilder: LiveQueryBuilder<TData>
  queryKey?: string[]
  advancedFilterFields?: FilterFieldDefinition[]
  initialState?: {
    pagination?: PaginationState
    sorting?: SortingState
    columnFilters?: ColumnFiltersState
    columnVisibility?: VisibilityState
    rowSelection?: RowSelectionState
    advancedFilter?: AdvancedFilterState
  }
  enableRowSelection?: boolean
  enableMultiRowSelection?: boolean
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  pageSize?: number
  getRowId?: (row: TData) => string
  onRowSelectionChange?: (selection: RowSelectionState) => void
  onSortingChange?: (sorting: SortingState) => void
  onFiltersChange?: (filters: ColumnFiltersState) => void
  onAdvancedFilterChange?: (filter: AdvancedFilterState) => void
}

interface UseDataTableWithLiveQueryReturn<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  data: TData[]
  isLoading: boolean
  error: Error | null
  rowSelection: RowSelectionState
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>
  sorting: SortingState
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
  columnFilters: ColumnFiltersState
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  columnVisibility: VisibilityState
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>
  pagination: PaginationState
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  advancedFilter: AdvancedFilterState
  setAdvancedFilter: React.Dispatch<React.SetStateAction<AdvancedFilterState>>
  totalRows: number
  selectedRows: TData[]
  clearSelection: () => void
  refetch: () => void
}

export function useDataTableWithLiveQuery<TData, TValue = unknown>({
  columns,
  queryBuilder,
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
}: UseDataTableWithLiveQueryOptions<TData, TValue>): UseDataTableWithLiveQueryReturn<TData> {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    initialState.rowSelection ?? {}
  )
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    initialState.columnVisibility ?? {}
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialState.columnFilters ?? []
  )
  const [sorting, setSorting] = React.useState<SortingState>(
    initialState.sorting ?? []
  )
  const [pagination, setPagination] = React.useState<PaginationState>(
    initialState.pagination ?? { pageIndex: 0, pageSize }
  )
  const [advancedFilter, setAdvancedFilter] = React.useState<AdvancedFilterState>(
    initialState.advancedFilter ?? createEmptyFilterState()
  )

  const liveQueryResult = useLiveQuery(queryBuilder as unknown as Parameters<typeof useLiveQuery>[0])
  
  const rawData = React.useMemo(() => {
    const data = liveQueryResult?.data
    if (Array.isArray(data)) return data as TData[]
    if (data) return [data] as TData[]
    return [] as TData[]
  }, [liveQueryResult?.data])
  
  const isLoading = (liveQueryResult as { status?: string })?.status === "pending"
  const error = (liveQueryResult as { isError?: boolean })?.isError ? new Error("Query error") : null

  const advancedFilterFn = React.useMemo(() => {
    if (advancedFilter.conditions.length === 0) return null
    return createAdvancedFilterFn<TData>(advancedFilter)
  }, [advancedFilter])

  const filteredData = React.useMemo(() => {
    if (!advancedFilterFn) return rawData
    return rawData.filter((row) =>
      advancedFilterFn(row, (r, columnId) => {
        const original = r as Record<string, unknown>
        return original[columnId]
      })
    )
  }, [rawData, advancedFilterFn])

  React.useEffect(() => {
    onRowSelectionChange?.(rowSelection)
  }, [rowSelection, onRowSelectionChange])

  React.useEffect(() => {
    onSortingChange?.(sorting)
  }, [sorting, onSortingChange])

  React.useEffect(() => {
    onFiltersChange?.(columnFilters)
  }, [columnFilters, onFiltersChange])

  React.useEffect(() => {
    onAdvancedFilterChange?.(advancedFilter)
  }, [advancedFilter, onAdvancedFilterChange])

  const tableOptions: TableOptions<TData> = {
    data: filteredData,
    columns,
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
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  }

  const table = useReactTable(tableOptions)

  const selectedRows = React.useMemo(() => {
    return table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original)
  }, [table])

  const clearSelection = React.useCallback(() => {
    setRowSelection({})
  }, [])

  const refetch = React.useCallback(() => {
  }, [])

  return {
    table,
    data: filteredData,
    isLoading,
    error: error as Error | null,
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
  }
}

interface UseDataTableWithSupabaseOptions<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  tableName: string
  select?: string
  initialState?: {
    pagination?: PaginationState
    sorting?: SortingState
    columnFilters?: ColumnFiltersState
    columnVisibility?: VisibilityState
    rowSelection?: RowSelectionState
    advancedFilter?: AdvancedFilterState
  }
  advancedFilterFields?: FilterFieldDefinition[]
  enableRowSelection?: boolean
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  pageSize?: number
  getRowId?: (row: TData) => string
  realtimeEnabled?: boolean
  realtimeEvent?: "INSERT" | "UPDATE" | "DELETE" | "*"
}

export function useDataTableWithSupabase<TData, TValue = unknown>(
  _options: UseDataTableWithSupabaseOptions<TData, TValue>
) {
  console.warn(
    "useDataTableWithSupabase is deprecated. Use useDataTableWithLiveQuery with TanStack DB collections instead."
  )
  return null
}
