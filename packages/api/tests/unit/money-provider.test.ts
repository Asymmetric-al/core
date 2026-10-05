import { describe, expect, it } from "vitest";

import {
  fromStripeMinorUnits,
  toStripeMinorUnits,
  parseMoneyToMinorUnits,
  formatMoney,
  minorUnitExponent,
} from "@asym/api/money";

describe("lossless canonical/provider money boundary", () => {
  it.each(["ISK", "UGX"])(
    "adapts %s whole canonical units to provider hundredths",
    (code) => {
      expect(toStripeMinorUnits(500, code, "charge")).toBe(50000);
      expect(fromStripeMinorUnits(50000, code, "charge")).toBe(500);
      expect(() => fromStripeMinorUnits(50001, code, "charge")).toThrow();
    },
  );
  it.each(["HUF", "TWD"])(
    "keeps %s charge precision while validating payout whole units",
    (code) => {
      expect(toStripeMinorUnits(1234, code, "charge")).toBe(1234);
      expect(() => toStripeMinorUnits(1234, code, "payout")).toThrow();
      expect(toStripeMinorUnits(1200, code, "payout")).toBe(1200);
    },
  );
  it("keeps BHD canonical precision separate from provider last-digit restrictions", () => {
    expect(parseMoneyToMinorUnits("1.234", "BHD")).toBe(1234);
    expect(formatMoney(1234, "BHD", "en-US")).toBe("BHD\u00a01.234");
    expect(() => toStripeMinorUnits(1234, "BHD", "charge")).toThrow();
    expect(() => fromStripeMinorUnits(1234, "BHD", "charge")).toThrow();
    expect(toStripeMinorUnits(1230, "BHD", "charge")).toBe(1230);
  });
  it("represents MGA's ISO hundredths separately from provider whole units", () => {
    expect(minorUnitExponent("MGA")).toBe(2);
    expect(toStripeMinorUnits(50000, "MGA", "charge")).toBe(500);
    expect(fromStripeMinorUnits(500, "MGA", "charge")).toBe(50000);
    expect(() => toStripeMinorUnits(50001, "MGA", "charge")).toThrow();
  });
  it("preserves exact formatted units at safe integer extremes", () => {
    expect(formatMoney(9007199254740991, "USD", "en-US")).toBe(
      "$90,071,992,547,409.91",
    );
    expect(formatMoney(-9007199254740991, "USD", "en-US")).toBe(
      "-$90,071,992,547,409.91",
    );
    expect(() =>
      toStripeMinorUnits(9007199254740991, "ISK", "charge"),
    ).toThrow();
  });
  it.each(["constructor", "__proto__"])(
    "rejects inherited object keys %s",
    (code) => {
      expect(() => minorUnitExponent(code)).toThrow();
    },
  );
});
