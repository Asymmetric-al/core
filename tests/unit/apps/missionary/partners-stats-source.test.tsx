/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: () => ({
    data: {
      support: { recurringMonthlyCents: 70_667, monthlyPartnerCount: 7 },
    },
  }),
}));
vi.mock("../../../../apps/missionary/app/donors/use-donors-page-view", () => ({
  useDonorsPageViewFields: () => ({
    donors: { all: new Array(15).fill({}), hasMore: false },
    filters: { statusFilter: "All", pledgeFilter: "All" },
    actions: { applyStatFilter: vi.fn() },
    summary: {
      activeCount: 13,
      // The roster can't see anonymous partners' gifts.
      activePledgeCount: 6,
      monthlyPledgeTotal: 68_167,
      atRiskCount: 1,
      lapsedCount: 1,
      totalGiven: 2_487_700,
    },
  }),
}));

import { DonorsPageStats } from "../../../../apps/missionary/app/donors/donors-page-stats";

afterEach(cleanup);

describe("Partners summary", () => {
  it("shows the same committed support as Home, anonymous partners included", () => {
    render(<DonorsPageStats />);
    const monthly = screen.getByRole("button", { name: /Monthly partners/ });
    expect(monthly.textContent).toContain("7");
    expect(monthly.textContent).toContain("$706.67 a month committed");
  });
});
