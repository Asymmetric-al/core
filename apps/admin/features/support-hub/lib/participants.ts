import {
  supportAgentsCollection,
  type SupportAssignee,
  type SupportParticipant,
} from "@asym/database/hooks";

/**
 * Resolve an agent id to a `SupportParticipant` envelope used when authoring
 * messages from a mutation hook. Reads directly from the live collection so
 * the function stays valid as the agents seed grows.
 */
export function getSupportAgentParticipant(
  agentId: string,
): SupportParticipant | undefined {
  const rows = supportAgentsCollection.toArray as SupportAssignee[] | undefined;
  const agent = rows?.find((row) => row.id === agentId);
  if (!agent) return undefined;
  return toSupportParticipant(agent);
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
