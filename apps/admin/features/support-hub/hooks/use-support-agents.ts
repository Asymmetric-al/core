"use client";

import {
  useSupportAgentsLive,
  useSupportTeamsLive,
} from "@asym/database/hooks";

import type { SupportAssignee, SupportTeam } from "@asym/database/hooks";

export function useSupportAgents(): {
  data: SupportAssignee[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useSupportAgentsLive();
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}

export function useSupportTeams(): {
  data: SupportTeam[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useSupportTeamsLive();
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}
