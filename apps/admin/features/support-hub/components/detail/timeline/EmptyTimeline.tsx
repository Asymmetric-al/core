"use client";

import { Inbox } from "lucide-react";

export function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-100">
        <Inbox className="size-4 text-zinc-300" />
      </div>
      <p className="text-[12px] font-medium text-zinc-700">No messages yet</p>
      <p className="text-[11px] text-zinc-500">
        Inbound donor email will land here as soon as it arrives.
      </p>
    </div>
  );
}
