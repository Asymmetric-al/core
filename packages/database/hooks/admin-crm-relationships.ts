"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
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
  after,
  domains,
  search,
  sorting,
}: {
  after: string | null;
  domains: CrmRelationshipDomain[];
  search: string;
  sorting: SortingState;
}) {
  const searchParams = new URLSearchParams();
  const sort = mapSortField(sorting);

  searchParams.set("limit", "50");
  if (after) {
    searchParams.set("after", after);
  }
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
  after,
  domains,
  search,
  signal,
  sorting,
}: {
  after: string | null;
  domains: CrmRelationshipDomain[];
  search: string;
  signal: AbortSignal;
  sorting: SortingState;
}) {
  const searchParams = buildRelationshipsSearchParams({
    after,
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
  // Newest activity first; Updated stays one click away in View.
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "lastActivityAt", desc: true },
  ]);
  const debouncedSearch = useDebouncedValue(search, 250);
  // Toggling appends/removes domains, so the raw array's order depends on the
  // toggle sequence. Normalize the key to a sorted serialization so equivalent
  // selections (e.g. people+churches vs churches+people) share one cache entry.
  const domainsKey = React.useMemo(
    () => [...domains].sort().join(","),
    [domains],
  );

  // Pages follow the API's cursor so the grid can continue past the first
  // 50 relationships ("Load more"); the report covers all rows on every page.
  const relationshipsQuery = useInfiniteQuery({
    queryKey: [
      ...CRM_RELATIONSHIPS_QUERY_KEY,
      { domains: domainsKey, search: debouncedSearch, sorting },
    ],
    queryFn: ({ signal, pageParam }) =>
      fetchCrmRelationships({
        domains,
        after: pageParam,
        search: debouncedSearch,
        signal,
        sorting,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
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

  const firstPage = relationshipsQuery.data?.pages[0];
  const relationships = React.useMemo(
    () =>
      (relationshipsQuery.data?.pages ?? []).flatMap(
        (page) => page.rows,
      ) as CrmRelationshipRow[],
    [relationshipsQuery.data],
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = relationshipsQuery;
  const loadMore = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    clearDomains,
    configured: firstPage?.configured ?? true,
    domains,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
    isLoading: relationshipsQuery.isPending,
    loadMore,
    missing: firstPage?.missing ?? [],
    mode: firstPage?.mode ?? "local",
    onDomainToggle: toggleDomain,
    onRefresh: relationshipsQuery.refetch,
    onSearchChange: setSearch,
    onSortingChange: setSorting,
    relationships,
    report: firstPage?.report ?? null,
    rollback: firstPage?.rollback,
    search,
    sorting,
    tableError:
      relationshipsQuery.error instanceof Error
        ? relationshipsQuery.error
        : null,
  };
}
