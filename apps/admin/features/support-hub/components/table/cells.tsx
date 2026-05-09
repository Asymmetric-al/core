"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { cn } from "@asym/ui/lib/utils";
import { AlertTriangle, Clock, UserRound } from "lucide-react";

import { useSupportNow } from "../../lib/now";
import { formatRelative, isPastDue, minutesBetween } from "../../lib/time";

import type {
  SupportAssignee,
  SupportConversation,
  SupportConversationStatus,
  SupportLabel,
  SupportLabelTone,
  SupportPriority,
} from "../../types";

const STATUS_LABELS: Record<SupportConversationStatus, string> = {
  open: "Open",
  pending: "Pending",
  snoozed: "Snoozed",
  resolved: "Resolved",
};

const STATUS_TONES: Record<SupportConversationStatus, string> = {
  open: "bg-amber-50 text-amber-700 ring-amber-200",
  pending: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  snoozed: "bg-violet-50 text-violet-700 ring-violet-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const PRIORITY_TONES: Record<SupportPriority, string> = {
  urgent: "bg-rose-50 text-rose-700 ring-rose-200",
  high: "bg-amber-50 text-amber-700 ring-amber-200",
  normal: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  low: "bg-zinc-50 text-zinc-500 ring-zinc-200",
};

const LABEL_TONES: Record<SupportLabelTone, string> = {
  zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function StatusCell({ status }: { status: SupportConversationStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-md px-2 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset",
        STATUS_TONES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityCell({ priority }: { priority: SupportPriority }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 rounded-md px-1.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset",
        PRIORITY_TONES[priority],
      )}
    >
      {priority}
    </Badge>
  );
}

export function DonorCell({ row }: { row: SupportConversation }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-[13px] font-medium text-zinc-900">
        {row.externalContactName ?? row.externalContactEmail}
      </span>
      {row.externalContactName ? (
        <span className="truncate text-[11px] text-zinc-500">
          {row.externalContactEmail}
        </span>
      ) : null}
    </div>
  );
}

export function SubjectCell({ row }: { row: SupportConversation }) {
  const nowIso = useSupportNow();
  const showAlert = row.escalatedAt !== null;
  const showPastDue =
    row.firstResponseDueAt !== null &&
    row.firstRespondedAt === null &&
    isPastDue(row.firstResponseDueAt, nowIso);
  return (
    <div className="flex min-w-0 items-center gap-2">
      {row.unreadCount > 0 ? (
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full bg-zinc-900"
        />
      ) : null}
      <span className="truncate text-[13px] font-medium text-zinc-900">
        {row.subject}
      </span>
      {showAlert ? (
        <AlertTriangle className="size-3 shrink-0 text-rose-500" />
      ) : null}
      {showPastDue ? <Clock className="size-3 shrink-0 text-rose-500" /> : null}
    </div>
  );
}

export function AssigneeCell({
  assignee,
}: {
  assignee: SupportAssignee | null;
}) {
  if (!assignee) {
    return (
      <span className="inline-flex items-center gap-2 text-[12px] text-zinc-400">
        <span
          className="flex size-6 items-center justify-center rounded-full border border-dashed border-amber-300 text-amber-600"
          aria-hidden
        >
          <UserRound className="size-3" />
        </span>
        Unassigned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar className="size-6 border border-zinc-100">
        <AvatarImage
          src={assignee.avatarUrl ?? undefined}
          alt={assignee.name}
        />
        <AvatarFallback className="text-[10px] font-semibold">
          {assignee.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-[12px] text-zinc-700">
        {assignee.name}
      </span>
    </span>
  );
}

export function LabelsCell({ labels }: { labels: SupportLabel[] }) {
  if (labels.length === 0) {
    return <span className="text-[11px] text-zinc-400">--</span>;
  }
  const visible = labels.slice(0, 2);
  const overflow = labels.length - visible.length;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((label) => (
        <span
          key={label.id}
          className={cn(
            "inline-flex h-5 items-center rounded-md px-1.5 text-[10px] font-semibold ring-1 ring-inset",
            LABEL_TONES[label.tone],
          )}
        >
          {label.name}
        </span>
      ))}
      {overflow > 0 ? (
        <span className="text-[10px] font-semibold text-zinc-400">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export function RelativeTimeCell({ value }: { value: string | null }) {
  const nowIso = useSupportNow();
  if (!value) return <span className="text-[11px] text-zinc-400">--</span>;
  return (
    <span className="font-mono text-[11px] tabular-nums text-zinc-600">
      {formatRelative(value, nowIso)}
    </span>
  );
}

/**
 * Donor-care "waiting time": for active conversations awaiting an agent it's
 * the time since the donor's most recent inbound message; otherwise dashes.
 */
export function WaitingTimeCell({ row }: { row: SupportConversation }) {
  const nowIso = useSupportNow();
  if (row.status !== "open" && row.status !== "pending") {
    return <span className="text-[11px] text-zinc-400">--</span>;
  }
  if (row.lastMessageDirection !== "inbound") {
    return <span className="text-[11px] text-zinc-400">--</span>;
  }
  const since = row.lastCustomerMessageAt ?? row.lastMessageAt;
  const minutes = minutesBetween(since, nowIso);
  if (minutes === null) {
    return <span className="text-[11px] text-zinc-400">--</span>;
  }
  const label = formatRelative(since, nowIso);
  const isOver24h = minutes >= 24 * 60;
  return (
    <span
      className={cn(
        "font-mono text-[11px] tabular-nums",
        isOver24h ? "text-rose-600" : "text-zinc-600",
      )}
    >
      {label}
    </span>
  );
}

export function InboxCell({ inboxId }: { inboxId: string }) {
  return (
    <span className="text-[11px] font-medium text-zinc-500">{inboxId}</span>
  );
}
