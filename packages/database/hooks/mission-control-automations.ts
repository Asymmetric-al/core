"use client";

import { useQuery } from "@tanstack/react-query";

import type { MissionControlAutomationActivationStatus } from "@asym/database/mission-control-automations";

export type { MissionControlAutomationActivationStatus };

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
  /**
   * Runs in the activity log over the last 24 hours (the summary's window).
   * Absent means not reported, which the page must not read as no runs.
   */
  runs24h?: number;
  /** Runs in that window that recorded a failure. */
  failedRuns24h?: number;
  /** ISO time of the latest failed run in that window, or null. */
  lastFailureAt?: string | null;
}

export interface MissionControlAutomationSummary {
  totalRules: number;
  activeRules: number;
  pausedRules: number;
  readyRules: number;
  draftRules: number;
  invalidRules: number;
  executions24h: number;
  failedRuns24h: number;
  /**
   * Failed runs in the window whose log row names no rule (deleting a rule
   * clears it). Rules past the newest page that ran are in the list, so
   * these are never theirs. Absent from responses that predate it.
   */
  failedRunsWithoutRule24h?: number;
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
