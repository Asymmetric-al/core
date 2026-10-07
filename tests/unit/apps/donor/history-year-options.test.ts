import { afterEach, describe, expect, it, vi } from "vitest";

import { getHistoryYearOptions } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/history-year-options";

afterEach(() => vi.useRealTimers());

describe("donor history year options", () => {
  it("refreshes the current year after New Year without reloading the module", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 31, 12));
    expect(getHistoryYearOptions()[0]).toBe("2026");
    vi.setSystemTime(new Date(2027, 0, 1, 12));
    expect(getHistoryYearOptions()[0]).toBe("2027");
  });

  it("keeps the existing five-year descending calendar-year choices", () => {
    expect(getHistoryYearOptions(new Date(2020, 1, 29, 12))).toEqual([
      "2020",
      "2019",
      "2018",
      "2017",
      "2016",
    ]);
  });
});
