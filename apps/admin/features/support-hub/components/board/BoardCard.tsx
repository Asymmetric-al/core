"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { cn } from "@asym/ui/lib/utils";
import { AlertTriangle, Clock, Mail, UserRound } from "lucide-react";
import * as React from "react";

import { formatRelative, isPastDue } from "../../lib/time";

import type {
  SupportConversation,
  SupportLabel,
  SupportLabelTone,
} from "../../types";

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

const LABEL_TONE_CLASSES: Record<SupportLabelTone, string> = {
  zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

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
        "group rounded-2xl border bg-white shadow-sm transition-shadow",
        "border-zinc-100 hover:shadow-md focus-within:shadow-md",
        isFirstReplyPastDue && "border-l-2 border-l-rose-300",
        isEscalated && "ring-1 ring-rose-200",
        isSelected && "ring-1 ring-zinc-900",
        isDragging && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        onKeyDown={(event) => onCardKeyDown?.(event, conversation)}
        className="flex w-full flex-col gap-2 rounded-2xl p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        aria-label={`${conversation.subject} from ${
          conversation.externalContactName ?? conversation.externalContactEmail
        }`}
      >
        <header className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5 truncate">
            {isUnread ? (
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-zinc-900"
              />
            ) : null}
            <span className="truncate font-medium text-zinc-700">
              {conversation.externalContactName ??
                conversation.externalContactEmail}
            </span>
          </span>
          <span className="shrink-0 font-mono tabular-nums text-zinc-400">
            {formatRelative(conversation.lastMessageAt, nowIso)}
          </span>
        </header>

        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-900">
          {conversation.subject}
        </p>

        <footer className="mt-1 flex items-end justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {(conversation.priority === "urgent" ||
              conversation.priority === "high") && (
              <Badge
                variant="outline"
                className={cn(
                  "h-5 rounded-md px-1.5 text-[10px] font-bold uppercase tracking-wider",
                  conversation.priority === "urgent"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                )}
              >
                {conversation.priority}
              </Badge>
            )}
            {conversation.labels.slice(0, 2).map((label) => (
              <LabelChip key={label.id} label={label} />
            ))}
            {conversation.labels.length > 2 ? (
              <span className="text-[10px] font-semibold text-zinc-400">
                +{conversation.labels.length - 2}
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {isFirstReplyPastDue ? (
              <Clock className="size-3 text-rose-500" aria-label="Past due" />
            ) : null}
            {isEscalated ? (
              <AlertTriangle
                className="size-3 text-rose-500"
                aria-label="Escalated"
              />
            ) : null}
            {conversation.channel === "email" ? (
              <Mail
                className="size-3 text-zinc-300"
                aria-label="Email channel"
              />
            ) : null}
            {conversation.assignee ? (
              <Avatar className="size-6 border border-zinc-100">
                <AvatarImage
                  src={conversation.assignee.avatarUrl ?? undefined}
                  alt={conversation.assignee.name}
                />
                <AvatarFallback className="text-[10px] font-semibold">
                  {conversation.assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border border-dashed",
                  isUnassigned
                    ? "border-amber-300 text-amber-600"
                    : "border-zinc-200 text-zinc-300",
                )}
                aria-label="Unassigned"
              >
                <UserRound className="size-3" />
              </span>
            )}
          </div>
        </footer>
      </button>
    </article>
  );
}

function LabelChip({ label }: { label: SupportLabel }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-md px-1.5 text-[10px] font-semibold ring-1 ring-inset",
        LABEL_TONE_CLASSES[label.tone],
      )}
    >
      {label.name}
    </span>
  );
}
