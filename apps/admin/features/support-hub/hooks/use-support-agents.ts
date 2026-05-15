"use client";

import { useQuery } from "@tanstack/react-query";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type { SupportAssignee, SupportTeam } from "@asym/database/hooks";

interface AgentsResponse {
  agents: SupportAssignee[];
}

interface TeamsResponse {
  teams: SupportTeam[];
}

export function useSupportAgents(): {
  data: SupportAssignee[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: supportHubQueryKeys.agents,
    queryFn: async () =>
      (await supportApiGet<AgentsResponse>("/api/admin/support/agents")).agents,
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}

export function useSupportTeams(): {
  data: SupportTeam[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: supportHubQueryKeys.teams,
    queryFn: async () =>
      (await supportApiGet<TeamsResponse>("/api/admin/support/teams")).teams,
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}
