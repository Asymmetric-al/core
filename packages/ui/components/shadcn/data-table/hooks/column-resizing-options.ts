import type { ColumnSizingState } from "../tanstack";

export interface ColumnResizingOptions {
  enabled?: boolean;
  defaultColumnSize?: number;
  minColumnSize?: number;
  maxColumnSize?: number;
  persistKey?: string;
  onColumnSizeChange?: (sizing: ColumnSizingState) => void;
}

export function getColumnResizingTableOptions(
  options: ColumnResizingOptions = {},
) {
  const {
    enabled = true,
    defaultColumnSize = 150,
    minColumnSize = 50,
    maxColumnSize = 500,
  } = options;

  return {
    enableColumnResizing: enabled,
    columnResizeMode: "onChange" as const,
    defaultColumn: {
      size: defaultColumnSize,
      minSize: minColumnSize,
      maxSize: maxColumnSize,
    },
  };
}
