import type { Column, ColumnDef, Row, Table, ColumnSizingState, VisibilityState } from "@tanstack/react-table"

export type DataTableFilterVariant =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "date"
  | "date-range"
  | "boolean"

export type DataTableCellVariant =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "boolean"
  | "badge"
  | "avatar"
  | "link"
  | "progress"
  | "rating"
  | "custom"

export interface DataTableFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

export interface DataTableFilterField<TData> {
  id: keyof TData | string
  label: string
  placeholder?: string
  variant?: DataTableFilterVariant
  options?: DataTableFilterOption[]
}

export interface DataTableAdvancedFilterField<TData>
  extends DataTableFilterField<TData> {
  isMulti?: boolean
}

export interface DataTableRowAction<TData> {
  row: Row<TData>
  type: "update" | "delete"
}

export interface DataTableConfig {
  enableRowSelection?: boolean
  enableMultiSort?: boolean
  enableColumnResizing?: boolean
  enableColumnPinning?: boolean
  enableGlobalFilter?: boolean
  enableColumnVisibility?: boolean
  enablePagination?: boolean
  enableFilters?: boolean
  enableAdvancedFilters?: boolean
  enableSorting?: boolean
  enableFullscreen?: boolean
  enableKeyboardNavigation?: boolean
  enableExport?: boolean
  enableUrlState?: boolean
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  columnResizingPersistKey?: string
}

export interface DataTableUrlStateConfig {
  pageIndexKey?: string
  pageSizeKey?: string
  sortKey?: string
  filterKey?: string
  searchKey?: string
  visibilityKey?: string
}

export interface DataTableState {
  columnSizing?: ColumnSizingState
  columnVisibility?: VisibilityState
}

export const DEFAULT_PAGE_SIZES = [10, 20, 30, 50, 100] as const

export const DEFAULT_COLUMN_SIZE = 150
export const MIN_COLUMN_SIZE = 50
export const MAX_COLUMN_SIZE = 500

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filterVariant?: DataTableFilterVariant
    filterOptions?: DataTableFilterOption[]
    cellVariant?: DataTableCellVariant
    label?: string
    headerClassName?: string
    cellClassName?: string
    exportFormatter?: (value: TValue, row: TData) => string
    enableResizing?: boolean
    sticky?: "left" | "right"
  }
}

export type {
  Column,
  ColumnDef,
  Row,
  Table,
  ColumnSizingState,
  VisibilityState,
}
