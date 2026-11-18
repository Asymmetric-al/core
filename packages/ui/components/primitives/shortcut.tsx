"use client";

import {
  ariaKeyshortcuts,
  formatShortcut,
  matchesShortcut,
} from "@ui-sdk/core/shortcuts";
import {
  shortcuts,
  useShortcut as useSdkShortcut,
  useShortcutHint as useSdkShortcutHint,
} from "@ui-sdk/react/shortcuts";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { Kbd } from "../shadcn/kbd";

import type { ComponentProps, RefObject } from "react";

type ElementSource =
  RefObject<Element | null> | (() => Element | null | undefined);

export type ShortcutOptions = {
  /** What the shortcut does, for `listShortcuts()` and help surfaces. */
  description?: string;
  /** Checked on every press. The key is left alone while it returns false. */
  when?: () => boolean;
  /** Run while focus is in a text field. Off by default, also for `mod` keys. */
  allowInInput?: boolean;
  /**
   * Run whatever dialog or menu holds focus, for a key the page must always
   * take from the browser, like Save. Off by default.
   */
  allowInOverlay?: boolean;
  /** Run again while the key is held, like undo in an editor. Off by default. */
  repeat?: boolean;
  /**
   * Limit the shortcut to one region: it runs only while focus is inside it.
   * A region inside a dialog or menu keeps its shortcut while that is open.
   */
  within?: ElementSource;
  /**
   * An element inside the dialog or menu this shortcut opens. A page shortcut
   * keeps running while that overlay, and no other, holds focus, also in its
   * text field, so the keys that opened it close it.
   */
  overlay?: ElementSource;
};

const elementOf = (source: ElementSource | undefined) =>
  (typeof source === "function" ? source() : source?.current) ?? null;

// Text entry only, as UI SDK judges typing: a slider, checkbox, radio, file or
// button input takes no letters, so it must not block a shortcut.
const NOT_TEXT_INPUTS = [
  "checkbox",
  "radio",
  "range",
  "file",
  "button",
  "submit",
  "reset",
  "image",
  "color",
]
  .map((type) => `:not([type="${type}"])`)
  .join("");
const EDITABLE = `input${NOT_TEXT_INPUTS}, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]`;
const OVERLAY =
  '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';
const OPEN_MODAL =
  '[role="dialog"][data-open], [role="alertdialog"][data-open]';

// UI SDK only pauses page shortcuts for its own popups, so find Base UI's.
function overlayOwningKeyboard(active: Element | null) {
  const around = active?.closest(OVERLAY);
  if (around) return around;
  return !active || active === document.body
    ? document.querySelector(OPEN_MODAL)
    : null;
}

function canRun({
  allowInInput,
  allowInOverlay,
  overlay,
  when,
  within,
}: ShortcutOptions) {
  if (when && !when()) return false;
  const active = document.activeElement;
  const region = elementOf(within);
  if (within && !region?.contains(active)) return false;
  const owner = allowInOverlay ? null : overlayOwningKeyboard(active);
  const opened = elementOf(overlay);
  const inOpened = Boolean(owner && opened && owner.contains(opened));
  if (!allowInInput && !inOpened && active?.closest(EDITABLE)) return false;
  if (!owner) return true;
  return inOpened || Boolean(region && owner.contains(region));
}

// UI SDK runs whichever same-key shortcut registered last. In Core a region's
// shortcut outranks a page shortcut while focus is in that region, so the
// winner never depends on mount order.
const regionClaims = new Map<string, Set<() => boolean>>();

// The keys as UI SDK names them on this platform, modifiers sorted:
// "shift+mod+k" and "mod+shift+k", "esc" and "escape", and on Windows
// "ctrl" and "mod" are the same keys.
function keysId(keys: string) {
  const parts = ariaKeyshortcuts(keys).toLowerCase().split("+");
  const key = parts.pop() ?? "";
  return [...parts.sort(), key].join("+");
}

function claimedByRegion(keys: string) {
  for (const claim of regionClaims.get(keys) ?? []) if (claim()) return true;
  return false;
}

