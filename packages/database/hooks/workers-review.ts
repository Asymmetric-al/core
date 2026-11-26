"use client";

import { useQuery } from "@tanstack/react-query";

import { ownApiFetch } from "@asym/database/own-api";

export const UNREVIEWED_WORKERS_COUNT_QUERY_KEY = [
  "admin",
  "workers",
  "unreviewed-count",
] as const;

async function loadUnreviewedWorkersCount(): Promise<number> {
  const response = await ownApiFetch("/api/admin/workers/unreviewed-count", {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!response.ok)
    throw new Error("Could not check workers' security levels.");
  const body = (await response.json().catch(() => null)) as {
    count?: unknown;
  } | null;
  const count = body?.count;
  if (typeof count !== "number" || !Number.isInteger(count) || count < 0)
    throw new Error("Could not check workers' security levels.");
  return count;
}

export function useUnreviewedWorkersCount() {
  return useQuery({
    queryFn: loadUnreviewedWorkersCount,
    queryKey: UNREVIEWED_WORKERS_COUNT_QUERY_KEY,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 0,
  });
}
