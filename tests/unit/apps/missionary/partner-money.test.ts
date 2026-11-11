import { describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Verify the Partners page money formatter at its app boundary.
import { formatCurrency } from "../../../../apps/missionary/app/donors/donors-model";

// Partner money is stored as integer cents. An exact amount always shows its
// cents, as the donor app does ("$755.00"); rounding to whole dollars would
// misstate what a partner gave.
describe("Partners page money display", () => {
  it("always shows cents for exact amounts", () => {
    expect(formatCurrency(11000)).toBe("$110.00");
    expect(formatCurrency(20400)).toBe("$204.00");
    expect(formatCurrency(75500)).toBe("$755.00");
    expect(formatCurrency(70667)).toBe("$706.67");
    expect(formatCurrency(1916667)).toBe("$19,166.67");
    expect(formatCurrency(12550)).toBe("$125.50");
    expect(formatCurrency(5)).toBe("$0.05");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("treats a missing amount as zero dollars and zero cents", () => {
    expect(formatCurrency(null)).toBe("$0.00");
    expect(formatCurrency(undefined)).toBe("$0.00");
  });
});
