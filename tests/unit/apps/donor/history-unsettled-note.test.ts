import { afterAll, beforeAll, describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Verify the donor history summary's reconciliation note at its app boundary.
import {
  monthlyGivingSeries,
  unsettledNote,
} from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/page-content";

describe("unsettledNote", () => {
  it("is null when every gift was paid", () => {
    expect(unsettledNote([{ status: "Paid" }])).toBeNull();
    expect(unsettledNote([])).toBeNull();
  });

  it("names processing gifts", () => {
    expect(unsettledNote([{ status: "Paid" }, { status: "Processing" }])).toBe(
      "1 processing",
    );
  });

  it("names failed gifts", () => {
    expect(unsettledNote([{ status: "Failed" }, { status: "Failed" }])).toBe(
      "2 failed",
    );
  });

  it("names both, processing first", () => {
    expect(
      unsettledNote([
        { status: "Failed" },
        { status: "Processing" },
        { status: "Paid" },
      ]),
    ).toBe("1 processing · 1 failed");
  });

  it("names refunded gifts last", () => {
    expect(
      unsettledNote([{ status: "Refunded" }, { status: "Processing" }]),
    ).toBe("1 processing · 1 refunded");
  });
});

describe("monthlyGivingSeries", () => {
  // The year filter uses the donor's local calendar; the monthly bars must use
  // the same calendar. Fix the zone so the boundary case is deterministic.
  const originalTz = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = "America/Los_Angeles";
  });
  afterAll(() => {
    if (originalTz === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTz;
    }
  });

  it("keeps a New Year's Eve evening gift in December of the selected year", () => {
    const series = monthlyGivingSeries(
      [
        // 31 Dec 2026, 19:00 in Los Angeles (already 1 Jan 2027 in UTC).
        { date: "2027-01-01T03:00:00Z", amount: 50, status: "Paid" },
        { date: "2026-01-15T18:00:00Z", amount: 20.5, status: "Paid" },
        { date: "2026-01-20T18:00:00Z", amount: 99, status: "Failed" },
      ],
      "2026",
    );

    expect(series).toHaveLength(12);
    expect(series[0]).toEqual({ month: "Jan", amount: 20.5 });
    expect(series[11]).toEqual({ month: "Dec", amount: 50 });
  });

  it("keeps date-only New Year's gifts in January of the selected year", () => {
    const series = monthlyGivingSeries(
      [{ date: "2026-01-01", amount: 25, status: "Paid" }],
      "2026",
    );

    expect(series[0]).toEqual({ month: "Jan", amount: 25 });
    expect(series[11]).toEqual({ month: "Dec", amount: 0 });
  });
});
