"use client";

import * as React from "react";

/**
 * Restores keyboard focus to the element that opened a popover / detail
 * pane / modal once the consumer unmounts. The hook stores the active
 * element on first paint, then on cleanup re-focuses it as long as the
 * node is still in the document and is focusable.
 *
 * Pattern used across the support-hub detail pane + composer chrome:
 *
 * ```tsx
 * useFocusReturn(isOpen);
 * ```
 *
 * Phase 7 wires this so closing the conversation detail returns focus to
 * the originating row / card. The hook is intentionally tiny — Phase 8 may
 * extend it to manage focus traps for full-screen sheets if the mobile UX
 * grows there.
 */
export function useFocusReturn(active: boolean): void {
  const previouslyFocused = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!active) return;
    if (typeof document === "undefined") return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    return () => {
      const target = previouslyFocused.current;
      if (!target) return;
      if (!document.body.contains(target)) return;
      try {
        target.focus({ preventScroll: true });
      } catch {
        // older browsers may not support preventScroll — fall back silently
        try {
          target.focus();
        } catch {
          /* swallow */
        }
      }
    };
  }, [active]);
}
