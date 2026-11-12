import { describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Verify the Partners page money formatter at its app boundary.
import { formatCurrency } from "../../../../apps/missionary/app/donors/donors-model";

describe("Partners page money display", () => {
  it("always shows cents for exact amounts", () => {
    expect(formatCurrency(11000, "USD")).toBe("$110.00");
    expect(formatCurrency(20400, "USD")).toBe("$204.00");
    expect(formatCurrency(75500, "USD")).toBe("$755.00");
    expect(formatCurrency(70667, "USD")).toBe("$706.67");
    expect(formatCurrency(1916667, "USD")).toBe("$19,166.67");
    expect(formatCurrency(12550, "USD")).toBe("$125.50");
    expect(formatCurrency(5, "USD")).toBe("$0.05");
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });

  it("uses the known currency exponent without losing original minor units", () => {
    expect(formatCurrency(1000, "JPY")).toBe("¥1,000");
    expect(formatCurrency(1234, "BHD")).toBe("BHD\u00a01.234");
    expect(formatCurrency(Number.MAX_SAFE_INTEGER, "USD")).toBe(
      "$90,071,992,547,409.91",
    );
  });

  it("keeps unknown amounts and currency unavailable", () => {
    expect(formatCurrency(null, "USD")).toBe("Unavailable");
    expect(formatCurrency(undefined, "USD")).toBe("Unavailable");
    expect(formatCurrency(1000, null)).toBe("Unavailable");
    expect(formatCurrency(1000, "NOT-CURRENCY")).toBe("Unavailable");
  });
});
