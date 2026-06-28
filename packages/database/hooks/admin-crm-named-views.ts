"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ADMIN_CRM_TABLE_PREFERENCES_QUERY_KEY } from "./admin-crm-table-preferences";

import type {
  CrmNamedView,
  CrmNamedViewsResponse,
  CrmViewSettingsLayer,
} from "@asym/database/types";

export const ADMIN_CRM_NAMED_VIEWS_QUERY_KEY = [
  "admin",
  "crm",
  "named-views",
] as const;

/**
 * @remarks Requires the CRM named-views API route slice before admin UI imports
 * these hooks.
 */
async function parseViewError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return payload?.error ?? fallback;
}

async function fetchCrmNamedViews({
  tableId,
  signal,
}: {
  tableId: string;
  signal: AbortSignal;
}) {
  const params = new URLSearchParams({ tableId });
  const response = await fetch(
    `/api/admin/crm/table-preferences/views?${params}`,
    {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(
      await parseViewError(
        response,
        `Failed to load named views (${response.status})`,
      ),
    );
  }

  return (await response.json()) as CrmNamedViewsResponse;
}

export function isCrmNamedViewsQueryEnabled(tableId: string) {
  return Boolean(tableId);
}

export function useCrmNamedViews(tableId: string) {
  return useQuery({
    enabled: isCrmNamedViewsQueryEnabled(tableId),
    queryFn: ({ signal }) => fetchCrmNamedViews({ tableId, signal }),
    queryKey: [...ADMIN_CRM_NAMED_VIEWS_QUERY_KEY, tableId],
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}

export interface CrmNamedViewCreateInput {
  name: string;
  isDefault?: boolean;
  pinnedActionId?: string | null;
  columns?: CrmViewSettingsLayer["columns"];
  filtersSort?: CrmViewSettingsLayer["filtersSort"];
}

export interface CrmNamedViewUpdateInput {
  viewId: string;
  name?: string;
  isDefault?: boolean;
  pinnedActionId?: string | null;
  columns?: CrmViewSettingsLayer["columns"];
  filtersSort?: CrmViewSettingsLayer["filtersSort"];
}

export interface CrmNamedViewDeleteInput {
  viewId: string;
  nextDefaultViewId?: string | null;
}

function useInvalidateNamedViews(tableId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_CRM_NAMED_VIEWS_QUERY_KEY, tableId],
      }),
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_CRM_TABLE_PREFERENCES_QUERY_KEY, tableId],
      }),
    ]);
  };
}

export function useCreateCrmNamedView(tableId: string) {
  const invalidate = useInvalidateNamedViews(tableId);

  return useMutation({
    mutationFn: async (input: CrmNamedViewCreateInput) => {
      const response = await fetch("/api/admin/crm/table-preferences/views", {
        body: JSON.stringify({ tableId, ...input }),
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          await parseViewError(
            response,
            `Failed to save the named view (${response.status})`,
          ),
        );
      }

      return (await response.json()) as { view: CrmNamedView };
    },
    onSettled: invalidate,
  });
}

export function useUpdateCrmNamedView(tableId: string) {
  const invalidate = useInvalidateNamedViews(tableId);

  return useMutation({
    mutationFn: async ({ viewId, ...input }: CrmNamedViewUpdateInput) => {
      const response = await fetch(
        `/api/admin/crm/table-preferences/views/${viewId}`,
        {
          body: JSON.stringify({ tableId, ...input }),
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "PUT",
        },
      );

      if (!response.ok) {
        throw new Error(
          await parseViewError(
            response,
            `Failed to update the named view (${response.status})`,
          ),
        );
      }

      return (await response.json()) as { ok: boolean };
    },
    onSettled: invalidate,
  });
}

export function useDeleteCrmNamedView(tableId: string) {
  const invalidate = useInvalidateNamedViews(tableId);

  return useMutation({
    mutationFn: async (input: CrmNamedViewDeleteInput) => {
      const params = new URLSearchParams({ tableId });
      if (input.nextDefaultViewId) {
        params.set("nextDefaultViewId", input.nextDefaultViewId);
      }
      const response = await fetch(
        `/api/admin/crm/table-preferences/views/${input.viewId}?${params}`,
        {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(
          await parseViewError(
            response,
            `Failed to delete the named view (${response.status})`,
          ),
        );
      }

      return (await response.json()) as { ok: boolean };
    },
    onSettled: invalidate,
  });
}
