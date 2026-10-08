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
import { cn } from "@asym/ui/lib/utils";
import { Check, ChevronDown } from "lucide-react";

import { useSetSupportConversationStatus } from "../../hooks/use-support-mutations";
import {
  SUPPORT_CONVERSATION_STATUSES,
  type SupportConversation,
  type SupportConversationStatus,
} from "../../types/conversation";

interface ConversationStatusMenuProps {
  conversation: SupportConversation;
}

const STATUS_LABELS: Record<SupportConversationStatus, string> = {
  open: "Open",
  pending: "Pending",
  snoozed: "Snoozed",
  resolved: "Resolved",
};

const STATUS_TRIGGER_TONES: Record<SupportConversationStatus, string> = {
  open: "bg-warning",
  pending: "bg-muted-foreground",
  snoozed: "bg-chart-3",
  resolved: "bg-success",
};

export function ConversationStatusMenu({
  conversation,
}: ConversationStatusMenuProps) {
  const setStatus = useSetSupportConversationStatus();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                STATUS_TRIGGER_TONES[conversation.status],
              )}
            />
            {STATUS_LABELS[conversation.status]}
            <ChevronDown aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Set status</DropdownMenuLabel>

          <DropdownMenuSeparator />
          {SUPPORT_CONVERSATION_STATUSES.map((status) => {
            const isActive = status === conversation.status;
            return (
              <DropdownMenuItem
                key={status}
                onClick={() =>
                  setStatus.mutate({
                    conversationId: conversation.id,
                    status,
                  })
                }
              >
                <Check
                  aria-hidden="true"
                  className={cn(
                    "size-3.5",
                    isActive ? "text-foreground" : "text-transparent",
                  )}
                />
                {STATUS_LABELS[status]}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
