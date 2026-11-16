import { afterAll, beforeAll, describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Pure history helper at its app boundary.
import { monthlyGivingSeries } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/history/page-content";
// eslint-disable-next-line no-restricted-imports -- AL-1931: Pure overview helper at its app boundary.
import {
  givenThisYear,
  supportedMissionaries,
} from "../../../../apps/donor/features/donor/components/overview/overview-model";

// Gift dates come from a SQL DATE ("2026-02-01"). Parsed as UTC midnight, a
// first-of-the-month gift lands in the previous month west of UTC, and a
// 1 January gift in the previous year.
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

describe("date-only gift dates west of UTC", () => {
  it("charts a first-of-the-month gift in its own month and year", () => {
    const series = monthlyGivingSeries(
      [
        { date: "2026-01-01", amount: 50, status: "Paid" },
        { date: "2026-02-01", amount: 30, status: "Paid" },
      ],
      "2026",
    );
    expect(series[0]).toEqual({ month: "Jan", amount: 50 });
    expect(series[1]).toEqual({ month: "Feb", amount: 30 });
  });

  it("counts a 1 January gift in this year's total", () => {
    const total = givenThisYear(
      {
        donations: [{ date: "2026-01-01", amount: 50, status: "Paid" }],
      } as never,
      new Date(2026, 5, 15),
    );
    expect(total.paid).toBe(50);
  });

  it("lists a missionary whose only gift this year was on 1 January", () => {
    const missionary = { id: "m-1", name: "Ana Diaz", avatarUrl: null };
    const people = supportedMissionaries(
      {
        recurringGifts: [],
        donations: [
          { date: "2026-01-01", amount: 50, status: "Paid", missionary },
          {
            date: "2025-12-31",
            amount: 20,
            status: "Paid",
            missionary: { id: "m-2", name: "Ben Ode", avatarUrl: null },
          },
        ],
      } as never,
      new Date(2026, 5, 15),
    );
    expect(people).toEqual([missionary]);
  });
});
