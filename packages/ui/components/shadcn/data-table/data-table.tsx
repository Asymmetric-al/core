"use client";

import * as React from "react";

import { DataTableBody, DataTableBodyWithUrl } from "./data-table-body";

import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  TableOptions,
  VisibilityState,
} from "./tanstack";
import type {
  DataTableControlledState,
  DataTableFilterField,
  DataTableConfig,
  DataTableInteractiveRowAction,
  DataTableUrlStateConfig,
} from "./types";

interface DataTableProps<TData extends RowData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFields?: DataTableFilterField<TData>[];
  /**
   * TanStack column id for toolbar search.
   * @deprecated Use `searchColumnId`.
   */
  searchKey?: string;
  /** TanStack column id for toolbar search (preferred). */
  searchColumnId?: string;
  searchPlaceholder?: string;
  config?: DataTableConfig;
  isLoading?: boolean;
  pageCount?: number;
  rowCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  actionBarActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (rows: TData[]) => void;
    variant?: "default" | "destructive";
  }[];
  rowActions?: DataTableInteractiveRowAction<TData>[];
  onRowClick?: (row: Row<TData>) => void;
  state?: DataTableControlledState;
  getRowId?: TableOptions<TData>["getRowId"];
  urlState?: DataTableUrlStateConfig | boolean;
  className?: string;
  tableClassName?: string;
  emptyState?: React.ReactNode;
  toolbar?: React.ReactNode;
  /**
   * Unique TanStack Table devtools `key`. When set, the table registers with
   * TanStack Devtools (development builds only; the adapter no-ops in
   * production).
   */
  devtoolsKey?: string;
  initialState?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    rowSelection?: RowSelectionState;
  };
}

export function DataTable<TData extends RowData, TValue>({
  urlState,
  ...rest
}: DataTableProps<TData, TValue>) {
  const resolvedUrlState =
    urlState === true ? ({} as DataTableUrlStateConfig) : urlState || undefined;

  if (resolvedUrlState) {
    return <DataTableBodyWithUrl {...rest} urlState={resolvedUrlState} />;
  }

  return <DataTableBody {...rest} />;
}

export { DataTable as default };
