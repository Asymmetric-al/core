/**
 * Shared helpers for memoized data-table chrome (pagination, action bars).
 *
 * Chrome components subscribe to individual table state slices
 * (`useSelector(table.atoms.<slice>)`) instead of relying on the
 * table-creating parent re-rendering them with the full broadcast state.
 * That only pays off when `React.memo` can bail out of parent-driven
 * re-renders, which needs a comparator that understands the v9 `useTable`
 * wrapper (see {@link areChromeTablePropsInterchangeable}).
 */

import type { RowData, Table, TableSelectionSource } from "./tanstack";
import type * as React from "react";

/**
 * Inert selection source: the value is always `undefined` and the
 * subscription never fires. Chrome components fall back to it when a slice
 * atom is unavailable (minimal table doubles in unit tests) or when a
 * subscription is conditionally unwanted, keeping hook order stable.
 */
export const EMPTY_TABLE_SELECTION_SOURCE: TableSelectionSource<undefined> = {
  get: () => undefined,
  subscribe: () => ({ unsubscribe: () => {} }),
};

/**
 * Reads `table.atoms` without assuming a full v9 instance.
 *
 * Chrome components accept minimal table doubles in existing unit tests
 * (plain objects with just the methods they call), which have no reactivity
 * atoms. Returns `undefined` in that case so callers can fall back to
 * {@link EMPTY_TABLE_SELECTION_SOURCE}; such doubles still render correctly
 * because they re-render with their parent.
 */
export function getTableSliceAtoms<TData extends RowData>(
  table: Table<TData>,
): Table<TData>["atoms"] | undefined {
  return (table as Partial<Table<TData>>).atoms;
}

interface ChromeDerivedTableInputs {
  columns: readonly unknown[] | undefined;
  data: readonly unknown[] | undefined;
  pageCount: number | undefined;
  rowCount: number | undefined;
}

function readChromeDerivedTableInputs<TData extends RowData>(
  table: Table<TData>,
): ChromeDerivedTableInputs {
  const options = (table as Partial<Table<TData>>).options;
  return {
    columns: options?.columns,
    data: options?.data,
    pageCount: options?.pageCount,
    rowCount: options?.rowCount,
  };
}

export type DataTableChromeAction = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (rows: RowData[]) => void;
  variant?: "default" | "destructive";
  hideOnMobile?: boolean;
};

/** Shallow value compare so memoized chrome can bail out when callers pass fresh action arrays. */
export function areDataTableChromeActionsEqual(
  previous: readonly DataTableChromeAction[] | undefined,
  next: readonly DataTableChromeAction[] | undefined,
): boolean {
  if (previous === next) {
    return true;
  }
  if (!previous || !next) {
    return !previous && !next;
  }
  if (previous.length !== next.length) {
    return false;
  }
  return previous.every((action, index) => {
    const other = next[index];
    if (!other) {
      return false;
    }
    return (
      action.label === other.label &&
      action.variant === other.variant &&
      action.hideOnMobile === other.hideOnMobile &&
      action.icon === other.icon &&
      action.onClick === other.onClick
    );
  });
}

/**
 * `React.memo` comparator support for the `table` prop of chrome components.
 *
 * v9's `useTable` returns `{ ...instance, options, state }` — a fresh wrapper
 * object on every render of the table-owning component — so an identity
 * compare of the `table` prop never bails out even though the underlying
 * instance is stable. Two wrappers are interchangeable for
 * subscription-driven chrome when:
 *
 * 1. they wrap the same underlying instance (same `atoms` map; the atoms are
 *    created once in `constructTable` and copied by reference into every
 *    wrapper), and
 * 2. the non-state option inputs feeding the chrome's derived reads
 *    (filtered/selected row counts, page count) are unchanged: `columns`,
 *    `data`, `pageCount`, and `rowCount`. State-slice changes are covered by each
 *    chrome component's own `useSelector` subscriptions, not by re-rendering
 *    through props.
 *
 * IMPORTANT: a component memoized with this comparator must NOT read
 * `table.state` during render — the retained wrapper's `.state` snapshot goes
 * stale once the comparator starts bailing out. Read state through
 * `useSelector(table.atoms.<slice>)` (or live `table.get*` APIs whose inputs
 * are covered by a subscription or by this comparator).
 */
export function areChromeTablePropsInterchangeable<TData extends RowData>(
  previous: Table<TData>,
  next: Table<TData>,
): boolean {
  if (previous !== next) {
    const previousAtoms = getTableSliceAtoms(previous);
    const nextAtoms = getTableSliceAtoms(next);
    const isSameInstance =
      previousAtoms !== undefined && previousAtoms === nextAtoms;
    if (!isSameInstance) {
      return false;
    }
  }

  const previousInputs = readChromeDerivedTableInputs(previous);
  const nextInputs = readChromeDerivedTableInputs(next);
  return (
    previousInputs.columns === nextInputs.columns &&
    previousInputs.data === nextInputs.data &&
    previousInputs.pageCount === nextInputs.pageCount &&
    previousInputs.rowCount === nextInputs.rowCount
  );
}
