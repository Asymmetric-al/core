"use client";

import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

export interface SuggestionItem {
  id: string;
  label: string;
  description?: string | null;
  /** Optional pill (e.g. shortcode for canned responses). */
  hint?: string;
}

export interface SuggestionListHandle {
  /**
   * The Tiptap suggestion plugin forwards keyboard events here so the popover
   * can drive its own selection. Returning `true` tells Tiptap to swallow the
   * event so the editor doesn't also receive it.
   */
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface SuggestionListProps {
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
  /** Heading shown above the list (e.g. "Canned responses", "Mention"). */
  heading?: string;
  /** Empty-state copy when `items` is empty. */
  emptyHint?: string;
  /** The renderer connects this popup to the editor that retains DOM focus. */
  onActiveOptionChange?: (listboxId: string, optionId: string | null) => void;
}

/**
 * Floating popover used by both the canned-response suggestion and the
 * agent-mention suggestion. Maia/Zinc styling, keyboard nav, single
 * implementation.
 */
export const SuggestionList = React.forwardRef<
  SuggestionListHandle,
  SuggestionListProps
>(function SuggestionList(
  { items, command, heading, emptyHint = "No matches.", onActiveOptionChange },
  ref,
) {
  // The highlight is stored together with the list it belongs to, so a new
  // `items` array derives back to the first row without a reset effect.
  const [highlight, setHighlight] = React.useState<{
    items: SuggestionItem[];
    index: number;
  }>({ items, index: 0 });
  const activeIndex = highlight.items === items ? highlight.index : 0;
  const setActiveIndex = React.useCallback(
    (update: number | ((current: number) => number)) => {
      setHighlight((current) => {
        const base = current.items === items ? current.index : 0;
        return {
          items,
          index: typeof update === "function" ? update(base) : update,
        };
      });
    },
    [items],
  );

  const listboxId = React.useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const activeItem = items[activeIndex];
  const activeOptionId = activeItem ? optionId(activeIndex) : null;
  const viewportRef = React.useRef<HTMLUListElement>(null);
  const activeOptionRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    onActiveOptionChange?.(listboxId, activeOptionId);
  }, [listboxId, activeOptionId, onActiveOptionChange]);
  React.useEffect(() => {
    const viewport = viewportRef.current;
    const option = activeOptionRef.current;
    if (!viewport || !option) return;
    // Scroll only the popup, so keyboard navigation never moves the editor/page.
    const top = option.offsetTop - viewport.offsetTop;
    const bottom = top + option.offsetHeight;
    if (top < viewport.scrollTop) viewport.scrollTop = top;
    else if (bottom > viewport.scrollTop + viewport.clientHeight) {
      viewport.scrollTop = bottom - viewport.clientHeight;
    }
  }, [activeIndex, items]);

  const select = (index: number) => {
    const item = items[index];
    if (!item) return;
    command(item);
  };

  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowDown") {
        setActiveIndex((current) => (current + 1) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === "ArrowUp") {
        setActiveIndex((current) =>
          current <= 0 ? Math.max(items.length - 1, 0) : current - 1,
        );
        return true;
      }
      if (event.key === "Enter") {
        select(activeIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label={heading ?? "Suggestions"}
      className={cn(
        "z-50 min-w-55 max-w-sm overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg",
      )}
    >
      {heading ? (
        <p className="border-b border-border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {heading}
        </p>
      ) : null}
      {items.length === 0 ? (
        <p className="p-3 text-[12px] text-muted-foreground">{emptyHint}</p>
      ) : (
        <ul
          ref={viewportRef}
          role="presentation"
          className="max-h-64 overflow-y-auto py-1"
        >
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={item.id} role="presentation">
                <button
                  ref={isActive ? activeOptionRef : undefined}
                  type="button"
                  id={optionId(index)}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={-1}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-1.5 text-left",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-popover-foreground hover:bg-accent",
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(index)}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-medium">
                      {item.label}
                    </span>
                    {item.description ? (
                      <span className="truncate text-[11px] text-popover-foreground">
                        {item.description}
                      </span>
                    ) : null}
                  </div>
                  {item.hint ? (
                    <span className="ml-2 inline-flex items-center rounded-md border border-border bg-popover px-1.5 py-0.5 font-mono text-[10px] text-popover-foreground">
                      {item.hint}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
