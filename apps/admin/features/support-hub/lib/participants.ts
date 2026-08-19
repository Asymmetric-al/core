import type { SupportAssignee, SupportParticipant } from "@asym/database/hooks";

/**
 * Resolve an agent id against a caller-owned agent list. The Support Hub
 * agents collection does not start sync on import, so lookups must not
 * snapshot a possibly empty collection.
 */
export function findSupportAgentParticipant(
  agents: readonly SupportAssignee[],
  agentId: string,
): SupportParticipant | undefined {
  const agent = agents.find((row) => row.id === agentId);
  if (!agent) return undefined;
  return toSupportParticipant(agent);
}

export function getSupportAgentParticipant(
  agentId: string,
  agents: readonly SupportAssignee[],
): SupportParticipant | undefined {
  return findSupportAgentParticipant(agents, agentId);
}

export function toSupportParticipant(
  agent: SupportAssignee,
): SupportParticipant {
  return {
    id: agent.id,
    role: "agent",
    name: agent.name,
    email: agent.email,
    avatarUrl: agent.avatarUrl,
  };
}

export const SUPPORT_SYSTEM_PARTICIPANT: SupportParticipant = {
  id: "system",
  role: "system",
  name: "Mission Control",
  email: null,
  avatarUrl: null,
};
