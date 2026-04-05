"use client";

import { useQuery } from "@tanstack/react-query";

import { mockContributions } from "./data";

import type { Contribution } from "./types";

export const ADMIN_CONTRIBUTIONS_QUERY_KEY = [
  "admin",
  "contributions",
] as const;

function cloneContribution(contribution: Contribution): Contribution {
  return {
    ...contribution,
    donor: { ...contribution.donor },
  };
}

function waitForDelay(ms: number, signal?: AbortSignal) {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const timeoutId = globalThis.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const abortHandler = () => {
      cleanup();
      const error = new Error("Admin contributions query aborted");
      error.name = "AbortError";
      reject(error);
    };

    const cleanup = () => {
      globalThis.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortHandler);
    };

    signal?.addEventListener("abort", abortHandler, { once: true });
  });
}

export async function fetchAdminContributions({
  delayMs = 250,
  signal,
}: {
  delayMs?: number;
  signal?: AbortSignal;
} = {}): Promise<Contribution[]> {
  await waitForDelay(delayMs, signal);

  if (signal?.aborted) {
    const error = new Error("Admin contributions query aborted");
    error.name = "AbortError";
    throw error;
  }

  return mockContributions.map(cloneContribution);
}

export function useAdminContributions() {
  return useQuery({
    queryKey: ADMIN_CONTRIBUTIONS_QUERY_KEY,
    queryFn: ({ signal }) => fetchAdminContributions({ signal }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}
