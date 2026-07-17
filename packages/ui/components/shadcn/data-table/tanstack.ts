/**
 * Single boundary module for TanStack Table (v9 engine).
 *
 * Every table-related import in this repo (shared UI, apps, tests) must flow
 * through this file instead of importing `@tanstack/react-table` directly, so
 * engine upgrades happen in exactly one place. Exceptions:
 * `packages/database` hooks import the engine-stable state types directly
 * (database cannot depend on `@asym/ui`), the `declare module` ColumnMeta
 * augmentation in `./types.ts` must keep targeting the real package name, and
 * table-creating files import `@tanstack/react-table-devtools` directly (it is
 * a devtools adapter, not the engine, so it stays out of this boundary).
 *
 * v9 makes features and row models explicit per table instance. This module
 * pins ONE shared feature set (`dataTableFeatures`) covering everything the
 * shared data-table/data-grid layer uses, plus a row-model factory bundle
 * (`createDataTableRowModels`). The v8-named type aliases below are pre-bound
 * to that feature set so consumer files keep compiling with v8-era signatures
 * such as `ColumnDef<TData, TValue>` and `Table<TData>`.
 */

import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from "@tanstack/react-table";

import type {
  Cell as TanStackCell,
  CellData,
  Column as TanStackColumn,
  ColumnDef as TanStackColumnDef,
  ColumnVisibilityState,
  Header as TanStackHeader,
  HeaderGroup as TanStackHeaderGroup,
  ReactTable,
  Row as TanStackRow,
  RowData,
  TableOptions as TanStackTableOptions,
} from "@tanstack/react-table";

/**
 * The one explicit feature set used by every shared table instance.
 *
 * Each entry is required by current shared-layer usage:
 * - columnFacetingFeature: `column.getFacetedUniqueValues()` (faceted filter)
 * - columnFilteringFeature: toolbar search + filter chips + filtered row model
 * - columnPinningFeature: `enableColumnPinning` option, `column.getCanPin()/pin()`
 * - columnResizingFeature: `enableColumnResizing` / `columnResizeMode` options
 * - columnSizingFeature: `header.getSize()` / `column.getSize()`
 * - columnVisibilityFeature: view options menu, `row.getVisibleCells()`
 * - globalFilteringFeature: data-grid `globalFilter` search state
 * - rowPaginationFeature: pagination controls + paginated row model
 * - rowSelectionFeature: select column, action bars, selected row models
 * - rowSortingFeature: sortable column headers + sorted row model
 */
export const dataTableFeatures = tableFeatures({
  columnFacetingFeature,
  columnFilteringFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
});

export type SharedTableFeatures = typeof dataTableFeatures;

export interface CreateDataTableRowModelsOptions {
  /** Register the client-side filtered row model. Disable for manual/server filtering. */
  filtering?: boolean;
  /** Register the client-side sorted row model. Disable for manual/server sorting. */
  sorting?: boolean;
  /** Register the client-side paginated row model. Disable for manual/server pagination. */
  pagination?: boolean;
  /** Register the faceted row models used by faceted filter option counts. */
  faceting?: boolean;
}

/**
 * Shared row-model bundle for the v9 `rowModels` table option.
 *
 * v9 silently skips client-side processing when a row model is not
 * registered (no error is thrown), so the flags below must mirror the
 * `manual*` / `enable*` flags passed to the same table. Registering a model
 * alongside a `manual*` flag is harmless: the runtime checks the manual flag
 * first and falls back to the pre-stage row model.
 */
