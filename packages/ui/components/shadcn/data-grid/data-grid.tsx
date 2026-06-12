"use client";

import {
  Plus,
  Trash2,
  Search,
  Copy,
  Clipboard,
  Undo,
  Redo,
} from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { DataGridCell } from "./data-grid-cell";
import { useDataTableVirtualization } from "../data-table/hooks/use-data-table-virtualization";
import { Input } from "../input";
import {
  DEFAULT_ROW_HEIGHT,
  DEFAULT_HEADER_HEIGHT,
  DEFAULT_COLUMN_WIDTH,
} from "./types";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type HeaderGroup,
  type Row,
  type SortingState,
} from "../data-table/tanstack";

import type {
  DataGridColumn,
  DataGridCellPosition,
  DataGridConfig,
  DataGridCallbacks,
} from "./types";

interface DataGridProps<TData extends Record<string, unknown>> {
  data: TData[];
  columns: DataGridColumn<TData>[];
  config?: DataGridConfig;
  callbacks?: DataGridCallbacks<TData>;
  className?: string;
}

const EMPTY_DATA_GRID_CONFIG: DataGridConfig = {};
const EMPTY_DATA_GRID_CALLBACKS: DataGridCallbacks<Record<string, unknown>> =
  {};
type VirtualGridRow = { index: number; start: number; size: number };

function DataGridToolbar({
  enableSearch,
  globalFilter,
  onGlobalFilterChange,
  enableUndo,
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  enableCopy,
  onCopy,
  canCopy,
  enablePaste,
  onPaste,
  canPaste,
  enableRowDelete,
  onDeleteRows,
  selectedRowCount,
  enableRowAdd,
  onAddRow,
}: {
  enableSearch: boolean;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  enableUndo: boolean;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  enableCopy: boolean;
  onCopy: () => void;
  canCopy: boolean;
  enablePaste: boolean;
  onPaste: () => void;
  canPaste: boolean;
  enableRowDelete: boolean;
  onDeleteRows: () => void;
  selectedRowCount: number;
  enableRowAdd: boolean;
  onAddRow: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
      <div className="flex items-center gap-2">
        {enableSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              className="h-9 w-64 pl-10 rounded-xl"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {enableUndo && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="size-9 rounded-xl"
            >
              <Undo className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="size-9 rounded-xl"
            >
              <Redo className="size-4" />
            </Button>
          </>
        )}
        {enableCopy && canCopy && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            className="h-9 rounded-xl"
          >
            <Copy className="size-4 mr-2" />
            Copy
          </Button>
        )}
        {enablePaste && canPaste && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPaste}
            className="h-9 rounded-xl"
          >
            <Clipboard className="size-4 mr-2" />
            Paste
          </Button>
        )}
        {enableRowDelete && selectedRowCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteRows}
            className="h-9 rounded-xl text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4 mr-2" />
            Delete ({selectedRowCount})
          </Button>
        )}
        {enableRowAdd && (
          <Button
            variant="default"
            size="sm"
            onClick={onAddRow}
            className="h-9 rounded-xl"
          >
            <Plus className="size-4 mr-2" />
            Add Row
          </Button>
        )}
      </div>
    </div>
  );
}

