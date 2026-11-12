"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { DataGridColumnDef } from "@asym/ui/components/data-grid-panel";

type ColumnVisibility = Record<string, boolean>;
type ColumnVisibilityUpdater =
  ColumnVisibility | ((current: ColumnVisibility) => ColumnVisibility);

export interface CrmGridLayoutColumn {
  id: string;
  size: number;
  minSize?: number;
}

/** TanStack's default column size when a definition sets none. */
const DEFAULT_COLUMN_SIZE = 150;
/** The panel Card's 1px border on each side; the table sits inside it. */
const PANEL_BORDER_WIDTH = 2;

function isVisible(visibility: ColumnVisibility, id: string) {
  return visibility[id] !== false;
}

/** Ids, sizes and minimum sizes from grid column definitions. */
export function crmGridLayoutColumns<TData extends object>(
  columns: DataGridColumnDef<TData>[],
): CrmGridLayoutColumn[] {
  return columns.flatMap((column) => {
    const id =
      column.id ??
      ("accessorKey" in column && typeof column.accessorKey === "string"
        ? column.accessorKey
        : undefined);
    return id
      ? [
          {
            id,
            size: column.size ?? DEFAULT_COLUMN_SIZE,
            minSize: column.minSize,
          },
        ]
      : [];
  });
}

/** Keeps only the columns whose visibility differs from the defaults. */
export function diffCrmColumnVisibility(
  next: ColumnVisibility,
  defaults: ColumnVisibility,
): ColumnVisibility {
  const changed: ColumnVisibility = {};
  for (const id of new Set([...Object.keys(next), ...Object.keys(defaults)])) {
    const value = isVisible(next, id);
    if (value !== isVisible(defaults, id)) changed[id] = value;
  }
  return changed;
}

/** A tier with the kept columns (sorted or filtered) switched back on. */
function withKeptColumns(
  tier: ColumnVisibility,
  keepVisible: readonly string[],
): ColumnVisibility {
  if (keepVisible.length === 0) return tier;
  const next = { ...tier };
  for (const id of keepVisible) {
    if (next[id] === false) next[id] = true;
  }
  return next;
}

/**
 * Panel-aware layout for a fixed-width CRM grid:
 * - the default visibility is the first tier (most columns first) whose
 *   columns fit the panel, with the fill column at its minimum size (or at
 *   the tier's own `fillMinimums` entry, for a tier that should only apply
 *   when the name keeps that much room);
 * - `keepVisible` columns (the sorted and filtered ones) stay on in every
 *   tier, so a narrower tier is chosen to make room for them rather than
 *   hiding the column the rows are ordered or filtered by;
 * - the viewer's View menu choices win over the tier;
 * - the fill column (the record name) takes every pixel the other visible
 *   columns leave, and never shrinks below its minimum (the grid scrolls
 *   instead).
 * An unmeasured panel (server render, tests without layout) keeps the widest
 * tier and the declared sizes.
 */
export function resolveCrmGridLayout({
  width,
  columns,
  fillColumnId,
  tiers: declaredTiers,
  overrides,
  keepVisible = [],
  fillMinimums = [],
}: {
  width: number | null;
  columns: CrmGridLayoutColumn[];
  fillColumnId: string;
  tiers: ColumnVisibility[];
  overrides: ColumnVisibility;
  keepVisible?: readonly string[];
  /** Per tier (same order): the fill column's minimum for that tier. */
  fillMinimums?: readonly (number | undefined)[];
}): {
  columnVisibility: ColumnVisibility;
  columnSizing: Record<string, number>;
  defaults: ColumnVisibility;
} {
  const tiers = declaredTiers.map((tier) => withKeptColumns(tier, keepVisible));
  const widest = tiers[0] ?? {};
  if (width == null || width <= 0) {
    return {
      columnVisibility: { ...widest, ...overrides },
      columnSizing: {},
      defaults: widest,
    };
  }

  const minimumWidth = (visibility: ColumnVisibility, index: number) =>
    columns
      .filter((column) => isVisible(visibility, column.id))
      .reduce(
        (sum, column) =>
          sum +
          (column.id === fillColumnId
            ? Math.max(column.minSize ?? column.size, fillMinimums[index] ?? 0)
            : column.size),
        0,
      );
  const defaults =
    tiers.find((tier, index) => minimumWidth(tier, index) <= width) ??
    tiers[tiers.length - 1] ??
    {};
  const columnVisibility = { ...defaults, ...overrides };

  const fill = columns.find((column) => column.id === fillColumnId);
  if (!fill) {
    return { columnVisibility, columnSizing: {}, defaults };
  }
  const others = columns
    .filter(
      (column) =>
        column.id !== fillColumnId && isVisible(columnVisibility, column.id),
    )
    .reduce((sum, column) => sum + column.size, 0);
  return {
    columnVisibility,
    columnSizing: {
      [fillColumnId]: Math.max(fill.minSize ?? fill.size, width - others),
    },
    defaults,
  };
}

/**
 * Measures the panel and resolves column visibility and the fill column's
 * width (see `resolveCrmGridLayout`). Attach `panelRef` to an element that
 * wraps the `DataGridPanel`; pass module-level constants for `tiers`.
 */
export function useCrmGridLayout<TData extends object>({
  columns,
  fillColumnId,
  tiers,
  keepVisible,
  fillMinimums,
}: {
  columns: DataGridColumnDef<TData>[];
  fillColumnId: string;
  tiers: ColumnVisibility[];
  /** Column ids that stay visible in every tier (sorted, filtered). */
  keepVisible?: readonly string[];
  /** Per tier: the fill column's minimum (module-level constant). */
  fillMinimums?: readonly (number | undefined)[];
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [overrides, setOverrides] = useState<ColumnVisibility>({});

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const measure = () => {
      const next =
        Math.floor(panel.getBoundingClientRect().width) - PANEL_BORDER_WIDTH;
      setWidth(next > 0 ? next : null);
    };
    // Measure before the first paint so the grid never flashes the widest
    // column set on a narrower panel.
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const layoutColumns = useMemo(() => crmGridLayoutColumns(columns), [columns]);
  const { columnVisibility, columnSizing, defaults } = resolveCrmGridLayout({
    width,
    columns: layoutColumns,
    fillColumnId,
    tiers,
    overrides,
    keepVisible,
    fillMinimums,
  });

  const onColumnVisibilityChange = useCallback(
    (updater: ColumnVisibilityUpdater) => {
      setOverrides((current) => {
        const effective = { ...defaults, ...current };
        const next =
          typeof updater === "function" ? updater(effective) : updater;
        return diffCrmColumnVisibility(next, defaults);
      });
    },
    [defaults],
  );

  return {
    panelRef,
    /** The measured panel width (null until measured). */
    panelWidth: width,
    columnVisibility,
    columnSizing,
    onColumnVisibilityChange,
  };
}
