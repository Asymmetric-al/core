/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

function gift(id: string, amount: number, frequency: string) {
  return {
    id,
    amount,
    currency: "USD",
    frequency,
    status: "active",
    start_date: "2026-01-01",
    total_paid: amount,
    total_expected: amount * 2,
    payments_completed: 1,
    payments_remaining: 1,
  };
}

vi.mock("../../../../apps/missionary/app/donors/use-donors-page-view", () => ({
  useDonorsPageViewFields: () => ({
    donors: {
      selected: {
        recurring_donations: [
          gift("monthly", 5000, "Monthly"),
          gift("yearly", 120000, "Annually"),
        ],
      },
    },
  }),
}));

import { DonorsPageDetailRecurring } from "../../../../apps/missionary/app/donors/donors-page-detail-recurring";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: true,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }),
  });
});
afterEach(cleanup);

it("names each recurring gift's progress by its amount and frequency", () => {
  render(<DonorsPageDetailRecurring />);
  const names = screen
    .getAllByRole("progressbar")
    .map((bar) => bar.getAttribute("aria-label"));
  expect(names).toEqual([
    "Recurring gift progress, $50.00 monthly",
    "Recurring gift progress, $1,200.00 annually",
  ]);
});
