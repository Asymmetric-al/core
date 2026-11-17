"use client";

import * as React from "react";

interface FocusReturnOptions {
  /** The open record; when it changes, what has focus then is the new return target. */
  key?: unknown;
  /** The surface itself, whose own controls are never a return target. */
  container?: React.RefObject<Element | null>;
}

/**
 * While `active`, remembers the element that had focus when it became
 * active; when `active` turns false or the caller unmounts, focuses that
 * element again if it is still in the document.
 *
 * ```tsx
 * useFocusReturn(isOpen);
 * ```
 *
 * `ConversationDetail` uses it so closing a conversation returns focus to
 * the row or card that opened it. The hook is intentionally tiny — Phase 8 may
 * extend it to manage focus traps for full-screen sheets if the mobile UX
 * grows there.
 */
export function useFocusReturn(
  active: boolean,
  { key, container }: FocusReturnOptions = {},
): void {
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

  // j/k on a list moves focus to the next row before the open pane shows it,
  // so closing returns to the record being closed, not the first one opened.
  React.useEffect(() => {
    if (!active) return;
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || focused === document.body) return;
    if (container?.current?.contains(focused)) return;
    previouslyFocused.current = focused;
  }, [active, key, container]);
}
