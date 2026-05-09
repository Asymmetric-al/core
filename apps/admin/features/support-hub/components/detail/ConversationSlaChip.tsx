"use client";

import { cn } from "@asym/ui/lib/utils";
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
      <Chip
        tone="rose"
        icon={<AlertTriangle className="size-3" />}
        label={`Overdue · ${formatRelative(due, nowIso)}`}
      />
    );
  }
  if (isAtRisk) {
    return (
      <Chip
        tone="amber"
        icon={<Clock className="size-3" />}
        label={`Due in ${formatRelative(due, nowIso)}`}
      />
    );
  }
  return (
    <Chip
      tone="emerald"
      icon={<ShieldCheck className="size-3" />}
      label={`On track · due ${formatRelative(due, nowIso)}`}
    />
  );
}

interface ChipProps {
  tone: "rose" | "amber" | "emerald";
  icon: React.ReactNode;
  label: string;
}

const TONE_CLASSES: Record<ChipProps["tone"], string> = {
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function Chip({ tone, icon, label }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ring-transparent",
        TONE_CLASSES[tone],
      )}
    >
      {icon}
      {label}
    </span>
  );
}
