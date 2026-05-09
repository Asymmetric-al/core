"use client";

import { MessageSquare } from "lucide-react";

/**
 * Quiet "pick a conversation" state shown in the right rail when no
 * conversation id is selected.
 */
export function ConversationDetailEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-zinc-50 ring-1 ring-zinc-100">
        <MessageSquare className="size-5 text-zinc-300" />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-zinc-900">
          Pick a conversation
        </p>
        <p className="mt-1 max-w-xs text-[12px] text-zinc-500">
          Select any board card or table row to read the email thread, leave an
          internal note, or reply to the donor.
        </p>
      </div>
    </div>
  );
}
