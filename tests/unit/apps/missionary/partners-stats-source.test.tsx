/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const currencyState = vi.hoisted(() => ({
  support: {
    recurringMonthlyCents: 70_667 as number | null,
    recurringCurrency: "USD" as string | null,
    monthlyPartnerCount: 7,
  },
}));

vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: () => ({
    data: {
      support: currencyState.support,
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
beforeEach(() => {
  currencyState.support.recurringMonthlyCents = 70_667;
  currencyState.support.recurringCurrency = "USD";
});

describe("Partners summary", () => {
  it("does not replace unavailable snapshot money with roster sums", () => {
    currencyState.support.recurringMonthlyCents = null;
    currencyState.support.recurringCurrency = null;
    render(<DonorsPageStats />);
    expect(
      screen.getByRole("button", { name: /Monthly partners/ }).textContent,
    ).toContain("unavailable");
    expect(screen.queryByText(/\$/)).toBeNull();
    expect(screen.getByText(/Lifetime giving is unavailable/)).toBeTruthy();
  });

  it("uses the snapshot currency for monthly commitments", () => {
    currencyState.support.recurringMonthlyCents = 1000;
    currencyState.support.recurringCurrency = "JPY";
    render(<DonorsPageStats />);
    expect(
      screen.getByRole("button", { name: /Monthly partners/ }).textContent,
    ).toContain("¥1,000 a month committed");
  });
  it("shows the same committed support as Home, anonymous partners included", () => {
    render(<DonorsPageStats />);
    const monthly = screen.getByRole("button", { name: /Monthly partners/ });
    expect(monthly.textContent).toContain("7");
    expect(monthly.textContent).toContain("$706.67 a month committed");
  });
});
