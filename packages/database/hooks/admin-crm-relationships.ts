"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import type {
  AdminCrmRelationshipsListResponse,
  CrmRelationshipDomain,
  CrmRelationshipRow,
  CrmRelationshipSortField,
} from "@asym/database/types";
import type { SortingState } from "@tanstack/react-table";

const CRM_RELATIONSHIPS_QUERY_KEY = ["admin", "crm", "relationships"] as const;

export const CRM_RELATIONSHIP_DOMAIN_OPTIONS = [
  { label: "People", value: "people" },
  { label: "Organizations", value: "organizations" },
  { label: "Churches", value: "churches" },
  { label: "Households", value: "households" },
  { label: "Pledges", value: "pledges" },
  { label: "Activity", value: "activity" },
] as const satisfies readonly {
  label: string;
  value: CrmRelationshipDomain;
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

function mapSortField(sorting: SortingState): {
  dir: "asc" | "desc";
  sort: CrmRelationshipSortField;
} {
  const primary = sorting[0];
  if (!primary) {
    return { dir: "desc", sort: "updatedAt" };
  }

  switch (primary.id) {
    case "displayName":
      return { dir: primary.desc ? "desc" : "asc", sort: "displayName" };
    case "domain":
      return { dir: primary.desc ? "desc" : "asc", sort: "domain" };
    case "status":
      return { dir: primary.desc ? "desc" : "asc", sort: "status" };
    case "lastActivityAt":
      return { dir: primary.desc ? "desc" : "asc", sort: "lastActivityAt" };
    case "commitmentAmountCents":
      return {
        dir: primary.desc ? "desc" : "asc",
        sort: "commitmentAmountCents",
      };
    case "updatedAt":
    default:
      return { dir: primary.desc ? "desc" : "asc", sort: "updatedAt" };
  }
}

function buildRelationshipsSearchParams({
  domains,
  search,
  sorting,
}: {
  domains: CrmRelationshipDomain[];
  search: string;
  sorting: SortingState;
}) {
  const searchParams = new URLSearchParams();
  const sort = mapSortField(sorting);

  searchParams.set("limit", "50");
  searchParams.set("sort", sort.sort);
  searchParams.set("dir", sort.dir);

  if (search.trim()) {
    searchParams.set("q", search.trim());
  }

  for (const domain of domains) {
    searchParams.append("domain", domain);
  }

  return searchParams;
}

async function parseJsonError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return payload?.error ?? fallback;
}

async function fetchCrmRelationships({
  domains,
  search,
  signal,
  sorting,
}: {
  domains: CrmRelationshipDomain[];
  search: string;
  signal: AbortSignal;
  sorting: SortingState;
}) {
  const searchParams = buildRelationshipsSearchParams({
    domains,
    search,
    sorting,
  });
  const response = await fetch(`/api/admin/crm/relationships?${searchParams}`, {
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
        `Failed to load CRM relationships (${response.status})`,
      ),
    );
  }

  return (await response.json()) as AdminCrmRelationshipsListResponse;
}

export function useAdminCrmRelationshipsGrid() {
  const [search, setSearch] = React.useState("");
  const [domains, setDomains] = React.useState<CrmRelationshipDomain[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const debouncedSearch = useDebouncedValue(search, 250);
  // Toggling appends/removes domains, so the raw array's order depends on the
  // toggle sequence. Normalize the key to a sorted serialization so equivalent
  // selections (e.g. people+churches vs churches+people) share one cache entry.
  const domainsKey = React.useMemo(
    () => [...domains].sort().join(","),
    [domains],
  );

  const relationshipsQuery = useQuery({
    queryKey: [
      ...CRM_RELATIONSHIPS_QUERY_KEY,
      { domains: domainsKey, search: debouncedSearch, sorting },
    ],
    queryFn: ({ signal }) =>
      fetchCrmRelationships({
        domains,
        search: debouncedSearch,
        signal,
        sorting,
      }),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const toggleDomain = React.useCallback((domain: CrmRelationshipDomain) => {
    setDomains((current) =>
      current.includes(domain)
        ? current.filter((value) => value !== domain)
        : [...current, domain],
    );
  }, []);

  const clearDomains = React.useCallback(() => setDomains([]), []);

  return {
    clearDomains,
    configured: relationshipsQuery.data?.configured ?? true,
    domains,
    isLoading: relationshipsQuery.isPending,
    missing: relationshipsQuery.data?.missing ?? [],
    mode: relationshipsQuery.data?.mode ?? "local",
    onDomainToggle: toggleDomain,
    onRefresh: relationshipsQuery.refetch,
    onSearchChange: setSearch,
    onSortingChange: setSorting,
    relationships: (relationshipsQuery.data?.rows ??
      []) as CrmRelationshipRow[],
    report: relationshipsQuery.data?.report ?? null,
    rollback: relationshipsQuery.data?.rollback,
    search,
    sorting,
    tableError:
      relationshipsQuery.error instanceof Error
        ? relationshipsQuery.error
        : null,
  };
}
