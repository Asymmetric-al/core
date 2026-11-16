"use client";

import { useQuery } from "@tanstack/react-query";

export const ADMIN_CRM_TAG_OPTIONS_QUERY_KEY = [
  "admin-crm-tag-options",
] as const;

async function fetchAdminCrmTagOptions(
  signal?: AbortSignal,
): Promise<string[]> {
  const response = await fetch("/api/admin/crm/tags", {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to load CRM tags (${response.status})`);
  }
  const payload = (await response.json()) as { tags?: unknown };
  return Array.isArray(payload.tags)
    ? payload.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
}

/**
 * Every tag in use across the tenant's CRM records, for the Tag filter. The
 * grid loads records a page at a time, so loaded rows alone miss tags on
 * records further down. Cached for five minutes; a failed load leaves the
 * filter with the tags on the loaded rows.
 */
export function useAdminCrmTagOptions() {
  return useQuery({
    queryKey: ADMIN_CRM_TAG_OPTIONS_QUERY_KEY,
    queryFn: ({ signal }) => fetchAdminCrmTagOptions(signal),
    staleTime: 5 * 60 * 1000,
  });
}
