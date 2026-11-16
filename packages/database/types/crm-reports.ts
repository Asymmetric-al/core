export type CrmReportSlice =
  "funds" | "missionaries" | "donors" | "sync-failures";

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

/**
 * Whether a giving report read every gift in its period. A report reads at
 * most `donationLimit` gifts (newest first); past that, totals cover only the
 * most recent `includedGiftCount` gifts and must not read as the whole period.
 */
export interface AdminCrmReportCompleteness {
  complete: boolean;
  /** Gifts read before settlement, refund and correction rules applied. */
  includedGiftCount: number;
  /** The read bound, or null when the slice is not a giving report. */
  donationLimit: number | null;
}

export interface AdminCrmReportResponse {
  slice: CrmReportSlice;
  filters: CrmReportFilters;
  rows: CrmReportRow[];
  completeness: AdminCrmReportCompleteness;
  totals: {
    /**
     * Settled giving net of refunds, after approved corrections to amount
     * and designation.
     */
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
