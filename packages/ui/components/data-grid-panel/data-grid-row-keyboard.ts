import type { KeyboardEvent } from "react";

/**
 * Attribute that marks a row's primary control: the button or link that opens
 * the record. Each data row (table row or mobile card) should render exactly
 * one, named after the record, so screen-reader users hear "Open Avery Lopez"
 * instead of an anonymous focusable row.
 */
export const DATA_GRID_ROW_PRIMARY_ATTRIBUTE = "data-grid-row-primary";

const PRIMARY_SELECTOR = `[${DATA_GRID_ROW_PRIMARY_ATTRIBUTE}]`;
const ROW_SELECTOR = '[data-slot="data-grid-panel-row"], tr[data-row-id]';
const PAGE_STEP = 10;

function primaryTargets(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(PRIMARY_SELECTOR),
  ).filter((element) => !element.closest("[hidden]"));
}

function rowOf(element: Element): Element | null {
  return element.closest(ROW_SELECTOR);
}

/**
 * The grid's scrolling body between a row and the grid container, if any. A
 * virtualized body mounts only a window of rows, so the first or last loaded
 * row may not be in the DOM until the body scrolls to that edge.
 */
function scrollingBody(
  row: Element,
  container: HTMLElement,
): HTMLElement | null {
  for (
    let element = row.parentElement;
    element && element !== container;
    element = element.parentElement
  ) {
    const overflowY = getComputedStyle(element).overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      element.scrollHeight > element.clientHeight
    ) {
      return element;
    }
  }
  return null;
}

function afterRender(callback: () => void) {
  const frame =
    typeof requestAnimationFrame === "function"
      ? requestAnimationFrame
      : (next: () => void) => setTimeout(next, 16);
  // Two frames: one for the scroll to reach the virtualizer, one to commit.
  frame(() => frame(callback));
}

export interface DataGridRowKeyboardOptions {
  /** Toggles every row's selection; called for Ctrl/Cmd+A when selection is on. */
  onSelectAll?: () => void;
}

/**
 * Roving row navigation shared by every Core data grid, preserving the
 * keyboard contract of the previous shared data table:
 * ArrowUp/ArrowDown move between rows, Ctrl/Cmd+Home/End jump to the first or
 * last row, PageUp/PageDown move ten rows, Space toggles the row's selection
 * checkbox and Ctrl/Cmd+A selects all rows. Enter activates the focused
 * primary control natively (it is a button or link).
 *
 * Returns `true` when the event was handled.
 */
export function handleDataGridRowKeyDown(
  event: KeyboardEvent<HTMLElement>,
  options: DataGridRowKeyboardOptions = {},
): boolean {
  const container = event.currentTarget;
  const target = event.target as HTMLElement;
  // Never hijack typing inside inputs, menus or other composite widgets.
  if (
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="menu"], [role="listbox"], [role="dialog"]',
    )
  ) {
    return false;
  }
  const currentRow = rowOf(target);
  if (!currentRow) return false;

  const targets = primaryTargets(container);
  if (targets.length === 0) return false;
  const currentIndex = targets.findIndex(
    (element) => rowOf(element) === currentRow,
  );

  const moveTo = (index: number) => {
    const next = targets[Math.max(0, Math.min(targets.length - 1, index))];
    if (!next) return;
    next.focus();
    next.scrollIntoView?.({ block: "nearest" });
  };

  const modifier = event.ctrlKey || event.metaKey;
  switch (event.key) {
    case "ArrowDown":
      moveTo(currentIndex + 1);
      break;
    case "ArrowUp":
      moveTo(currentIndex - 1);
      break;
    case "PageDown":
      moveTo(currentIndex + PAGE_STEP);
      break;
    case "PageUp":
      moveTo(currentIndex - PAGE_STEP);
      break;
    case "Home":
    case "End": {
      if (!modifier) return false;
      const toEnd = event.key === "End";
      moveTo(toEnd ? targets.length - 1 : 0);
      // Virtualized: scroll the body to that edge, then focus the row the
      // virtualizer mounts there (the logical first or last loaded row).
      const body = scrollingBody(currentRow, container);
      if (body) {
        body.scrollTop = toEnd ? body.scrollHeight : 0;
        afterRender(() => {
          const edgeTargets = primaryTargets(container);
          const edge = toEnd
            ? edgeTargets[edgeTargets.length - 1]
            : edgeTargets[0];
          if (!edge) return;
          edge.focus();
          edge.scrollIntoView?.({ block: "nearest" });
        });
      }
      break;
    }
    case " ": {
      // Space on a button would activate it; on rows it means "select".
      const checkbox =
        currentRow.querySelector<HTMLElement>('[role="checkbox"]');
      if (!checkbox || target === checkbox) return false;
      checkbox.click();
      break;
    }
    case "a":
    case "A":
      if (!modifier || !options.onSelectAll) return false;
      options.onSelectAll();
      break;
    default:
      return false;
  }
  event.preventDefault();
  return true;
}
