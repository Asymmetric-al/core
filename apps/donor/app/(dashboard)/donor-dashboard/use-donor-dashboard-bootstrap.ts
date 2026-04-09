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
    const err = new Error("Donor dashboard bootstrap aborted");
    err.name = "AbortError";
    return Promise.reject(err);
  }

  return new Promise((resolve, reject) => {
    const id = globalThis.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);

    const onAbort = () => {
      globalThis.clearTimeout(id);
      const err = new Error("Donor dashboard bootstrap aborted");
      err.name = "AbortError";
      reject(err);
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
