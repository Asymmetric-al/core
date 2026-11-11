import { describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Verify the missionary partner money formatter at its app boundary.
import { formatCurrency } from "../../../../apps/missionary/app/donors/donors-model";
import {
  formatCents,
  formatCurrencyFromCents,
  formatDollars,
  toDollarBreakdown,
} from "../../../../packages/missionary/components/money-units";

// Donations, donor totals and pledges are stored in cents (BIGINT). The donor
// app and missionary analytics already divide by 100; these surfaces must too,
// or a $110 gift reads as $11,000.
describe("missionary money displays use cents", () => {
  it("formats partner amounts from cents", () => {
    // Exact amounts always show cents, like the donor app ("$50.00").
    expect(formatCurrency(11000)).toBe("$110.00");
    expect(formatCurrency(20400)).toBe("$204.00");
    expect(formatCurrency(1916667)).toBe("$19,166.67");
    expect(formatCurrency(12550)).toBe("$125.50");
    expect(formatCurrency(null)).toBe("$0.00");
  });

  // An exact amount always shows cents, as the donor app does ("$50.00").
  // Rounding a real amount to whole dollars would misstate it, and mixing
  // "$755" with "$706.67" on one card reads as two kinds of number.
  it("shows cents on every exact amount", () => {
    expect(formatCents(75500)).toBe("$755.00");
    expect(formatCents(70667)).toBe("$706.67");
    expect(formatCents(5000)).toBe("$50.00");
    expect(formatCents(1250)).toBe("$12.50");
    expect(formatCents(123456700)).toBe("$1,234,567.00");
    expect(formatCents(0)).toBe("$0.00");
  });

  it("formats dashboard tile amounts from cents", () => {
    expect(formatCurrencyFromCents(55000)).toBe("$550");
    expect(formatCurrencyFromCents(1250)).toBe("$12.50");
    expect(formatCurrencyFromCents(3000000)).toBe("$30k");
    expect(formatCurrencyFromCents(0)).toBe("$0");
  });

  it("formats chart tooltip dollars with consistent decimals", () => {
    expect(formatDollars(300)).toBe("$300");
    expect(formatDollars(125.5)).toBe("$125.50");
  });

  it("converts the giving breakdown to dollars for the chart", () => {
    expect(
      toDollarBreakdown([
        {
          month: "Jan",
          recurring: 0,
          oneTime: 30000,
          offline: 0,
          total: 30000,
        },
      ]),
    ).toEqual([
      { month: "Jan", recurring: 0, oneTime: 300, offline: 0, total: 300 },
    ]);
  });
});
