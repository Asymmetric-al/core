"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";

import { useSupportAgents } from "../../../hooks/use-support-agents";
import { SettingsPanel } from "../SettingsPanel";

export function AgentsList() {
  const { data: agents } = useSupportAgents();

  return (
    <SettingsPanel
      title="Collaborators"
      description="Team members with access to donor care conversations. Roles are managed in Mission Control settings."
    >
      {agents.length === 0 ? (
        <p className="text-[12px] text-zinc-500">No collaborators yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-100">
          {agents.map((agent) => (
            <li key={agent.id} className="flex items-center gap-3 py-2.5">
              <Avatar className="size-9 ring-1 ring-zinc-100">
                {agent.avatarUrl ? (
                  <AvatarImage src={agent.avatarUrl} alt={agent.name} />
                ) : null}
                <AvatarFallback>
                  {agent.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[13px] font-semibold text-zinc-900">
                  {agent.name}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {agent.title ?? "Support team member"} · {agent.email}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SettingsPanel>
  );
}
