"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";

import { mockContributions } from "./data";
import { ADMIN_CONTRIBUTIONS_LOAD_CEILING } from "./hub-model";

import type { Contribution } from "./types";
import type { AdminContributionsListResponse } from "@asym/api/admin/contributions/types";

export const ADMIN_CONTRIBUTIONS_QUERY_KEY = [
  "admin",
  "contributions",
] as const;

/** The server's maximum page size for `GET /api/admin/contributions`. */
export const ADMIN_CONTRIBUTIONS_PAGE_SIZE = 100;

export { ADMIN_CONTRIBUTIONS_LOAD_CEILING };

/** Keyset cursor of the page to read; null reads the newest gifts. */
type ContributionsPageCursor = string | null;

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

async function readListPage(
  cursor: ContributionsPageCursor,
  signal?: AbortSignal,
): Promise<AdminContributionsListResponse> {
  const params = new URLSearchParams({
    limit: String(ADMIN_CONTRIBUTIONS_PAGE_SIZE),
  });
  if (cursor) {
    params.set("after", cursor);
  }
  const response = await fetch(
    `/api/admin/contributions?${params.toString()}`,
    { headers: { accept: "application/json" }, signal },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load contributions.");
  }

  return (await response.json()) as AdminContributionsListResponse;
}

/**
 * Every gift from the loaded pages, newest first, once each, capped at the
 * hub's load ceiling. A gift that moves between pages while they load is
 * kept at its first position.
 */
function mergeListPages(
  pages: readonly AdminContributionsListResponse[],
): Contribution[] {
  const rowsById = new Map<string, Contribution>();
  for (const page of pages) {
    for (const row of page.rows ?? []) {
      if (rowsById.size >= ADMIN_CONTRIBUTIONS_LOAD_CEILING) {
        return [...rowsById.values()];
      }
      if (!rowsById.has(row.id)) {
        rowsById.set(row.id, cloneContribution(row));
      }
    }
  }
  return [...rowsById.values()];
}

/**
 * The cursor of the next older page, or undefined once the server has no
 * more gifts, repeats a cursor, or the hub reached its load ceiling.
 */
function nextListCursor(
  lastPage: AdminContributionsListResponse,
  pages: readonly AdminContributionsListResponse[],
  lastCursor: ContributionsPageCursor,
): string | undefined {
  if (
    !lastPage.hasMore ||
    !lastPage.nextCursor ||
    lastPage.nextCursor === lastCursor
  ) {
    return undefined;
  }
  if (mergeListPages(pages).length >= ADMIN_CONTRIBUTIONS_LOAD_CEILING) {
    return undefined;
  }
  return lastPage.nextCursor;
}

/**
 * A load problem after gifts are already on screen: an older page failed
 * ("older") or a refresh of the loaded pages failed ("refresh"). The rows
 * shown stay; `onRetry` reloads only what failed.
 */
export interface ContributionsLoadIssue {
  kind: "older" | "refresh";
  message: string;
  onRetry: () => void;
}

export interface AdminContributionsList {
  /** Gifts loaded so far, newest first; undefined until the first page. */
  data: Contribution[] | undefined;
  isPending: boolean;
  /** No gifts could be loaded at all (the first page failed). */
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
  /**
   * True while older pages are still loading, so the hub can say its totals
   * cover the gifts loaded so far rather than every gift on record.
   */
  isLoadingOlder: boolean;
  /** A failure after gifts were shown; null when loading is healthy. */
  loadIssue: ContributionsLoadIssue | null;
}

/** One retry per page absorbs a transient blip across many page requests. */
const PAGE_RETRY_COUNT = 1;
const PAGE_RETRY_DELAY_MS = 750;

/**
 * Loads every contribution the hub can show by following the server's keyset
 * cursor (newest gift first, 100 per page). The hub filters, sorts and totals
 * in the browser, so a single unparameterised request (50 rows) silently
 * dropped every older gift. The newest page renders as soon as it arrives and
 * older pages keep loading behind it until the server runs out or the hub
 * reaches its load ceiling.
 *
 * Failures degrade honestly: only a failed first load is a failed workspace.
 * When an older page (or a refresh) fails, the gifts already shown stay and
 * `loadIssue` offers a retry of just the failed request.
 */
export function useAdminContributions(): AdminContributionsList {
  const query = useInfiniteQuery({
    queryKey: ADMIN_CONTRIBUTIONS_QUERY_KEY,
    queryFn: ({ pageParam, signal }) => readListPage(pageParam, signal),
    initialPageParam: null as ContributionsPageCursor,
    getNextPageParam: (lastPage, pages, lastCursor) =>
      nextListCursor(lastPage, pages, lastCursor),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: PAGE_RETRY_COUNT,
    retryDelay: PAGE_RETRY_DELAY_MS,
  });
  const {
    fetchNextPage,
    hasNextPage,
    isError: queryFailed,
    isFetching,
    isFetchNextPageError,
    refetch,
  } = query;
  const pages = query.data?.pages;
  // Keyed on the page count too: a fast page can start and finish between
  // two renders, leaving every other dependency unchanged.
  const loadedPageCount = pages?.length ?? 0;
  const hasRows = loadedPageCount > 0;

  useEffect(() => {
    // One page at a time; a refetch in flight finishes before paging on, and
    // a failed page waits for staff to retry it.
    if (loadedPageCount > 0 && hasNextPage && !isFetching && !queryFailed) {
      void fetchNextPage({ cancelRefetch: false });
    }
  }, [fetchNextPage, hasNextPage, isFetching, loadedPageCount, queryFailed]);

  const rows = useMemo(
    () => (pages ? mergeListPages(pages) : undefined),
    [pages],
  );

  const retryOlder = useCallback(() => {
    void fetchNextPage({ cancelRefetch: false });
  }, [fetchNextPage]);
  const retryRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  // While a retry is in flight the issue clears, so the hub shows progress
  // rather than a stale failure.
  const loadIssue = useMemo<ContributionsLoadIssue | null>(() => {
    if (!queryFailed || !hasRows || isFetching) {
      return null;
    }
    const message =
      query.error?.message?.trim() || "Could not load contributions.";
    return isFetchNextPageError
      ? { kind: "older", message, onRetry: retryOlder }
      : { kind: "refresh", message, onRetry: retryRefresh };
  }, [
    hasRows,
    isFetchNextPageError,
    isFetching,
    query.error,
    queryFailed,
    retryOlder,
    retryRefresh,
  ]);

  return {
    data: rows,
    isPending: query.isPending,
    isError: queryFailed && !hasRows,
    error: query.error,
    refetch,
    // A retried older page counts as loading even before the failure clears.
    isLoadingOlder:
      query.isFetchingNextPage || (!queryFailed && Boolean(hasNextPage)),
    loadIssue,
  };
}
