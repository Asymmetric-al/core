"use client";

import * as React from "react";

import { DataTableResponsiveInner } from "./data-table-responsive-inner";
import {
  EMPTY_RESPONSIVE_INITIAL_STATE,
  type DataTableResponsiveProps,
} from "./data-table-responsive-types";
import {
  useDataTableStateCore,
  useDataTableStateWithUrl,
} from "./hooks/use-data-table-state";

import type { RowData } from "./tanstack";
import type { DataTableUrlStateConfig } from "./types";

type DataTableResponsiveBodyProps<TData extends RowData, TValue> = Omit<
  DataTableResponsiveProps<TData, TValue>,
  "urlState"
>;

function DataTableResponsiveBody<TData extends RowData, TValue>({
  ...props
}: DataTableResponsiveBodyProps<TData, TValue>) {
  const tableState = useDataTableStateCore({
    initialState: props.initialState,
    controlledState: props.state,
    onSortingChange: props.onSortingChange,
    onFiltersChange: props.onFiltersChange,
    onColumnVisibilityChange: props.onColumnVisibilityChange,
    onRowSelectionChange: props.onRowSelectionChange,
    onPaginationChange: props.onPaginationChange,
  });

  return <DataTableResponsiveInner {...props} tableState={tableState} />;
}

function DataTableResponsiveWithUrl<TData extends RowData, TValue>({
  urlState,
  ...props
}: DataTableResponsiveBodyProps<TData, TValue> & {
  urlState: DataTableUrlStateConfig;
}) {
  const tableState = useDataTableStateWithUrl({
    initialState: props.initialState,
    controlledState: props.state,
    onSortingChange: props.onSortingChange,
    onFiltersChange: props.onFiltersChange,
    onColumnVisibilityChange: props.onColumnVisibilityChange,
    onRowSelectionChange: props.onRowSelectionChange,
    onPaginationChange: props.onPaginationChange,
    searchKey: props.searchKey,
    searchColumnId: props.searchColumnId,
    urlState,
  });

  return <DataTableResponsiveInner {...props} tableState={tableState} />;
}

export function DataTableResponsive<TData extends RowData, TValue>({
  urlState,
  searchKey,
  searchColumnId,
  initialState = EMPTY_RESPONSIVE_INITIAL_STATE as NonNullable<
    DataTableResponsiveProps<TData, TValue>["initialState"]
  >,
  ...rest
}: DataTableResponsiveProps<TData, TValue>) {
  const urlStateConfig = React.useMemo<
    DataTableUrlStateConfig | undefined
  >(() => {
    if (!urlState || urlState === true) {
      return urlState === true
        ? { searchColumnKey: searchColumnId ?? searchKey }
        : undefined;
    }
    return {
      ...urlState,
      searchColumnKey: urlState.searchColumnKey ?? searchColumnId ?? searchKey,
      defaultPageSize:
        urlState.defaultPageSize ?? initialState.pagination?.pageSize ?? 10,
    };
  }, [initialState.pagination?.pageSize, searchColumnId, searchKey, urlState]);

  const shared = {
    searchKey,
    searchColumnId,
    initialState,
    ...rest,
  };

  if (urlStateConfig) {
    return <DataTableResponsiveWithUrl {...shared} urlState={urlStateConfig} />;
  }

  return <DataTableResponsiveBody {...shared} />;
}

export type { DataTableResponsiveProps };
