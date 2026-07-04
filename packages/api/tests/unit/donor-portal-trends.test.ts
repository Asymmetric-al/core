import { describe, expect, it } from "vitest";

import { buildGivingTrends } from "../../src/donor-portal/trends";

/**
 * TDD — Giving Trends projection for the donor history chart.
 * Replaces the hardcoded MONTHLY_DATA with an aggregation computed from the
 * already-live `portal.donations`. Pure → no DB needed.
 */

function d(date: string, amountCents: number, status = "Succeeded") {
  return { date, amountCents, status };
}

describe("buildGivingTrends", () => {
  it("aggregates settled gifts by calendar month, ascending", () => {
    const out = buildGivingTrends([
      d("2026-01-05T00:00:00Z", 1000),
      d("2026-01-20T00:00:00Z", 2500),
      d("2026-03-02T00:00:00Z", 5000),
    ]);
    expect(out.map((p) => p.monthKey)).toEqual(["2026-01", "2026-03"]);
    expect(out[0]).toMatchObject({
      monthKey: "2026-01",
      totalCents: 3500,
      total: 35,
      giftCount: 2,
    });
    expect(out[0]!.label).toBe("Jan 2026");
    expect(out[1]).toMatchObject({ monthKey: "2026-03", totalCents: 5000, giftCount: 1 });
  });

  it("excludes non-succeeded gifts (Processing/Failed)", () => {
    const out = buildGivingTrends([
      d("2026-02-01", 1000, "Processing"),
      d("2026-02-02", 2000, "Failed"),
      d("2026-02-03", 3000, "Succeeded"),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ monthKey: "2026-02", totalCents: 3000, giftCount: 1 });
  });

  it("returns an empty series for no settled gifts", () => {
    expect(buildGivingTrends([])).toEqual([]);
    expect(buildGivingTrends([d("2026-02-01", 1000, "Failed")])).toEqual([]);
  });

  it("ignores rows with an unparseable date", () => {
    const out = buildGivingTrends([d("not-a-date", 1000), d("2026-05-01", 2000)]);
    expect(out.map((p) => p.monthKey)).toEqual(["2026-05"]);
  });
});
