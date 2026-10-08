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
import { LABEL_BADGE_VARIANTS } from "../labels/label-badge-variants";

import type {
  SupportAssignee,
  SupportConversation,
  SupportConversationStatus,
  SupportLabel,
  SupportPriority,
} from "../../types";

const STATUS_LABELS: Record<SupportConversationStatus, string> = {
  open: "Open",
  pending: "Pending",
  snoozed: "Snoozed",
  resolved: "Resolved",
};

const STATUS_TONES: Record<SupportConversationStatus, string> = {
  open: "bg-warning/10 text-warning ring-warning/30",
  pending: "bg-muted text-foreground ring-border",
  snoozed: "bg-chart-3/10 text-foreground ring-chart-3/30",
  resolved: "bg-success/10 text-success ring-success/30",
};

const PRIORITY_TONES: Record<SupportPriority, string> = {
  urgent: "bg-destructive/10 text-destructive ring-destructive/30",
  high: "bg-warning/10 text-warning ring-warning/30",
  normal: "bg-muted text-muted-foreground ring-border",
  low: "bg-muted/40 text-muted-foreground ring-border",
};

export function StatusCell({ status }: { status: SupportConversationStatus }) {
  return (
    <Badge variant="outline" className={STATUS_TONES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityCell({ priority }: { priority: SupportPriority }) {
  return (
    <Badge variant="outline" className={PRIORITY_TONES[priority]}>
      {priority}
    </Badge>
  );
}

export function DonorCell({ row }: { row: SupportConversation }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-xs font-medium text-foreground">
        {row.externalContactName ?? row.externalContactEmail}
      </span>
      {row.externalContactName ? (
        <span className="truncate text-xs text-muted-foreground">
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
          className="size-1.5 shrink-0 rounded-full bg-primary"
        />
      ) : null}
      <span className="truncate text-xs font-medium text-foreground">
        {row.subject}
      </span>
      {showAlert ? (
        <AlertTriangle className="size-3 shrink-0 text-destructive" />
      ) : null}
      {showPastDue ? (
        <Clock className="size-3 shrink-0 text-destructive" />
      ) : null}
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
      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className="flex size-6 items-center justify-center rounded-full border border-dashed border-warning/40 text-warning"
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
      <Avatar className="size-6 border border-border">
        <AvatarImage
          src={assignee.avatarUrl ?? undefined}
          alt={assignee.name}
        />
        <AvatarFallback className="text-xs font-semibold">
          {assignee.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-xs text-foreground">{assignee.name}</span>
    </span>
  );
}

export function LabelsCell({ labels }: { labels: SupportLabel[] }) {
  if (labels.length === 0) {
    return <span className="text-xs text-muted-foreground">--</span>;
  }
  const visible = labels.slice(0, 2);
  const overflow = labels.length - visible.length;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((label) => (
        <Badge key={label.id} variant={LABEL_BADGE_VARIANTS[label.tone]}>
          {label.name}
        </Badge>
      ))}
      {overflow > 0 ? (
        <span className="text-xs font-semibold text-muted-foreground">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export function RelativeTimeCell({ value }: { value: string | null }) {
  const nowIso = useSupportNow();
  if (!value) return <span className="text-xs text-muted-foreground">--</span>;
  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground">
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
    return <span className="text-xs text-muted-foreground">--</span>;
  }
  if (row.lastMessageDirection !== "inbound") {
    return <span className="text-xs text-muted-foreground">--</span>;
  }
  const since = row.lastCustomerMessageAt ?? row.lastMessageAt;
  const minutes = minutesBetween(since, nowIso);
  if (minutes === null) {
    return <span className="text-xs text-muted-foreground">--</span>;
  }
  const label = formatRelative(since, nowIso);
  const isOver24h = minutes >= 24 * 60;
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        isOver24h ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export function InboxCell({ inboxId }: { inboxId: string }) {
  return (
    <span className="text-xs font-medium text-muted-foreground">{inboxId}</span>
  );
}
