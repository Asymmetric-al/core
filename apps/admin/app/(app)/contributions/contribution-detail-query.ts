"use client";

import {
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY,
  ADMIN_CRM_RECORDS_QUERY_KEY,
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY,
} from "@asym/database/hooks";
import { useQuery, type QueryClient } from "@tanstack/react-query";

import { ADMIN_CONTRIBUTIONS_QUERY_KEY } from "./use-admin-contributions";

import type { ViewerProjectedContributionDetail } from "@asym/api/admin/contribution-operations";

export const ADMIN_CONTRIBUTION_DETAIL_QUERY_KEY = [
  "admin",
  "contribution-detail",
] as const;

export function contributionDetailQueryKey(donationId: string) {
  return [...ADMIN_CONTRIBUTION_DETAIL_QUERY_KEY, donationId] as const;
}

/**
 * Any 8-4-4-4-12 hex id, the same shape the operation action schema accepts
 * (`z.guid()`). Seeded and imported gifts carry ids outside the RFC version
 * and variant ranges, and a stricter check here silently dropped their links.
 */
const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const INVALID_CONTRIBUTION_LINK_MESSAGE =
  "That contribution link isn’t valid.";

export function isContributionGiftParam(value: string | null): value is string {
  return Boolean(value && GUID_PATTERN.test(value));
}

/**
 * Invalidates every query that renders shared contribution fields so the
 * Contributions Hub, CRM donor gift history, and the open detail overlay
 * refresh from the same database truth after an operation (ADR-CD-032).
 */
export async function invalidateContributionOperationQueries(
  queryClient: QueryClient,
  options?: {
    /**
     * TanStack Query resolves `invalidateQueries` even when the triggered
     * refetches fail. Callers that surface a stale-data warning on refresh
     * failure (the operation shell) opt into rejection instead.
     */
    throwOnError?: boolean;
  },
) {
  const refetchOptions = { throwOnError: options?.throwOnError ?? false };
  await Promise.all([
    queryClient.invalidateQueries(
      { queryKey: ADMIN_CONTRIBUTIONS_QUERY_KEY },
      refetchOptions,
    ),
    queryClient.invalidateQueries(
      { queryKey: MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY },
      refetchOptions,
    ),
    queryClient.invalidateQueries(
      { queryKey: ADMIN_CONTRIBUTION_DETAIL_QUERY_KEY },
      refetchOptions,
    ),
    queryClient.invalidateQueries(
      { queryKey: ADMIN_CRM_RECORD_DETAIL_QUERY_KEY },
      refetchOptions,
    ),
    queryClient.invalidateQueries(
      { queryKey: ADMIN_CRM_RECORDS_QUERY_KEY },
      refetchOptions,
    ),
  ]);
}

async function fetchContributionDetail(donationId: string) {
  const response = await fetch(
    `/api/admin/contribution-operations/${encodeURIComponent(donationId)}`,
    { headers: { accept: "application/json" } },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load contribution detail.");
  }

  const body = (await response.json()) as {
    contribution: ViewerProjectedContributionDetail;
  };
  return body.contribution;
}

export function useContributionDetail(donationId: string | null) {
  const validDonationId = isContributionGiftParam(donationId)
    ? donationId
    : null;

  return useQuery({
    enabled: Boolean(validDonationId),
    queryFn: () => fetchContributionDetail(validDonationId!),
    queryKey: contributionDetailQueryKey(validDonationId ?? "none"),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}
