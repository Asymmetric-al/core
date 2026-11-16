import { describe, expect, it } from "vitest";

import {
  givingMix,
  givingYear,
  monthlyYearOverYear,
  partnerRetention,
  type AnalyticsGift,
} from "../../../../apps/missionary/app/analytics/analytics-model";

const NOW = new Date(2026, 10, 10, 12); // 10 Nov 2026, local time

const gift = (
  ymd: [number, number, number],
  amountCents: number,
  donorId: string | null = "d1",
  extra: Partial<AnalyticsGift> = {},
): AnalyticsGift => ({
  amountCents,
  currency: "USD",
  date: new Date(ymd[0], ymd[1] - 1, ymd[2], 9).toISOString(),
  donorId,
  type: "one_time",
  status: "completed",
  ...extra,
});

describe("givingYear", () => {
  it("keeps counts but contains mixed or unknown monetary analytics", () => {
    for (const gifts of [
      [
        gift([2026, 11, 1], 1000, "d1", { currency: "JPY" }),
        gift([2026, 11, 2], 1000, "d2", { currency: "USD" }),
      ],
      [gift([2026, 11, 1], 1000, "d1", { currency: null })],
    ]) {
      const summary = givingYear(gifts, NOW);
      expect(summary.last12Cents).toBeNull();
      expect(summary.changePct).toBeNull();
      expect(summary.averageGiftCents).toBeNull();
      expect(summary.medianGiftCents).toBeNull();
      expect(summary.giftCount).toBe(gifts.length);
      expect(monthlyYearOverYear(gifts, NOW)).toEqual([]);
      expect(givingMix(gifts, NOW).oneTimeCents).toBeNull();
    }
  });
  it("compares the last 12 months with the 12 before, completed gifts only", () => {
    const summary = givingYear(
      [
        gift([2026, 11, 5], 10_000),
        gift([2026, 1, 15], 20_000),
        gift([2025, 10, 1], 15_000), // prior window
        gift([2026, 6, 1], 99_999, "d2", { status: "failed" }),
      ],
      NOW,
    );
    expect(summary).toEqual({
      currency: "USD",
      last12Cents: 30_000,
      prior12Cents: 15_000,
      changePct: 100,
      giftCount: 2,
      averageGiftCents: 15_000,
      medianGiftCents: 15_000,
    });
  });

  it("uses the middle gift so one large gift doesn’t skew the typical gift", () => {
    const summary = givingYear(
      [
        gift([2026, 2, 1], 2_500),
        gift([2026, 3, 1], 5_000),
        gift([2026, 4, 1], 250_000),
      ],
      NOW,
    );
    expect(summary.medianGiftCents).toBe(5_000);
    expect(
      givingYear([gift([2026, 2, 1], 2_000), gift([2026, 3, 1], 3_000)], NOW)
        .medianGiftCents,
    ).toBe(2_500);
  });

  it("has no change or average without the gifts to compute them", () => {
    expect(givingYear([gift([2026, 3, 1], 5_000)], NOW)).toEqual({
      currency: "USD",
      last12Cents: 5_000,
      prior12Cents: 0,
      changePct: null,
      giftCount: 1,
      averageGiftCents: 5_000,
      medianGiftCents: 5_000,
    });
    expect(givingYear([], NOW).averageGiftCents).toBeNull();
    expect(givingYear([], NOW).medianGiftCents).toBeNull();
  });
});

describe("one period everywhere", () => {
  // The headline, the chart and the mix all cover the same 12 calendar
  // months (this month and the 11 before), so their totals agree.
  it("counts exactly the gifts the chart shows", () => {
    const gifts = [
      gift([2025, 11, 20], 7_000), // last November: before the chart’s first month
      gift([2025, 12, 2], 5_000), // the chart’s first month
      gift([2026, 11, 5], 10_000),
    ];
    const chartCents = monthlyYearOverYear(gifts, NOW).reduce(
      (total, month) => total + month.thisYearCents,
      0,
    );
    expect(givingYear(gifts, NOW).last12Cents).toBe(chartCents);
    expect(givingYear(gifts, NOW).last12Cents).toBe(15_000);
    const mix = givingMix(gifts, NOW);
    expect(mix.recurringCents + mix.oneTimeCents + mix.offlineCents).toBe(
      chartCents,
    );
  });
});

describe("partnerRetention", () => {
  it("is the share of last year's partners who gave again this year", () => {
    const retention = partnerRetention(
      [
        gift([2025, 6, 1], 1_000, "kept"),
        gift([2026, 9, 1], 1_000, "kept"),
        gift([2025, 3, 1], 1_000, "lost"),
        gift([2026, 10, 1], 1_000, "new"),
        gift([2025, 7, 1], 1_000, null), // anonymous gift: no partner to follow
      ],
      NOW,
    );
    expect(retention).toEqual({
      priorPartners: 2,
      retainedPartners: 1,
      ratePct: 50,
    });
  });

  it("can't give a rate without last year's partners", () => {
    expect(
      partnerRetention([gift([2026, 9, 1], 1_000)], NOW).ratePct,
    ).toBeNull();
  });
});

describe("monthlyYearOverYear", () => {
  it("lines up each of the last 12 months with the same month a year earlier", () => {
    const months = monthlyYearOverYear(
      [
        gift([2026, 11, 2], 4_000),
        gift([2025, 11, 20], 3_000),
        gift([2025, 12, 1], 2_000),
        // Local 1 Nov 00:30 belongs to November, not October.
        {
          ...gift([2026, 11, 1], 500),
          date: new Date(2026, 10, 1, 0, 30).toISOString(),
        },
      ],
      NOW,
    );
    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({
      key: "2025-12",
      label: "Dec",
      thisYearCents: 2_000,
      lastYearCents: 0,
    });
    expect(months.at(-1)).toEqual({
      key: "2026-11",
      label: "Nov",
      thisYearCents: 4_500,
      lastYearCents: 3_000,
    });
  });
});

describe("givingMix", () => {
  it("splits the last 12 months by how people gave", () => {
    expect(
      givingMix(
        [
          gift([2026, 10, 1], 3_000, "d1", { type: "recurring" }),
          gift([2026, 9, 1], 2_000, "d1", { type: "one_time" }),
          gift([2026, 8, 1], 1_000, "d1", { type: "offline" }),
          gift([2024, 1, 1], 9_000, "d1", { type: "recurring" }),
        ],
        NOW,
      ),
    ).toEqual({
      recurringCents: 3_000,
      oneTimeCents: 2_000,
      offlineCents: 1_000,
    });
  });
});
