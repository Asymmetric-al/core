import { describe, expect, it } from "vitest";

import { formatPledgeCurrency } from "../../src/donor-portal/pledge-view";

describe("formatPledgeCurrency", () => {
  it("normalizes valid currency codes", () => {
    expect(formatPledgeCurrency(50, "eur", "en-US")).toBe("€50.00");
    expect(formatPledgeCurrency(50, " eur ", "en-US")).toBe("€50.00");
  });

  it("falls back to USD for empty or malformed currency codes", () => {
    expect(formatPledgeCurrency(50, "", "en-US")).toBe("$50.00");
    expect(formatPledgeCurrency(50, "US", "en-US")).toBe("$50.00");
  });
});
