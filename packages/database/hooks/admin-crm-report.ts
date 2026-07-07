"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import type {
  AdminCrmReportResponse,
  CrmReportSlice,
} from "@asym/database/types";

const CRM_REPORT_QUERY_KEY = ["admin", "crm", "report"] as const;

async function parseJsonError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return payload?.error ?? fallback;
}

async function fetchCrmReport({
  signal,
  slice,
}: {
  signal: AbortSignal;
  slice: CrmReportSlice;
}) {
  const searchParams = new URLSearchParams({ slice });
  const response = await fetch(`/api/admin/crm/reports?${searchParams}`, {
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
        `Failed to load CRM report (${response.status})`,
      ),
    );
  }

  return (await response.json()) as AdminCrmReportResponse;
}

export function useAdminCrmReport(slice: CrmReportSlice = "funds") {
  const reportQuery = useQuery({
    queryKey: [...CRM_REPORT_QUERY_KEY, { slice }],
    queryFn: ({ signal }) => fetchCrmReport({ signal, slice }),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const error = React.useMemo(() => {
    if (reportQuery.error instanceof Error) {
      return reportQuery.error;
    }

    return reportQuery.error ? new Error(String(reportQuery.error)) : null;
  }, [reportQuery.error]);

  return {
    error,
    isError: reportQuery.isError,
    isLoading: reportQuery.isPending,
    onRefresh: reportQuery.refetch,
    report: reportQuery.data ?? null,
  };
}