// UI SDK ignores a held key without taking it, so a held Save would reach the
// browser's "Save page". Take repeats of a shortcut that would run now, and
// run the ones that ask to repeat.
type HeldShortcut = {
  keys: string;
  takes: () => boolean;
  repeat: (event: KeyboardEvent) => void;
};
const held = new Set<HeldShortcut>();

function takeHeldKey(event: KeyboardEvent) {
  if (!event.repeat || event.defaultPrevented || event.isComposing) return;
  // Newest first, as UI SDK picks among same-key shortcuts for the first press.
  for (const shortcut of [...held].reverse()) {
    if (matchesShortcut(event, shortcut.keys) && shortcut.takes()) {
      event.preventDefault();
      shortcut.repeat(event);
      return;
    }
  }
}

function holdKeys(shortcut: HeldShortcut) {
  if (!held.size) document.addEventListener("keydown", takeHeldKey);
  held.add(shortcut);
  return () => {
    held.delete(shortcut);
    if (!held.size) document.removeEventListener("keydown", takeHeldKey);
  };
}

/**
 * Registers a keyboard shortcut while the component is mounted. UI SDK owns
 * the single key listener, `mod` (Command on Apple platforms, Control
 * elsewhere), key repeat and handlers that already took the key. This wrapper
 * adds what the SDK cannot know in Core: typing always wins, a Base UI
 * dialog, menu or listbox pauses page shortcuts, and a region's shortcut
 * outranks the page's. Pass `null` to register nothing.
 */
export function useShortcut(
  keys: string | null | undefined,
  handler: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {},
) {
  const claimKeys = keys && options.within ? keysId(keys) : null;
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });
  const takes = () =>
    canRun(latest.current) &&
    (Boolean(latest.current.within) || !keys || !claimedByRegion(keysId(keys)));
  useEffect(() => {
    if (!claimKeys) return;
    const claim = () => canRun(latest.current);
    const claims = regionClaims.get(claimKeys) ?? new Set();
    regionClaims.set(claimKeys, claims.add(claim));
    return () => {
      claims.delete(claim);
    };
  }, [claimKeys]);

  const latestRun = useRef({ takes, handler });
  useEffect(() => {
    latestRun.current = { takes, handler };
  });
  const { allowInInput, description } = options;
  // Registered again whenever UI SDK registers the shortcut again, so a held
  // key picks among same-key shortcuts in the order the first press did.
  useEffect(() => {
    if (!keys) return;
    return holdKeys({
      keys,
      takes: () => latestRun.current.takes(),
      repeat: (event) => {
        if (latest.current.repeat) latestRun.current.handler(event);
      },
    });
  }, [keys, allowInInput, description]);

  useSdkShortcut(keys, handler, {
    allowInInput: options.allowInInput,
    description: options.description,
    when: takes,
  });
}

const subscribeToNothing = () => () => {};

/**
 * The keys as this platform writes them (`⌘K` or `Ctrl+K`) with the matching
 * `aria-keyshortcuts`. The server and the first client render agree on the
 * non-Apple form; `platformKnown` turns true after hydration, for hints that
 * should wait rather than show the wrong keys.
 */
export function useShortcutHint(keys: string) {
  const hint = useSdkShortcutHint(keys);
  const platformKnown = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  // UI SDK's hint starts on the server's platform and corrects in an effect,
  // which a hint mounted after hydration would paint for one frame.
  return platformKnown
    ? {
        text: formatShortcut(keys),
        ariaKeyshortcuts: ariaKeyshortcuts(keys),
        platformKnown,
      }
    : { ...hint, platformKnown };
}

/** A visual key hint. It renders once the platform is known and is hidden from assistive technology: put `aria-keyshortcuts` on the control. */
export function ShortcutHint({
  keys,
  ...props
}: { keys: string } & Omit<ComponentProps<typeof Kbd>, "children">) {
  const { text, platformKnown } = useShortcutHint(keys);
  return platformKnown ? (
    <Kbd aria-hidden="true" {...props}>
      {text}
    </Kbd>
  ) : null;
}

/** The shortcuts that would run now, oldest first, for a help surface. */
export function listShortcuts() {
  return shortcuts.list();
}
