import type { Table, Row, Column } from "@tanstack/react-table";
import { format } from "date-fns";

export interface ExportOptions<TData> {
  filename?: string;
  includeHeaders?: boolean;
  delimiter?: string;
  columns?: string[];
  excludeColumns?: string[];
  formatters?: Record<string, (value: unknown, row: TData) => string>;
  onlySelected?: boolean;
  onlyFiltered?: boolean;
}

export interface ExportColumn {
  id: string;
  header: string;
}

function escapeCSVValue(value: string, delimiter: string): string {
  const stringValue = String(value ?? "");
  const needsQuotes =
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r");

  if (needsQuotes) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function getColumnHeader<TData>(column: Column<TData, unknown>): string {
  const columnDef = column.columnDef;
  if (typeof columnDef.header === "string") {
    return columnDef.header;
  }
  if (columnDef.meta?.label) {
    return columnDef.meta.label;
  }
  return column.id;
}

function getCellValue<TData>(row: Row<TData>, columnId: string): unknown {
  const cell = row.getAllCells().find((c) => c.column.id === columnId);
  if (!cell) return "";
  return cell.getValue();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return format(value, "yyyy-MM-dd HH:mm:ss");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function exportToCSV<TData>(
  table: Table<TData>,
  options: ExportOptions<TData> = {},
): string {
  const {
    includeHeaders = true,
    delimiter = ",",
    columns: includeColumns,
    excludeColumns = ["select", "actions"],
    formatters = {},
    onlySelected = false,
    onlyFiltered = true,
  } = options;

  const allColumns = table.getAllLeafColumns();

  const exportColumns = allColumns.filter((column) => {
    if (excludeColumns.includes(column.id)) return false;
    if (includeColumns && !includeColumns.includes(column.id)) return false;
    if (!column.getIsVisible()) return false;
    return true;
  });

  let rows: Row<TData>[];
  if (onlySelected) {
    rows = table.getSelectedRowModel().rows;
  } else if (onlyFiltered) {
    rows = table.getFilteredRowModel().rows;
  } else {
    rows = table.getCoreRowModel().rows;
  }

  const lines: string[] = [];

  if (includeHeaders) {
    const headerRow = exportColumns
      .map((column) => escapeCSVValue(getColumnHeader(column), delimiter))
      .join(delimiter);
    lines.push(headerRow);
  }

  for (const row of rows) {
    const values = exportColumns.map((column) => {
      const value = getCellValue(row, column.id);
      const formatter = formatters[column.id];

      if (formatter) {
        return escapeCSVValue(formatter(value, row.original), delimiter);
      }

      return escapeCSVValue(formatValue(value), delimiter);
    });
    lines.push(values.join(delimiter));
  }

  return lines.join("\n");
}

export function downloadCSV(
  csv: string,
  filename: string = "export.csv",
): void {
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTableToCSV<TData>(
  table: Table<TData>,
  options: ExportOptions<TData> = {},
): void {
  const {
    filename = `export-${format(new Date(), "yyyy-MM-dd-HHmmss")}`,
    ...exportOptions
  } = options;

  const csv = exportToCSV(table, exportOptions);
  downloadCSV(csv, filename);
}

export function getExportableColumns<TData>(
  table: Table<TData>,
): ExportColumn[] {
  return table
    .getAllLeafColumns()
    .filter((column) => !["select", "actions"].includes(column.id))
    .map((column) => ({
      id: column.id,
      header: getColumnHeader(column),
    }));
}

export function getExportRowCount<TData>(
  table: Table<TData>,
  options: { onlySelected?: boolean; onlyFiltered?: boolean } = {},
): number {
  const { onlySelected = false, onlyFiltered = true } = options;

  if (onlySelected) {
    return table.getSelectedRowModel().rows.length;
  }
  if (onlyFiltered) {
    return table.getFilteredRowModel().rows.length;
  }
  return table.getCoreRowModel().rows.length;
}
