"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import type {
  AdminCrmProjectionShadowResponse,
  CrmProjectionShadowRow,
  CrmProjectionTargetSurface,
} from "@asym/database/types";

const CRM_PROJECTIONS_QUERY_KEY = ["admin", "crm", "projections"] as const;

export const CRM_PROJECTION_TARGET_SURFACE_OPTIONS = [
  { label: "Donor", value: "donor" },
  { label: "Missionary", value: "missionary" },
  { label: "CMS", value: "cms" },
  { label: "Events", value: "event" },
  { label: "Reporting", value: "reporting" },
] as const satisfies readonly {
  label: string;
  value: CrmProjectionTargetSurface;
}[];

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

function buildProjectionSearchParams({
  search,
  targetSurfaces,
}: {
  search: string;
  targetSurfaces: CrmProjectionTargetSurface[];
}) {
  const searchParams = new URLSearchParams();

  if (search.trim()) {
    searchParams.set("q", search.trim());
  }

  for (const surface of targetSurfaces) {
    searchParams.append("surface", surface);
  }

  return searchParams;
}

async function parseJsonError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return payload?.error ?? fallback;
}

async function fetchCrmProjectionShadow({
  search,
  signal,
  targetSurfaces,
}: {
  search: string;
  signal: AbortSignal;
  targetSurfaces: CrmProjectionTargetSurface[];
}) {
  const searchParams = buildProjectionSearchParams({
    search,
    targetSurfaces,
  });
  const response = await fetch(`/api/admin/crm/projections?${searchParams}`, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      await parseJsonError(
        response,
        `Failed to load CRM projections (${response.status})`,
      ),
    );
  }

  return (await response.json()) as AdminCrmProjectionShadowResponse;
}

export function useAdminCrmProjectionShadowGrid() {
  const [search, setSearch] = React.useState("");
  const [targetSurfaces, setTargetSurfaces] = React.useState<
    CrmProjectionTargetSurface[]
  >([]);
  const debouncedSearch = useDebouncedValue(search, 250);

  const projectionsQuery = useQuery({
    queryKey: [
      ...CRM_PROJECTIONS_QUERY_KEY,
      { search: debouncedSearch, targetSurfaces },
    ],
    queryFn: ({ signal }) =>
      fetchCrmProjectionShadow({
        search: debouncedSearch,
        signal,
        targetSurfaces,
      }),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const toggleTargetSurface = React.useCallback(
    (targetSurface: CrmProjectionTargetSurface) => {
      setTargetSurfaces((current) =>
        current.includes(targetSurface)
          ? current.filter((value) => value !== targetSurface)
          : [...current, targetSurface],
      );
    },
    [],
  );

  const clearTargetSurfaces = React.useCallback(
    () => setTargetSurfaces([]),
    [],
  );

  return {
    clearTargetSurfaces,
    isLoading: projectionsQuery.isPending,
    onRefresh: projectionsQuery.refetch,
    onSearchChange: setSearch,
    onTargetSurfaceToggle: toggleTargetSurface,
    projections: (projectionsQuery.data?.rows ??
      []) as CrmProjectionShadowRow[],
    report: projectionsQuery.data?.report ?? null,
    rollback: projectionsQuery.data?.rollback,
    search,
    tableError:
      projectionsQuery.error instanceof Error ? projectionsQuery.error : null,
    targetSurfaces,
  };
}
