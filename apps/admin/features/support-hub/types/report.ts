import type { SupportReportSlice } from "@asym/database/hooks";

export { SUPPORT_REPORT_SLICES } from "@asym/database/hooks";
export type { SupportReportSlice } from "@asym/database/hooks";

/* App-only computed shapes returned by `lib/selectors.ts` + `lib/report-aggregations.ts`. */
export interface SupportReportBucket {
  key: string;
  label: string;
  value: number;
  secondaryValue: number | null;
}

export type SupportReportScopeKind =
  | "all"
  | "inbox"
  | "agent"
  | "team"
  | "label";

export interface SupportReportScope {
  kind: SupportReportScopeKind;
  id?: string | null;
}

export type SupportReportGroupBy = "day" | "week" | "month";

export interface SupportReportRange {
  /** Inclusive ISO 8601 start. */
  from: string;
  /** Exclusive ISO 8601 end. */
  to: string;
}

export interface SupportReportRequest {
  slice: SupportReportSlice;
  scope: SupportReportScope;
  range: SupportReportRange;
  groupBy: SupportReportGroupBy;
  businessHoursOnly: boolean;
}

export type SupportReportUnit = "count" | "minutes" | "percent";

export interface SupportReportSeries {
  slice: SupportReportSlice;
  generatedAt: string;
  unit: SupportReportUnit;
  total: number;
  buckets: SupportReportBucket[];
  /** When set, the caller has exposed the full filter context for export. */
  request?: SupportReportRequest;
}
