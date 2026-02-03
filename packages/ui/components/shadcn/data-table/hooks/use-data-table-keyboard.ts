"use client";

import { useCallback, useRef, useState, useMemo } from "react";
import type { Table, Row } from "@tanstack/react-table";

export interface KeyboardNavigationOptions {
  enabled?: boolean;
  onEnterRow?: (row: Row<unknown>) => void;
  onEscapeRow?: () => void;
  enableRowSelection?: boolean;
  enableCellNavigation?: boolean;
  wrapNavigation?: boolean;
}

export interface KeyboardNavigationState {
  focusedRowIndex: number | null;
  focusedCellIndex: number | null;
}

export interface UseDataTableKeyboardReturn {
  focusedRowIndex: number | null;
  focusedCellIndex: number | null;
  setFocusedRowIndex: (index: number | null) => void;
  setFocusedCellIndex: (index: number | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  getRowProps: (rowIndex: number) => {
    tabIndex: number;
    "data-focused": boolean;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  getCellProps: (
    rowIndex: number,
    cellIndex: number,
  ) => {
    tabIndex: number;
    "data-cell-focused": boolean;
  };
  resetFocus: () => void;
}

export function useDataTableKeyboard<TData>(
  table: Table<TData>,
  options: KeyboardNavigationOptions = {},
): UseDataTableKeyboardReturn {
  const {
    enabled = true,
    onEnterRow,
    onEscapeRow,
    enableRowSelection = true,
    enableCellNavigation = false,
    wrapNavigation = false,
  } = options;

  const [focusedRowIndex, setFocusedRowIndexRaw] = useState<number | null>(
    null,
  );
  const [focusedCellIndex, setFocusedCellIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLElement>>(new Map());

  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns();
  const rowCount = rows.length;
  const columnCount = columns.length;

  const validatedFocusedRowIndex = useMemo(() => {
    if (!enabled) return null;
    if (focusedRowIndex === null) return null;
    if (focusedRowIndex >= rowCount) {
      return rowCount > 0 ? rowCount - 1 : null;
    }
    return focusedRowIndex;
  }, [enabled, focusedRowIndex, rowCount]);

  const setFocusedRowIndex = useCallback((index: number | null) => {
    setFocusedRowIndexRaw(index);
  }, []);

  const focusRow = useCallback((index: number) => {
    const rowElement = rowRefs.current.get(index);
    if (rowElement) {
      rowElement.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIndex: number) => {
      if (!enabled) return;

      const currentRow = rows[rowIndex];
      if (!currentRow) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          let nextIndex = rowIndex + 1;
          if (nextIndex >= rowCount) {
            nextIndex = wrapNavigation ? 0 : rowCount - 1;
          }
          setFocusedRowIndex(nextIndex);
          focusRow(nextIndex);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          let prevIndex = rowIndex - 1;
          if (prevIndex < 0) {
            prevIndex = wrapNavigation ? rowCount - 1 : 0;
          }
          setFocusedRowIndex(prevIndex);
          focusRow(prevIndex);
          break;
        }
        case "ArrowRight": {
          if (enableCellNavigation) {
            e.preventDefault();
            let nextCell = (focusedCellIndex ?? -1) + 1;
            if (nextCell >= columnCount) {
              nextCell = wrapNavigation ? 0 : columnCount - 1;
            }
            setFocusedCellIndex(nextCell);
          }
          break;
        }
        case "ArrowLeft": {
          if (enableCellNavigation) {
            e.preventDefault();
            let prevCell = (focusedCellIndex ?? 0) - 1;
            if (prevCell < 0) {
              prevCell = wrapNavigation ? columnCount - 1 : 0;
            }
            setFocusedCellIndex(prevCell);
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (onEnterRow) {
            onEnterRow(currentRow as Row<unknown>);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          setFocusedRowIndex(null);
          setFocusedCellIndex(null);
          if (onEscapeRow) {
            onEscapeRow();
          }
          break;
        }
        case " ": {
          if (enableRowSelection) {
            e.preventDefault();
            currentRow.toggleSelected();
          }
          break;
        }
        case "Home": {
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            setFocusedRowIndex(0);
            focusRow(0);
          } else if (enableCellNavigation) {
            setFocusedCellIndex(0);
          }
          break;
        }
        case "End": {
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            setFocusedRowIndex(rowCount - 1);
            focusRow(rowCount - 1);
          } else if (enableCellNavigation) {
            setFocusedCellIndex(columnCount - 1);
          }
          break;
        }
        case "PageDown": {
          e.preventDefault();
          const pageSize = table.getState().pagination.pageSize;
          const nextIndex = Math.min(rowIndex + pageSize, rowCount - 1);
          setFocusedRowIndex(nextIndex);
          focusRow(nextIndex);
          break;
        }
        case "PageUp": {
          e.preventDefault();
          const pageSizeUp = table.getState().pagination.pageSize;
          const prevIndex = Math.max(rowIndex - pageSizeUp, 0);
          setFocusedRowIndex(prevIndex);
          focusRow(prevIndex);
          break;
        }
        case "a": {
          if ((e.ctrlKey || e.metaKey) && enableRowSelection) {
            e.preventDefault();
            table.toggleAllRowsSelected();
          }
          break;
        }
      }
    },
    [
      enabled,
      rows,
      rowCount,
      columnCount,
      wrapNavigation,
      enableCellNavigation,
      enableRowSelection,
      focusedCellIndex,
      onEnterRow,
      onEscapeRow,
      focusRow,
      setFocusedRowIndex,
      table,
    ],
  );

  const getRowProps = useCallback(
    (rowIndex: number) => ({
      tabIndex: validatedFocusedRowIndex === rowIndex ? 0 : -1,
      "data-focused": validatedFocusedRowIndex === rowIndex,
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, rowIndex),
      onFocus: () => setFocusedRowIndex(rowIndex),
      onBlur: () => {},
      ref: (el: HTMLElement | null) => {
        if (el) {
          rowRefs.current.set(rowIndex, el);
        } else {
          rowRefs.current.delete(rowIndex);
        }
      },
    }),
    [validatedFocusedRowIndex, handleKeyDown, setFocusedRowIndex],
  );

  const getCellProps = useCallback(
    (rowIndex: number, cellIndex: number) => ({
      tabIndex:
        validatedFocusedRowIndex === rowIndex && focusedCellIndex === cellIndex
          ? 0
          : -1,
      "data-cell-focused":
        validatedFocusedRowIndex === rowIndex && focusedCellIndex === cellIndex,
    }),
    [validatedFocusedRowIndex, focusedCellIndex],
  );

  const resetFocus = useCallback(() => {
    setFocusedRowIndex(null);
    setFocusedCellIndex(null);
  }, [setFocusedRowIndex]);

  return {
    focusedRowIndex: validatedFocusedRowIndex,
    focusedCellIndex,
    setFocusedRowIndex,
    setFocusedCellIndex,
    containerRef,
    getRowProps,
    getCellProps,
    resetFocus,
  };
}

export function getKeyboardNavigationStyles() {
  return {
    focusedRow:
      "outline-none ring-2 ring-ring ring-offset-1 ring-offset-background",
    focusedCell: "outline-none ring-2 ring-ring ring-inset",
  };
}