function DataGridViewport<TData extends Record<string, unknown>>({
  parentRef,
  maxHeight,
  totalSize,
  headerHeight,
  rowHeight,
  rows,
  virtualRows,
  selectedRows,
  headerGroups,
  onSelectCell,
}: {
  parentRef: React.RefObject<HTMLDivElement | null>;
  maxHeight: number | string;
  totalSize: number;
  headerHeight: number;
  rowHeight: number;
  rows: Row<TData>[];
  virtualRows: VirtualGridRow[];
  selectedRows: Set<number>;
  headerGroups: HeaderGroup<TData>[];
  onSelectCell: (rowIndex: number, columnId: string) => void;
}) {
  return (
    <div ref={parentRef} className="overflow-auto" style={{ maxHeight }}>
      <div
        style={{
          height: `${totalSize + headerHeight}px`,
          width: "100%",
          position: "relative",
        }}
      >
        <div
          className="sticky top-0 z-10 flex border-b bg-muted/50"
          style={{ height: headerHeight }}
        >
          {headerGroups.map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="flex items-center px-3 text-xs font-semibold text-muted-foreground border-r last:border-r-0"
                style={{
                  width: header.getSize(),
                  minWidth: header.column.columnDef.minSize,
                  maxWidth: header.column.columnDef.maxSize,
                }}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </div>
            )),
          )}
        </div>

        <div style={{ position: "relative", height: `${totalSize}px` }}>
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;

            return (
              <div
                key={row.id}
                role="row"
                className={cn(
                  "absolute top-0 left-0 flex border-b w-full",
                  "hover:bg-muted/20 transition-colors",
                  selectedRows.has(virtualRow.index) && "bg-primary/5",
                )}
                style={{
                  height: rowHeight,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    role="gridcell"
                    tabIndex={0}
                    className="border-r last:border-r-0"
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.columnDef.minSize,
                      maxWidth: cell.column.columnDef.maxSize,
                    }}
                    onClick={() =>
                      onSelectCell(virtualRow.index, cell.column.id)
                    }
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      onSelectCell(virtualRow.index, cell.column.id);
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DataGridSummary({
  rowCount,
  selectedRowCount,
  copiedRowCount,
}: {
  rowCount: number;
  selectedRowCount: number;
  copiedRowCount: number;
}) {
  return (
    <div className="flex items-center justify-between border-t px-4 py-2 text-sm text-muted-foreground">
      <span>
        {rowCount} row{rowCount !== 1 ? "s" : ""}
        {selectedRowCount > 0 && ` • ${selectedRowCount} selected`}
      </span>
      <span>{copiedRowCount > 0 && `${copiedRowCount} row(s) copied`}</span>
    </div>
  );
}

function copySelectedCellsToClipboard<TData extends Record<string, unknown>>({
  selectedCells,
  gridData,
  onCopy,
  setCopiedData,
}: {
  selectedCells: DataGridCellPosition[];
  gridData: TData[];
  onCopy?: DataGridCallbacks<TData>["onCopy"];
  setCopiedData: React.Dispatch<React.SetStateAction<string[][]>>;
}) {
  if (selectedCells.length === 0) return;

  const rowIndices = [...new Set(selectedCells.map((c) => c.rowIndex))].sort();
  const columnIds = [...new Set(selectedCells.map((c) => c.columnId))];

  const copiedRows = rowIndices.map((rowIndex) =>
    columnIds.map((columnId) => {
      const cellValue = gridData[rowIndex]?.[columnId];
      return String(cellValue ?? "");
    }),
  );

  setCopiedData(copiedRows);
  onCopy?.(
    selectedCells.map((pos) => ({
      value: gridData[pos.rowIndex]?.[pos.columnId],
      position: pos,
    })),
  );

  const textData = copiedRows.map((row) => row.join("\t")).join("\n");
  navigator.clipboard.writeText(textData).catch(console.error);
}

async function pasteClipboardIntoGrid<TData extends Record<string, unknown>>({
  selectedCells,
  columns,
  saveToUndo,
  onPaste,
  setGridData,
}: {
  selectedCells: DataGridCellPosition[];
  columns: DataGridColumn<TData>[];
  saveToUndo: () => void;
  onPaste?: DataGridCallbacks<TData>["onPaste"];
  setGridData: React.Dispatch<React.SetStateAction<TData[]>>;
}) {
  if (selectedCells.length === 0) return;

  try {
    const text = await navigator.clipboard.readText();
    const rows = text.split("\n").map((row) => row.split("\t"));
    onPaste?.(rows);

    const startRow = Math.min(...selectedCells.map((c) => c.rowIndex));
    const startColIndex = columns.findIndex(
      (c) => c.id === selectedCells[0]?.columnId,
    );

    saveToUndo();
    setGridData((prev) => {
      const newData = [...prev];
      rows.forEach((row, rowOffset) => {
        const targetRowIndex = startRow + rowOffset;
        const existingRow = newData[targetRowIndex];
        if (!existingRow) return;

        row.forEach((value, colOffset) => {
          const targetCol = columns[startColIndex + colOffset];
          if (!targetCol || !targetCol.editable) return;

          const columnId = targetCol.id;
          const newValue =
            targetCol.cellType === "number"
              ? parseFloat(value) || 0
              : targetCol.cellType === "checkbox"
                ? value.toLowerCase() === "true"
                : value;

          newData[targetRowIndex] = {
            ...existingRow,
            [columnId]: newValue,
          } as TData;
        });
      });
      return newData;
    });
  } catch (err) {
    console.error("Failed to paste:", err);
  }
}

function buildDataGridColumns<TData extends Record<string, unknown>>({
  columns,
  enableSelection,
  enableEditing,
  selectedRows,
  rowCount,
  editingCell,
  selectedCells,
  setSelectedRows,
  setEditingCell,
  setSelectedCells,
  handleCellChange,
}: {
  columns: DataGridColumn<TData>[];
  enableSelection: boolean;
  enableEditing: boolean;
  selectedRows: Set<number>;
  rowCount: number;
  editingCell: DataGridCellPosition | null;
  selectedCells: DataGridCellPosition[];
  setSelectedRows: React.Dispatch<React.SetStateAction<Set<number>>>;
  setEditingCell: React.Dispatch<
    React.SetStateAction<DataGridCellPosition | null>
  >;
  setSelectedCells: React.Dispatch<
    React.SetStateAction<DataGridCellPosition[]>
  >;
  handleCellChange: (
    rowIndex: number,
    columnId: string,
    value: unknown,
  ) => void;
}): ColumnDef<TData>[] {
  const cols: ColumnDef<TData>[] = [];

  if (enableSelection) {
    cols.push({
      id: "select",
      header: () => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selectedRows.size === rowCount && rowCount > 0}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedRows(
                  new Set(Array.from({ length: rowCount }, (_, i) => i)),
                );
              } else {
                setSelectedRows(new Set());
              }
            }}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selectedRows.has(row.index)}
            onCheckedChange={(checked) => {
              setSelectedRows((prev) => {
                const next = new Set(prev);
                if (checked) {
                  next.add(row.index);
                } else {
                  next.delete(row.index);
                }
                return next;
              });
            }}
          />
        </div>
      ),
      size: 48,
    });
  }

  columns.forEach((col) => {
    cols.push({
      id: col.id,
      accessorKey: col.accessorKey as string,
      header: col.header,
      size: col.width ?? DEFAULT_COLUMN_WIDTH,
      minSize: col.minWidth,
      maxSize: col.maxWidth,
      cell: ({ row }) => {
        const value = row.original[col.accessorKey];
        const rowIndex = row.index;
        const isEditing =
          editingCell?.rowIndex === rowIndex &&
          editingCell?.columnId === col.id;
        const isSelected = selectedCells.some(
          (c) => c.rowIndex === rowIndex && c.columnId === col.id,
        );

        return (
          <DataGridCell
            value={value}
            cellType={col.cellType ?? "text"}
            isEditing={isEditing}
            isSelected={isSelected}
            options={col.options}
            placeholder={col.placeholder}
            onChange={(newValue) =>
              handleCellChange(rowIndex, col.id, newValue)
            }
            onStartEdit={() => {
              if (col.editable !== false && enableEditing) {
                setEditingCell({ rowIndex, columnId: col.id });
                setSelectedCells([{ rowIndex, columnId: col.id }]);
              }
            }}
            onEndEdit={() => setEditingCell(null)}
          />
        );
      },
    });
  });

  return cols;
}

