import { z } from "zod";

import type { CrmReportFilters, CrmReportSlice } from "@asym/database/types";

const reportSliceSchema = z
  .enum(["funds", "missionaries", "donors", "sync-failures"])
  .default("donors");

function cleanDate(value: string | null): string | null {
  if (!value) {
    return null;
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
