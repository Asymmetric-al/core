"use client";
"use no memo";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Plus,
  Trash2,
  Search,
  Copy,
  Clipboard,
  Undo,
  Redo,
} from "lucide-react";

import { cn } from "@asym/ui/lib/utils";
import { Button } from "../button";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { ScrollArea } from "../scroll-area";
import { DataGridCell } from "./data-grid-cell";
import type {
  DataGridColumn,
  DataGridCellPosition,
  DataGridConfig,
  DataGridCallbacks,
} from "./types";
import {
  DEFAULT_ROW_HEIGHT,
  DEFAULT_HEADER_HEIGHT,
  DEFAULT_COLUMN_WIDTH,
} from "./types";

interface DataGridProps<TData extends Record<string, unknown>> {
  data: TData[];
  columns: DataGridColumn<TData>[];
  config?: DataGridConfig;
  callbacks?: DataGridCallbacks<TData>;
  className?: string;
}

export function DataGrid<TData extends Record<string, unknown>>({
  data,
  columns,
  config = {},
  callbacks = {},
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

  React.useEffect(() => {
    setGridData(data);
  }, [data]);

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
    if (selectedCells.length === 0) return;

    const rowIndices = [
      ...new Set(selectedCells.map((c) => c.rowIndex)),
    ].sort();
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
  }, [selectedCells, gridData, onCopy]);

  const handlePaste = React.useCallback(async () => {
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

  const tableColumns: ColumnDef<TData>[] = React.useMemo(() => {
    const cols: ColumnDef<TData>[] = [];

    if (enableSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                selectedRows.size === gridData.length && gridData.length > 0
              }
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedRows(new Set(gridData.map((_, i) => i)));
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
  }, [
    columns,
    enableSelection,
    enableEditing,
    selectedRows,
    gridData,
    editingCell,
    selectedCells,
    handleCellChange,
  ]);

  // eslint-disable-next-line react-hooks/incompatible-library -- "use no memo" directive applied, warning acknowledged
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

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
    enabled: virtualizeRows,
  });

  const virtualRows = virtualizeRows
    ? rowVirtualizer.getVirtualItems()
    : rows.map((_, i) => ({ index: i, start: i * rowHeight, size: rowHeight }));
  const totalSize = virtualizeRows
    ? rowVirtualizer.getTotalSize()
    : rows.length * rowHeight;

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-card shadow-sm",
        className,
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
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
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="size-9 rounded-xl"
              >
                <Undo className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="size-9 rounded-xl"
              >
                <Redo className="size-4" />
              </Button>
            </>
          )}
          {enableCopy && selectedCells.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-9 rounded-xl"
            >
              <Copy className="size-4 mr-2" />
              Copy
            </Button>
          )}
          {enablePaste && copiedData.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePaste}
              className="h-9 rounded-xl"
            >
              <Clipboard className="size-4 mr-2" />
              Paste
            </Button>
          )}
          {enableRowDelete && selectedRows.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteRows}
              className="h-9 rounded-xl text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4 mr-2" />
              Delete ({selectedRows.size})
            </Button>
          )}
          {enableRowAdd && (
            <Button
              variant="default"
              size="sm"
              onClick={handleAddRow}
              className="h-9 rounded-xl"
            >
              <Plus className="size-4 mr-2" />
              Add Row
            </Button>
          )}
        </div>
      </div>

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
            {table.getHeaderGroups().map((headerGroup) =>
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
                      className="border-r last:border-r-0"
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize,
                      }}
                      onClick={() => {
                        const columnId = cell.column.id;
                        if (columnId === "select") return;
                        setSelectedCells([
                          { rowIndex: virtualRow.index, columnId },
                        ]);
                        onSelectionChange?.([
                          { rowIndex: virtualRow.index, columnId },
                        ]);
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-2 text-sm text-muted-foreground">
        <span>
          {rows.length} row{rows.length !== 1 ? "s" : ""}
          {selectedRows.size > 0 && ` • ${selectedRows.size} selected`}
        </span>
        <span>
          {copiedData.length > 0 && `${copiedData.length} row(s) copied`}
        </span>
      </div>
    </div>
  );
}
