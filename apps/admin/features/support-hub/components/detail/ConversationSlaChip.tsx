"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";

import { useSupportNow } from "../../lib/now";
import { formatRelative, isPastDue, minutesBetween } from "../../lib/time";

import type { SupportConversation } from "../../types";

interface ConversationSlaChipProps {
  conversation: SupportConversation;
  /** Minutes-of-buffer before the chip flips to "at risk" tone. */
  riskThresholdMinutes?: number;
}

/**
 * Compact SLA indicator. Reads `useSupportNow()` so the render stays pure
 * under the React Compiler purity rule and the value updates on the inbox
 * tick.
 */
export function ConversationSlaChip({
  conversation,
  riskThresholdMinutes = 60,
}: ConversationSlaChipProps) {
  const nowIso = useSupportNow();

  if (conversation.status === "resolved" || conversation.status === "snoozed") {
    return null;
  }

  const due =
    conversation.firstRespondedAt === null
      ? conversation.firstResponseDueAt
      : conversation.nextResponseDueAt;

  if (!due) return null;

  const overdue = isPastDue(due, nowIso);
  const minutes = minutesBetween(nowIso, due);
  const isAtRisk =
    !overdue && minutes !== null && minutes <= riskThresholdMinutes;

  if (overdue) {
    return (
      <Badge variant="destructive-subtle">
        <AlertTriangle aria-hidden="true" className="size-3" />
        {`Reply overdue by ${formatRelative(due, nowIso)}`}
      </Badge>
    );
  }
  if (isAtRisk) {
    return (
      <Badge variant="warning">
        <Clock aria-hidden="true" className="size-3" />
        {`Reply due in ${formatRelative(due, nowIso)}`}
      </Badge>
    );
  }
  return (
    <Badge variant="success">
      <ShieldCheck aria-hidden="true" className="size-3" />
      {`On track, due in ${formatRelative(due, nowIso)}`}
    </Badge>
  );
}
