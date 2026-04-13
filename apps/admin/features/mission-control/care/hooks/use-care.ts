"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ActivityLogEntry, CarePersonnel } from "../types";

type MemberCareDashboardResponse = {
  personnel: CarePersonnel[];
  activities: ActivityLogEntry[];
};

type MutationResponse = {
  id: string;
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

async function requestMutation<TInput>(
  endpoint: string,
  method: "POST" | "PATCH",
  input: TInput,
): Promise<MutationResponse> {
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? `Request failed: ${endpoint}`);
  }

  return (await response.json()) as MutationResponse;
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

async function invalidateMemberCareQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ["admin", "member-care", "dashboard"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["admin", "member-care", "directory"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["admin", "member-care", "detail"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["admin", "member-care", "notifications"],
    }),
  ]);
}

export function useCreateCareThreadPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      personnelId: string;
      content: string;
      isPrivate?: boolean;
    }) => requestMutation("/api/admin/member-care/thread", "POST", input),
    onSuccess: async () => {
      await invalidateMemberCareQueries(queryClient);
    },
  });
}

export function useCreateOrUpdateCareGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id?: string;
      personnelId: string;
      title: string;
      status?: "pending" | "active" | "completed";
      targetDate?: string;
    }) => requestMutation("/api/admin/member-care/goals", "POST", input),
    onSuccess: async () => {
      await invalidateMemberCareQueries(queryClient);
    },
  });
}

export function useLogCareActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      personnelId: string;
      type: string;
      content: string;
      isPrivate?: boolean;
    }) => requestMutation("/api/admin/member-care/activity", "POST", input),
    onSuccess: async () => {
      await invalidateMemberCareQueries(queryClient);
    },
  });
}

export function useUpsertCareRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id?: string;
      personnelId: string;
      activityType: string;
      intervalDays: number;
      notes?: string;
    }) => requestMutation("/api/admin/member-care/requirements", "POST", input),
    onSuccess: async () => {
      await invalidateMemberCareQueries(queryClient);
    },
  });
}

export function useSetManualAttentionFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { personnelId: string; manualAttention: boolean }) =>
      requestMutation("/api/admin/member-care/attention", "PATCH", input),
    onSuccess: async () => {
      await invalidateMemberCareQueries(queryClient);
    },
  });
}

export function useLogActivity() {
  return useLogCareActivity();
}
