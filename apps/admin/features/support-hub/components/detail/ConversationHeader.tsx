"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Check, X } from "lucide-react";

import { RelativeTime } from "../RelativeTime";
import { ConversationAssigneeMenu } from "./ConversationAssigneeMenu";
import { ConversationContactSidecar } from "./ConversationContactSidecar";
import { ConversationLabelMenu } from "./ConversationLabelMenu";
import { ConversationMacrosMenu } from "./ConversationMacrosMenu";
import { ConversationPriorityMenu } from "./ConversationPriorityMenu";
import { ConversationSlaChip } from "./ConversationSlaChip";
import { ConversationSnoozeMenu } from "./ConversationSnoozeMenu";
import { ConversationStatusMenu } from "./ConversationStatusMenu";
import { useResolveSupportConversation } from "../../hooks/use-resolve-support-conversation";
import { useSupportInboxSettings } from "../../hooks/use-support-inbox-settings";
import { CONVERSATION_STATUS_LABELS } from "../../lib/status-labels";
import { LABEL_BADGE_VARIANTS } from "../labels/label-badge-variants";

import type { SupportConversation, SupportLabel } from "../../types";

interface ConversationHeaderProps {
  conversation: SupportConversation;
  onClose: () => void;
}

/**
 * Top of the detail pane:
 *   1. Status crumb + close button + Resolve / Snooze quick actions.
 *   2. Subject + last-activity stamp + SLA chip.
 *   3. Donor identity sidecar (unless the conversation's inbox turns the
 *      donor panel off), then one wrapping row of status, assignee,
 *      priority and labels.
 */
export function ConversationHeader({
  conversation,
  onClose,
}: ConversationHeaderProps) {
  const resolveConversation = useResolveSupportConversation();
  const isResolved = conversation.status === "resolved";
  // Inbox identity settings own the donor panel. An inbox without a saved
  // record (or settings still loading) keeps the stored default: shown.
  const { data: inboxSettings } = useSupportInboxSettings(conversation.inboxId);
  const showDonorPanel = inboxSettings?.showContactSidecar !== false;

  return (
    // A container: the desktop pane is a third of the page, so the header
    // lays itself out by its own width, not the viewport's.
    <header className="@container flex flex-col gap-3 border-b border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          Inbox
          <span aria-hidden className="text-muted-foreground">
            /
          </span>
          <span className="text-foreground">
            {CONVERSATION_STATUS_LABELS[conversation.status]}
          </span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <ConversationMacrosMenu conversation={conversation} />
          <ConversationSnoozeMenu conversation={conversation} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isResolved}
            onClick={() => void resolveConversation(conversation)}
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
        <h2 className="line-clamp-2 min-w-0 flex-1 text-base font-semibold break-words text-foreground">
          {conversation.subject}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            <RelativeTime value={conversation.lastMessageAt} />
          </span>
          <ConversationSlaChip conversation={conversation} />
        </div>
      </div>

      <div className="flex flex-col gap-3 @md:flex-row @md:items-stretch @md:justify-between">
        {showDonorPanel ? (
          <div className="@md:max-w-xs @md:flex-1">
            <ConversationContactSidecar conversation={conversation} />
          </div>
        ) : null}
        {/* One wrapping row: two stacked rows took height from the thread
            in the one-screen desktop pane. */}
        <div
          role="group"
          aria-label="Conversation settings"
          className="flex flex-1 flex-wrap items-center gap-1.5 @md:content-start @md:justify-end"
        >
          <ConversationStatusMenu conversation={conversation} />
          <ConversationAssigneeMenu conversation={conversation} />
          <ConversationPriorityMenu conversation={conversation} />
          {conversation.labels.map((label) => (
            <LabelChip key={label.id} label={label} />
          ))}
          <ConversationLabelMenu conversation={conversation} compact />
        </div>
      </div>
    </header>
  );
}

function LabelChip({ label }: { label: SupportLabel }) {
  return <Badge variant={LABEL_BADGE_VARIANTS[label.tone]}>{label.name}</Badge>;
}
