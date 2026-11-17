"use client";

import { X } from "lucide-react";
import {
  Children,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
} from "react";

import { DATA_GRID_ROW_PRIMARY_ATTRIBUTE } from "./data-grid-row-keyboard";
import { Button } from "../shadcn/button";
import { Toolbar, ToolbarButton } from "../shadcn/toolbar";

import type {
  ComponentProps,
  FocusEvent,
  ReactElement,
  ReactNode,
} from "react";

export interface DataGridSelectionBarProps {
  /** Number of selected rows; at zero only an empty live region remains. */
  count: number;
  /** Singular noun for the announcement, e.g. "record" → "3 records selected". */
  noun?: string;
  onClear: () => void;
  /**
   * Bulk action buttons (use `size="sm"`, one primary at most). Each direct
   * `Button` child becomes a toolbar item; other content renders before
   * them, outside the toolbar's arrow-key focus, and keeps its own Tab stops.
   */
  children?: ReactNode;
}

const GRID_ROW = '[data-slot="data-grid-panel-row"], tr[data-row-id]';

/**
 * A selection bar leaves the page when the selection clears. If focus is in
 * it then (or in a menu or dialog it opened), focus goes back to the bar's
 * grid: the row control it came from, else the first row. A bar outside a
 * grid sends it back to where it came from. Focus elsewhere is left alone.
 */
function useSelectionBarFocusReturn() {
  const barRef = useRef<HTMLDivElement>(null);
  const cameFrom = useRef<HTMLElement | null>(null);
  const lastInside = useRef<EventTarget | null>(null);

  useLayoutEffect(() => {
    const bar = barRef.current;
    // React runs this cleanup just before it takes the bar out of the page.
    return () => {
      const active = document.activeElement;
      if (!bar || !active) return;
      if (!bar.contains(active) && active !== lastInside.current) return;
      const grid = bar.closest('[data-slot="data-grid-panel"]');
      const from = cameFrom.current;
      const restore = () => {
        for (const target of [
          grid?.contains(from) && from?.closest(GRID_ROW) ? from : null,
          grid?.querySelector<HTMLElement>(
            `[${DATA_GRID_ROW_PRIMARY_ATTRIBUTE}]`,
          ),
          from,
        ]) {
          if (!target?.isConnected) continue;
          target.focus();
          if (document.activeElement === target) return;
        }
      };
      restore();
      // The same update can remove that element too: look again after it.
      queueMicrotask(() => {
        if (document.activeElement === document.body) restore();
      });
    };
  }, []);

  return {
    ref: barRef,
    onFocus(event: FocusEvent<HTMLElement>) {
      const from = event.relatedTarget;
      // React bubbles focus from a menu the bar opened, so that is inside too.
      if (
        from instanceof HTMLElement &&
        from !== lastInside.current &&
        !event.currentTarget.contains(from)
      ) {
        cameFrom.current = from;
      }
      lastInside.current = event.target;
    },
  };
}

/**
 * The roving-focus root for a selection bar's controls: one Tab stop, arrow
 * keys, Home and End. Render it only while rows are selected, so that it
 * returns focus when it unmounts.
 */
export function SelectionBarToolbar(
  props: Omit<ComponentProps<typeof Toolbar>, "ref" | "onFocus">,
) {
  const focusReturn = useSelectionBarFocusReturn();
  return <Toolbar {...props} {...focusReturn} />;
}

function isActionButton(
  child: ReturnType<typeof Children.toArray>[number],
): child is ReactElement<ComponentProps<typeof Button>> {
  return isValidElement(child) && child.type === Button;
}

function SelectionBarActions({
  onClear,
  children,
}: Pick<DataGridSelectionBarProps, "onClear" | "children">) {
  const focusReturn = useSelectionBarFocusReturn();
  const content = Children.toArray(children);
  return (
    <div
      {...focusReturn}
      className="flex grow flex-wrap items-center justify-end gap-2"
    >
      {/* React bubbles events from a portal to its parents, so content that
          may open a dialog stays outside the toolbar's key and focus
          handlers, which would otherwise act on the dialog's fields. */}
      {content.filter((child) => !isActionButton(child))}
      {/* Only the bar's own actions form the toolbar. Other content, such as
          Web Studio's Payload actions, keeps its own Tab stops beside it. */}
      <Toolbar aria-label="Selected record actions">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {content.filter(isActionButton).map((child) => (
            <ToolbarButton
              key={child.key}
              disabled={child.props.disabled}
              focusableWhenDisabled={child.props.focusableWhenDisabled ?? false}
              render={child}
            />
          ))}
          {/* Phones keep the X (named for assistive tech) so the bar stays
              one or two rows beside the bulk actions. */}
          <ToolbarButton
            render={
              <Button
                variant="ghost"
                size="sm"
                aria-label="Clear selection"
                onClick={onClear}
              />
            }
          >
            <X />
            <span className="hidden sm:inline">Clear selection</span>
          </ToolbarButton>
        </div>
      </Toolbar>
    </div>
  );
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
  const countId = useId();
  return (
    <div
      role={active ? "group" : undefined}
      aria-labelledby={active ? countId : undefined}
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
        id={countId}
        aria-live="polite"
        className={active ? "text-sm font-medium tabular-nums" : "sr-only"}
      >
        {active ? label : ""}
      </p>
      {active ? (
        <SelectionBarActions onClear={onClear}>{children}</SelectionBarActions>
      ) : null}
    </div>
  );
}
