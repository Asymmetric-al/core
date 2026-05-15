"use client";

import { useQuery } from "@tanstack/react-query";

export type MissionaryPortalTask = {
  id: string;
  missionary_id: string;
  donor_id: string | null;
  title: string;
  description: string | null;
  task_type: string;
  status: string;
  priority: string;
  sort_key: number;
  due_date: string | null;
  completed_at: string | null;
  is_auto_generated: boolean;
  created_at: string;
  updated_at: string;
  donor: {
    id: string;
    name: string;
    email: string | null;
    avatar_url: string | null;
  } | null;
};

export type MissionaryPortalSnapshot = {
  profile: {
    id: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
  publicPage: {
    missionaryId: string;
    tagline: string | null;
    bio: string | null;
    missionField: string | null;
    location: string | null;
    coverUrl: string | null;
    socialLinks: Record<string, unknown>;
  };
  support: {
    goalCents: number;
    raisedCents: number;
    recurringMonthlyCents: number;
    percentFunded: number;
    activeDonorCount: number;
    giftCount: number;
    lastGiftAt: string | null;
  };
  donorRelationships: Array<{
    id: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    preferredContact: string;
    avatarUrl: string | null;
    location: string | null;
    status: string;
    totalGivenCents: number;
    lastGiftAt: string | null;
    lastGiftAmountCents: number;
    giftCount: number;
    frequency: string | null;
    tags: string[];
    hasActivePledge: boolean;
  }>;
  recentGifts: Array<{
    id: string;
    donorId: string | null;
    amountCents: number;
    amount: number;
    currency: string;
    type: "Recurring" | "One-Time";
    date: string;
  }>;
  tasks: MissionaryPortalTask[];
  ministryUpdates: Array<{
    id: string;
    title: string;
    excerpt: string;
    visibility: string;
    status: string;
    createdAt: string | null;
    engagementCount: number;
  }>;
  actions: {
    editProfileUrl: string;
    createUpdateUrl: string;
    tasksUrl: string;
    donorsUrl: string;
  };
};

const MISSIONARY_PORTAL_QUERY_KEY = ["missionary", "portal"] as const;

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

export async function fetchMissionaryPortalSnapshot(): Promise<MissionaryPortalSnapshot> {
  const response = await fetch("/api/missionary/portal", {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    method: "GET",
  });

  const payload = await parseJsonResponse<{ portal: MissionaryPortalSnapshot }>(
    response,
  );

  return payload.portal;
}

export function useMissionaryPortalSnapshot() {
  return useQuery({
    queryKey: MISSIONARY_PORTAL_QUERY_KEY,
    queryFn: fetchMissionaryPortalSnapshot,
  });
}
