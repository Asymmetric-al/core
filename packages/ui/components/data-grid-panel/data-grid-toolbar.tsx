"use client";

import { LayoutGrid, LayoutList, Search, Settings2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useDataGridPanelShowsCards } from "./data-grid-panel-layout";
import { DataGridColumnVisibility } from "../reui/data-grid/data-grid-column-visibility";
import { Button } from "../shadcn/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../shadcn/input-group";
import { ToggleGroup, ToggleGroupItem } from "../shadcn/toggle-group";

import type { Table } from "./data-grid-engine";
import type { DataGridFeatures } from "../reui/data-grid/data-grid";
import type { ReactNode } from "react";

export interface DataGridSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Visible placeholder; the accessible name comes from `label`. */
  placeholder?: string;
  label: string;
  /** Debounce in ms before `onValueChange` fires while typing. */
  debounceMs?: number;
  className?: string;
}

/** Search box with a clear button, shared by every Core data grid toolbar. */
export function DataGridSearch({
  value,
  onValueChange,
  placeholder = "Search…",
  label,
  debounceMs = 0,
  className,
}: DataGridSearchProps) {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Adopt external resets (e.g. a "Reset filters" action) without an effect.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const commit = (next: string) => {
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    if (debounceMs > 0 && next !== "") {
      timer.current = setTimeout(() => onValueChange(next), debounceMs);
    } else {
      onValueChange(next);
    }
  };

  return (
    <div className={className ?? "w-full min-w-0 sm:w-64"}>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Search aria-hidden="true" />
        </InputGroupAddon>
        {/* type="text" + role="searchbox": type="search" adds the
            browser's own cancel button beside the Clear search button. */}
        <InputGroupInput
          type="text"
          role="searchbox"
          enterKeyHint="search"
          aria-label={label}
          placeholder={placeholder}
          value={draft}
          onChange={(event) => commit(event.target.value)}
        />
        {draft.length > 0 ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="Clear search"
              onClick={() => commit("")}
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </div>
  );
}

/** Pushes the following toolbar items to the end of the row. */
export function DataGridToolbarSpacer() {
  return <div aria-hidden="true" className="hidden grow sm:block" />;
}

/**
 * Column visibility menu with Core's standard "View" trigger. It steps aside
 * whenever the enclosing panel shows cards (a chosen card view, columns that
 * would not fit, or a phone), where columns change nothing; below md it is
 * also hidden by CSS so a phone never flashes it before layout is known.
 */
export function DataGridViewOptions<TData extends object>({
  table,
}: {
  table: Table<DataGridFeatures, TData>;
}) {
  const cards = useDataGridPanelShowsCards();
  if (cards) return null;
  return (
    <div data-slot="data-grid-view-options" className="hidden md:flex">
      <DataGridColumnVisibility
        table={table}
        trigger={
          <Button variant="outline" size="sm">
            <Settings2 />
            View
          </Button>
        }
      />
    </div>
  );
}

/** Clears every column filter and the search box in one step. */
export function DataGridResetFilters({
  visible,
  onReset,
}: {
  visible: boolean;
  onReset: () => void;
}) {
  if (!visible) return null;
  return (
    <Button variant="ghost" size="sm" onClick={onReset}>
      Reset
      <X />
    </Button>
  );
}

export type DataGridView = "table" | "list";

/**
 * Table/card view switch for grids that offer both layouts at desktop
 * widths. Pair it with `DataGridPanel`'s `view` prop. It is hidden below
 * the md breakpoint, where the panel always shows cards. Pressing the
 * active option keeps the current view, so one option is always on.
 */
export function DataGridViewToggle({
  value,
  onValueChange,
}: {
  value: DataGridView;
  onValueChange: (view: DataGridView) => void;
}) {
  return (
    <div className="hidden md:flex">
      <ToggleGroup
        aria-label="Layout"
        variant="outline"
        size="sm"
        value={[value]}
        onValueChange={(next: unknown[]) => {
          const [view] = next;
          if (view === "table" || view === "list") onValueChange(view);
        }}
      >
        <ToggleGroupItem value="table" aria-label="Table view">
          <LayoutList />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="Card view">
          <LayoutGrid />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export function DataGridToolbarGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>
  );
}
