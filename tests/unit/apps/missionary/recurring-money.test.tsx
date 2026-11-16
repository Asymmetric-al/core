/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  currency: "USD" as string | null,
  amount: 70667,
  expected: 141334,
}));

vi.mock("../../../../apps/missionary/app/donors/use-donors-page-view", () => ({
  useDonorsPageViewFields: () => ({
    donors: {
      selected: {
        recurring_donations: [
          {
            id: "commitment",
            amount: fixture.amount,
            currency: fixture.currency,
            frequency: "Monthly",
            status: "active",
            start_date: "2026-01-01",
            total_paid: fixture.amount,
            total_expected: fixture.expected,
            payments_completed: 1,
            payments_remaining: 1,
          },
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

afterEach(() => {
  cleanup();
  fixture.currency = "USD";
  fixture.amount = 70667;
  fixture.expected = 141334;
});

describe("recurring gift currency", () => {
  it.each([
    ["USD", 70667, "$706.67"],
    ["JPY", 1000, "¥1,000"],
    ["BHD", 1234, "1.234"],
    ["USD", Number.MAX_SAFE_INTEGER, "$90,071,992,547,409.91"],
  ])("keeps %s original minor units", (currency, amount, expected) => {
    fixture.currency = currency;
    fixture.amount = amount;
    fixture.expected = amount;
    render(<DonorsPageDetailRecurring />);
    expect(
      screen.getAllByText(expected, { exact: false }).length,
    ).toBeGreaterThan(0);
    expect(
      screen
        .getByRole("progressbar", { name: "Recurring gift progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("100");
  });

  it.each([null, "XXX"])(
    "does not turn unknown %s commitments into USD or progress",
    (currency) => {
      fixture.currency = currency;
      const { container } = render(<DonorsPageDetailRecurring />);
      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.getByText(/currencies are mixed or unknown/)).toBeTruthy();
      expect(container.textContent).not.toMatch(/\$|50%|100%/);
    },
  );

  it("does not claim completion of an ongoing commitment", () => {
    fixture.expected = 0;
    render(<DonorsPageDetailRecurring />);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(
      screen.getByText("Ongoing recurring gift; no fixed total to compare."),
    ).toBeTruthy();
  });
});
