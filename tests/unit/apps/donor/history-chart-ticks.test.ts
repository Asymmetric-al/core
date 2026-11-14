import { describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Pure chart helper at its app boundary.
import {
  phoneMonthTicks,
  roundTicks,
} from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/monthly-giving-chart";

describe("roundTicks", () => {
  it("steps the scale in round amounts that cover the biggest month", () => {
    expect(roundTicks(285)).toEqual([0, 100, 200, 300]);
    expect(roundTicks(50)).toEqual([0, 20, 40, 60]);
    expect(roundTicks(1554)).toEqual([0, 600, 1200, 1800]);
    expect(roundTicks(0)).toEqual([0]);
  });
});

describe("phoneMonthTicks", () => {
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
  ].map((month) => ({ month, amount: 0 }));

  // Every other month, counted back from the current one, so the month in
  // progress is always labelled.
  it("labels every other month ending with the current one", () => {
    expect(phoneMonthTicks(months, 10)).toEqual([
      "Jan",
      "Mar",
      "May",
      "Jul",
      "Sep",
      "Nov",
    ]);
    expect(phoneMonthTicks(months, 11)).toEqual([
      "Feb",
      "Apr",
      "Jun",
      "Aug",
      "Oct",
      "Dec",
    ]);
  });
});
