"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenuGroup,
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
            aria-label="Snooze conversation"
          >
            {isSnoozed ? (
              <Sunrise aria-hidden="true" className="text-chart-3" />
            ) : (
              <Clock aria-hidden="true" />
            )}
            {isSnoozed ? "Snoozed" : "Snooze"}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Snooze until</DropdownMenuLabel>

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
              >
                Wake up now
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
