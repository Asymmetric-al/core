import type { SupportReportSlice } from "@asym/database/hooks";

export { SUPPORT_REPORT_SLICES } from "@asym/database/hooks";
export type { SupportReportSlice } from "@asym/database/hooks";

/* App-only computed shapes returned by `lib/selectors.ts`. */
export interface SupportReportBucket {
  key: string;
  label: string;
  value: number;
  secondaryValue: number | null;
}

export interface SupportReportSeries {
  slice: SupportReportSlice;
  generatedAt: string;
  unit: "count" | "minutes" | "percent";
  total: number;
  buckets: SupportReportBucket[];
}
