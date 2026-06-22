"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AdminCrmNoteCreateResponse,
  CrmDonorDetailResponse,
} from "@asym/database/types";

export const ADMIN_CRM_RECORD_DETAIL_QUERY_KEY = [
  "admin",
  "crm",
  "records",
  "detail",
] as const;
export const ADMIN_CRM_RECORDS_QUERY_KEY = ["admin", "crm", "records"] as const;

const CRM_DETAIL_QUERY_KEY = ADMIN_CRM_RECORD_DETAIL_QUERY_KEY;
const CRM_RECORDS_QUERY_KEY = ADMIN_CRM_RECORDS_QUERY_KEY;

async function parseJsonError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return payload?.error ?? fallback;
}

async function fetchCrmRecordDetail({
  recordId,
  signal,
}: {
  recordId: string;
  signal: AbortSignal;
}) {
  const response = await fetch(`/api/admin/crm/records/${recordId}`, {
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
        `Failed to load CRM record detail (${response.status})`,
      ),
    );
  }

  return (await response.json()) as CrmDonorDetailResponse;
}

async function createLinkedCrmNote(input: {
  body: string;
  linkedRecordId: string;
  linkedRecordType: "donor_profile";
  title: string;
  visibility?: "standard" | "restricted";
}) {
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

export function useAdminCrmRecordDetail(recordId: string | null) {
  return useQuery({
    enabled: Boolean(recordId),
    gcTime: 5 * 60 * 1000,
    queryFn: ({ signal }) =>
      fetchCrmRecordDetail({
        recordId: recordId!,
        signal,
      }),
    queryKey: [...CRM_DETAIL_QUERY_KEY, recordId],
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

export function useCreateLinkedCrmNote(recordId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLinkedCrmNote,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: CRM_DETAIL_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: CRM_RECORDS_QUERY_KEY,
        }),
      ]);
    },
    scope: {
      id: recordId ? `crm-note:${recordId}` : "crm-note",
    },
  });
}
