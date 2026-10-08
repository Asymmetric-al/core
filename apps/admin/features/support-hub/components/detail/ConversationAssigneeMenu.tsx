"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
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
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="max-w-48"
            aria-label={
              assignee ? `Assigned to ${assignee.name}` : "Unassigned"
            }
          >
            {assignee ? (
              <Avatar className="size-5 border border-border">
                <AvatarImage
                  src={assignee.avatarUrl ?? undefined}
                  alt={assignee.name}
                />
                <AvatarFallback className="text-xs font-semibold">
                  {assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span className="flex size-5 items-center justify-center rounded-full border border-dashed border-warning/40 text-warning">
                <UserRound className="size-3" />
              </span>
            )}
            <span className="truncate">{assignee?.name ?? "Unassigned"}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Assign conversation</DropdownMenuLabel>

          <DropdownMenuSeparator />
          {currentAgentId ? (
            <DropdownMenuItem
              onClick={() =>
                assign.mutate({
                  conversationId: conversation.id,
                  assigneeAgentId: currentAgentId,
                })
              }
            >
              <UserCheck className="size-3.5 text-muted-foreground" />
              Assign to me
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() =>
              assign.mutate({
                conversationId: conversation.id,
                assigneeAgentId: null,
              })
            }
          >
            <UserMinus className="size-3.5 text-muted-foreground" />
            Unassign
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {agents.map((agent) => {
            const isActive = assignee?.id === agent.id;
            return (
              <DropdownMenuItem
                key={agent.id}
                onClick={() =>
                  assign.mutate({
                    conversationId: conversation.id,
                    assigneeAgentId: agent.id,
                  })
                }
              >
                <Check
                  className={cn(
                    "size-3.5",
                    isActive ? "text-foreground" : "text-transparent",
                  )}
                />
                <Avatar className="size-5 border border-border">
                  <AvatarImage
                    src={agent.avatarUrl ?? undefined}
                    alt={agent.name}
                  />
                  <AvatarFallback className="text-xs font-semibold">
                    {agent.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{agent.name}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
