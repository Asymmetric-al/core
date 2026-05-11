"use client";

import { useMC } from "@asym/lib/mission-control/context";

import { useSupportAgents } from "../hooks/use-support-agents";

/**
 * Resolves the currently signed-in Mission Control user to a Support Hub
 * agent id. Today the match is by email (the mock agents use the same
 * `*@givehope.org` addresses as the staff seed). When real `support_agents`
 * land, this hook is the single place where the resolution swaps.
 *
 * Returns `null` until the agents collection has hydrated or until the user
 * email matches no agent. Memoization is left to the React Compiler.
 */
export function useCurrentSupportAgentId(): string | null {
  const { user } = useMC();
  const { data: agents } = useSupportAgents();

  const email = user?.email;
  if (!email) return null;
  const lookup = email.toLowerCase();
  const match = agents.find(
    (agent) => agent.email.toLowerCase() === lookup || agent.id === user.id,
  );
  return match?.id ?? null;
}
