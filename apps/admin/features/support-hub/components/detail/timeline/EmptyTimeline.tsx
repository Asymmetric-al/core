"use client";

import { Inbox } from "lucide-react";

export function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-6 py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-xl bg-card shadow-sm ring-1 ring-border">
        <Inbox className="size-4 text-muted-foreground" />
      </div>
      <p className="text-xs font-medium text-foreground">No messages yet</p>
      <p className="text-xs text-muted-foreground">
        Inbound donor email will land here as soon as it arrives.
      </p>
    </div>
  );
}
