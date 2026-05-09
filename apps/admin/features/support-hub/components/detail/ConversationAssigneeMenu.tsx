"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
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
import { Check, UserCheck, UserMinus, UserRound } from "lucide-react";

import { useSupportAgents } from "../../hooks/use-support-agents";
import { useAssignSupportConversation } from "../../hooks/use-support-mutations";
import { useCurrentSupportAgentId } from "../../lib/current-agent";

import type { SupportConversation } from "../../types";

interface ConversationAssigneeMenuProps {
  conversation: SupportConversation;
}

export function ConversationAssigneeMenu({
  conversation,
}: ConversationAssigneeMenuProps) {
  const { data: agents } = useSupportAgents();
  const currentAgentId = useCurrentSupportAgentId();
  const assign = useAssignSupportConversation();

  const assignee = conversation.assignee;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-2 rounded-lg px-2 text-[12px] font-medium text-zinc-700"
          aria-label={assignee ? `Assigned to ${assignee.name}` : "Unassigned"}
        >
          {assignee ? (
            <Avatar className="size-5 border border-zinc-100">
              <AvatarImage
                src={assignee.avatarUrl ?? undefined}
                alt={assignee.name}
              />
              <AvatarFallback className="text-[10px] font-semibold">
                {assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="flex size-5 items-center justify-center rounded-full border border-dashed border-amber-300 text-amber-600">
              <UserRound className="size-3" />
            </span>
          )}
          <span className="truncate text-[12px]">
            {assignee?.name ?? "Unassigned"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-400">
          Assign conversation
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {currentAgentId ? (
          <DropdownMenuItem
            onSelect={() =>
              assign.mutate({
                conversationId: conversation.id,
                assigneeAgentId: currentAgentId,
              })
            }
            className="gap-2 text-[12px]"
          >
            <UserCheck className="size-3.5 text-zinc-500" />
            Assign to me
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onSelect={() =>
            assign.mutate({
              conversationId: conversation.id,
              assigneeAgentId: null,
            })
          }
          className="gap-2 text-[12px]"
        >
          <UserMinus className="size-3.5 text-zinc-500" />
          Unassign
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {agents.map((agent) => {
          const isActive = assignee?.id === agent.id;
          return (
            <DropdownMenuItem
              key={agent.id}
              onSelect={() =>
                assign.mutate({
                  conversationId: conversation.id,
                  assigneeAgentId: agent.id,
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
              <Avatar className="size-5 border border-zinc-100">
                <AvatarImage
                  src={agent.avatarUrl ?? undefined}
                  alt={agent.name}
                />
                <AvatarFallback className="text-[10px] font-semibold">
                  {agent.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{agent.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
