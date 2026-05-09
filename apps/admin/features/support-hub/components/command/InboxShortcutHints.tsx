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
    <div className="border-t border-zinc-100 px-3 py-2">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
        Keyboard shortcuts
      </p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-zinc-600">
        {SUPPORT_INBOX_KEYMAP.map((entry) => (
          <li
            key={entry.action}
            className="flex items-center justify-between gap-2"
          >
            <span>{entry.label}</span>
            <Kbd className="font-mono text-[10px]">{entry.chord}</Kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}
