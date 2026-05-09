"use client";

import * as React from "react";

interface HotkeyMap {
  /** Cmd/Ctrl + Enter — primary action of the active mode (send / add note). */
  onPrimaryAction: () => void;
}

/**
 * Tiny keyboard surface for the composer. Registers the documented
 * `Cmd/Ctrl + Enter` shortcut on the container ref. Phase 5 extends this
 * surface (`Cmd+K` palette, `Cmd+/` macro picker, etc.) without rewriting
 * the composer.
 */
export function useComposerHotkeys({ onPrimaryAction }: HotkeyMap) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handler = (event: KeyboardEvent) => {
      const isPrimaryShortcut =
        (event.metaKey || event.ctrlKey) && event.key === "Enter";
      if (!isPrimaryShortcut) return;
      event.preventDefault();
      onPrimaryAction();
    };

    node.addEventListener("keydown", handler);
    return () => {
      node.removeEventListener("keydown", handler);
    };
  }, [onPrimaryAction]);

  return containerRef;
}
