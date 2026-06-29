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
  open: "border-amber-200 bg-amber-50 text-amber-800",
  pending: "border-zinc-200 bg-zinc-100 text-zinc-700",
  snoozed: "border-violet-200 bg-violet-50 text-violet-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function ConversationStatusMenu({
  conversation,
}: ConversationStatusMenuProps) {
  const setStatus = useSetSupportConversationStatus();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-1.5 rounded-lg px-2.5 text-[11px] font-bold uppercase tracking-wider",
              STATUS_TRIGGER_TONES[conversation.status],
            )}
          >
            {STATUS_LABELS[conversation.status]}
            <ChevronDown className="size-3 opacity-70" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-400">
          Set status
        </DropdownMenuLabel>
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
              className="gap-2 text-[12px]"
            >
              <Check
                className={cn(
                  "size-3.5",
                  isActive ? "text-zinc-900" : "text-transparent",
                )}
              />
              {STATUS_LABELS[status]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
