"use client";

import { useQuery } from "@tanstack/react-query";

import { mockContributions } from "./data";

import type { Contribution } from "./types";

export const ADMIN_CONTRIBUTIONS_QUERY_KEY = [
  "admin",
  "contributions",
] as const;

function cloneContribution(contribution: Contribution): Contribution {
  return { ...contribution };
}

/**
 * Mock-only loader until a real admin contributions API exists.
 * No network I/O — clones fixture rows for an isolated React Query cache entry.
 * TODO(api): replace this scaffold with a real admin contributions endpoint
 * before enabling the non-mock UI path in production.
 */
export function loadMockAdminContributions(): Contribution[] {
  return mockContributions.map(cloneContribution);
}

export function useAdminContributions() {
  return useQuery({
    queryKey: ADMIN_CONTRIBUTIONS_QUERY_KEY,
    queryFn: () => Promise.resolve(loadMockAdminContributions()),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
