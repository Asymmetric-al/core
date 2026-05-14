export type CrmReportSlice =
  | "funds"
  | "missionaries"
  | "donors"
  | "sync-failures";

export interface CrmReportFilters {
  dateFrom: string | null;
  dateTo: string | null;
  search: string | null;
}

export interface CrmReportRow {
  id: string;
  label: string;
  amountCents: number;
  giftCount: number;
  donorCount: number;
  lastGiftAt: string | null;
  status: string | null;
  metadata: Record<string, unknown>;
}

export interface AdminCrmReportResponse {
  slice: CrmReportSlice;
  filters: CrmReportFilters;
  rows: CrmReportRow[];
  totals: {
    amountCents: number;
    giftCount: number;
    donorCount: number;
    rowCount: number;
  };
  audit: {
    exportRequired: true;
    loggedEvents: readonly [
      "actor",
      "tenant",
      "filters",
      "rowCount",
      "timestamp",
    ];
  };
}
