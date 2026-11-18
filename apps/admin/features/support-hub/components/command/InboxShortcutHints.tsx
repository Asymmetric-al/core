"use client";

import {
  ShortcutHint,
  useShortcutHint,
} from "@asym/ui/components/primitives/shortcut";

import { SUPPORT_INBOX_KEYMAP } from "../../lib/keymap";

function InboxShortcut({ label, keys }: { label: string; keys: string }) {
  const { ariaKeyshortcuts } = useShortcutHint(keys);
  return (
    <li className="flex items-center justify-between gap-2">
      <span>{label}</span>
      {/* The chord is drawn for the eye; screen readers hear the key names. */}
      <span className="sr-only">{ariaKeyshortcuts}</span>
      <ShortcutHint keys={keys} />
    </li>
  );
}

/**
 * Small footer rendered inside the command palette so agents can discover
 * the inbox keyboard shortcuts. Kept compact — pulls straight from the
 * keymap so the table stays in one place, with each chord written the way
 * this platform writes it.
 */
export function InboxShortcutHints() {
  return (
    <div className="border-t border-border px-3 py-2">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Keyboard shortcuts
      </p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {SUPPORT_INBOX_KEYMAP.map((entry) => (
          <InboxShortcut
            key={entry.action}
            label={entry.label}
            keys={entry.keys}
          />
        ))}
      </ul>
    </div>
  );
}
