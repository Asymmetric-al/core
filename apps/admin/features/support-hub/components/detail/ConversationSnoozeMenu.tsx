"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Clock, Sunrise } from "lucide-react";

import {
  useSnoozeSupportConversation,
  useUnsnoozeSupportConversation,
} from "../../hooks/use-support-mutations";

import type { SupportConversation } from "../../types";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

function makeDisplayTimestamp(): number {
  return globalThis.Date.now();
}

interface ConversationSnoozeMenuProps {
  conversation: SupportConversation;
}

const HOUR_MS = 60 * 60 * 1000;

const QUICK_SNOOZE_OPTIONS: Array<{ label: string; hours: number }> = [
  { label: "1 hour", hours: 1 },
  { label: "4 hours", hours: 4 },
  { label: "Tomorrow morning", hours: 16 },
  { label: "7 days", hours: 24 * 7 },
];

export function ConversationSnoozeMenu({
  conversation,
}: ConversationSnoozeMenuProps) {
  const snooze = useSnoozeSupportConversation();
  const unsnooze = useUnsnoozeSupportConversation();
  const isSnoozed = conversation.status === "snoozed";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg border-zinc-200 px-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-600"
            aria-label="Snooze conversation"
          >
            {isSnoozed ? (
              <Sunrise className="size-3.5 text-violet-500" />
            ) : (
              <Clock className="size-3.5" />
            )}
            {isSnoozed ? "Snoozed" : "Snooze"}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-400">
          Snooze until
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {QUICK_SNOOZE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.label}
            onClick={() =>
              snooze.mutate({
                conversationId: conversation.id,
                snoozedUntil: makeDisplayDate(
                  makeDisplayTimestamp() + option.hours * HOUR_MS,
                ).toISOString(),
              })
            }
            className="text-[12px]"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
        {isSnoozed ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                unsnooze.mutate({ conversationId: conversation.id })
              }
              className="text-[12px] text-zinc-700"
            >
              Wake up now
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
