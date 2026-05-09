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
import { cn } from "@asym/ui/lib/utils";
import { Check, Flag } from "lucide-react";

import { useSetSupportConversationPriority } from "../../hooks/use-support-mutations";
import {
  SUPPORT_PRIORITIES,
  type SupportConversation,
  type SupportPriority,
} from "../../types";

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
  urgent: "text-rose-600",
  high: "text-amber-600",
  normal: "text-zinc-500",
  low: "text-zinc-400",
};

export function ConversationPriorityMenu({
  conversation,
}: ConversationPriorityMenuProps) {
  const setPriority = useSetSupportConversationPriority();
  const tone = PRIORITY_TONES[conversation.priority];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900"
          aria-label={`Priority: ${PRIORITY_LABELS[conversation.priority]}`}
        >
          <Flag className={cn("size-3.5", tone)} />
          {PRIORITY_LABELS[conversation.priority]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-400">
          Priority
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORT_PRIORITIES.map((priority) => (
          <DropdownMenuItem
            key={priority}
            onSelect={() =>
              setPriority.mutate({
                conversationId: conversation.id,
                priority,
              })
            }
            className="gap-2 text-[12px]"
          >
            <Check
              className={cn(
                "size-3.5",
                priority === conversation.priority
                  ? "text-zinc-900"
                  : "text-transparent",
              )}
            />
            <Flag className={cn("size-3.5", PRIORITY_TONES[priority])} />
            {PRIORITY_LABELS[priority]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
