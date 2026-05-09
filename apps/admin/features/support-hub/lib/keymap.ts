/**
 * Support Hub keyboard surface. The table is the single source of truth for
 * the inbox shortcuts; `useInboxShortcuts` consumes it to register
 * `keydown` handlers, and the `<InboxShortcutHints />` footer renders it
 * inside the command palette so the agent can discover the shortcuts
 * without leaving the page.
 *
 * Phase 6 extends this surface — add new entries here, do not register
 * one-off `addEventListener` calls inside components.
 */

export type SupportShortcutAction =
  | "openCommandPalette"
  | "nextConversation"
  | "previousConversation"
  | "resolveConversation"
  | "openSnoozeMenu"
  | "closeOverlay";

export interface SupportShortcutEntry {
  action: SupportShortcutAction;
  /** Human label rendered in the palette footer. */
  label: string;
  /** Display text for the `<Kbd />` chip. */
  chord: string;
  /** Underlying KeyboardEvent.key the listener matches. */
  key: string;
  /** When true, listener requires Cmd (mac) or Ctrl (other). */
  meta?: boolean;
  /** When true, listener requires Shift. */
  shift?: boolean;
  /** When true, listener requires Alt. */
  alt?: boolean;
}

export const SUPPORT_INBOX_KEYMAP: SupportShortcutEntry[] = [
  {
    action: "openCommandPalette",
    label: "Open command palette",
    chord: "Cmd K",
    key: "k",
    meta: true,
  },
  {
    action: "nextConversation",
    label: "Next conversation",
    chord: "j",
    key: "j",
  },
  {
    action: "previousConversation",
    label: "Previous conversation",
    chord: "k",
    key: "k",
  },
  {
    action: "resolveConversation",
    label: "Resolve conversation",
    chord: "e",
    key: "e",
  },
  {
    action: "openSnoozeMenu",
    label: "Snooze",
    chord: "s",
    key: "s",
  },
  {
    action: "closeOverlay",
    label: "Close overlay",
    chord: "Esc",
    key: "Escape",
  },
];

/**
 * Look up an entry by its keyboard event without scanning the table at every
 * keystroke. The map is built once at module load.
 */
const ENTRY_BY_KEY: Map<string, SupportShortcutEntry> = new Map(
  SUPPORT_INBOX_KEYMAP.map((entry) => [shortcutKey(entry), entry] as const),
);

export function findSupportShortcut(
  event: Pick<
    KeyboardEvent,
    "key" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey"
  >,
): SupportShortcutEntry | null {
  const meta = event.metaKey || event.ctrlKey;
  return (
    ENTRY_BY_KEY.get(
      buildLookupKey(event.key, meta, event.shiftKey, event.altKey),
    ) ?? null
  );
}

function shortcutKey(entry: SupportShortcutEntry): string {
  return buildLookupKey(
    entry.key,
    Boolean(entry.meta),
    Boolean(entry.shift),
    Boolean(entry.alt),
  );
}

function buildLookupKey(
  rawKey: string,
  meta: boolean,
  shift: boolean,
  alt: boolean,
): string {
  return [
    meta ? "M" : "",
    shift ? "S" : "",
    alt ? "A" : "",
    rawKey.toLowerCase(),
  ].join("|");
}
