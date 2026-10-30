"use client";

import { Kbd } from "@asym/ui/components/shadcn/kbd";

import { SUPPORT_INBOX_KEYMAP } from "../../lib/keymap";

/**
 * Small footer rendered inside the command palette so agents can discover
 * the inbox keyboard shortcuts. Kept compact — pulls straight from the
 * keymap so the table stays in one place.
 */
export function InboxShortcutHints() {
  return (
    <div className="border-t border-border px-3 py-2">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Keyboard shortcuts
      </p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {SUPPORT_INBOX_KEYMAP.map((entry) => (
          <li
            key={entry.action}
            className="flex items-center justify-between gap-2"
          >
            <span>{entry.label}</span>
            <Kbd>{entry.chord}</Kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}
