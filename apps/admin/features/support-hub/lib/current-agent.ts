"use client";

import { useMC } from "@asym/lib/mission-control/context";

import { useSupportAgents } from "../hooks/use-support-agents";

/**
 * Resolves the signed-in Mission Control user to a Support Hub agent id: the
 * tenant agent whose email matches the user's (case-insensitive) or whose id
 * equals the user id. Returns `null` until agents have loaded, or when no
 * agent matches.
 *
 * The composer sends this id as `authorAgentId`; the reply and note routes
 * use it as given and do not check it against the signed-in user.
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
