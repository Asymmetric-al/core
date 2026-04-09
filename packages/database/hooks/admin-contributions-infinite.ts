"use client";

import {
  createCollection,
  localOnlyCollectionOptions,
  useLiveQuery,
} from "@tanstack/react-db";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as React from "react";

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

interface ContributionGridRow {
  id: string;
  donorId: string | null;
  donorName: string;
  donorEmail: string;
  donorAvatar: string | null;
  donorType: string | null;
  donorPhone: string | null;
  donorLocation: string | null;
  organizationName: string | null;
  amount: number;
  amountGross: number;
  amountNet: number | null;
  amountFee: number | null;
  amountTaxDeductible: number | null;
  currency: string;
  date: string;
  contributionDate: string;
  createdAt: string;
  updatedAt: string;
  settlementDate: string | null;
  depositDate: string | null;
  status: "completed" | "pending" | "failed" | "refunded";
  subStatus: string | null;
  type: "One-time" | "Recurring" | "Pledge" | "In-kind";
  paymentMethod:
    | "Credit Card"
    | "Bank Transfer"
    | "Check"
    | "Cash"
    | "PayPal"
    | "Other";
  source: "Online" | "Mobile" | "In-person" | "Mail" | "Phone" | "Import";
  fundId: string | null;
  fundCode: string | null;
  fundName: string;
  missionaryId: string | null;
  missionaryName: string | null;
  campaignId: string | null;
  receiptStatus: "sent" | "pending" | "failed" | "not_sent";
  receiptSent: boolean;
  receiptSentAt: string | null;
  annualStatementEligible: boolean;
  entryMethod: "api" | "manual" | "import";
  reconciliationStatus: "unreconciled" | "review" | "reconciled";
  transactionId: string | null;
  externalTransactionId: string | null;
  processorTransactionId: string | null;
  notes: string | null;
  notesPreview: string | null;
  isAnonymous: boolean;
}

interface AdminContributionsListResponse {
  rows: ContributionGridRow[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface AdminContributionsSummary {
  totalReceived: number;
  successfulCount: number;
  pendingAmount: number;
  pendingCount: number;
  averageGift: number;
  recurringCount: number;
}

const CONTRIBUTIONS_QUERY_KEY = ["admin", "contributions", "infinite"] as const;
const CONTRIBUTIONS_SUMMARY_QUERY_KEY = [
  "admin",
  "contributions",
  "summary",
] as const;

type ContributionLoadedRow = ContributionGridRow & { sortPosition: number };

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
    return { dir: "desc" as const, sort: "giftDate" };
  }

  switch (primary.id) {
    case "amountGross":
      return { dir: primary.desc ? "desc" : "asc", sort: "amount" };
    case "status":
      return { dir: primary.desc ? "desc" : "asc", sort: "status" };
    case "paymentMethod":
      return { dir: primary.desc ? "desc" : "asc", sort: "paymentMethod" };
    case "source":
      return { dir: primary.desc ? "desc" : "asc", sort: "source" };
    case "date":
    default:
      return { dir: primary.desc ? "desc" : "asc", sort: "giftDate" };
  }
}

function getColumnFilterValue(
  columnFilters: ColumnFiltersState,
  id: string,
): unknown {
  return columnFilters.find((filter) => filter.id === id)?.value;
}

function normalizeTypeFilterValue(value: string) {
  switch (value) {
    case "Recurring":
      return "recurring";
    case "Pledge":
      return "pledge";
    case "In-kind":
      return "in_kind";
    case "One-time":
    default:
      return "one_time";
  }
}

function normalizePaymentMethodValue(value: string) {
  switch (value) {
    case "Credit Card":
      return "card";
    case "Bank Transfer":
      return "bank_transfer";
    case "Check":
      return "check";
    case "Cash":
      return "cash";
    case "PayPal":
      return "paypal";
    default:
      return "other";
  }
}

function normalizeSourceValue(value: string) {
  switch (value) {
    case "Mobile":
      return "mobile";
    case "In-person":
      return "in_person";
    case "Mail":
      return "mail";
    case "Phone":
      return "phone";
    case "Import":
      return "import";
    default:
      return "direct";
  }
}

function buildContributionSearchParams({
  columnFilters,
  sorting,
  after,
}: {
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
  after?: string | null;
}) {
  const searchParams = new URLSearchParams();
  const donorSearch = getColumnFilterValue(columnFilters, "donorName");
  const statuses = getColumnFilterValue(columnFilters, "status");
  const types = getColumnFilterValue(columnFilters, "type");
  const paymentMethods = getColumnFilterValue(columnFilters, "paymentMethod");
  const sources = getColumnFilterValue(columnFilters, "source");
  const sort = mapSortField(sorting);

  searchParams.set("limit", "50");
  searchParams.set("sort", sort.sort);
  searchParams.set("dir", sort.dir);

  if (typeof donorSearch === "string" && donorSearch.trim()) {
    searchParams.set("q", donorSearch.trim());
  }

  if (Array.isArray(statuses)) {
    for (const status of statuses) {
      searchParams.append("status", String(status));
    }
  }

  if (Array.isArray(types)) {
    for (const type of types) {
      searchParams.append("type", normalizeTypeFilterValue(String(type)));
    }
  }

  if (Array.isArray(paymentMethods)) {
    for (const paymentMethod of paymentMethods) {
      searchParams.append(
        "paymentMethod",
        normalizePaymentMethodValue(String(paymentMethod)),
      );
    }
  }

  if (Array.isArray(sources)) {
    for (const source of sources) {
      searchParams.append("source", normalizeSourceValue(String(source)));
    }
  }

  if (after) {
    searchParams.set("after", after);
  }

  return searchParams;
}

async function fetchContributionPage({
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
  const searchParams = buildContributionSearchParams({
    columnFilters,
    sorting,
    after,
  });
  const response = await fetch(`/api/admin/contributions?${searchParams}`, {
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
      payload?.error || `Failed to load contributions (${response.status})`,
    );
  }

  return (await response.json()) as AdminContributionsListResponse;
}

async function fetchContributionSummary() {
  const response = await fetch("/api/admin/contributions/summary", {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      payload?.error ||
        `Failed to load contributions summary (${response.status})`,
    );
  }

  return (await response.json()) as AdminContributionsSummary;
}

export function useAdminContributionsInfiniteGrid() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "date", desc: true },
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
        localOnlyCollectionOptions<ContributionLoadedRow>({
          id: `contributions-loaded-${collectionFingerprint}`,
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
    queryKey: [
      ...CONTRIBUTIONS_QUERY_KEY,
      { filters: debouncedFilters, sorting },
    ],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      fetchContributionPage({
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

  const summaryQuery = useQuery({
    queryKey: [...CONTRIBUTIONS_SUMMARY_QUERY_KEY],
    queryFn: fetchContributionSummary,
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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

  React.useEffect(() => {
    const currentRows = loadedRowsQuery.data ?? [];
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
    await Promise.all([infiniteQuery.refetch(), summaryQuery.refetch()]);
  }, [infiniteQuery, summaryQuery]);

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
    summary: summaryQuery.data,
    summaryError:
      summaryQuery.error instanceof Error ? summaryQuery.error : null,
    tableError:
      infiniteQuery.error instanceof Error ? infiniteQuery.error : null,
    queryClient,
  };
}
