"use client";

import { documentStorageKey } from "@asym/database/document-storage";
import { useCallback, useState, useEffect } from "react";

import type { ColumnSizingState, RowData, Header } from "../tanstack";
import type { ColumnResizingOptions } from "./column-resizing-options";

export interface UseColumnResizingReturn {
  columnSizing: ColumnSizingState;
  setColumnSizing: (sizing: ColumnSizingState) => void;
  resetColumnSizing: () => void;
  getResizeHandler: (
    header: Header<RowData, unknown>,
  ) => (e: React.MouseEvent | React.TouchEvent) => void;
  isResizing: boolean;
}

const STORAGE_PREFIX = "data-table-column-sizing-";

/**
 * The browser storage key for a table's column sizes: it carries the
 * document's person and tenant (`documentStorageKey`; plan 5.2, WP2b,
 * AL-2675), because storage outlives the document load that switching
 * organization performs. `null` for a document with no scope, which keeps
 * its sizes in memory and stores nothing.
 */
function storageKeyFor(persistKey: string): string | null {
  if (typeof window === "undefined") return null;
  return documentStorageKey(STORAGE_PREFIX + persistKey);
}

function loadFromStorage(persistKey: string): ColumnSizingState | null {
  const key = storageKeyFor(persistKey);
  if (!key) return null;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveToStorage(persistKey: string, sizing: ColumnSizingState) {
  const key = storageKeyFor(persistKey);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(sizing));
  } catch {}
}

function removeFromStorage(persistKey: string) {
  const key = storageKeyFor(persistKey);
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function useColumnResizing(
  options: ColumnResizingOptions = {},
): UseColumnResizingReturn {
  const {
    enabled = true,
    minColumnSize = 50,
    maxColumnSize = 500,
    persistKey,
    onColumnSizeChange,
  } = options;

  const [columnSizingState, setColumnSizingState] = useState<ColumnSizingState>(
    {},
  );

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!persistKey) return;

    const stored = loadFromStorage(persistKey);
    if (stored) {
      setColumnSizingState(stored);
    }
  }, [persistKey]);

  useEffect(() => {
    if (persistKey && Object.keys(columnSizingState).length > 0) {
      saveToStorage(persistKey, columnSizingState);
    }
  }, [columnSizingState, persistKey]);

  const setColumnSizing = useCallback(
    (sizing: ColumnSizingState) => {
      setColumnSizingState(sizing);
      onColumnSizeChange?.(sizing);
    },
    [onColumnSizeChange],
  );

  const resetColumnSizing = useCallback(() => {
    setColumnSizingState({});
    if (persistKey) {
      removeFromStorage(persistKey);
    }
    onColumnSizeChange?.({});
  }, [persistKey, onColumnSizeChange]);

  const getResizeHandler = useCallback(
    (header: Header<RowData, unknown>) => {
      if (!enabled) return () => {};

      return (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsResizing(true);

        const startX =
          "touches" in e && e.touches.length > 0
            ? (e.touches[0]?.clientX ?? 0)
            : (e as React.MouseEvent).clientX;
        const startSize = header.getSize();
        const columnId = header.column.id;

        const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
          const currentX =
            "touches" in moveEvent &&
            (moveEvent as TouchEvent).touches.length > 0
              ? ((moveEvent as TouchEvent).touches[0]?.clientX ?? 0)
              : (moveEvent as MouseEvent).clientX;
          const delta = currentX - startX;
          const newSize = Math.max(
            minColumnSize,
            Math.min(maxColumnSize, startSize + delta),
          );

          setColumnSizingState((prev) => ({
            ...prev,
            [columnId]: newSize,
          }));
        };

        const handleEnd = () => {
          setIsResizing(false);
          document.removeEventListener("mousemove", handleMove);
          document.removeEventListener("mouseup", handleEnd);
          document.removeEventListener("touchmove", handleMove);
          document.removeEventListener("touchend", handleEnd);
        };

        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd);
        document.addEventListener("touchmove", handleMove, { passive: true });
        document.addEventListener("touchend", handleEnd, { passive: true });
      };
    },
    [enabled, minColumnSize, maxColumnSize],
  );

  return {
    columnSizing: columnSizingState,
    setColumnSizing,
    resetColumnSizing,
    getResizeHandler,
    isResizing,
  };
}

export function ColumnResizeHandle({
  onResize,
  onKeyboardResize,
  className,
}: {
  onResize: (e: React.MouseEvent | React.TouchEvent) => void;
  /**
   * Keyboard alternative to dragging; receives the width delta in px
   * (ArrowLeft/ArrowRight move by 10px, 50px with Shift).
   */
  onKeyboardResize?: (deltaPx: number) => void;
  className?: string;
}) {
  return (
    <div
      onMouseDown={onResize}
      onTouchStart={onResize}
      onKeyDown={(e) => {
        if (!onKeyboardResize) return;
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const step = e.shiftKey ? 50 : 10;
        onKeyboardResize(e.key === "ArrowRight" ? step : -step);
      }}
      role="separator"
      aria-label="Resize column"
      aria-orientation="vertical"
      tabIndex={onKeyboardResize ? 0 : -1}
      className={
        className ??
        "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-transparent hover:bg-primary/50 active:bg-primary transition-colors"
      }
      style={{
        transform: "translateX(50%)",
      }}
    />
  );
}
