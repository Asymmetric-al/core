import type { ColumnDef, Row } from "@tanstack/react-table";

export type DataGridCellType =
  | "text"
  | "number"
  | "select"
  | "date"
  | "checkbox"
  | "file"
  | "readonly";

export interface DataGridColumnOption {
  label: string;
  value: string;
}

export interface DataGridColumn<TData> {
  id: string;
  header: string;
  accessorKey: keyof TData;
  cellType?: DataGridCellType;
  options?: DataGridColumnOption[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  editable?: boolean;
  required?: boolean;
  placeholder?: string;
  format?: (value: unknown) => string;
  validate?: (value: unknown) => boolean | string;
}

export interface DataGridCellPosition {
  rowIndex: number;
  columnId: string;
}

export interface DataGridSelection {
  start: DataGridCellPosition;
  end: DataGridCellPosition;
}

export interface DataGridState<TData> {
  data: TData[];
  selectedCells: DataGridCellPosition[];
  editingCell: DataGridCellPosition | null;
  copiedCells: { value: unknown; position: DataGridCellPosition }[];
  undoStack: TData[][];
  redoStack: TData[][];
}

export interface DataGridConfig {
  enableSelection?: boolean;
  enableEditing?: boolean;
  enableCopy?: boolean;
  enablePaste?: boolean;
  enableUndo?: boolean;
  enableSearch?: boolean;
  enableFilter?: boolean;
  enableSort?: boolean;
  enableRowAdd?: boolean;
  enableRowDelete?: boolean;
  enableColumnResize?: boolean;
  virtualizeRows?: boolean;
  virtualizeColumns?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  maxHeight?: number | string;
}

export interface DataGridCallbacks<TData> {
  onCellChange?: (rowIndex: number, columnId: string, value: unknown) => void;
  onRowAdd?: () => TData;
  onRowDelete?: (rowIndices: number[]) => void;
  onSelectionChange?: (selection: DataGridCellPosition[]) => void;
  onCopy?: (
    cells: { value: unknown; position: DataGridCellPosition }[],
  ) => void;
  onPaste?: (data: string[][]) => void;
}

export const DEFAULT_ROW_HEIGHT = 44;
export const DEFAULT_HEADER_HEIGHT = 48;
export const DEFAULT_COLUMN_WIDTH = 150;

export type { ColumnDef, Row };
