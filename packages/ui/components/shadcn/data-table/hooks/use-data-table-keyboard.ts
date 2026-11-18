"use client";

import { useCallback, useRef, useState, useMemo } from "react";

import type { RowData, Table, Row } from "../tanstack";

export interface KeyboardNavigationOptions {
  enabled?: boolean;
  onEnterRow?: (row: Row<RowData>) => void;
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
  /** Whether rows take keyboard focus and the arrow keys move between them. */
  enabled: boolean;
  /** The row in the tab order; `null` while navigation is off. */
  tabStopRowIndex: number | null;
  focusedRowIndex: number | null;
  focusedCellIndex: number | null;
  setFocusedRowIndex: (index: number | null) => void;
  setFocusedCellIndex: (index: number | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  getRowProps: (rowIndex: number) => {
    tabIndex: number;
    "data-focused": boolean;
    ref: (el: HTMLElement | null) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFocus: (e: React.FocusEvent) => void;
    onBlur: (e: React.FocusEvent) => void;
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

// The same controls `DataGridPanel` leaves alone inside a row.
const ROW_CONTROL_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  '[role="button"]',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="switch"]',
  "[contenteditable]",
].join(",");

// React also hands the row keys pressed on a control inside it, and in a menu
// or dialog that control opened in a portal. Those keys belong to the control.
function isRowKey(event: React.KeyboardEvent) {
  const row = event.currentTarget;
  const target = event.target as Element | null;
  if (target === row) return true;
  if (typeof target?.closest !== "function" || !row.contains(target)) {
    return false;
  }
  const control = target.closest(ROW_CONTROL_SELECTOR);
  return !control || !row.contains(control);
}

export function useDataTableKeyboard<TData extends RowData>(
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

  const [focusedRowIndexRaw, setFocusedRowIndexRaw] = useState<number | null>(
    null,
  );
  const [focusedCellIndex, setFocusedCellIndex] = useState<number | null>(null);
  const [rowHasFocus, setRowHasFocus] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLElement>>(new Map());

  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns();
  const rowCount = rows.length;
  const columnCount = columns.length;

  const validatedFocusedRowIndex = useMemo(() => {
    if (!enabled) return null;
    if (focusedRowIndexRaw === null) return null;
    if (focusedRowIndexRaw >= rowCount) {
      return rowCount > 0 ? rowCount - 1 : null;
    }
    return focusedRowIndexRaw;
  }, [enabled, focusedRowIndexRaw, rowCount]);

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
      if (!enabled || !isRowKey(e)) return;

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
            onEnterRow(currentRow as Row<RowData>);
          }
          break;
        }
        case "Escape": {
          // The row keeps the tab stop, and Escape stays with a dialog or
          // sheet around the table unless the table handles it itself.
          setFocusedCellIndex(null);
          if (onEscapeRow) {
            e.preventDefault();
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
          // Event-handler snapshot read; v9 removed `table.getState()`.
          const pageSize = table.atoms.pagination.get().pageSize;
          const nextIndex = Math.min(rowIndex + pageSize, rowCount - 1);
          setFocusedRowIndex(nextIndex);
          focusRow(nextIndex);
          break;
        }
        case "PageUp": {
          e.preventDefault();
          // Event-handler snapshot read; v9 removed `table.getState()`.
          const pageSizeUp = table.atoms.pagination.get().pageSize;
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

  // Roving tab stop: the last focused row, or the first row until one is.
  const tabStopRowIndex = enabled ? (validatedFocusedRowIndex ?? 0) : null;

  const getRowProps = useCallback(
    (rowIndex: number) => ({
      tabIndex: tabStopRowIndex === rowIndex ? 0 : -1,
      // The ring marks the row only while the row itself holds focus, so it
      // neither lingers after focus leaves nor doubles a focused control's.
      "data-focused": rowHasFocus && validatedFocusedRowIndex === rowIndex,
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, rowIndex),
      onFocus: (e: React.FocusEvent) => {
        setFocusedRowIndex(rowIndex);
        setRowHasFocus(e.target === e.currentTarget);
      },
      onBlur: (e: React.FocusEvent) => {
        if (e.target === e.currentTarget) setRowHasFocus(false);
      },
      ref: (el: HTMLElement | null) => {
        if (el) {
          rowRefs.current.set(rowIndex, el);
        } else {
          rowRefs.current.delete(rowIndex);
        }
      },
    }),
    [
      tabStopRowIndex,
      rowHasFocus,
      validatedFocusedRowIndex,
      handleKeyDown,
      setFocusedRowIndex,
    ],
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
    enabled,
    tabStopRowIndex,
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
