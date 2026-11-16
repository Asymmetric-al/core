"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import type {
  AdminCrmReportResponse,
  CrmReportSlice,
} from "@asym/database/types";

const CRM_REPORT_QUERY_KEY = ["admin", "crm", "report"] as const;

/** The giving groupings the Reports page offers. */
export type CrmReportGroup = Extract<
  CrmReportSlice,
  "funds" | "missionaries" | "donors"
>;

export type CrmReportPeriodKey = "all" | "year" | "12m" | "90d" | "30d";

/** API date bounds; null is open-ended (all time when both are null). */
export interface CrmReportPeriod {
  dateFrom: string | null;
  dateTo: string | null;
}

const ALL_TIME: CrmReportPeriod = { dateFrom: null, dateTo: null };

/**
 * A period as API bounds: it starts at local midnight, so "Last 30 days"
 * means today and the 29 days before it, and the end stays open.
 */
function localCalendarDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function crmReportPeriodRange(
  key: CrmReportPeriodKey,
  now: Date = new Date(),
): CrmReportPeriod {
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const from = {
    all: null,
    year: new Date(year, 0, 1),
    "12m": new Date(year - 1, month, day),
    "90d": new Date(year, month, day - 89),
    "30d": new Date(year, month, day - 29),
  }[key];

  // A calendar date: the server compares it with each gift's own date.
  return { dateFrom: from ? localCalendarDate(from) : null, dateTo: null };
}

/**
 * The audited CSV export of a loaded report. Built from the slice and
 * filters the server echoed back, so the file matches the figures on screen
 * even while a newer selection is still loading.
 */
export function crmReportExportHref(
  report: Pick<AdminCrmReportResponse, "slice" | "filters">,
): string {
  const params = new URLSearchParams({ slice: report.slice });
  const { dateFrom, dateTo, search } = report.filters;
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  if (search) params.set("q", search);
  return `/api/admin/crm/reports/export?${params}`;
}

async function parseJsonError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return payload?.error ?? fallback;
}

async function fetchCrmReport({
  signal,
  slice,
  period,
}: {
  signal: AbortSignal;
  slice: CrmReportSlice;
  period: CrmReportPeriod;
}) {
  const searchParams = new URLSearchParams({ slice });
  if (period.dateFrom) searchParams.set("dateFrom", period.dateFrom);
  if (period.dateTo) searchParams.set("dateTo", period.dateTo);
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

export function useAdminCrmReport(
  slice: CrmReportSlice = "funds",
  period: CrmReportPeriod = ALL_TIME,
) {
  const { dateFrom, dateTo } = period;
  const reportQuery = useQuery({
    queryKey: [...CRM_REPORT_QUERY_KEY, { slice, dateFrom, dateTo }],
    queryFn: ({ signal }) =>
      fetchCrmReport({ signal, slice, period: { dateFrom, dateTo } }),
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
    /**
     * The report shown is the previous grouping or period while the new one
     * loads: label it from `report.slice`/`report.filters`, not the controls.
     */
    isUpdating: reportQuery.isPlaceholderData,
    onRefresh: reportQuery.refetch,
    report: reportQuery.data ?? null,
  };
}
