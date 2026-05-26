"use client";

import { useQuery } from "@tanstack/react-query";

export interface MissionControlAutomationRule {
  id?: string;
  name: string;
  mode: "simple" | "advanced";
  trigger: { kind: string };
  conditions: Array<Record<string, unknown>>;
  actions: Array<Record<string, unknown>>;
  runMode: "automatic" | "review_first";
  enabled: boolean;
}

export const MISSION_CONTROL_AUTOMATIONS_QUERY_KEY = [
  "admin",
  "mission-control",
  "automations",
] as const;

async function loadMissionControlAutomations() {
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

  return (await response.json()) as {
    automationRules: MissionControlAutomationRule[];
  };
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
