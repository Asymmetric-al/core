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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { UserCheck, UserMinus, UserRound, Shuffle } from "lucide-react";
import { toast } from "sonner";

import { useSupportAgents } from "../../hooks/use-support-agents";
import {
  useApplyRoundRobinAssignment,
  useAssignSupportConversation,
} from "../../hooks/use-support-mutations";
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
  const roundRobin = useApplyRoundRobinAssignment();
  const handleRoundRobin = async () => {
    try {
      const next = await roundRobin.mutateAsync({
        conversationId: conversation.id,
        authorAgentId: currentAgentId ?? undefined,
      });
      if (!next) toast.info("No other agent is available.");
    } catch {
      toast.error("Couldn’t assign the conversation. Try again.");
    }
  };

  const assignee = conversation.assignee;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={
              assignee ? `Assigned to ${assignee.name}` : "Unassigned"
            }
          >
            {assignee ? (
              <Avatar className="size-5">
                <AvatarImage
                  src={assignee.avatarUrl ?? undefined}
                  alt={assignee.name}
                />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <span className="flex size-5 items-center justify-center rounded-full border border-dashed border-warning/40 text-warning">
                <UserRound className="size-3" />
              </span>
            )}
            <span className="max-w-36 truncate">
              {assignee?.name ?? "Unassigned"}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
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
          <DropdownMenuItem
            disabled={roundRobin.isPending}
            onClick={() => void handleRoundRobin()}
          >
            <Shuffle className="size-3.5 text-muted-foreground" />
            Round-robin assign
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuRadioGroup
          aria-label="Agents"
          value={assignee?.id ?? null}
          onValueChange={(assigneeAgentId: string) =>
            assign.mutate({
              conversationId: conversation.id,
              assigneeAgentId,
            })
          }
        >
          {agents.map((agent) => (
            <DropdownMenuRadioItem key={agent.id} value={agent.id} closeOnClick>
              <Avatar aria-hidden="true" className="size-5">
                <AvatarImage src={agent.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="max-w-36 truncate">{agent.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
