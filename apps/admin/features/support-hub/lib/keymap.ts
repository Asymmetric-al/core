/**
 * Support Hub keyboard surface. The table is the single source of truth for
 * the inbox shortcuts; `useInboxShortcuts` registers each entry through the
 * shared `useShortcut`, and the `<InboxShortcutHints />` footer renders it
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
  | "openSnoozeMenu";

interface SupportShortcutEntry {
  action: SupportShortcutAction;
  /** Human label rendered in the palette footer. */
  label: string;
  /**
   * Keys in `useShortcut` form: `+`-separated, `mod` is Command on Apple
   * platforms and Control elsewhere.
   */
  keys: string;
}

export const SUPPORT_INBOX_KEYMAP = [
  {
    action: "openCommandPalette",
    label: "Open command palette",
    keys: "mod+k",
  },
  { action: "nextConversation", label: "Next conversation", keys: "j" },
  { action: "previousConversation", label: "Previous conversation", keys: "k" },
  { action: "resolveConversation", label: "Resolve conversation", keys: "e" },
  { action: "openSnoozeMenu", label: "Snooze", keys: "s" },
  // No Escape entry: the open palette, menu or dialog closes itself on it.
] as const satisfies readonly SupportShortcutEntry[];
