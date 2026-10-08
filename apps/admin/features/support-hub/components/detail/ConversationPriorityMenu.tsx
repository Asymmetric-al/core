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
import { Check, Flag } from "lucide-react";

import { useSetSupportConversationPriority } from "../../hooks/use-support-mutations";
import {
  SUPPORT_PRIORITIES,
  type SupportConversation,
  type SupportPriority,
} from "../../types/conversation";

interface ConversationPriorityMenuProps {
  conversation: SupportConversation;
}

const PRIORITY_LABELS: Record<SupportPriority, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

const PRIORITY_TONES: Record<SupportPriority, string> = {
  urgent: "text-destructive",
  high: "text-warning",
  normal: "text-muted-foreground",
  low: "text-muted-foreground",
};

export function ConversationPriorityMenu({
  conversation,
}: ConversationPriorityMenuProps) {
  const setPriority = useSetSupportConversationPriority();
  const tone = PRIORITY_TONES[conversation.priority];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Priority: ${PRIORITY_LABELS[conversation.priority]}`}
          >
            <Flag aria-hidden="true" className={tone} />
            {PRIORITY_LABELS[conversation.priority]}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Priority</DropdownMenuLabel>

          <DropdownMenuSeparator />
          {SUPPORT_PRIORITIES.map((priority) => (
            <DropdownMenuItem
              key={priority}
              onClick={() =>
                setPriority.mutate({
                  conversationId: conversation.id,
                  priority,
                })
              }
            >
              <Check
                aria-hidden="true"
                className={cn(
                  "size-3.5",
                  priority === conversation.priority
                    ? "text-foreground"
                    : "text-transparent",
                )}
              />
              <Flag aria-hidden="true" className={PRIORITY_TONES[priority]} />
              {PRIORITY_LABELS[priority]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
