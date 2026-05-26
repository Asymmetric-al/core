"use client";

import { useQuery } from "@tanstack/react-query";

export interface MissionControlNeedsAttentionItem {
  id: string;
  taskId: string | null;
  issueType: string;
  issueLabel: string;
  urgency: "normal" | "high" | "critical";
  status: string;
  summary: string;
  contributionId: string | null;
  donorId: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface MissionControlNeedsAttentionGroup {
  key: string;
  title: string;
  urgency: "normal" | "high" | "critical";
  count: number;
  items: MissionControlNeedsAttentionItem[];
}

export const MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY = [
  "admin",
  "mission-control",
  "needs-attention",
] as const;

async function loadNeedsAttention() {
  const response = await fetch("/api/admin/mission-control/needs-attention", {
    credentials: "same-origin",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load Needs Attention.");
  }

  return (await response.json()) as {
    groups: MissionControlNeedsAttentionGroup[];
    items: MissionControlNeedsAttentionItem[];
  };
}

export function useContributionNeedsAttention() {
  return useQuery({
    gcTime: 5 * 60_000,
    queryFn: loadNeedsAttention,
    queryKey: MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30_000,
  });
}
