import { describe, expect, it } from "vitest";

import { crmGivingByYear } from "../../../../../apps/admin/app/(app)/crm/giving-by-year";

import type { CrmDonorDetailResponse } from "@asym/database/types";

type Gift = {
  amountCents: number;
  giftDate: string;
  paymentStatus?: string;
  refundedAmountCents?: number;
  currencyCode?: string;
};

function detail(
  gifts: Gift[],
  giftHistoryTruncated = false,
): Pick<CrmDonorDetailResponse, "giftHistory" | "giftHistoryTruncated"> {
  return {
    giftHistoryTruncated,
    giftHistory: gifts.map((gift, index) => ({
      shared: {
        donationId: `g-${index}`,
        amountCents: gift.amountCents,
        currencyCode: gift.currencyCode ?? "USD",
        giftDate: gift.giftDate,
        paymentStatus: gift.paymentStatus ?? "completed",
        refundedAmountCents: gift.refundedAmountCents ?? 0,
      },
    })) as never,
  };
}

/**
 * The drawer's "Giving by year" chart: settled giving after refunds, per
 * calendar year, from the gift history the drawer already loads. It never
 * sums currencies together and says when the capped list may miss years.
 */
describe("crmGivingByYear", () => {
  it("sums settled gifts after refunds per year and fills quiet years with zero", () => {
    const result = crmGivingByYear(
      detail([
        { amountCents: 50_000, giftDate: "2023-04-09" },
        { amountCents: 30_000, giftDate: "2023-11-02T10:00:00.000Z" },
        // A partial refund counts only what was kept.
        {
          amountCents: 100_000,
          giftDate: "2025-01-28",
          refundedAmountCents: 40_000,
        },
        // Pending and failed gifts are not money received.
        {
          amountCents: 70_000,
          giftDate: "2025-06-01",
          paymentStatus: "pending",
        },
        {
          amountCents: 70_000,
          giftDate: "2025-07-01",
          paymentStatus: "failed",
        },
      ]),
      2026,
    );
    expect(result).toEqual({
      kind: "chart",
      currencyCode: "USD",
      truncated: false,
      olderYearsLeftOut: false,
      years: [
        { year: 2023, amountCents: 80_000, giftCount: 2, isCurrentYear: false },
        { year: 2024, amountCents: 0, giftCount: 0, isCurrentYear: false },
        { year: 2025, amountCents: 60_000, giftCount: 1, isCurrentYear: false },
        { year: 2026, amountCents: 0, giftCount: 0, isCurrentYear: true },
      ],
    });
  });

  it("leaves out fully refunded gifts", () => {
    const result = crmGivingByYear(
      detail([
        {
          amountCents: 50_000,
          giftDate: "2024-03-01",
          refundedAmountCents: 50_000,
        },
        { amountCents: 20_000, giftDate: "2025-02-01" },
      ]),
      2026,
    );
    expect(result.kind).toBe("chart");
    if (result.kind !== "chart") return;
    expect(result.years.map((year) => year.year)).toEqual([2025, 2026]);
  });

  it("shows no chart without at least two years to compare", () => {
    expect(crmGivingByYear(detail([]), 2026)).toEqual({ kind: "none" });
    // One bar for this year says no more than Lifetime giving does.
    expect(
      crmGivingByYear(
        detail([{ amountCents: 1_000, giftDate: "2026-01-01" }]),
        2026,
      ),
    ).toEqual({ kind: "none" });
    expect(
      crmGivingByYear(
        detail([
          {
            amountCents: 1_000,
            giftDate: "2025-01-01",
            paymentStatus: "pending",
          },
        ]),
        2026,
      ),
    ).toEqual({ kind: "none" });
  });

  it("refuses to add different currencies together", () => {
    expect(
      crmGivingByYear(
        detail([
          { amountCents: 10_000, giftDate: "2025-01-01" },
          { amountCents: 10_000, giftDate: "2026-01-01", currencyCode: "cad" },
        ]),
        2026,
      ),
    ).toEqual({ kind: "mixed-currency" });
  });

  it("reports a capped gift list so the chart can say early years may be incomplete", () => {
    const result = crmGivingByYear(
      detail([{ amountCents: 10_000, giftDate: "2025-01-01" }], true),
      2026,
    );
    expect(result).toMatchObject({ kind: "chart", truncated: true });
  });

  it("keeps the ten most recent years and says older ones are left out", () => {
    const result = crmGivingByYear(
      detail([
        { amountCents: 10_000, giftDate: "2010-05-01" },
        { amountCents: 10_000, giftDate: "2026-05-01" },
      ]),
      2026,
    );
    expect(result.kind).toBe("chart");
    if (result.kind !== "chart") return;
    expect(result.years).toHaveLength(10);
    expect(result.years[0]?.year).toBe(2017);
    expect(result.olderYearsLeftOut).toBe(true);
  });
});
