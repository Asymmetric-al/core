"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { applyCrmViewSettingsPatch } from "@asym/database/types";

import type {
  CrmGiftHistoryColumnSettings,
  CrmGiftHistoryFiltersSortSettings,
  CrmTablePreferencesResponse,
} from "@asym/database/types";

export const ADMIN_CRM_TABLE_PREFERENCES_QUERY_KEY = [
  "admin",
  "crm",
  "table-preferences",
] as const;

async function parsePreferenceError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return payload?.error ?? fallback;
}

async function fetchCrmTablePreferences({
  tableId,
  signal,
}: {
  tableId: string;
  signal: AbortSignal;
}) {
  const params = new URLSearchParams({ tableId });
  const response = await fetch(`/api/admin/crm/table-preferences?${params}`, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      await parsePreferenceError(
        response,
        `Failed to load table preferences (${response.status})`,
      ),
    );
  }

  return (await response.json()) as CrmTablePreferencesResponse;
}

async function saveCrmRowActionPin(input: {
  tableId: string;
  pinnedActionId: string | null;
}) {
  const response = await fetch("/api/admin/crm/table-preferences", {
    body: JSON.stringify(input),
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(
      await parsePreferenceError(
        response,
        `Failed to save the pinned row action (${response.status})`,
      ),
    );
  }

  return (await response.json()) as {
    user: { actionId: string | null; schemaVersion: number };
  };
}

export function useCrmTablePreferences(tableId: string) {
  return useQuery({
    queryFn: ({ signal }) => fetchCrmTablePreferences({ tableId, signal }),
    queryKey: [...ADMIN_CRM_TABLE_PREFERENCES_QUERY_KEY, tableId],
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}

/**
 * Per-scope view settings patch (#272): absent = unchanged, null = scoped
 * reset, value = replace.
 */
export interface CrmViewSettingsSavePatch {
  pinnedActionId?: string | null;
  columns?: Partial<CrmGiftHistoryColumnSettings> | null;
  filtersSort?: Partial<CrmGiftHistoryFiltersSortSettings> | null;
  /** Named personal view applied by the user (issue #273). */
  activeViewId?: string | null;
}

async function saveCrmTablePreferencePatch(input: {
  tableId: string;
  patch: CrmViewSettingsSavePatch;
}) {
  const response = await fetch("/api/admin/crm/table-preferences", {
    body: JSON.stringify({ tableId: input.tableId, ...input.patch }),
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(
      await parsePreferenceError(
        response,
        `Failed to save view settings (${response.status})`,
      ),
    );
  }

  return (await response.json()) as {
    user: CrmTablePreferencesResponse["user"];
  };
}

/**
 * Saves CRM gift-history view settings (columns, filters/sort, pin) with an
 * optimistic local cache update over the server source of truth (#272).
 */
export function useSaveCrmViewSettings(tableId: string) {
  const queryClient = useQueryClient();
  const queryKey = [...ADMIN_CRM_TABLE_PREFERENCES_QUERY_KEY, tableId];

  return useMutation({
    mutationFn: (patch: CrmViewSettingsSavePatch) =>
      saveCrmTablePreferencePatch({ tableId, patch }),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<CrmTablePreferencesResponse>(queryKey);
      if (previous) {
        queryClient.setQueryData<CrmTablePreferencesResponse>(queryKey, {
          ...previous,
          user: {
            actionId:
              patch.pinnedActionId !== undefined
                ? patch.pinnedActionId
                : (previous.user?.actionId ?? null),
            schemaVersion: previous.schemaVersion,
            settings: applyCrmViewSettingsPatch(
              previous.user?.settings ?? null,
              patch,
            ),
          },
        });
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Saves the user's pinned row action with an optimistic local cache update,
 * so the row action switches instantly while the server record (the source
 * of truth) catches up (ADR-CD-021).
 */
export function useSaveCrmRowActionPin(tableId: string) {
  const queryClient = useQueryClient();
  const queryKey = [...ADMIN_CRM_TABLE_PREFERENCES_QUERY_KEY, tableId];

  return useMutation({
    mutationFn: (pinnedActionId: string | null) =>
      saveCrmRowActionPin({ tableId, pinnedActionId }),
    onMutate: async (pinnedActionId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<CrmTablePreferencesResponse>(queryKey);
      if (previous) {
        queryClient.setQueryData<CrmTablePreferencesResponse>(queryKey, {
          ...previous,
          user: {
            actionId: pinnedActionId,
            schemaVersion: previous.schemaVersion,
          },
        });
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });
}
