import type { Cell, RowData } from "../tanstack";

export function cellEditorAccessibleName<TData extends RowData, TValue>(
  cell: Cell<TData, TValue>,
) {
  const column = cell?.column;
  const label = column?.columnDef.meta?.label;
  const header = column?.columnDef.header;
  const name = label ?? (typeof header === "string" ? header : column?.id);
  return name ? `Edit ${name}` : "Edit cell value";
}
