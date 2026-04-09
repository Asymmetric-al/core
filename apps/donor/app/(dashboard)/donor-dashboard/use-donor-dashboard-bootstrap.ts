"use client";

import { useQuery } from "@tanstack/react-query";

export const DONOR_DASHBOARD_BOOTSTRAP_KEY = [
  "donor",
  "dashboard",
  "bootstrap",
] as const;

/**
 * Short async gate so Boneyard can show a real loading phase without setTimeout in the page.
 * Replace with real dashboard data fetches when wired.
 *
 * On `AbortSignal` (TanStack Query cancellation: unmount, refetch, strict mode), we **resolve**
 * instead of rejecting so the client does not surface a bogus "Load failed" state.
 */
export function fetchDonorDashboardBootstrap({
  delayMs = 0,
  signal,
}: {
  delayMs?: number;
  signal?: AbortSignal;
} = {}): Promise<void> {
  if (delayMs <= 0) {
    return Promise.resolve();
  }

  if (signal?.aborted) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const id = globalThis.setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);

    const cleanup = () => {
      globalThis.clearTimeout(id);
      signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      cleanup();
      resolve();
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export function useDonorDashboardBootstrap() {
  return useQuery({
    queryKey: DONOR_DASHBOARD_BOOTSTRAP_KEY,
    queryFn: ({ signal }) =>
      fetchDonorDashboardBootstrap({ delayMs: 200, signal }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
