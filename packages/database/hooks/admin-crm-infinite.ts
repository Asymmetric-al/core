"use client";

import {
  createCollection,
  localOnlyCollectionOptions,
  useLiveQuery,
} from "@tanstack/react-db";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as React from "react";

import type { AdminCrmListResponse, CrmGridRow } from "@asym/database/types";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

const CRM_QUERY_KEY = ["admin", "crm", "records", "infinite"] as const;

type CrmLoadedRow = CrmGridRow & { sortPosition: number };

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

function mapSortField(sorting: SortingState) {
  const primary = sorting[0];
  if (!primary) {
    return { dir: "desc" as const, sort: "updatedAt" };
  }

  switch (primary.id) {
    case "displayName":
      return { dir: primary.desc ? "desc" : "asc", sort: "name" };
    case "recordType":
      return { dir: primary.desc ? "desc" : "asc", sort: "recordType" };
    case "lifecycleStatus":
      return { dir: primary.desc ? "desc" : "asc", sort: "lifecycleStatus" };
    case "lifetimeGiving":
      return { dir: primary.desc ? "desc" : "asc", sort: "lifetimeGiving" };
    case "lastGiftAt":
      return { dir: primary.desc ? "desc" : "asc", sort: "lastGiftAt" };
    case "lastTouchAt":
      return { dir: primary.desc ? "desc" : "asc", sort: "updatedAt" };
    case "createdAt":
      return { dir: primary.desc ? "desc" : "asc", sort: "createdAt" };
    default:
      return { dir: primary.desc ? "desc" : "asc", sort: "updatedAt" };
  }
}

function getColumnFilterValue(
  columnFilters: ColumnFiltersState,
  id: string,
): unknown {
  return columnFilters.find((filter) => filter.id === id)?.value;
}

function buildCrmSearchParams({
  columnFilters,
  sorting,
  after,
}: {
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
  after?: string | null;
}) {
  const searchParams = new URLSearchParams();
  const sort = mapSortField(sorting);

  searchParams.set("limit", "50");
  searchParams.set("sort", sort.sort);
  searchParams.set("dir", sort.dir);

  const nameSearch = getColumnFilterValue(columnFilters, "displayName");
  if (typeof nameSearch === "string" && nameSearch.trim()) {
    searchParams.set("q", nameSearch.trim());
  }

  const recordTypes = getColumnFilterValue(columnFilters, "recordType");
  if (Array.isArray(recordTypes)) {
    for (const t of recordTypes) {
      searchParams.append("recordType", String(t));
    }
  }

  const statuses = getColumnFilterValue(columnFilters, "lifecycleStatus");
  if (Array.isArray(statuses)) {
    for (const s of statuses) {
      searchParams.append("status", String(s));
    }
  }

  const tags = getColumnFilterValue(columnFilters, "tags");
  if (Array.isArray(tags)) {
    for (const tag of tags) {
      searchParams.append("tag", String(tag));
    }
  }

  const portal = getColumnFilterValue(columnFilters, "portalAccessLabel");
  if (Array.isArray(portal) && portal.length === 1) {
    const v = String(portal[0]);
    if (v === "linked") {
      searchParams.set("hasPortal", "true");
    } else if (v === "none") {
      searchParams.set("hasPortal", "false");
    }
  }

  if (after) {
    searchParams.set("after", after);
  }

  return searchParams;
}

async function fetchCrmPage({
  after,
  columnFilters,
  signal,
  sorting,
}: {
  after?: string | null;
  columnFilters: ColumnFiltersState;
  signal: AbortSignal;
  sorting: SortingState;
}) {
  const searchParams = buildCrmSearchParams({
    columnFilters,
    sorting,
    after,
  });
  const response = await fetch(`/api/admin/crm/records?${searchParams}`, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      payload?.error || `Failed to load CRM records (${response.status})`,
    );
  }

  return (await response.json()) as AdminCrmListResponse;
}

export function useAdminCrmRecordsInfiniteGrid() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "lastTouchAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const debouncedFilters = useDebouncedValue(columnFilters, 250);
  const collectionFingerprint = React.useMemo(
    () => JSON.stringify({ filters: debouncedFilters, sorting }),
    [debouncedFilters, sorting],
  );

  const loadedCollection = React.useMemo(
    () =>
      createCollection(
        localOnlyCollectionOptions<CrmLoadedRow>({
          id: `crm-loaded-${collectionFingerprint}`,
          getKey: (row) => row.id,
          initialData: [],
        }),
      ),
    [collectionFingerprint],
  );

  const loadedRowsQuery = useLiveQuery((q) =>
    q
      .from({ row: loadedCollection })
      .select(({ row }) => row)
      .orderBy(({ row }) => row.sortPosition, "asc"),
  );

  const infiniteQuery = useInfiniteQuery({
    queryKey: [...CRM_QUERY_KEY, { filters: debouncedFilters, sorting }],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      fetchCrmPage({
        after: pageParam,
        columnFilters: debouncedFilters,
        signal,
        sorting,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    maxPages: 8,
  });

  const flattenedRows = React.useMemo(() => {
    let offset = 0;
    return (infiniteQuery.data?.pages ?? []).flatMap((page) => {
      const mappedRows = page.rows.map((row, index) => ({
        ...row,
        sortPosition: offset + index,
      }));
      offset += page.rows.length;
      return mappedRows;
    });
  }, [infiniteQuery.data?.pages]);

  const crmLoadedCollectionRef = React.useRef(loadedCollection);
  React.useEffect(() => {
    const collectionSwapped =
      crmLoadedCollectionRef.current !== loadedCollection;
    crmLoadedCollectionRef.current = loadedCollection;

    const rawLiveRows = loadedRowsQuery.data ?? [];
    // After fingerprint changes, `loadedCollection` is a new instance but
    // `useLiveQuery` can still return the previous collection's rows briefly;
    // treating the snapshot as empty forces insert-only for that pass.
    const currentRows = collectionSwapped ? [] : rawLiveRows;
    const currentById = new Map(currentRows.map((row) => [row.id, row]));
    const nextIds = new Set(flattenedRows.map((row) => row.id));

    const removedIds = currentRows
      .map((row) => row.id)
      .filter((id) => !nextIds.has(id));

    if (removedIds.length > 0) {
      loadedCollection.delete(removedIds);
    }

    for (const nextRow of flattenedRows) {
      const existingRow = currentById.get(nextRow.id);
      if (!existingRow) {
        loadedCollection.insert(nextRow);
        continue;
      }

      loadedCollection.update(nextRow.id, (draft) => {
        Object.assign(draft, nextRow);
      });
    }
  }, [flattenedRows, loadedCollection, loadedRowsQuery.data]);

  const rows = React.useMemo(
    () =>
      (loadedRowsQuery.data ?? []).map(
        ({ sortPosition: _sortPosition, ...row }) => row,
      ),
    [loadedRowsQuery.data],
  );

  const refresh = React.useCallback(async () => {
    await infiniteQuery.refetch();
  }, [infiniteQuery]);

  return {
    columnFilters,
    hasMore: infiniteQuery.hasNextPage ?? false,
    isError: infiniteQuery.isError,
    isFetchingMore: infiniteQuery.isFetchingNextPage,
    isLoading: infiniteQuery.isPending && rows.length === 0,
    loadMore: () => {
      if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
        void infiniteQuery.fetchNextPage();
      }
    },
    onFiltersChange: setColumnFilters,
    onRefresh: refresh,
    onSortingChange: setSorting,
    rows,
    sorting,
    tableError:
      infiniteQuery.error instanceof Error ? infiniteQuery.error : null,
  };
}
