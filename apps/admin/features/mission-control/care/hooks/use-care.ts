"use client";

import { useLogActivity as useLegacyLogActivity } from "@asym/database/hooks";
import { useQuery } from "@tanstack/react-query";

import type { ActivityLogEntry, CarePersonnel } from "../types";

type MemberCareDashboardResponse = {
  personnel: CarePersonnel[];
  activities: ActivityLogEntry[];
};

async function fetchMemberCareDashboard(): Promise<MemberCareDashboardResponse> {
  const response = await fetch("/api/admin/member-care/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to load member care data.");
  }

  return (await response.json()) as MemberCareDashboardResponse;
}

export function useCareDashboard() {
  return useQuery({
    queryKey: ["admin", "member-care", "dashboard"],
    queryFn: fetchMemberCareDashboard,
  });
}

export function useCarePersonnel() {
  const query = useCareDashboard();

  return {
    ...query,
    data: query.data?.personnel ?? [],
  };
}

export function useCareActivity(personnelId?: string) {
  const query = useCareDashboard();

  const data = (query.data?.activities ?? []).filter(
    (entry) => !personnelId || entry.personnelId === personnelId,
  );

  return {
    ...query,
    data,
  };
}

export function useCareProfile(id: string) {
  const query = useCareDashboard();

  return {
    ...query,
    data: (query.data?.personnel ?? []).find(
      (personnel) => personnel.id === id,
    ),
  };
}

export function useLogActivity() {
  return useLegacyLogActivity();
}
