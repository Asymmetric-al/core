"use client";

import { useQuery } from "@tanstack/react-query";

export type MissionControlAutomationActivationStatus =
  | "draft"
  | "ready"
  | "active"
  | "paused"
  | "disabled";

export interface MissionControlAutomationRuleDto {
  id?: string;
  name: string;
  mode: "simple" | "advanced";
  trigger: { kind: string };
  conditions: Array<Record<string, unknown>>;
  actions: Array<Record<string, unknown>>;
  runMode: "automatic" | "review_first";
  enabled: boolean;
  activationStatus?: MissionControlAutomationActivationStatus;
}

export interface MissionControlAutomationSummary {
  totalRules: number;
  activeRules: number;
  pausedRules: number;
  readyRules: number;
  draftRules: number;
  executions24h: number;
  failedRuns24h: number;
  activityLogBacked: boolean;
  integrationHealthBacked: boolean;
}

export interface MissionControlAutomationsResponse {
  automationRules: MissionControlAutomationRuleDto[];
  summary: MissionControlAutomationSummary;
}

export const MISSION_CONTROL_AUTOMATIONS_QUERY_KEY = [
  "admin",
  "mission-control",
  "automations",
] as const;

/**
 * @remarks Requires the Mission Control automations API route slice before
 * admin UI imports this hook.
 */
async function loadMissionControlAutomations(): Promise<MissionControlAutomationsResponse> {
  const response = await fetch("/api/admin/mission-control/automations", {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load automations.");
  }

  return (await response.json()) as MissionControlAutomationsResponse;
}

export function useMissionControlAutomations() {
  return useQuery({
    queryKey: MISSION_CONTROL_AUTOMATIONS_QUERY_KEY,
    queryFn: loadMissionControlAutomations,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
