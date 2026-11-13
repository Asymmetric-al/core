"use client";

import { X } from "lucide-react";

import { Button } from "../shadcn/button";

import type { ReactNode } from "react";

export interface DataGridSelectionBarProps {
  /** Number of selected rows; at zero only an empty live region remains. */
  count: number;
  /** Singular noun for the announcement, e.g. "record" → "3 records selected". */
  noun?: string;
  onClear: () => void;
  /** Bulk action buttons (use `size="sm"`, one primary at most). */
  children?: ReactNode;
}

/**
 * Bulk action bar shown at the top of a data grid panel while rows are
 * selected. It sits in the panel's flow (never covering the page's own
 * controls), sticks below the app header while the grid scrolls past so the
 * actions stay reachable from lower rows and on phones, and announces the
 * count politely.
 *
 * The count's live region stays in the page, empty, while nothing is
 * selected: a live region that mounts already filled is not announced.
 */
export function DataGridSelectionBar({
  count,
  noun = "row",
  onClear,
  children,
}: DataGridSelectionBarProps) {
  const active = count > 0;
  const label = `${count} ${count === 1 ? noun : `${noun}s`} selected`;
  return (
    <div
      role={active ? "toolbar" : undefined}
      aria-label={active ? "Selected record actions" : undefined}
      data-slot="data-grid-selection-bar"
      // Inactive: no box (display: contents), so the panel's gap adds no
      // empty band; the live region inside stays in the page.
      className={
        active
          ? "sticky top-14 z-20 mx-4 flex min-w-0 flex-wrap items-center gap-2 rounded-lg border bg-muted px-3 py-2 shadow-sm"
          : "contents"
      }
    >
      <p
        aria-live="polite"
        className={active ? "text-sm font-medium tabular-nums" : "sr-only"}
      >
        {active ? label : ""}
      </p>
      {active ? (
        <div className="flex grow flex-wrap items-center justify-end gap-2">
          {children}
          {/* Phones keep the X (named for assistive tech) so the bar stays
              one or two rows beside the bulk actions. */}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Clear selection"
            onClick={onClear}
          >
            <X />
            <span className="hidden sm:inline">Clear selection</span>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
