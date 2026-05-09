"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { Check, X } from "lucide-react";

import { ConversationAssigneeMenu } from "./ConversationAssigneeMenu";
import { ConversationContactSidecar } from "./ConversationContactSidecar";
import { ConversationLabelMenu } from "./ConversationLabelMenu";
import { ConversationMacrosMenu } from "./ConversationMacrosMenu";
import { ConversationPriorityMenu } from "./ConversationPriorityMenu";
import { ConversationSlaChip } from "./ConversationSlaChip";
import { ConversationSnoozeMenu } from "./ConversationSnoozeMenu";
import { ConversationStatusMenu } from "./ConversationStatusMenu";
import { useSetSupportConversationStatus } from "../../hooks/use-support-mutations";
import { useSupportNow } from "../../lib/now";
import { formatRelative } from "../../lib/time";

import type {
  SupportConversation,
  SupportLabel,
  SupportLabelTone,
} from "../../types";

interface ConversationHeaderProps {
  conversation: SupportConversation;
  onClose: () => void;
}

const LABEL_TONE_CLASSES: Record<SupportLabelTone, string> = {
  zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

/**
 * Top of the detail pane. Three rows:
 *   1. Status crumb + close button + Resolve / Snooze quick actions.
 *   2. Subject + last-activity stamp + SLA chip.
 *   3. Donor identity sidecar + label cluster + assignee + status + priority menus.
 */
export function ConversationHeader({
  conversation,
  onClose,
}: ConversationHeaderProps) {
  const setStatus = useSetSupportConversationStatus();
  const nowIso = useSupportNow();
  const isResolved = conversation.status === "resolved";

  return (
    <header className="flex flex-col gap-3 border-b border-zinc-100 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Inbox
          <span aria-hidden className="text-zinc-300">
            /
          </span>
          <span className="text-zinc-700">{conversation.status}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <ConversationMacrosMenu conversation={conversation} />
          <ConversationSnoozeMenu conversation={conversation} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isResolved}
            onClick={() =>
              setStatus.mutate({
                conversationId: conversation.id,
                status: "resolved",
              })
            }
            className="h-8 gap-1.5 rounded-lg border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
          >
            <Check className="size-3.5" />
            {isResolved ? "Resolved" : "Resolve"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close conversation detail"
            className="size-8 text-zinc-400 hover:text-zinc-700"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-900">
          {conversation.subject}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[11px] tabular-nums text-zinc-400">
            {formatRelative(conversation.lastMessageAt, nowIso)}
          </span>
          <ConversationSlaChip conversation={conversation} />
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="lg:max-w-xs lg:flex-1">
          <ConversationContactSidecar conversation={conversation} />
        </div>
        <div className="flex flex-1 flex-col items-end gap-2">
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {conversation.labels.map((label) => (
              <LabelChip key={label.id} label={label} />
            ))}
            <ConversationLabelMenu conversation={conversation} compact />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <ConversationStatusMenu conversation={conversation} />
            <ConversationAssigneeMenu conversation={conversation} />
            <ConversationPriorityMenu conversation={conversation} />
          </div>
        </div>
      </div>
    </header>
  );
}

function LabelChip({ label }: { label: SupportLabel }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-md px-2 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
        LABEL_TONE_CLASSES[label.tone],
      )}
    >
      {label.name}
    </Badge>
  );
}
