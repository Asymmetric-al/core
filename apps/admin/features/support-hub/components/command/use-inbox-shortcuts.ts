"use client";

import {
  useShortcut,
  type ShortcutOptions,
} from "@asym/ui/components/primitives/shortcut";

import {
  SUPPORT_INBOX_KEYMAP,
  type SupportShortcutAction,
} from "../../lib/keymap";

import type * as React from "react";

export type SupportShortcutHandler = (event: KeyboardEvent) => void;

export type SupportShortcutHandlers = Partial<
  Record<SupportShortcutAction, SupportShortcutHandler>
>;

interface Options {
  /** Region the shortcuts belong to. Defaults to the whole page if omitted. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /**
   * An element inside the command palette, a dialog outside the container:
   * while it is open, the palette's own key closes it from there.
   */
  paletteRef?: React.RefObject<HTMLElement | null>;
  /**
   * The open conversation's phone sheet, a modal portaled outside the
   * container: while it holds focus, the inbox keys work there too.
   */
  sheetRef?: React.RefObject<HTMLElement | null>;
  handlers: SupportShortcutHandlers;
  /** When false, the keys are left alone. */
  enabled?: boolean;
}

const [
  OPEN_COMMAND_PALETTE,
  NEXT_CONVERSATION,
  PREVIOUS_CONVERSATION,
  RESOLVE_CONVERSATION,
  OPEN_SNOOZE_MENU,
] = SUPPORT_INBOX_KEYMAP;

function inboxRegion({
  containerRef,
  sheetRef,
}: Options): ShortcutOptions["within"] {
  if (!containerRef || !sheetRef) return containerRef;
  return () => {
    const sheet = sheetRef.current;
    return sheet?.contains(document.activeElement)
      ? sheet
      : containerRef.current;
  };
}

function useInboxShortcut(
  entry: (typeof SUPPORT_INBOX_KEYMAP)[number],
  options: Options,
  {
    within = inboxRegion(options),
    overlay,
  }: Pick<ShortcutOptions, "within" | "overlay"> = {},
) {
  const { handlers, enabled = true } = options;
  const handler = handlers[entry.action];
  useShortcut(handler ? entry.keys : null, (event) => handler?.(event), {
    description: entry.label,
    when: () => enabled,
    within,
    overlay,
  });
}

/**
 * Keyboard shortcuts for the support inbox. They belong to the supplied
 * container (and the open conversation's sheet), so they run only while the
 * inbox owns focus, and there they outrank Mission Control's global Cmd+K.
 *
 * Typing is never a shortcut: an agent typing "j" inside the composer
 * doesn't walk to the next conversation.
 */
export function useInboxShortcuts(options: Options) {
  const { containerRef, paletteRef } = options;
  useInboxShortcut(OPEN_COMMAND_PALETTE, options, {
    // The open palette's dialog is this key's region.
    within:
      containerRef &&
      (() =>
        paletteRef?.current?.closest('[role="dialog"]') ??
        containerRef.current),
    overlay: paletteRef,
  });
  useInboxShortcut(NEXT_CONVERSATION, options);
  useInboxShortcut(PREVIOUS_CONVERSATION, options);
  useInboxShortcut(RESOLVE_CONVERSATION, options);
  useInboxShortcut(OPEN_SNOOZE_MENU, options);
}
