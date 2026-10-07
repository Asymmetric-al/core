"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
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
import { LABEL_BADGE_VARIANTS } from "../labels/label-badge-variants";

import type { SupportConversation, SupportLabel } from "../../types";

interface ConversationHeaderProps {
  conversation: SupportConversation;
  onClose: () => void;
}

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
    <header className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          Inbox
          <span aria-hidden className="text-muted-foreground">
            /
          </span>
          <span className="text-foreground">{conversation.status}</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
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
          >
            <Check aria-hidden="true" className="text-success" />
            {isResolved ? "Resolved" : "Resolve"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close conversation detail"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
          {conversation.subject}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
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
  return <Badge variant={LABEL_BADGE_VARIANTS[label.tone]}>{label.name}</Badge>;
}
