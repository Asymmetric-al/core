"use client";

import { useCallback, useState, useEffect } from "react";
import type { ColumnSizingState, Table, Header } from "@tanstack/react-table";

export interface ColumnResizingOptions {
  enabled?: boolean;
  defaultColumnSize?: number;
  minColumnSize?: number;
  maxColumnSize?: number;
  persistKey?: string;
  onColumnSizeChange?: (sizing: ColumnSizingState) => void;
}

export interface UseColumnResizingReturn {
  columnSizing: ColumnSizingState;
  setColumnSizing: (sizing: ColumnSizingState) => void;
  resetColumnSizing: () => void;
  getResizeHandler: (
    header: Header<unknown, unknown>,
  ) => (e: React.MouseEvent | React.TouchEvent) => void;
  isResizing: boolean;
}

const STORAGE_PREFIX = "data-table-column-sizing-";

function loadFromStorage(key: string): ColumnSizingState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, sizing: ColumnSizingState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(sizing));
  } catch {}
}

function removeFromStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {}
}

export function useColumnResizing<TData>(
  table: Table<TData>,
  options: ColumnResizingOptions = {},
): UseColumnResizingReturn {
  const {
    enabled = true,
    defaultColumnSize = 150,
    minColumnSize = 50,
    maxColumnSize = 500,
    persistKey,
    onColumnSizeChange,
  } = options;

  const [columnSizing, setColumnSizingState] = useState<ColumnSizingState>(
    () => {
      if (persistKey) {
        const stored = loadFromStorage(persistKey);
        if (stored) return stored;
      }
      return {};
    },
  );

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (persistKey && Object.keys(columnSizing).length > 0) {
      saveToStorage(persistKey, columnSizing);
    }
  }, [columnSizing, persistKey]);

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
    (header: Header<unknown, unknown>) => {
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
        document.addEventListener("touchmove", handleMove);
        document.addEventListener("touchend", handleEnd);
      };
    },
    [enabled, minColumnSize, maxColumnSize],
  );

  return {
    columnSizing,
    setColumnSizing,
    resetColumnSizing,
    getResizeHandler,
    isResizing,
  };
}

export function ColumnResizeHandle({
  onResize,
  className,
}: {
  onResize: (e: React.MouseEvent | React.TouchEvent) => void;
  className?: string;
}) {
  return (
    <div
      onMouseDown={onResize}
      onTouchStart={onResize}
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
