import { z } from "zod";

import type { CrmReportFilters, CrmReportSlice } from "@asym/database/types";

const reportSliceSchema = z
  .enum(["funds", "missionaries", "donors", "sync-failures"])
  .default("donors");

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A bound as the report applies it: a calendar date ("2026-01-01") stays a
 * date, compared with each gift's date; anything else becomes an instant.
 */
function cleanDate(value: string | null): string | null {
  if (!value) {
    return null;
  }
  if (DATE_ONLY.test(value)) {
    return Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())
      ? null
      : value;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export interface AdminCrmReportParams {
  slice: CrmReportSlice;
  filters: CrmReportFilters;
}

export function parseAdminCrmReportParams(
  searchParams: URLSearchParams,
): AdminCrmReportParams {
  return {
    filters: {
      dateFrom: cleanDate(searchParams.get("dateFrom")),
      dateTo: cleanDate(searchParams.get("dateTo")),
      search: searchParams.get("q")?.trim() || null,
    },
    slice: reportSliceSchema.parse(searchParams.get("slice") ?? undefined),
  };
}
