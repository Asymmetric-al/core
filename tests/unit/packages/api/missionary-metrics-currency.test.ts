import { describe, expect, it } from "vitest";

import { projectMetricsMoney } from "../../../../packages/api/src/missionaries/metrics";

const gift = (
  currency: string | null,
  amount = 1000,
  status = "completed",
) => ({ amount, currency, status });
describe("metrics money qualification", () => {
  it("retains and validates currencies instead of inferring USD", () => {
    expect(projectMetricsMoney([gift("jpy")])).toEqual({
      currency: "JPY",
      donations: [gift("JPY")],
    });
    expect(projectMetricsMoney([gift(null)]).currency).toBeNull();
    expect(
      projectMetricsMoney([gift("ZZZ")]).donations[0]?.currency,
    ).toBeNull();
  });
  it("does not qualify mixed currencies, unsafe sums or an empty history", () => {
    expect(projectMetricsMoney([gift("JPY"), gift("USD")]).currency).toBeNull();
    expect(
      projectMetricsMoney([
        gift("USD", Number.MAX_SAFE_INTEGER),
        gift("USD", 1),
      ]).currency,
    ).toBeNull();
    expect(projectMetricsMoney([]).currency).toBeNull();
  });
  it("does not let failed gifts invalidate completed gift totals", () => {
    expect(
      projectMetricsMoney([gift("JPY"), gift("USD", 1000, "failed")]).currency,
    ).toBe("JPY");
  });
  it("reports every settled status spelling as completed, so charts count those gifts", () => {
    const projected = projectMetricsMoney([
      gift("USD", 1000, "succeeded"),
      gift("USD", 500, " Success "),
      gift("USD", 250, "Completed"),
      gift("USD", 100, "pending"),
    ]);
    expect(projected.donations.map((row) => row.status)).toEqual([
      "completed",
      "completed",
      "completed",
      "pending",
    ]);
    expect(projected.currency).toBe("USD");
    expect(projectMetricsMoney([gift("JPY", 1000, "succeeded")]).currency).toBe(
      "JPY",
    );
  });
  it("counts settled gifts net of refunds, and a fully refunded gift not at all", () => {
    const refunded = (
      amount: number,
      refund: number | null,
      status = "completed",
    ) => ({
      ...gift("USD", amount, status),
      refund_amount: refund,
    });
    const projected = projectMetricsMoney([
      refunded(10000, 2500),
      refunded(5000, 5000, "succeeded"),
      refunded(4000, 9000),
      refunded(3000, null),
      refunded(2000, -100),
      refunded(1500, 500, "pending"),
    ]);
    expect(projected.donations.map((row) => [row.status, row.amount])).toEqual([
      ["completed", 7500],
      ["refunded", 0],
      ["refunded", 0],
      ["completed", 3000],
      ["completed", 2000],
      ["pending", 1500],
    ]);
  });
});
