"use client";

import * as React from "react";

interface HotkeyMap {
  /** Cmd/Ctrl + Enter — primary action of the active mode (send / add note). */
  onPrimaryAction: () => void;
  disabled?: boolean;
}

export function useComposerHotkeys({
  onPrimaryAction,
  disabled = false,
}: HotkeyMap) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handler = (event: KeyboardEvent) => {
      const isPrimaryShortcut =
        (event.metaKey || event.ctrlKey) && event.key === "Enter";
      if (!isPrimaryShortcut || event.defaultPrevented || event.isComposing)
        return;
      event.preventDefault();
      if (disabled || event.repeat) return;
      onPrimaryAction();
    };

    node.addEventListener("keydown", handler);
    return () => {
      node.removeEventListener("keydown", handler);
    };
  }, [onPrimaryAction, disabled]);

  return containerRef;
}
