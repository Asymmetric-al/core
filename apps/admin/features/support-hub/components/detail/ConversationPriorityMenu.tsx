"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenuGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Flag } from "lucide-react";

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
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Priority</DropdownMenuLabel>

          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={conversation.priority}
            onValueChange={(priority: SupportPriority) =>
              setPriority.mutate({
                conversationId: conversation.id,
                priority,
              })
            }
          >
            {SUPPORT_PRIORITIES.map((priority) => (
              <DropdownMenuRadioItem
                key={priority}
                value={priority}
                closeOnClick
              >
                <Flag aria-hidden="true" className={PRIORITY_TONES[priority]} />
                {PRIORITY_LABELS[priority]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