export function createDataTableRowModels<TData extends RowData>({
  filtering = true,
  sorting = true,
  pagination = true,
  faceting = true,
}: CreateDataTableRowModelsOptions = {}) {
  return {
    ...(filtering
      ? {
          filteredRowModel: createFilteredRowModel<SharedTableFeatures, TData>(
            filterFns,
          ),
        }
      : {}),
    ...(sorting
      ? {
          sortedRowModel: createSortedRowModel<SharedTableFeatures, TData>(
            sortFns,
          ),
        }
      : {}),
    ...(pagination
      ? {
          paginatedRowModel: createPaginatedRowModel<
            SharedTableFeatures,
            TData
          >(),
        }
      : {}),
    ...(faceting
      ? {
          facetedRowModel: createFacetedRowModel<SharedTableFeatures, TData>(),
          facetedUniqueValues: createFacetedUniqueValues<
            SharedTableFeatures,
            TData
          >(),
        }
      : {}),
  };
}

export { flexRender, useTable, tableFeatures } from "@tanstack/react-table";

/**
 * Structural type accepted by {@link useSelector}: any TanStack Store atom or
 * store (readonly or writable) — anything with `get()` plus a `subscribe()`
 * that returns an unsubscribe handle. `table.atoms.<slice>` and `table.store`
 * both satisfy it.
 *
 * Mirrors `useSelector`'s parameter type in `@tanstack/react-store`, which is
 * not exported from that package. `@tanstack/store`'s exported `Readable` is
 * not a substitute: it requires the observer-style `subscribe` overload,
 * which hand-built sources such as `EMPTY_TABLE_SELECTION_SOURCE` do not
 * implement.
 */
export interface TableSelectionSource<TValue> {
  get: () => TValue;
  subscribe: (listener: (value: TValue) => void) => {
    unsubscribe: () => void;
  };
}

/**
 * `useSelector` subscribes a component to an atom or store and returns the
 * (optionally selected) value — the focused-subscription primitive for table
 * chrome. The selector, when provided, should be pure; pass
 * `UseSelectorOptions.compare` to skip re-renders on compare-equal
 * selections.
 *
 * Re-exported from `@tanstack/react-store` (a direct dependency, matching
 * the store version `@tanstack/react-table` itself uses) so components keep
 * importing it from this boundary module rather than the package.
 *
 * @example
 * const pagination = useSelector(table.atoms.pagination);
 */
export { useSelector } from "@tanstack/react-store";
export type { UseSelectorOptions } from "@tanstack/react-store";

export {
  columnFacetingFeature,
  columnFilteringFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
};

/**
 * v8-name-compatible type aliases, pre-bound to `SharedTableFeatures`.
 *
 * v9 added `TFeatures` as the first generic parameter on most types and
 * constrains `TData` to `RowData` (`Record<string, any> | Array<any>`).
 * Binding the feature set here keeps consumer signatures on the v8 shape.
 */
export type Cell<
  TData extends RowData,
  TValue extends CellData = CellData,
> = TanStackCell<SharedTableFeatures, TData, TValue>;

export type Column<TData extends RowData, TValue = unknown> = TanStackColumn<
  SharedTableFeatures,
  TData,
  TValue
>;

export type ColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData,
> = TanStackColumnDef<SharedTableFeatures, TData, TValue>;

export type Header<
  TData extends RowData,
  TValue extends CellData = CellData,
> = TanStackHeader<SharedTableFeatures, TData, TValue>;

export type HeaderGroup<TData extends RowData> = TanStackHeaderGroup<
  SharedTableFeatures,
  TData
>;

export type Row<TData extends RowData> = TanStackRow<
  SharedTableFeatures,
  TData
>;

/**
 * The React table instance type returned by `useTable` with the shared
 * feature set. Includes `table.state` (the default full-state selection used
 * for render reads; v8's `table.getState()` is gone in v9).
 */
export type Table<TData extends RowData> = ReactTable<
  SharedTableFeatures,
  TData
>;

export type TableOptions<TData extends RowData> = TanStackTableOptions<
  SharedTableFeatures,
  TData
>;

/** v8 name for what v9 renamed to `ColumnVisibilityState`. */
export type VisibilityState = ColumnVisibilityState;

export type {
  CellData,
  ColumnFiltersState,
  ColumnSizingState,
  ColumnVisibilityState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  TableFeatures,
  Updater,
} from "@tanstack/react-table";
