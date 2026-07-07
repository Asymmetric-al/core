import { describe, expect, it } from "vitest";

import {
  GIVING_TREND_MONTHS,
  resolveGivingTrendState,
  selectGivingTrend,
  type GivingTrendPoint,
} from "../../../apps/missionary/app/analytics/analytics-data";

import type { MonthlyChartDataPoint } from "@asym/lib/hooks";

/** Build a 13-month breakdown (Jan..Jan) so we can assert the trailing window. */
function makeBreakdown(): MonthlyChartDataPoint[] {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
  ];
  return months.map((month, index) => ({
    month,
    recurring: 100 + index,
    oneTime: 10 + index,
    offline: 5 + index,
    total: 115 + index * 3,
  }));
}

describe("selectGivingTrend", () => {
  it("keeps only the trailing GIVING_TREND_MONTHS window by default", () => {
    const trend = selectGivingTrend(makeBreakdown());
    expect(trend).toHaveLength(GIVING_TREND_MONTHS);
    // Trailing 6 of a 13-length series → Aug..Jan.
    expect(trend.map((p) => p.month)).toEqual([
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
    ]);
  });

  it("projects onto the chart shape and drops the offline field", () => {
    const [first] = selectGivingTrend(
      [
        {
          month: "Jan",
          recurring: 10000,
          oneTime: 2500,
          offline: 500,
          total: 13000,
        },
      ],
      6,
    );

    expect(first).toEqual<GivingTrendPoint>({
      month: "Jan",
      total: 125,
      recurring: 100,
      oneTime: 25,
    });
    expect(first).not.toHaveProperty("offline");
  });

  it("respects a custom window size", () => {
    const trend = selectGivingTrend(makeBreakdown(), 3);
    expect(trend.map((p) => p.month)).toEqual(["Nov", "Dec", "Jan"]);
  });

  it("returns everything when the series is shorter than the window", () => {
    const short = makeBreakdown().slice(0, 2);
    expect(selectGivingTrend(short, 6)).toHaveLength(2);
  });

  it("returns an empty array for a non-positive window", () => {
    expect(selectGivingTrend(makeBreakdown(), 0)).toEqual([]);
    expect(selectGivingTrend(makeBreakdown(), -4)).toEqual([]);
  });
});

describe("resolveGivingTrendState", () => {
  const zero: GivingTrendPoint[] = [
    { month: "Nov", total: 0, recurring: 0, oneTime: 0 },
    { month: "Dec", total: 0, recurring: 0, oneTime: 0 },
  ];
  const withValue: GivingTrendPoint[] = [
    { month: "Nov", total: 0, recurring: 0, oneTime: 0 },
    { month: "Dec", total: 42, recurring: 42, oneTime: 0 },
  ];

  it("reports loading regardless of error or data", () => {
    expect(
      resolveGivingTrendState({ isLoading: true, error: null, points: zero }),
    ).toBe("loading");
    expect(
      resolveGivingTrendState({
        isLoading: true,
        error: new Error("boom"),
        points: withValue,
      }),
    ).toBe("loading");
  });

  it("reports error only when not loading", () => {
    expect(
      resolveGivingTrendState({
        isLoading: false,
        error: new Error("boom"),
        points: withValue,
      }),
    ).toBe("error");
  });

  it("reports empty when every month in the window is zero", () => {
    expect(
      resolveGivingTrendState({ isLoading: false, error: null, points: zero }),
    ).toBe("empty");
    expect(
      resolveGivingTrendState({ isLoading: false, error: null, points: [] }),
    ).toBe("empty");
  });

  it("reports ready when any month carries recurring or one-time value", () => {
    expect(
      resolveGivingTrendState({
        isLoading: false,
        error: null,
        points: withValue,
      }),
    ).toBe("ready");
  });
});
