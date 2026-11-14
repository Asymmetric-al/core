import { useLayoutEffect, useState } from "react";

import type { DataGridPanelVirtualOptions } from "@asym/ui/components/data-grid-panel";
import type { RefObject } from "react";

/** The sticky header row. */
const VIRTUAL_HEADER_HEIGHT = 40;
/** The "loading more / all loaded" status row under the last row. */
const VIRTUAL_STATUS_ROW_HEIGHT = 48;
/** Room left before the page has been measured (server render, first paint). */
const FALLBACK_ALLOWANCE = "20rem";
/** The compact PageShell's bottom padding on desktop (lg:p-7). */
const PAGE_BOTTOM_GAP = 28;

/**
 * The virtual body fills the window below the page content above it, but
 * never grows taller than its rows, so a short search result does not leave a
 * blank box. Long lists scroll inside the panel instead of stretching the
 * page. `allowance` is the measured height (px) of everything on the page
 * that is not the list body (see `useCrmVirtualAllowance`).
 */
export function getCrmVirtualHeight(
  rowCount: number,
  rowHeight: number,
  {
    allowance = null,
    statusRow = true,
    minViewportShare = 0,
  }: {
    allowance?: number | null;
    statusRow?: boolean;
    /**
     * Least share of the window kept for rows (0.6 = 60dvh) on pages with a
     * lot above and below the list; the page then scrolls a little instead
     * of squeezing the list to the 16rem floor.
     */
    minViewportShare?: number;
  } = {},
) {
  const contentHeight =
    rowCount * rowHeight +
    VIRTUAL_HEADER_HEIGHT +
    (statusRow ? VIRTUAL_STATUS_ROW_HEIGHT : 0);
  const room = allowance == null ? FALLBACK_ALLOWANCE : `${allowance}px`;
  const share =
    minViewportShare > 0 ? ` ${Math.round(minViewportShare * 100)}dvh,` : "";
  return `min(max(16rem,${share} calc(100dvh - ${room})), ${contentHeight}px)`;
}

/**
 * Page height that is not the list body: everything above the panel, the
 * panel's own chrome around the body (toolbar, footer) and the page's
 * bottom padding.
 */
export function crmVirtualAllowance({
  panelTop,
  panelHeight,
  bodyHeight,
  bottomGap = PAGE_BOTTOM_GAP,
}: {
  panelTop: number;
  panelHeight: number;
  bodyHeight: number;
  bottomGap?: number;
}) {
  return Math.round(panelTop + (panelHeight - bodyHeight) + bottomGap);
}

/** How far the nearest scrolling ancestor (or the window) is scrolled. */
function scrollOffset(element: HTMLElement) {
  for (
    let node = element.parentElement;
    node && node !== document.body && node !== document.documentElement;
    node = node.parentElement
  ) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node.scrollTop;
  }
  return window.scrollY;
}

/**
 * Measures the page around a CRM grid panel so its virtual body can take
 * exactly the window height left below the panel's own top (summary cards,
 * alerts and footers differ per page). Null until the virtual body renders.
 * Attach `panelRef` to the element that wraps the `DataGridPanel`.
 */
export function useCrmVirtualAllowance(
  panelRef: RefObject<HTMLElement | null>,
) {
  const [allowance, setAllowance] = useState<number | null>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const measure = () => {
      const body = panel.querySelector<HTMLElement>(
        '[data-slot="data-grid-table-viewport"]',
      );
      if (!body) {
        setAllowance(null);
        return;
      }
      const panelRect = panel.getBoundingClientRect();
      // Offset from the top of the scrolled content, so the result does not
      // change as the page scrolls.
      setAllowance(
        crmVirtualAllowance({
          panelTop: panelRect.top + scrollOffset(panel),
          panelHeight: panelRect.height,
          bodyHeight: body.getBoundingClientRect().height,
        }),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    if (typeof ResizeObserver === "undefined") {
      return () => window.removeEventListener("resize", measure);
    }
    // The panel resizes as its toolbar wraps and its body mounts; the parent
    // as content above it (summary cards, alerts) loads.
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    if (panel.parentElement) observer.observe(panel.parentElement);
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [panelRef]);

  return allowance;
}

/**
 * Virtual-body options for a CRM grid that loads its rows in server pages:
 * a bounded scroll area that asks for the next page near its end, and a
 * status line saying whether more are loading or all are loaded. Undefined
 * while there are no rows (loading and empty states use the plain body).
 */
export function crmVirtualOptions({
  rowCount,
  rowHeight,
  hasMore,
  isFetchingMore,
  loadMore,
  noun,
  allowance = null,
  minViewportShare = 0,
}: {
  rowCount: number;
  rowHeight: number;
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMore: () => void;
  /** Singular and plural, e.g. ["note", "notes"]. */
  noun: readonly [string, string];
  /** From `useCrmVirtualAllowance`; null keeps the fixed fallback. */
  allowance?: number | null;
  /** See `getCrmVirtualHeight`. */
  minViewportShare?: number;
}): DataGridPanelVirtualOptions | undefined {
  if (rowCount === 0) return undefined;
  return {
    estimateSize: rowHeight,
    height: getCrmVirtualHeight(rowCount, rowHeight, {
      allowance,
      minViewportShare,
    }),
    hasMore,
    isFetchingMore,
    onFetchMore: loadMore,
    fetchingMoreMessage: `Loading more ${noun[1]}…`,
    allRowsLoadedMessage:
      rowCount === 1
        ? `1 ${noun[0]} loaded`
        : `All ${rowCount} ${noun[1]} loaded`,
  };
}
