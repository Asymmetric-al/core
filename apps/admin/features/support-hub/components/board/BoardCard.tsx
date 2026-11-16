"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { cn } from "@asym/ui/lib/utils";
import {
  AlertTriangle,
  Clock,
  Mail,
  UserRound,
  MoreHorizontal,
} from "lucide-react";
import * as React from "react";

import { labelsWithoutName } from "../../lib/selectors";
import { CONVERSATION_STATUS_LABELS } from "../../lib/status-labels";
import { isPastDue } from "../../lib/time";
import { LABEL_BADGE_VARIANTS } from "../labels/label-badge-variants";
import { RelativeTime } from "../RelativeTime";

import type { SupportConversation, SupportLabel } from "../../types";

interface BoardCardProps {
  conversation: SupportConversation;
  isSelected: boolean;
  isDragging: boolean;
  /**
   * Stable per-render timestamp from the parent — keeps the card render pure
   * (React Compiler / `react-hooks/purity` requires no `Date.now()` in render).
   */
  nowIso: string;
  onSelect: (id: string) => void;
  onMove?: (id: string, status: SupportConversation["status"]) => void;
  movePending?: boolean;
  onCardKeyDown?: (
    event: React.KeyboardEvent<HTMLButtonElement>,
    conversation: SupportConversation,
  ) => void;
  dragHandleProps: {
    draggable: true;
    onDragStart: (event: React.DragEvent<HTMLElement>) => void;
    onDragEnd: () => void;
  };
}

/** The badge the card shows for a raised priority; none for normal or low. */
function priorityBadgeLabel(
  priority: SupportConversation["priority"],
): "Urgent" | "High" | null {
  if (priority === "urgent") return "Urgent";
  if (priority === "high") return "High";
  return null;
}

/** "A", "A and B", "A, B and C": keeps the list apart from what follows. */
function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/**
 * The card's name says what the card shows, in reading order: the unread
 * dot, subject, donor, status, priority badge and labels, then the owner and
 * warnings. A label named like the priority badge is not repeated.
 */
function boardCardAriaLabel({
  conversation,
  isUnread,
  isFirstReplyPastDue,
  isEscalated,
}: {
  conversation: SupportConversation;
  isUnread: boolean;
  isFirstReplyPastDue: boolean;
  isEscalated: boolean;
}) {
  const priority = priorityBadgeLabel(conversation.priority);
  const labels = labelsWithoutName(conversation.labels, priority).map(
    (label) => label.name,
  );
  return [
    isUnread ? "Unread" : null,
    conversation.subject,
    `from ${
      conversation.externalContactName ?? conversation.externalContactEmail
    }`,
    `status ${conversation.status}`,
    priority ? `${priority.toLowerCase()} priority` : null,
    labels.length > 0
      ? `${labels.length === 1 ? "label" : "labels"} ${joinWithAnd(labels)}`
      : null,
    conversation.assignee
      ? `assigned to ${conversation.assignee.name}`
      : "unassigned",
    isFirstReplyPastDue ? "past due" : null,
    isEscalated ? "escalated" : null,
  ]
    .filter(Boolean)
    .join(", ");
}

function BoardCardHeader({
  conversation,
  isUnread,
}: {
  conversation: SupportConversation;
  isUnread: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5 truncate">
        {isUnread ? (
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full bg-foreground"
          />
        ) : null}
        <span className="truncate font-medium text-foreground">
          {conversation.externalContactName ??
            conversation.externalContactEmail}
        </span>
      </span>
      <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
        <RelativeTime value={conversation.lastMessageAt} compact />
      </span>
    </header>
  );
}

function BoardCardAssignee({
  conversation,
  isUnassigned,
}: {
  conversation: SupportConversation;
  isUnassigned: boolean;
}) {
  if (conversation.assignee) {
    return (
      <Avatar size="sm">
        <AvatarImage
          src={conversation.assignee.avatarUrl ?? undefined}
          alt={conversation.assignee.name}
        />
        <AvatarFallback>{conversation.assignee.name.charAt(0)}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-full border border-dashed",
        isUnassigned
          ? "border-warning/40 text-warning"
          : "border-border text-muted-foreground",
      )}
      aria-hidden="true"
    >
      <UserRound className="size-3" />
    </span>
  );
}

