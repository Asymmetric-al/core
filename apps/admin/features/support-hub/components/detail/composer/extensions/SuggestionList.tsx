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
  { items, command, heading, emptyHint = "No matches." },
  ref,
) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [items]);

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
      role="listbox"
      className={cn(
        "z-50 min-w-[220px] max-w-sm overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-lg",
      )}
    >
      {heading ? (
        <p className="border-b border-zinc-100 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          {heading}
        </p>
      ) : null}
      {items.length === 0 ? (
        <p className="px-3 py-3 text-[12px] text-zinc-400">{emptyHint}</p>
      ) : (
        <ul className="max-h-64 overflow-y-auto py-1">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={item.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-1.5 text-left",
                    isActive
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-50",
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(index)}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-medium">
                      {item.label}
                    </span>
                    {item.description ? (
                      <span className="truncate text-[11px] text-zinc-500">
                        {item.description}
                      </span>
                    ) : null}
                  </div>
                  {item.hint ? (
                    <span className="ml-2 inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
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
