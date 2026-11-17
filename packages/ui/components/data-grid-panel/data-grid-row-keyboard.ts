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
// Other controls in a row keep their own keys (Space presses a menu trigger,
// ArrowDown opens its menu); the row keys come from its primary control.
const ROW_CONTROL_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  '[role="button"]',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="switch"]',
  "[contenteditable]",
].join(",");

function primaryTargets(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(PRIMARY_SELECTOR),
  ).filter((element) => !element.closest("[hidden]"));
}

function rowOf(element: Element): Element | null {
  return element.closest(ROW_SELECTOR);
}

function isRowKeyTarget(target: Element, row: Element, key: string): boolean {
  const primary = target.closest(PRIMARY_SELECTOR);
  if (primary && row.contains(primary)) return true;
  const control = target.closest(ROW_CONTROL_SELECTOR);
  if (!control || !row.contains(control)) return true;
  // The row's selection checkbox has no use for the row keys, so they still
  // move and select from it; only Space, its own toggle, stays with it.
  return control.matches('[role="checkbox"]') && key !== " ";
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
 * primary control natively (it is a button or link). Keys pressed on any other
 * control in the row (menu trigger, link) stay with that control; the row's
 * checkbox keeps only Space.
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
  if (!currentRow || !isRowKeyTarget(target, currentRow, event.key)) {
    return false;
  }

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
      // Space on the primary button would activate it; on rows it means "select".
      const checkbox =
        currentRow.querySelector<HTMLElement>('[role="checkbox"]');
      if (!checkbox) return false;
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
