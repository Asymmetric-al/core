import { describe, expect, it } from "vitest";

import {
  formatCents,
  moneyProgress,
  summarizeMoney,
  formatCurrencyFromCents,
} from "../../../../packages/missionary/components/money-units";

describe("missionary currency displays", () => {
  it("compares support only when both currencies are explicitly known and equal", () => {
    expect(moneyProgress(1000, "JPY", 2000, "USD")).toBeNull();
    expect(moneyProgress(1000, "USD", 2000, null)).toBeNull();
    expect(moneyProgress(null, "USD", 2000, "USD")).toBeNull();
    expect(moneyProgress(1000, "jpy", 2000, "JPY")).toEqual({
      covered: 1000,
      remaining: 1000,
      percent: 50,
    });
  });
  it("contains unlike, unknown and unsafe aggregates", () => {
    expect(
      summarizeMoney([
        { amountCents: 1000, currency: "JPY" },
        { amountCents: 1000, currency: "USD" },
      ]),
    ).toEqual({ total: null, currency: null });
    expect(
      summarizeMoney([{ amountCents: 1000, currency: null }]).total,
    ).toBeNull();
    expect(
      summarizeMoney([
        { amountCents: Number.MAX_SAFE_INTEGER, currency: "USD" },
        { amountCents: 1, currency: "USD" },
      ]).total,
    ).toBeNull();
  });
  it.each([
    [70667, "USD", "$706.67"],
    [1000, "JPY", "¥1,000"],
    [1234, "BHD", "BHD 1.234"],
    [Number.MAX_SAFE_INTEGER, "USD", "$90,071,992,547,409.91"],
  ])("formats %s minor units in %s exactly", (amount, currency, expected) => {
    expect(formatCents(amount, currency)).toBe(expected);
  });

  it.each([null, undefined, "", "ZZZ"])(
    "does not invent USD for currency %s",
    (currency) => {
      expect(formatCents(1000, currency)).toBe("Unavailable");
      expect(formatCurrencyFromCents(3000000, currency)).toBe("Unavailable");
    },
  );

  it("keeps compact USD labels separate from exact money", () => {
    expect(formatCurrencyFromCents(3000000, "USD")).toBe("$30k");
    expect(formatCurrencyFromCents(70667, "USD")).toBe("$706.67");
    expect(formatCurrencyFromCents(1000, "JPY")).toBe("¥1,000");
    expect(formatCents(null, "USD")).toBe("Unavailable");
    expect(formatCents(Number.MAX_SAFE_INTEGER + 1, "USD")).toBe("Unavailable");
  });
});
