"use client";

import { useShortcut } from "@asym/ui/components/primitives/shortcut";
import * as React from "react";

interface HotkeyMap {
  /** Cmd/Ctrl + Enter — primary action of the active mode (send / add note). */
  onPrimaryAction: () => void;
  disabled?: boolean;
}

export const COMPOSER_PRIMARY_SHORTCUT = "mod+enter";

export function useComposerHotkeys({
  onPrimaryAction,
  disabled = false,
}: HotkeyMap) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // The shortcut keeps the key while sending, so it never falls through to
  // the editor as a line break.
  useShortcut(
    COMPOSER_PRIMARY_SHORTCUT,
    () => {
      if (!disabled) onPrimaryAction();
    },
    {
      allowInInput: true,
      description: "Send the reply or add the note",
      within: containerRef,
    },
  );

  return containerRef;
}
