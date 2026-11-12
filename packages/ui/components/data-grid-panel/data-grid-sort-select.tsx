"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";

import { useDataGridPanelShowsCards } from "./data-grid-panel-layout";

type DataGridSort = { id: string; desc: boolean };

/** "lastTouchAt:desc" for the primary sort, or `fallback` when unsorted. */
export function dataGridSortValue(
  sorting: readonly DataGridSort[],
  fallback: string,
): string {
  const primary = sorting[0];
  return primary ? `${primary.id}:${primary.desc ? "desc" : "asc"}` : fallback;
}

/**
 * Sort control for card layouts (phones, or a grid's card view), where the
 * sortable column headers are not shown. `options` maps "columnId:asc|desc" to a label; a header sort set
 * on a wider screen that is not among them is listed from `extraOptions` so
 * the trigger never shows a blank value. With `whenCards`, it renders only
 * while the enclosing panel draws cards (on phones, in a chosen card view,
 * or when the columns would not fit), since the table's headers sort.
 */
export function DataGridSortSelect({
  label,
  options,
  extraOptions = {},
  fallback,
  sorting,
  onSortingChange,
  whenCards = false,
}: {
  label: string;
  options: Record<string, string>;
  extraOptions?: Record<string, string>;
  fallback: string;
  sorting: readonly DataGridSort[];
  onSortingChange: (next: DataGridSort[]) => void;
  whenCards?: boolean;
}) {
  const showsCards = useDataGridPanelShowsCards();
  if (whenCards && !showsCards) return null;
  const value = dataGridSortValue(sorting, fallback);
  const extraLabel = options[value] ? null : extraOptions[value];
  const items = extraLabel ? { [value]: extraLabel, ...options } : options;
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => {
        if (typeof next !== "string") return;
        const [id, direction] = next.split(":");
        if (id) onSortingChange([{ id, desc: direction === "desc" }]);
      }}
    >
      <SelectTrigger size="sm" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([option, optionLabel]) => (
          <SelectItem key={option} value={option}>
            {optionLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
