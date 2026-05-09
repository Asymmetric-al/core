"use client";

import { cn } from "@asym/ui/lib/utils";
import { Activity } from "lucide-react";

import { useSupportNow } from "../../../lib/now";
import { formatRelative } from "../../../lib/time";

import type { SupportMessage } from "../../../types";

interface ActivityEntryProps {
  message: SupportMessage;
}

/**
 * Compact activity log line for system events (status changes, escalations,
 * macro runs, etc.). Phase 2's `support_messages.type === "system"` rows feed
 * directly into this renderer.
 */
export function ActivityEntry({ message }: ActivityEntryProps) {
  const nowIso = useSupportNow();
  return (
    <li
      className={cn(
        "flex items-center gap-2 px-1 py-1 text-[12px] text-zinc-500",
      )}
      aria-label="Activity entry"
    >
      <span className="flex size-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        <Activity className="size-3" />
      </span>
      <span className="min-w-0 flex-1 truncate">
        <span className="font-medium text-zinc-700">{message.author.name}</span>{" "}
        {message.body.text || "updated this conversation."}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-zinc-400">
        {formatRelative(message.postedAt, nowIso)}
      </span>
    </li>
  );
}
