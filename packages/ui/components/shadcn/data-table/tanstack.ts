/**
 * Single boundary module for TanStack Table.
 *
 * Every table-related import in this repo (shared UI, apps, tests) must flow
 * through this file instead of importing `@tanstack/react-table` directly, so
 * the v8 -> v9 engine migration happens in exactly one place. Exceptions:
 * `packages/database` hooks import the engine-stable state types directly
 * (database cannot depend on `@asym/ui`), and the `declare module` ColumnMeta
 * augmentation in `./types.ts` must keep targeting the real package name.
 */

export {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type {
  Cell,
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnSizingState,
  Header,
  HeaderGroup,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Table,
  TableOptions,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";
