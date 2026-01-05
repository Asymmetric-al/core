"use client"

import { useCallback, useMemo, useTransition } from "react"
import {
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs"
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"

export interface DataTableUrlStateOptions {
  pageIndexKey?: string
  pageSizeKey?: string
  sortKey?: string
  filterKey?: string
  searchKey?: string
  visibilityKey?: string
  defaultPageSize?: number
  debounceMs?: number
  shallow?: boolean
  scroll?: boolean
  history?: "push" | "replace"
  clearOnDefault?: boolean
}

export interface DataTableUrlState {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  globalFilter: string
  setPagination: (pagination: PaginationState) => void
  setSorting: (sorting: SortingState) => void
  setColumnFilters: (filters: ColumnFiltersState) => void
  setColumnVisibility: (visibility: VisibilityState) => void
  setGlobalFilter: (filter: string) => void
  resetUrlState: () => void
  isPending: boolean
}

function sortingToString(sorting: SortingState): string {
  if (sorting.length === 0) return ""
  return sorting
    .map((sort) => `${sort.desc ? "-" : ""}${sort.id}`)
    .join(",")
}

function stringToSorting(str: string | null): SortingState {
  if (!str) return []
  return str.split(",").filter(Boolean).map((item) => {
    const desc = item.startsWith("-")
    const id = desc ? item.slice(1) : item
    return { id, desc }
  })
}

function filtersToString(filters: ColumnFiltersState): string {
  if (filters.length === 0) return ""
  return JSON.stringify(filters)
}

function stringToFilters(str: string | null): ColumnFiltersState {
  if (!str) return []
  try {
    return JSON.parse(str)
  } catch {
    return []
  }
}

function visibilityToString(visibility: VisibilityState): string {
  const hidden = Object.entries(visibility)
    .filter(([, visible]) => !visible)
    .map(([key]) => key)
  return hidden.length > 0 ? hidden.join(",") : ""
}

function stringToVisibility(str: string | null): VisibilityState {
  if (!str) return {}
  const hidden = str.split(",").filter(Boolean)
  return hidden.reduce((acc, key) => {
    acc[key] = false
    return acc
  }, {} as VisibilityState)
}

export function useDataTableUrlState(
  options: DataTableUrlStateOptions = {}
): DataTableUrlState {
  const pageIndexKey = options.pageIndexKey ?? "page"
  const pageSizeKey = options.pageSizeKey ?? "perPage"
  const sortKey = options.sortKey ?? "sort"
  const filterKey = options.filterKey ?? "filter"
  const searchKey = options.searchKey ?? "q"
  const visibilityKey = options.visibilityKey ?? "cols"
  const defaultPageSize = options.defaultPageSize ?? 10
  const shallow = options.shallow ?? true
  const scroll = options.scroll ?? false
  const history = options.history ?? "replace"
  const clearOnDefault = options.clearOnDefault ?? true
  const debounceMs = options.debounceMs ?? 0

  const [isPending, startTransition] = useTransition()

  const searchParamsConfig = useMemo(
    () => ({
      [pageIndexKey]: parseAsInteger.withDefault(0),
      [pageSizeKey]: parseAsInteger.withDefault(defaultPageSize),
      [sortKey]: parseAsString.withDefault(""),
      [filterKey]: parseAsString.withDefault(""),
      [searchKey]: parseAsString.withDefault(""),
      [visibilityKey]: parseAsString.withDefault(""),
    }),
    [pageIndexKey, pageSizeKey, sortKey, filterKey, searchKey, visibilityKey, defaultPageSize]
  )

  const [searchParams, setSearchParams] = useQueryStates(searchParamsConfig, {
    shallow,
    scroll,
    history,
    clearOnDefault,
    throttleMs: debounceMs,
  })

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: searchParams[pageIndexKey] as number,
      pageSize: searchParams[pageSizeKey] as number,
    }),
    [searchParams, pageIndexKey, pageSizeKey]
  )

  const sorting = useMemo<SortingState>(
    () => stringToSorting(searchParams[sortKey] as string),
    [searchParams, sortKey]
  )

  const columnFilters = useMemo<ColumnFiltersState>(
    () => stringToFilters(searchParams[filterKey] as string),
    [searchParams, filterKey]
  )

  const columnVisibility = useMemo<VisibilityState>(
    () => stringToVisibility(searchParams[visibilityKey] as string),
    [searchParams, visibilityKey]
  )

  const globalFilter = (searchParams[searchKey] as string) ?? ""

  const setPagination = useCallback(
    (newPagination: PaginationState) => {
      startTransition(() => {
        setSearchParams({
          [pageIndexKey]: newPagination.pageIndex === 0 ? null : newPagination.pageIndex,
          [pageSizeKey]: newPagination.pageSize === defaultPageSize ? null : newPagination.pageSize,
        })
      })
    },
    [setSearchParams, pageIndexKey, pageSizeKey, defaultPageSize]
  )

  const setSorting = useCallback(
    (newSorting: SortingState) => {
      startTransition(() => {
        const sortStr = sortingToString(newSorting)
        setSearchParams({
          [sortKey]: sortStr || null,
          [pageIndexKey]: null,
        })
      })
    },
    [setSearchParams, sortKey, pageIndexKey]
  )

  const setColumnFilters = useCallback(
    (newFilters: ColumnFiltersState) => {
      startTransition(() => {
        const filterStr = filtersToString(newFilters)
        setSearchParams({
          [filterKey]: filterStr || null,
          [pageIndexKey]: null,
        })
      })
    },
    [setSearchParams, filterKey, pageIndexKey]
  )

  const setColumnVisibility = useCallback(
    (newVisibility: VisibilityState) => {
      startTransition(() => {
        const visStr = visibilityToString(newVisibility)
        setSearchParams({
          [visibilityKey]: visStr || null,
        })
      })
    },
    [setSearchParams, visibilityKey]
  )

  const setGlobalFilter = useCallback(
    (filter: string) => {
      startTransition(() => {
        setSearchParams({
          [searchKey]: filter || null,
          [pageIndexKey]: null,
        })
      })
    },
    [setSearchParams, searchKey, pageIndexKey]
  )

  const resetUrlState = useCallback(() => {
    startTransition(() => {
      setSearchParams({
        [pageIndexKey]: null,
        [pageSizeKey]: null,
        [sortKey]: null,
        [filterKey]: null,
        [searchKey]: null,
        [visibilityKey]: null,
      })
    })
  }, [setSearchParams, pageIndexKey, pageSizeKey, sortKey, filterKey, searchKey, visibilityKey])

  return {
    pagination,
    sorting,
    columnFilters,
    columnVisibility,
    globalFilter,
    setPagination,
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    setGlobalFilter,
    resetUrlState,
    isPending,
  }
}

export function createDataTableSearchParams(options: DataTableUrlStateOptions = {}) {
  const pageIndexKey = options.pageIndexKey ?? "page"
  const pageSizeKey = options.pageSizeKey ?? "perPage"
  const sortKey = options.sortKey ?? "sort"
  const filterKey = options.filterKey ?? "filter"
  const searchKey = options.searchKey ?? "q"
  const visibilityKey = options.visibilityKey ?? "cols"
  const defaultPageSize = options.defaultPageSize ?? 10
  
  return {
    [pageIndexKey]: parseAsInteger.withDefault(0),
    [pageSizeKey]: parseAsInteger.withDefault(defaultPageSize),
    [sortKey]: parseAsString.withDefault(""),
    [filterKey]: parseAsString.withDefault(""),
    [searchKey]: parseAsString.withDefault(""),
    [visibilityKey]: parseAsString.withDefault(""),
  }
}
