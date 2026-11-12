"use client";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Clock } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  useSnoozeSupportConversation,
  useUnsnoozeSupportConversation,
} from "../../hooks/use-support-mutations";
import { useSupportNow } from "../../lib/now";
import {
  SUPPORT_SNOOZE_OPTIONS,
  formatSnoozeTime,
  resolveSnoozeUntil,
  snoozeUntilFromNow,
} from "../../lib/snooze";
import { useSupportSnoozeMenuRequest } from "../../lib/snooze-menu-request";

import type { SupportConversation } from "../../types";
export function ConversationSnoozeMenu({
  conversation,
}: {
  conversation: SupportConversation;
}) {
  const nowIso = useSupportNow(),
    snooze = useSnoozeSupportConversation(),
    unsnooze = useUnsnoozeSupportConversation();
  const [open, setOpen] = React.useState(false);
  const request = useSupportSnoozeMenuRequest();
  const isRequested = request?.requestedId === conversation.id;
  const isSnoozed = conversation.status === "snoozed";
  const failure = (error: unknown) =>
    toast.error(
      error instanceof Error
        ? error.message
        : "Couldn’t change the snooze time. Try again.",
    );
  return (
    <DropdownMenu
      open={open || isRequested}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) request?.clear();
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Snooze conversation"
          >
            <Clock aria-hidden="true" />
            {isSnoozed && conversation.snoozedUntil
              ? "Snoozed until " +
                formatSnoozeTime(conversation.snoozedUntil, new Date(nowIso))
              : "Snooze"}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {isSnoozed ? "Snooze again until" : "Snooze until"}
          </DropdownMenuLabel>
          {isSnoozed ? (
            <>
              <DropdownMenuItem
                disabled={unsnooze.isPending}
                onClick={() => {
                  void unsnooze
                    .mutateAsync({ conversationId: conversation.id })
                    .catch(failure);
                }}
              >
                Wake up now
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {SUPPORT_SNOOZE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.key}
              disabled={snooze.isPending}
              onClick={() => {
                void snooze
                  .mutateAsync({
                    conversationId: conversation.id,
                    snoozedUntil: snoozeUntilFromNow(
                      option.key,
                      new Date(nowIso),
                    ),
                  })
                  .catch(failure);
              }}
            >
              <span>{option.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatSnoozeTime(
                  resolveSnoozeUntil(option.key, new Date(nowIso)),
                  new Date(nowIso),
                )}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