function BoardCardFooter({
  conversation,
  isFirstReplyPastDue,
  isEscalated,
  isUnassigned,
  actions,
}: {
  actions?: React.ReactNode;
  conversation: SupportConversation;
  isFirstReplyPastDue: boolean;
  isEscalated: boolean;
  isUnassigned: boolean;
}) {
  const priorityBadge = priorityBadgeLabel(conversation.priority);
  // A label named like the priority badge ("Urgent") would repeat it.
  const labels = labelsWithoutName(conversation.labels, priorityBadge);
  return (
    <footer className="mt-1 flex items-end justify-between gap-2">
      {/* One line in any lane width: the priority keeps its size and a long
          label truncates, its full name on hover and in the conversation. */}
      <div className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
        {priorityBadge ? (
          <Badge
            variant={
              conversation.priority === "urgent" ? "destructive" : "warning"
            }
            className="shrink-0"
          >
            {priorityBadge}
          </Badge>
        ) : null}
        {labels.slice(0, 2).map((label) => (
          <LabelChip key={label.id} label={label} />
        ))}
        {labels.length > 2 ? (
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
            +{labels.length - 2}
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {isFirstReplyPastDue ? (
          <Clock className="size-3 text-destructive" aria-label="Past due" />
        ) : null}
        {isEscalated ? (
          <AlertTriangle
            className="size-3 text-destructive"
            aria-label="Escalated"
          />
        ) : null}
        {conversation.channel === "email" ? (
          <Mail
            className="size-3 text-muted-foreground"
            aria-label="Email channel"
          />
        ) : null}
        <BoardCardAssignee
          conversation={conversation}
          isUnassigned={isUnassigned}
        />
        {actions}
      </div>
    </footer>
  );
}

/**
 * Compact donor-care card for the kanban board. Reads donor name, subject,
 * waiting time, assignee, label cluster, and priority/escalation accents.
 */
export function BoardCard({
  conversation,
  isSelected,
  isDragging,
  nowIso,
  onSelect,
  onMove,
  movePending,
  onCardKeyDown,
  dragHandleProps,
}: BoardCardProps) {
  const isFirstReplyPastDue =
    conversation.firstRespondedAt === null &&
    isPastDue(conversation.firstResponseDueAt, nowIso);

  const isUnread = conversation.unreadCount > 0;
  const isEscalated = conversation.escalatedAt !== null;
  const isUnassigned = conversation.assignee === null;

  return (
    <article
      {...dragHandleProps}
      data-conversation-id={conversation.id}
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm transition-shadow",
        "border-border [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md focus-within:shadow-md",
        isFirstReplyPastDue && "border-l-2 border-l-destructive/40",
        isEscalated && "ring-1 ring-destructive/30",
        isSelected && "ring-1 ring-foreground",
        isDragging && "opacity-60",
      )}
    >
      {/* Extend the open button over the card; the menu sits above it as a
          sibling, so the metadata needs no extra row or nested button. */}
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        onKeyDown={(event) => onCardKeyDown?.(event, conversation)}
        aria-current={isSelected}
        aria-label={boardCardAriaLabel({
          conversation,
          isUnread,
          isFirstReplyPastDue,
          isEscalated,
        })}
        className="flex w-full flex-col gap-2 text-left after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
      >
        <BoardCardHeader conversation={conversation} isUnread={isUnread} />

        <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
          {conversation.subject}
        </p>
      </button>
      <BoardCardFooter
        conversation={conversation}
        isFirstReplyPastDue={isFirstReplyPastDue}
        isEscalated={isEscalated}
        isUnassigned={isUnassigned}
        actions={
          onMove ? (
            <div className="relative z-10">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Move conversation"
                      disabled={movePending}
                    >
                      <MoreHorizontal aria-hidden="true" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Move to</DropdownMenuLabel>
                    {(
                      Object.keys(
                        CONVERSATION_STATUS_LABELS,
                      ) as SupportConversation["status"][]
                    )
                      .filter((status) => status !== conversation.status)
                      .map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => onMove(conversation.id, status)}
                        >
                          {CONVERSATION_STATUS_LABELS[status]}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null
        }
      />
    </article>
  );
}

function LabelChip({ label }: { label: SupportLabel }) {
  // The wrapper may shrink in a narrow lane; the badge then truncates its
  // name, and the full name stays in the tooltip.
  return (
    <span title={label.name} className="flex min-w-0 shrink">
      <Badge variant={LABEL_BADGE_VARIANTS[label.tone]} className="max-w-full">
        <span className="truncate">{label.name}</span>
      </Badge>
    </span>
  );
}
