"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * Missionary "Partners" donor rows.
 *
 * SECURITY (spec §7.2/§12.1): this hook fetches the SERVER-redacted endpoint
 * `GET /api/missionary/donors` (`@asym/api/missionary-portal/donors`). It must
 * NOT read the raw `donors` table client-side — a donor who is anonymous to the
 * missionary is redacted server-side, so raw identity never reaches the client.
 * (Previously this joined the client `donors`/`donor_activities`/`donor_pledges`
 * collections via `.select("*")`, which leaked raw identity — now removed.)
 */

export type ActivityType =
  | "gift"
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "pledge_started"
  | "pledge_completed";

export type GiftType =
  | "Online"
  | "Check"
  | "Cash"
  | "Bank Transfer"
  | "Stock"
  | "In-Kind";

export type RecurringStatus = "active" | "completed" | "paused" | "cancelled";

export interface MissionaryDonorActivity {
  id: string;
  type: ActivityType | string;
  date: string;
  title: string;
  description?: string;
  amount?: number;
  status?: string;
  gift_type?: GiftType | string;
  note?: string;
}

export interface MissionaryRecurringDonation {
  id: string;
  amount: number;
  frequency: string;
  status: RecurringStatus | string;
  start_date: string;
  end_date?: string;
  next_payment_date?: string;
  total_paid: number;
  total_expected: number;
  payments_completed: number;
  payments_remaining: number;
  payment_method?: string;
}

export interface MissionaryDonorAddress {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface MissionaryDonorRow {
  id: string;
  name: string;
  initials: string;
  type: "Individual" | "Organization" | "Church";
  status: "Active" | "Lapsed" | "New" | "At Risk";
  total_given: number;
  last_gift_date: string | null;
  last_gift_amount: number | null;
  frequency: string;
  email: string;
  phone: string;
  mobile?: string;
  work_phone?: string;
  preferred_contact: "email" | "phone" | "text";
  avatar_url?: string;
  location: string;
  address: MissionaryDonorAddress;
  work_address?: MissionaryDonorAddress;
  website?: string;
  organization?: string;
  title?: string;
  joined_date: string;
  birthday?: string;
  anniversary?: string;
  spouse?: string;
  notes?: string;
  tags: string[];
  score: number;
  activities: MissionaryDonorActivity[];
  recurring_donations: MissionaryRecurringDonation[];
  has_active_pledge: boolean;
  /** True when the row is redacted (donor anonymous to this missionary). */
  is_anonymous?: boolean;
}

interface MissionaryDonorRowsPage {
  donors: MissionaryDonorRow[];
  hasMore: boolean;
  nextOffset: number | null;
}

const MISSIONARY_DONOR_PAGE_SIZE = 50;

async function fetchMissionaryDonorRowsPage(
  offset: number,
): Promise<MissionaryDonorRowsPage> {
  const searchParams = new URLSearchParams({
    limit: String(MISSIONARY_DONOR_PAGE_SIZE),
    offset: String(offset),
  });

  const response = await fetch(`/api/missionary/donors?${searchParams}`, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    let message = `Failed to load donors (${response.status})`;
    try {
      const body = (await response.json()) as { error?: unknown };
      if (body?.error) message = String(body.error);
    } catch {
      // keep the status-based message
    }
    throw new Error(message);
  }

  const body = (await response.json()) as Partial<MissionaryDonorRowsPage>;
  return {
    donors: body.donors ?? [],
    hasMore: body.hasMore ?? false,
    nextOffset:
      typeof body.nextOffset === "number" && Number.isFinite(body.nextOffset)
        ? body.nextOffset
        : null,
  };
}

export function useMissionaryDonorRows(
  missionaryId: string | null | undefined,
) {
  const query = useInfiniteQuery({
    queryKey: ["donors", "missionary", missionaryId ?? null, "redacted"],
    queryFn: ({ pageParam }) => fetchMissionaryDonorRowsPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled: Boolean(missionaryId),
    staleTime: 30_000,
  });

  const data = query.data?.pages.flatMap((page) => page.donors) ?? [];

  async function loadMore() {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    await query.fetchNextPage();
  }

  return {
    data,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore,
    isLoading: query.isLoading,
    error: (query.error as Error | null) ?? null,
  };
}
