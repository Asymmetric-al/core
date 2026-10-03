import { describe, expect, it } from "vitest";

import {
  assertTransactable,
  formatMoney,
  isSupportedCurrency,
  minorUnitExponent,
  parseMoneyToMinorUnits,
} from "@asym/api/money";

// Literal expectations come from Phase 2 and ADR-0208. Canonical ISO units
// remain distinct from provider charge/payout compatibility representations.
describe("Phase 2 canonical currency amounts", () => {
  it.each([
    ["USD", 2, "12.34", 1234, "$12.34"],
    ["EUR", 2, "12.34", 1234, "€12.34"],
    ["JPY", 0, "500", 500, "¥500"],
    ["KRW", 0, "500", 500, "₩500"],
    ["BHD", 3, "1.234", 1234, "BHD\u00a01.234"],
    ["KWD", 3, "1.234", 1234, "KWD\u00a01.234"],
    ["ISK", 0, "500", 500, "ISK\u00a0500"],
    ["UGX", 0, "500", 500, "UGX\u00a0500"],
    ["HUF", 2, "12.34", 1234, "HUF\u00a012.34"],
    ["TWD", 2, "12.34", 1234, "NT$12.34"],
  ] as const)(
    "represents %s in its canonical ISO minor units",
    (code, exponent, major, minor, display) => {
      expect(minorUnitExponent(code)).toBe(exponent);
      expect(parseMoneyToMinorUnits(major, code)).toBe(minor);
      expect(formatMoney(minor, code, "en-US")).toBe(display);
    },
  );

  it.each([
    "AED",
    "AFN",
    "ALL",
    "CLP",
    "IQD",
    "JOD",
    "OMR",
    "TND",
    "VND",
    "XAF",
    "XOF",
    "XPF",
  ])("supports ISO metadata beyond the launch currency: %s", (code) =>
    expect(isSupportedCurrency(code)).toBe(true),
  );

  it.each(["", "banana", "ZZZ", "US", "USDD"])(
    "rejects unknown currency %j at every money seam",
    (code) => {
      expect(isSupportedCurrency(code)).toBe(false);
      expect(() => minorUnitExponent(code)).toThrow();
      expect(() => parseMoneyToMinorUnits("1", code)).toThrow();
      expect(() => formatMoney(1, code, "en-US")).toThrow();
      expect(() => assertTransactable(code, code)).toThrow();
    },
  );

  it.each([
    ["1.001", "USD"],
    ["1.001", "EUR"],
    ["1.1", "JPY"],
    ["1.1", "KRW"],
    ["1.2345", "BHD"],
    ["1.2345", "KWD"],
    ["1.1", "ISK"],
    ["1.1", "UGX"],
  ])("rejects precision loss for %s %s", (amount, code) => {
    expect(() => parseMoneyToMinorUnits(amount, code)).toThrow();
  });

  it.each(["", " ", "NaN", "Infinity", "banana"])(
    "rejects invalid amount %j",
    (input) => {
      expect(() => parseMoneyToMinorUnits(input, "USD")).toThrow();
    },
  );

  it("parses exact decimal units at the safe integer boundary", () => {
    expect(parseMoneyToMinorUnits("90071992547409.91", "USD")).toBe(
      9007199254740991,
    );
    expect(() => parseMoneyToMinorUnits("90071992547409.92", "USD")).toThrow();
  });

  it.each([1.5, NaN, Infinity, 9007199254740992])(
    "rejects unchecked minor units %s during formatting",
    (minor) => {
      expect(() => formatMoney(minor, "USD", "en-US")).toThrow();
    },
  );

  it.each(["USD", "EUR", "JPY", "BHD"])(
    "permits only the independently supplied settlement currency %s",
    (settlement) => {
      expect(() => assertTransactable(settlement, settlement)).not.toThrow();
      for (const code of ["USD", "EUR", "JPY", "BHD"]) {
        if (code !== settlement) {
          expect(() => assertTransactable(code, settlement)).toThrow();
        }
      }
    },
  );

  it("fails closed when settlement context is unknown", () => {
    expect(() => assertTransactable("USD", "ZZZ")).toThrow();
  });

  it("uses the explicit locale only for presentation", () => {
    expect(formatMoney(1234, "EUR", "de-DE")).toBe("12,34\u00a0€");
    expect(() => assertTransactable("EUR", "USD")).toThrow();
  });
});
