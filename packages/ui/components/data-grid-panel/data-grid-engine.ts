/**
 * Engine boundary for grids built on the vendored ReUI data-grid.
 *
 * Apps and tests import TanStack Table through this module (or, for the
 * shared data-table layer, `components/shadcn/data-table/tanstack.ts`), never
 * from `@tanstack/react-table` directly. The aliases below are pre-bound to
 * the ReUI `dataGridFeatures` bundle so column definitions stay terse.
 */
import type { DataGridFeatures } from "../reui/data-grid/data-grid";
import type {
  CellContext,
  CellData,
  ColumnDef,
  ColumnFiltersState,
  ColumnVisibilityState,
  HeaderContext,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  Table,
} from "@tanstack/react-table";

export {
  filterFn_arrHas,
  filterFn_arrIncludesSome,
  filterFn_includesString,
  Subscribe,
  useTable,
} from "@tanstack/react-table";

export type DataGridColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData,
> = ColumnDef<DataGridFeatures, TData, TValue>;

export type DataGridCellContext<
  TData extends RowData,
  TValue extends CellData = CellData,
> = CellContext<DataGridFeatures, TData, TValue>;

export type DataGridHeaderContext<
  TData extends RowData,
  TValue extends CellData = CellData,
> = HeaderContext<DataGridFeatures, TData, TValue>;

export type DataGridRow<TData extends RowData> = Row<DataGridFeatures, TData>;

export type DataGridTableOf<TData extends RowData> = Table<
  DataGridFeatures,
  TData
>;

/** v9 name: `ColumnVisibilityState`; aliased to the familiar v8 name. */
export type VisibilityState = ColumnVisibilityState;

export type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  Table,
};
