"use client";

import { Subscribe } from "./data-grid-engine";
import { DataGridTableRowSelectAll } from "../reui/data-grid/data-grid-table";
import { Checkbox } from "../shadcn/checkbox";
import { Skeleton } from "../shadcn/skeleton";

import type { ColumnDef, Row, RowData } from "./data-grid-engine";
import type { DataGridFeatures } from "../reui/data-grid/data-grid";

/** Width of the checkbox column: a 16px box plus the cell padding. */
const DATA_GRID_SELECTION_COLUMN_SIZE = 44;

export interface DataGridSelectionColumnOptions<TData extends RowData> {
  /**
   * Record name for the row checkbox, read as "Select {label}". Without it
   * every checkbox is called "Select row", so a screen reader user cannot
   * tell the rows apart.
   */
  getRowLabel?: (row: TData) => string;
  /** Column id; defaults to "select". */
  id?: string;
}

function DataGridSelectionCheckbox<TData extends object>({
  row,
  label,
}: {
  row: Row<DataGridFeatures, TData>;
  label: string;
}) {
  return (
    <Subscribe source={row.table.atoms.rowSelection}>
      {() => (
        <Checkbox
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected() && !row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          // Selection must not bubble into the row's onRowClick handler.
          onClick={(event) => event.stopPropagation()}
          aria-label={label}
        />
      )}
    </Subscribe>
  );
}

/**
 * Selection column for `DataGridPanel` grids: a select-all header and one
 * checkbox per row named after its record. The shared Checkbox root is an
 * inline-flex 16px box; the flex wrappers only centre it vertically in the
 * cell. Space and Ctrl/Cmd+A on a row primary drive the same
 * checkboxes (see `handleDataGridRowKeyDown`).
 */
export function createDataGridSelectionColumn<TData extends object>({
  getRowLabel,
  id = "select",
}: DataGridSelectionColumnOptions<TData> = {}): ColumnDef<
  DataGridFeatures,
  TData
> {
  return {
    id,
    header: () => (
      <div className="flex items-center">
        <DataGridTableRowSelectAll />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <DataGridSelectionCheckbox
          row={row}
          label={
            getRowLabel ? `Select ${getRowLabel(row.original)}` : "Select row"
          }
        />
      </div>
    ),
    size: DATA_GRID_SELECTION_COLUMN_SIZE,
    enableSorting: false,
    enableHiding: false,
    meta: { skeleton: <Skeleton className="size-4" /> },
  };
}
