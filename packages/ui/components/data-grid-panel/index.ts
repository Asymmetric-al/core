// Core's shared record grid built on the vendored ReUI data-grid
// (packages/ui/components/reui/data-grid). Import ReUI column helpers
// (DataGridColumnHeader, DataGridColumnFilter, DataGridTableRowSelect, ...)
// from their files; this module adds the Core composition around them.
export { DataGridPanel } from "./data-grid-panel";
export type {
  DataGridPanelError,
  DataGridPanelProps,
  DataGridPanelVirtualOptions,
} from "./data-grid-panel";
export { DataGridRowPrimary } from "./data-grid-row-primary";
export {
  DATA_GRID_ROW_PRIMARY_ATTRIBUTE,
  handleDataGridRowKeyDown,
} from "./data-grid-row-keyboard";
export { createDataGridSelectionColumn } from "./data-grid-selection-column";
export type { DataGridSelectionColumnOptions } from "./data-grid-selection-column";
export { DataGridSelectionBar } from "./data-grid-selection-bar";
export { DataGridSortSelect, dataGridSortValue } from "./data-grid-sort-select";
export type { DataGridSelectionBarProps } from "./data-grid-selection-bar";
export {
  DataGridResetFilters,
  DataGridSearch,
  DataGridToolbarGroup,
  DataGridToolbarSpacer,
  DataGridViewOptions,
  DataGridViewToggle,
} from "./data-grid-toolbar";
export type { DataGridSearchProps, DataGridView } from "./data-grid-toolbar";
export {
  dataGridFeatures,
  type DataGridFeatures,
} from "../reui/data-grid/data-grid";
export {
  filterFn_arrHas,
  filterFn_arrIncludesSome,
  filterFn_includesString,
  useTable,
} from "./data-grid-engine";
export type {
  ColumnFiltersState,
  DataGridCellContext,
  DataGridColumnDef,
  DataGridHeaderContext,
  DataGridRow,
  DataGridTableOf,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "./data-grid-engine";
