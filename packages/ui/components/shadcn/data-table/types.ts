import type {
  CellData,
  Column,
  ColumnDef,
  Row,
  RowData,
  Table,
  TableFeatures,
  ColumnSizingState,
  VisibilityState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "./tanstack";
import type * as React from "react";

export type DataTableFilterVariant =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "date"
  | "date-range"
  | "boolean";

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
  | "custom";

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface DataTableFilterField<TData> {
  id: keyof TData | string;
  label: string;
  placeholder?: string;
  variant?: DataTableFilterVariant;
  options?: DataTableFilterOption[];
}

export interface DataTableAdvancedFilterField<
  TData,
> extends DataTableFilterField<TData> {
  isMulti?: boolean;
}

/** Legacy row mutation descriptor (not the toolbar row-actions menu). */
export interface DataTableRowMutationAction<TData extends RowData> {
  row: Row<TData>;
  type: "update" | "delete";
}

/**
 * @deprecated Use `DataTableRowMutationAction` — distinct from `DataTableInteractiveRowAction`.
 */
export type DataTableRowAction<TData extends RowData> =
  DataTableRowMutationAction<TData>;

/** Toolbar / menu actions on a row (table buttons, dropdown, cards). */
export interface DataTableInteractiveRowAction<TData> {
  /** Optional stable key when multiple actions share the same label. */
  id?: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive";
}

export interface VirtualizationConfig {
  /**
   * Toggles TanStack Virtual observers for this instance.
   * Runtime changes reset virtualizer state (including scroll offset and
   * measurements), so treat this as stable for a mounted component.
   */
  enabled?: boolean;
  estimateSize?: number;
  overscan?: number;
  containerHeight?: number | string;
  getItemKey?: (index: number) => string | number;
}

export interface DataTableConfig {
  enableRowSelection?: boolean;
  enableMultiSort?: boolean;
  enableColumnResizing?: boolean;
  enableColumnPinning?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  enableFilters?: boolean;
  enableAdvancedFilters?: boolean;
  enableSorting?: boolean;
  enableKeyboardNavigation?: boolean;
  enableExport?: boolean;
  stickyHeader?: boolean;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  virtualization?: VirtualizationConfig;

  // Legacy virtualization fields kept for backward compatibility.
  enableVirtualization?: boolean;
  virtualRowHeight?: number;
  virtualOverscan?: number;
  virtualContainerHeight?: number | string;
  columnResizingPersistKey?: string;
}

export interface DataTableControlledState {
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  rowSelection?: RowSelectionState;
  pagination?: PaginationState;
}

export interface DataTableUrlStateConfig {
  pageIndexKey?: string;
  pageSizeKey?: string;
  sortKey?: string;
  filterKey?: string;
  searchKey?: string;
  visibilityKey?: string;
  defaultPageSize?: number;
  debounceMs?: number;
  shallow?: boolean;
  scroll?: boolean;
  history?: "push" | "replace";
  clearOnDefault?: boolean;
  searchColumnKey?: string;
}

export interface DataTableState {
  columnSizing?: ColumnSizingState;
  columnVisibility?: VisibilityState;
}

export const DEFAULT_PAGE_SIZES = [10, 20, 30, 50, 100] as const;

export const DEFAULT_COLUMN_SIZE = 150;
export const MIN_COLUMN_SIZE = 50;
export const MAX_COLUMN_SIZE = 500;

declare module "@tanstack/react-table" {
  // v9 adds TFeatures as the FIRST generic parameter on ColumnMeta. The
  // parameter list (including names) must mirror the upstream declaration
  // exactly or declaration merging fails with TS2428, so the unused
  // TFeatures parameter cannot take a leading underscore.
  /* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars -- TODO(AL-000): TS2428 requires the upstream type parameter list verbatim */
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    filterVariant?: DataTableFilterVariant;
    filterOptions?: DataTableFilterOption[];
    cellVariant?: DataTableCellVariant;
    label?: string;
    headerClassName?: string;
    cellClassName?: string;
    exportFormatter?: (value: TValue, row: TData) => string;
    enableResizing?: boolean;
    sticky?: "left" | "right";
  }
  /* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars */
}

export type {
  Column,
  ColumnDef,
  Row,
  Table,
  ColumnSizingState,
  VisibilityState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
};
