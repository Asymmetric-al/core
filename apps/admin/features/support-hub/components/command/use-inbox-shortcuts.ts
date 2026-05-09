"use client";

import * as React from "react";

import {
  findSupportShortcut,
  type SupportShortcutAction,
} from "../../lib/keymap";

export type SupportShortcutHandler = (event: KeyboardEvent) => void;

export type SupportShortcutHandlers = Partial<
  Record<SupportShortcutAction, SupportShortcutHandler>
>;

interface Options {
  /** Container the listener attaches to. Defaults to `document` if omitted. */
  containerRef?: React.RefObject<HTMLElement | null>;
  handlers: SupportShortcutHandlers;
  /** When false, the listener stays detached. Useful while the palette is open. */
  enabled?: boolean;
}

/**
 * Scoped keyboard listener for the support inbox. Attaches to the supplied
 * container ref so the shortcuts only fire while the inbox owns focus —
 * Mission Control's global Cmd+K dialog stays untouched.
 *
 * Inputs and the editor selectively block the listener via
 * `event.target.matches(...)` so an agent typing "j" inside the composer
 * doesn't accidentally walk to the next conversation.
 */
export function useInboxShortcuts({
  containerRef,
  handlers,
  enabled = true,
}: Options) {
  React.useEffect(() => {
    if (!enabled) return;
    const target = containerRef?.current ?? null;
    const node: EventTarget = target ?? document;

    const listener = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (shouldIgnore(keyboardEvent.target)) return;
      const entry = findSupportShortcut(keyboardEvent);
      if (!entry) return;
      const handler = handlers[entry.action];
      if (!handler) return;
      keyboardEvent.preventDefault();
      handler(keyboardEvent);
    };

    node.addEventListener("keydown", listener);
    return () => node.removeEventListener("keydown", listener);
  }, [containerRef, enabled, handlers]);
}

function shouldIgnore(target: EventTarget | null): boolean {
  if (!target) return false;
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return target.matches("input, textarea, select, [contenteditable]");
}
