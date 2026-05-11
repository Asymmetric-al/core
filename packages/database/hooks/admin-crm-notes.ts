"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import type {
  AdminCrmNoteCreateResponse,
  AdminCrmNotesListResponse,
  CrmNoteRow,
  CrmNoteSortField,
} from "@asym/database/types";
import type { SortingState } from "@tanstack/react-table";

const CRM_NOTES_QUERY_KEY = ["admin", "crm", "notes"] as const;

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
  sort: CrmNoteSortField;
} {
  const primary = sorting[0];
  if (!primary) {
    return { dir: "desc", sort: "updatedAt" };
  }

  switch (primary.id) {
    case "title":
      return { dir: primary.desc ? "desc" : "asc", sort: "title" };
    case "createdAt":
      return { dir: primary.desc ? "desc" : "asc", sort: "createdAt" };
    case "updatedAt":
    default:
      return { dir: primary.desc ? "desc" : "asc", sort: "updatedAt" };
  }
}

function buildNotesSearchParams({
  search,
  sorting,
}: {
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

  return searchParams;
}

async function parseJsonError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return payload?.error ?? fallback;
}

async function fetchCrmNotes({
  search,
  signal,
  sorting,
}: {
  search: string;
  signal: AbortSignal;
  sorting: SortingState;
}) {
  const searchParams = buildNotesSearchParams({ search, sorting });
  const response = await fetch(`/api/admin/crm/notes?${searchParams}`, {
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
        `Failed to load CRM notes (${response.status})`,
      ),
    );
  }

  return (await response.json()) as AdminCrmNotesListResponse;
}

async function createCrmNote(input: {
  body: string;
  title: string;
}): Promise<AdminCrmNoteCreateResponse> {
  const response = await fetch("/api/admin/crm/notes", {
    body: JSON.stringify(input),
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await parseJsonError(
        response,
        `Failed to queue CRM note (${response.status})`,
      ),
    );
  }

  return (await response.json()) as AdminCrmNoteCreateResponse;
}

export function useAdminCrmNotesGrid() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const debouncedSearch = useDebouncedValue(search, 250);

  const notesQuery = useQuery({
    queryKey: [...CRM_NOTES_QUERY_KEY, { search: debouncedSearch, sorting }],
    queryFn: ({ signal }) =>
      fetchCrmNotes({
        search: debouncedSearch,
        signal,
        sorting,
      }),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createCrmNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CRM_NOTES_QUERY_KEY,
      });
    },
  });

  return {
    configured: notesQuery.data?.configured ?? false,
    createNote: createMutation.mutateAsync,
    createNoteError:
      createMutation.error instanceof Error ? createMutation.error : null,
    isCreatingNote: createMutation.isPending,
    isLoading: notesQuery.isPending,
    missing: notesQuery.data?.missing ?? [],
    mode: notesQuery.data?.mode ?? "not_configured",
    notes: (notesQuery.data?.rows ?? []) as CrmNoteRow[],
    onRefresh: notesQuery.refetch,
    onSearchChange: setSearch,
    onSortingChange: setSorting,
    rollback: notesQuery.data?.rollback,
    search,
    sorting,
    tableError: notesQuery.error instanceof Error ? notesQuery.error : null,
  };
}
