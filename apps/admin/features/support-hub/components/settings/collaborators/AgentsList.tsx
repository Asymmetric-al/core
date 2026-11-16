"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { UserRound } from "lucide-react";

import { useSupportAgents } from "../../../hooks/use-support-agents";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsListState } from "../SettingsListState";
import { SettingsPanel } from "../SettingsPanel";

export function AgentsList() {
  const query = useSupportAgents();
  const agents = query.data;

  return (
    <SettingsPanel
      title="Collaborators"
      description="People who can work on donor care conversations."
    >
      <SettingsListState
        noun="collaborators"
        isLoading={query.isLoading}
        isError={query.isError}
        itemCount={agents.length}
        onRetry={query.refetch}
      >
        {agents.length === 0 ? (
          <SupportEmptySection
            icon={<UserRound className="size-4" />}
            title="No collaborators yet"
            description="People who can work in the support inbox appear here."
          />
        ) : (
          <ItemGroup className="gap-2">
            {agents.map((agent) => (
              <Item key={agent.id} variant="outline" size="sm">
                {/* The name sits beside the avatar, so the avatar is decorative. */}
                <ItemMedia>
                  <Avatar aria-hidden="true">
                    {agent.avatarUrl ? (
                      <AvatarImage src={agent.avatarUrl} alt="" />
                    ) : null}
                    <AvatarFallback>
                      {agent.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle>{agent.name}</ItemTitle>
                  <ItemDescription>
                    {agent.title
                      ? `${agent.title} · ${agent.email}`
                      : agent.email}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        )}
      </SettingsListState>
    </SettingsPanel>
  );
}
