"use client";

import { useIsMobile } from "@asym/lib/hooks/use-mobile";
import { getColumnHeaderLabel } from "@asym/ui/components/reui/data-grid/data-grid";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { ArrowUpDown } from "lucide-react";

import type { DataGridTableOf } from "@asym/ui/components/data-grid-panel";

const ORDER_ASCENDING = "asc";
const ORDER_DESCENDING = "desc";
const DEFAULT_VALUE = "__default";

/** The list's own order when no column is chosen (Payload's default sort). */
export type GridSortDefault = {
  /** e.g. "Default (newest first)". */
  label: string;
  /** Whether the list is in that order now. */
  active: boolean;
};

/**
 * Sorting for a grid's card list. Below md the shared panel swaps the table,
 * and with it the sortable column headers, for cards; this menu offers the
 * same sortable columns and order, and goes through the table's own sorting
 * state, so a server-sorted grid still sorts through its `onSortingChange`.
 * It renders only while the cards do (the panel's own breakpoint hook).
 *
 * A grid with a default order of its own (a Payload list sorts newest first
 * when no column is chosen) passes `defaultSort`: the menu then offers that
 * order as a choice and shows it checked while it applies. Order applies to
 * a chosen column, so it waits until one is chosen.
 */
export function GridSortMenu<TData extends object>({
  table,
  defaultSort,
  sortLabel,
}: {
  table: DataGridTableOf<TData>;
  defaultSort?: GridSortDefault;
  /**
   * What a column orders by, when that differs from its heading: a column
   * that shows names but sorts by a stored ID offers "Missionary ID".
   */
  sortLabel?: (columnId: string) => string | undefined;
}) {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanSort() && column.getIsVisible());
  if (columns.length === 0) return null;

  const currentColumn = defaultSort?.active
    ? undefined
    : columns.find((column) => column.getIsSorted());
  const order = currentColumn
    ? currentColumn.getIsSorted() === "desc"
      ? ORDER_DESCENDING
      : ORDER_ASCENDING
    : "";
  const sortValue = currentColumn
    ? currentColumn.id
    : defaultSort?.active
      ? DEFAULT_VALUE
      : "";

  const labelOf = (column: (typeof columns)[number]) =>
    sortLabel?.(column.id) ?? getColumnHeaderLabel(column);

  const sortBy = (id: string, desc: boolean) => {
    table.setSorting([{ id, desc }]);
  };

  const currentSummary = currentColumn
    ? `, by ${labelOf(currentColumn)} ${
        order === ORDER_DESCENDING ? "descending" : "ascending"
      }`
    : defaultSort?.active
      ? `, ${defaultSort.label.toLowerCase()}`
      : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <ArrowUpDown aria-hidden="true" />
            Sort
            {currentSummary ? (
              <span className="sr-only">{currentSummary}</span>
            ) : null}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sortValue}
            onValueChange={(id: string) => {
              if (id === DEFAULT_VALUE) {
                table.setSorting([]);
                return;
              }
              sortBy(id, order === ORDER_DESCENDING);
            }}
          >
            {defaultSort ? (
              <DropdownMenuRadioItem value={DEFAULT_VALUE}>
                {defaultSort.label}
              </DropdownMenuRadioItem>
            ) : null}
            {columns.map((column) => (
              <DropdownMenuRadioItem key={column.id} value={column.id}>
                {labelOf(column)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {currentColumn ? "Order" : "Order (choose a field first)"}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={order}
            onValueChange={(value: string) => {
              if (!currentColumn) return;
              sortBy(currentColumn.id, value === ORDER_DESCENDING);
            }}
          >
            <DropdownMenuRadioItem
              value={ORDER_ASCENDING}
              disabled={!currentColumn}
            >
              Ascending
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value={ORDER_DESCENDING}
              disabled={!currentColumn}
            >
              Descending
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