export function DataGrid<TData extends Record<string, unknown>>({
  data,
  columns,
  config = EMPTY_DATA_GRID_CONFIG,
  callbacks = EMPTY_DATA_GRID_CALLBACKS as DataGridCallbacks<TData>,
  className,
}: DataGridProps<TData>) {
  const {
    enableSelection = true,
    enableEditing = true,
    enableCopy = true,
    enablePaste = true,
    enableUndo = true,
    enableSearch = true,
    enableFilter = true,
    enableSort = true,
    enableRowAdd = true,
    enableRowDelete = true,
    virtualizeRows = true,
    rowHeight = DEFAULT_ROW_HEIGHT,
    virtualOverscan = 5,
    headerHeight = DEFAULT_HEADER_HEIGHT,
    maxHeight = 600,
  } = config;

  const {
    onCellChange,
    onRowAdd,
    onRowDelete,
    onSelectionChange,
    onCopy,
    onPaste,
  } = callbacks;

  const parentRef = React.useRef<HTMLDivElement>(null);
  const [gridData, setGridData] = React.useState<TData[]>(data);
  const [lastExternalData, setLastExternalData] = React.useState(data);
  if (data !== lastExternalData) {
    setLastExternalData(data);
    setGridData(data);
  }
  const [selectedCells, setSelectedCells] = React.useState<
    DataGridCellPosition[]
  >([]);
  const [editingCell, setEditingCell] =
    React.useState<DataGridCellPosition | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(
    new Set(),
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [copiedData, setCopiedData] = React.useState<string[][]>([]);
  const [undoStack, setUndoStack] = React.useState<TData[][]>([]);
  const [redoStack, setRedoStack] = React.useState<TData[][]>([]);

  const saveToUndo = React.useCallback(() => {
    if (enableUndo) {
      setUndoStack((prev) => [...prev.slice(-19), [...gridData]]);
      setRedoStack([]);
    }
  }, [gridData, enableUndo]);

  const handleUndo = React.useCallback(() => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      if (previousState) {
        setRedoStack((prev) => [...prev, [...gridData]]);
        setUndoStack((prev) => prev.slice(0, -1));
        setGridData(previousState);
      }
    }
  }, [undoStack, gridData]);

  const handleRedo = React.useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      if (nextState) {
        setUndoStack((prev) => [...prev, [...gridData]]);
        setRedoStack((prev) => prev.slice(0, -1));
        setGridData(nextState);
      }
    }
  }, [redoStack, gridData]);

  const handleCellChange = React.useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      saveToUndo();
      setGridData((prev) => {
        const newData = [...prev];
        const existingRow = newData[rowIndex];
        if (existingRow) {
          newData[rowIndex] = { ...existingRow, [columnId]: value } as TData;
        }
        return newData;
      });
      onCellChange?.(rowIndex, columnId, value);
    },
    [saveToUndo, onCellChange],
  );

  const handleAddRow = React.useCallback(() => {
    saveToUndo();
    const newRow = onRowAdd?.();
    if (newRow) {
      setGridData((prev) => [...prev, newRow]);
    }
  }, [saveToUndo, onRowAdd]);

  const handleDeleteRows = React.useCallback(() => {
    if (selectedRows.size === 0) return;
    saveToUndo();
    const indices = Array.from(selectedRows).sort((a, b) => b - a);
    setGridData((prev) => prev.filter((_, i) => !selectedRows.has(i)));
    onRowDelete?.(indices);
    setSelectedRows(new Set());
  }, [selectedRows, saveToUndo, onRowDelete]);

  const handleCopy = React.useCallback(() => {
    copySelectedCellsToClipboard({
      selectedCells,
      gridData,
      onCopy,
      setCopiedData,
    });
  }, [selectedCells, gridData, onCopy]);

  const handlePaste = React.useCallback(async () => {
    await pasteClipboardIntoGrid({
      selectedCells,
      columns,
      saveToUndo,
      onPaste,
      setGridData,
    });
  }, [selectedCells, columns, saveToUndo, onPaste]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "c" && enableCopy) {
          e.preventDefault();
          handleCopy();
        }
        if (e.key === "v" && enablePaste) {
          e.preventDefault();
          handlePaste();
        }
        if (e.key === "z" && enableUndo) {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        }
        if (e.key === "y" && enableUndo) {
          e.preventDefault();
          handleRedo();
        }
      }
      if (e.key === "Delete" && enableRowDelete && selectedRows.size > 0) {
        e.preventDefault();
        handleDeleteRows();
      }
    },
    [
      enableCopy,
      enablePaste,
      enableUndo,
      enableRowDelete,
      handleCopy,
      handlePaste,
      handleUndo,
      handleRedo,
      handleDeleteRows,
      selectedRows,
    ],
  );

  const tableColumns: ColumnDef<TData>[] = React.useMemo(
    () =>
      buildDataGridColumns({
        columns,
        enableSelection,
        enableEditing,
        selectedRows,
        rowCount: gridData.length,
        editingCell,
        selectedCells,
        setSelectedRows,
        setEditingCell,
        setSelectedCells,
        handleCellChange,
      }),
    [
      columns,
      enableSelection,
      enableEditing,
      selectedRows,
      gridData.length,
      editingCell,
      selectedCells,
      handleCellChange,
    ],
  );

  const table = useReactTable({
    data: gridData,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableFilter ? getFilteredRowModel() : undefined,
    getSortedRowModel: enableSort ? getSortedRowModel() : undefined,
  });

  const { rows } = table.getRowModel();
  const {
    config: resolvedVirtualization,
    virtualItems,
    totalSize,
    isEnabled,
  } = useDataTableVirtualization({
    count: rows.length,
    scrollElementRef: parentRef,
    virtualization: config.virtualization,
    legacy: {
      enabled: virtualizeRows,
      estimateSize: rowHeight,
      overscan: virtualOverscan,
      containerHeight: maxHeight,
    },
    defaults: {
      enabled: true,
      estimateSize: DEFAULT_ROW_HEIGHT,
      overscan: 5,
      containerHeight: 600,
    },
  });

  const virtualRows: VirtualGridRow[] = isEnabled
    ? virtualItems
    : rows.map((_, index) => ({
        index,
        start: index * resolvedVirtualization.estimateSize,
        size: resolvedVirtualization.estimateSize,
      }));
  const totalVirtualSize = isEnabled
    ? totalSize
    : rows.length * resolvedVirtualization.estimateSize;
  const selectCell = React.useCallback(
    (rowIndex: number, columnId: string) => {
      if (columnId === "select") return;
      setSelectedCells([{ rowIndex, columnId }]);
      onSelectionChange?.([{ rowIndex, columnId }]);
    },
    [onSelectionChange],
  );

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-card shadow-sm",
        className,
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="grid"
      aria-label="Data grid"
    >
      <DataGridToolbar
        enableSearch={enableSearch}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        enableUndo={enableUndo}
        onUndo={handleUndo}
        canUndo={undoStack.length > 0}
        onRedo={handleRedo}
        canRedo={redoStack.length > 0}
        enableCopy={enableCopy}
        onCopy={handleCopy}
        canCopy={selectedCells.length > 0}
        enablePaste={enablePaste}
        onPaste={handlePaste}
        canPaste={copiedData.length > 0}
        enableRowDelete={enableRowDelete}
        onDeleteRows={handleDeleteRows}
        selectedRowCount={selectedRows.size}
        enableRowAdd={enableRowAdd}
        onAddRow={handleAddRow}
      />

      <DataGridViewport
        parentRef={parentRef}
        maxHeight={resolvedVirtualization.containerHeight}
        totalSize={totalVirtualSize}
        headerHeight={headerHeight}
        rowHeight={resolvedVirtualization.estimateSize}
        rows={rows}
        virtualRows={virtualRows}
        selectedRows={selectedRows}
        headerGroups={table.getHeaderGroups()}
        onSelectCell={selectCell}
      />

      <DataGridSummary
        rowCount={rows.length}
        selectedRowCount={selectedRows.size}
        copiedRowCount={copiedData.length}
      />
    </div>
  );
}
