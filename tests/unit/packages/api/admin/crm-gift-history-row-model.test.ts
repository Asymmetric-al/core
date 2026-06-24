import { describe, expect, it } from "vitest";

import { deriveGiftHistoryRows } from "../../../../../packages/api/src/admin/crm/table-preferences/gift-history-row-model";

import type {
  CrmGiftHistoryFiltersSortSettings,
  CrmGiftHistoryRow,
  SharedContributionRowFields,
} from "@asym/database/types";

const defaultFiltersSort: CrmGiftHistoryFiltersSortSettings = {
  sortField: "giftDate",
  sortDirection: "desc",
  paymentStatus: "all",
  issue: "all",
};

describe("admin/crm/table-preferences/gift-history-row-model", () => {
  it("filters by payment status and sorts the remaining gifts", () => {
    const rows = [
      giftRow({
        id: "older-completed",
        amountCents: 30_00,
        giftDate: "2026-01-01",
      }),
      giftRow({
        id: "newer-completed",
        amountCents: 10_00,
        giftDate: "2026-03-01",
      }),
      giftRow({
        id: "refunded",
        amountCents: 20_00,
        giftDate: "2026-02-01",
        paymentStatus: "refunded",
      }),
    ];

    const result = deriveGiftHistoryRows({
      gifts: rows,
      filtersSort: {
        ...defaultFiltersSort,
        sortField: "amountCents",
        sortDirection: "asc",
        paymentStatus: "completed",
      },
    });

    expect(result.map((row) => row.id)).toEqual([
      "newer-completed",
      "older-completed",
    ]);
  });

  it("reuses shared issue filters for the CRM gift history issue views", () => {
    const cleanGift = giftRow({ id: "clean" });
    const pendingCorrection = giftRow({
      id: "pending-correction",
      correctionState: "pending",
    });
    const failedCrmPost = giftRow({
      id: "failed-crm-post",
      crmPostStatus: "failed",
    });

    const pendingResult = deriveGiftHistoryRows({
      gifts: [cleanGift, pendingCorrection, failedCrmPost],
      filtersSort: {
        ...defaultFiltersSort,
        issue: "pending_correction",
      },
    });

    const needsAttentionResult = deriveGiftHistoryRows({
      gifts: [cleanGift, pendingCorrection, failedCrmPost],
      filtersSort: {
        ...defaultFiltersSort,
        issue: "needs_attention",
      },
    });

    expect(pendingResult.map((row) => row.id)).toEqual([
      "pending-correction",
    ]);
    expect(needsAttentionResult.map((row) => row.id)).toEqual([
      "pending-correction",
      "failed-crm-post",
    ]);
  });
});

function giftRow({
  amountCents = 25_00,
  correctionState = "none",
  crmPostStatus = "posted",
  giftDate = "2026-01-15",
  id,
  paymentStatus = "completed",
}: {
  amountCents?: number;
  correctionState?: SharedContributionRowFields["correctionState"];
  crmPostStatus?: SharedContributionRowFields["crmPostStatus"];
  giftDate?: string;
  id: string;
  paymentStatus?: SharedContributionRowFields["paymentStatus"];
}): CrmGiftHistoryRow {
  const shared = {
    donationId: id,
    amountCents,
    currencyCode: "USD",
    giftDate,
    donorId: "donor-1",
    donorName: "Alice Johnson",
    designationSummary: {
      fundId: "fund-1",
      fundName: "Clean Water Initiative",
      missionaryId: null,
      missionaryName: null,
      lineCount: 1,
    },
    paymentStatus,
    receiptStatus: "sent",
    crmPostStatus,
    refundState: "none",
    refundedAmountCents: 0,
    correctionState,
    recurringLinkState: "none",
  } satisfies SharedContributionRowFields;

  return {
    shared,
    id,
    donationId: id,
    stagedGiftId: null,
    amountCents,
    currencyCode: "USD",
    giftDate,
    paymentStatus,
    receiptStatus: shared.receiptStatus,
    crmPostStatus,
    refundState: shared.refundState,
    correctionState,
    twentyRecordId: null,
    fundId: shared.designationSummary.fundId,
    fundName: shared.designationSummary.fundName,
    missionaryId: shared.designationSummary.missionaryId,
    missionaryName: shared.designationSummary.missionaryName,
  };
}
