import type { AdvancedFilterState, FilterFieldDefinition } from "./filters";
import type {
  DataTableConfig,
  DataTableFilterField,
  DataTableInteractiveRowAction,
  DataTableUrlStateConfig,
  DataTableControlledState,
} from "./types";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type * as React from "react";

export type ViewMode = "table" | "card";

export interface DataTableResponsiveProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFields?: DataTableFilterField<TData>[];
  advancedFilterFields?: FilterFieldDefinition[];
  /**
   * TanStack column id for toolbar search.
   * @deprecated Use `searchColumnId`.
   */
  searchKey?: string;
  /** TanStack column id for toolbar search (preferred). */
  searchColumnId?: string;
  searchPlaceholder?: string;
  config?: DataTableConfig & {
    enableViewToggle?: boolean;
    defaultViewMode?: ViewMode;
    mobileBreakpoint?: number;
  };
  isLoading?: boolean;
  pageCount?: number;
  rowCount?: number;
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  state?: DataTableControlledState;
  urlState?: DataTableUrlStateConfig | boolean;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onAdvancedFilterChange?: (filter: AdvancedFilterState) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onRowClick?: (row: Row<TData>) => void;
  /**
   * Cursor-style loading: fires `onLoadMore` when the user scrolls near the end
   * of the table body (virtualized or not).
   */
  infiniteScroll?: {
    hasMore: boolean;
    isFetchingMore: boolean;
    onLoadMore: () => void;
    threshold?: number;
    loadingContent?: React.ReactNode;
  };
  enableVirtualization?: boolean;
  floatingBarActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (rows: TData[]) => void;
    variant?: "default" | "destructive";
  }[];
  rowActions?: DataTableInteractiveRowAction<TData>[];
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

export const EMPTY_RESPONSIVE_FILTER_FIELDS: DataTableFilterField<unknown>[] =
  [];
export const EMPTY_ADVANCED_FILTER_FIELDS: FilterFieldDefinition[] = [];
export const EMPTY_RESPONSIVE_DATA_TABLE_CONFIG: DataTableConfig = {};
export const EMPTY_RESPONSIVE_INITIAL_STATE: NonNullable<
  DataTableResponsiveProps<unknown, unknown>["initialState"]
> = {};
