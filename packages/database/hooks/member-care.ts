"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import { getAdminSurfaceQueryKey } from "../query-keys";

export type MemberCarePriority =
  | "Healthy"
  | "Needs Attention"
  | "At Risk"
  | "Crisis";

export type MemberCareActivityType =
  | "Video Call"
  | "In-Person Visit"
  | "Check-in"
  | "Pastoral Note"
  | "Care Plan Update"
  | "Crisis Intervention"
  | "Birthday"
  | "Prayer Request";

export type MemberCarePersonnel = {
  id: string;
  name: string;
  location: string;
  timezone: string;
  status: MemberCarePriority;
  lastCheckIn: string;
  initials: string;
  avatarUrl?: string;
  role: string;
  region:
    | "Africa"
    | "SE Asia"
    | "Europe"
    | "Latin America"
    | "Middle East"
    | "North America";
  healthSignals: {
    emotional: number;
    spiritual: number;
    physical: number;
    financial: number;
  };
  careGaps: string[];
  manualAttention?: boolean;
  birthDate?: string;
};

export type MemberCareActivity = {
  id: string;
  personnelId: string;
  type: MemberCareActivityType;
  content: string;
  date: string;
  authorId: string;
  authorName: string;
  isPrivate: false;
};

export type MemberCarePrivateNote = {
  id: string;
  personnelId: string;
  content: string;
  date: string;
  authorId: string;
  authorName: string;
};

export type MemberCareGoal = {
  id: string;
  personnelId: string;
  title: string;
  status: "pending" | "active" | "completed";
  targetDate?: string;
};

export type MemberCareRequirement = {
  id: string;
  personnelId: string;
  activityType: MemberCareActivityType;
  intervalDays: number;
  notes?: string;
};

export type MemberCareDashboardResponse = {
  personnel: MemberCarePersonnel[];
  activities: MemberCareActivity[];
  goals: MemberCareGoal[];
  requirements: MemberCareRequirement[];
};

export type MemberCareDetailResponse = {
  personnel: MemberCarePersonnel | null;
  activities: MemberCareActivity[];
  privateNotes: MemberCarePrivateNote[];
};

type MutationResponse = {
  id: string;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.error || `Request failed with status ${response.status}`,
    );
  }

  if (!payload) {
    throw new Error("Request returned an empty response.");
  }

  return payload;
}

async function fetchMemberCareDashboard(): Promise<MemberCareDashboardResponse> {
  const response = await fetch("/api/admin/member-care/dashboard", {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    method: "GET",
  });

  return parseJsonResponse<MemberCareDashboardResponse>(response);
}

async function fetchMemberCareDetail(
  personnelId: string,
): Promise<MemberCareDetailResponse> {
  const response = await fetch(
    `/api/admin/member-care/directory/${personnelId}`,
    {
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
      method: "GET",
    },
  );

  return parseJsonResponse<MemberCareDetailResponse>(response);
}

async function requestMutation<TInput>(
  endpoint: string,
  method: "POST" | "PATCH",
  input: TInput,
): Promise<MutationResponse> {
  const response = await fetch(endpoint, {
    body: JSON.stringify(input),
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method,
  });

  return parseJsonResponse<MutationResponse>(response);
}

export function useMemberCareDashboardQuery() {
  return useQuery({
    queryKey: getAdminSurfaceQueryKey("memberCareDashboard"),
    queryFn: fetchMemberCareDashboard,
  });
}

export function useCareDashboard() {
  return useMemberCareDashboardQuery();
}

export function useMemberCareDetailQuery(personnelId: string | undefined) {
  return useQuery({
    enabled: Boolean(personnelId),
    queryKey: getAdminSurfaceQueryKey("memberCareDetail").concat(
      personnelId ?? "missing",
    ),
    queryFn: () => fetchMemberCareDetail(personnelId as string),
  });
}

export function useCarePersonnel() {
  const query = useMemberCareDashboardQuery();

  return {
    ...query,
    data: query.data?.personnel ?? [],
  };
}

export function useCareActivity(personnelId?: string) {
  const query = useMemberCareDashboardQuery();

  const data = React.useMemo(() => {
    if (!personnelId) {
      return query.data?.activities ?? [];
    }

    return (query.data?.activities ?? []).filter(
      (entry) => entry.personnelId === personnelId,
    );
  }, [personnelId, query.data?.activities]);

  return {
    ...query,
    data,
  };
}

export function useCareProfile(id: string) {
  const query = useMemberCareDetailQuery(id);

  return {
    ...query,
    data: query.data?.personnel ?? null,
  };
}

export function useCarePrivateNotes(personnelId: string) {
  const query = useMemberCareDetailQuery(personnelId);

  return {
    ...query,
    data: query.data?.privateNotes ?? [],
  };
}

export function useCreateCareThreadPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { personnelId: string; content: string }) =>
      requestMutation("/api/admin/member-care/thread", "POST", input),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDashboard"),
        }),
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDetail").concat(
            variables.personnelId,
          ),
        }),
      ]);
    },
  });
}

export function useCreateCarePrivateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { personnelId: string; content: string }) =>
      requestMutation("/api/admin/member-care/private-notes", "POST", input),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDashboard"),
        }),
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDetail").concat(
            variables.personnelId,
          ),
        }),
      ]);
    },
  });
}

export function useCreatePrivateNote() {
  return useCreateCarePrivateNote();
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
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDashboard"),
        }),
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDetail").concat(
            variables.personnelId,
          ),
        }),
      ]);
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
    }) => requestMutation("/api/admin/member-care/activity", "POST", input),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDashboard"),
        }),
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDetail").concat(
            variables.personnelId,
          ),
        }),
      ]);
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
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDashboard"),
        }),
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDetail").concat(
            variables.personnelId,
          ),
        }),
      ]);
    },
  });
}

export function useSetManualAttentionFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { personnelId: string; manualAttention: boolean }) =>
      requestMutation("/api/admin/member-care/attention", "PATCH", input),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDashboard"),
        }),
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("memberCareDetail").concat(
            variables.personnelId,
          ),
        }),
      ]);
    },
  });
}

export function useLogActivity() {
  return useLogCareActivity();
}
