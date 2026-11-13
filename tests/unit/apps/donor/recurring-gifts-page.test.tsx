// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import React, { type ComponentType } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  gifts: [] as unknown[],
  giftsComplete: undefined as boolean | undefined,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("../../../../packages/database/hooks/index", () => ({
  useDonorPortalSnapshot: () => ({
    data: {
      recurringGifts: state.gifts,
      recurringGiftsComplete: state.giftsComplete,
    },
    isLoading: false,
    error: null,
  }),
  useDonorWallet: () => ({
    data: {
      status: "linked",
      methods: [
        {
          id: "pm_visa",
          kind: "card",
          brand: "visa",
          last4: "4242",
          expMonth: 12,
          expYear: 2030,
          isDefault: true,
          recurringGiftIds: ["gift-jordan"],
        },
      ],
    },
  }),
  useCreateDonorBillingPortalSession: () => ({
    isPending: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
}));

let RecurringGiftsPage: ComponentType;
beforeAll(async () => {
  const module =
    await import("../../../../apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client");
  RecurringGiftsPage = module.default;
}, 20000);

afterEach(() => {
  cleanup();
  state.gifts = [];
});

const gift = (overrides: Record<string, unknown>) => ({
  id: "gift",
  amountCents: 5_000,
  amount: 50,
  currency: "usd",
  frequency: "monthly",
  status: "active",
  startedAt: "2025-01-05",
  endsAt: null,
  nextChargeAt: "2026-12-05",
  stripeSubscriptionId: null,
  paymentMethodLabel: "Saved payment method",
  totalPaidCents: 0,
  totalExpectedCents: 0,
  paymentsCompleted: 0,
  paymentsRemaining: null,
  designation: {
    id: "m",
    name: "Jordan Hale",
    type: "missionary",
    avatarUrl: null,
  },
  missionary: { id: "m", name: "Jordan Hale", avatarUrl: null },
  fund: null,
  ...overrides,
});

describe("Recurring gifts", () => {
  it("lists each gift with its amount, schedule, next gift, card and status, and the monthly total", () => {
    state.gifts = [
      gift({ id: "gift-jordan" }),
      gift({
        id: "gift-team",
        amount: 150,
        amountCents: 15_000,
        frequency: "quarterly",
        nextChargeAt: "2027-01-15",
        designation: {
          id: "t",
          name: "Field Team 1",
          type: "missionary",
          avatarUrl: null,
        },
        missionary: { id: "t", name: "Field Team 1", avatarUrl: null },
        fund: { id: "f", name: "Nairobi Water Wells" },
      }),
    ];
    render(<RecurringGiftsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Recurring gifts" }),
    ).toBeTruthy();
    expect(screen.getByText("$100.00 a month")).toBeTruthy();

    const jordan = screen.getByRole("listitem", { name: "Jordan Hale" });
    expect(within(jordan).getByText("$50.00 a month")).toBeTruthy();
    expect(within(jordan).getByText("Next gift Dec 5, 2026")).toBeTruthy();
    expect(within(jordan).getByText("Visa ending in 4242")).toBeTruthy();
    expect(within(jordan).getByText("Active")).toBeTruthy();
    expect(within(jordan).getByText("General support")).toBeTruthy();

    const team = screen.getByRole("listitem", { name: "Field Team 1" });
    expect(within(team).getByText("$150.00 every 3 months")).toBeTruthy();
    expect(within(team).getByText("Nairobi Water Wells")).toBeTruthy();
    expect(within(team).getByText("Saved payment method")).toBeTruthy();

    expect(
      screen.getByRole("button", { name: "Change or stop a gift" }),
    ).toBeTruthy();
  });

  it.each([
    ["eur", 5_000, "€50.00 a month"],
    ["JPY", 5_000, "¥5,000 a month"],
    ["BHD", 1_234, "BHD 1.234 a month"],
  ])(
    "uses canonical %s minor units for each gift and its monthly total",
    (currency, amountCents, expected) => {
      state.gifts = [gift({ currency, amountCents, amount: 999 })];
      render(<RecurringGiftsPage />);

      const row = screen.getByRole("listitem", { name: "Jordan Hale" });
      expect(within(row).getByText(expected)).toBeTruthy();
      expect(screen.getAllByText(expected)).toHaveLength(2);
      expect(screen.queryByText(/\$999/)).toBeNull();
    },
  );

  it("keeps mixed-currency gift rows but makes the monthly total unavailable", () => {
    state.gifts = [
      gift({ id: "usd", currency: "USD" }),
      gift({ id: "eur", currency: "EUR" }),
    ];
    render(<RecurringGiftsPage />);

    expect(screen.getByText("$50.00 a month")).toBeTruthy();
    expect(screen.getByText("€50.00 a month")).toBeTruthy();
    expect(screen.getByText("Monthly total unavailable")).toBeTruthy();
    expect(
      screen.getByText(/cannot be combined into one monthly total/),
    ).toBeTruthy();
    expect(screen.queryByText("$100.00 a month")).toBeNull();
  });

  it.each(["", "ZZZ", "not-a-currency", null, undefined])(
    "does not infer a currency for an unknown %s gift",
    (currency) => {
      state.gifts = [gift({ currency })];
      render(<RecurringGiftsPage />);

      expect(screen.getByText("Amount unavailable a month")).toBeTruthy();
      expect(screen.getByText("Monthly total unavailable")).toBeTruthy();
      expect(screen.queryByText(/\$/)).toBeNull();
    },
  );

  it("combines normalized active currencies without including inactive gifts", () => {
    state.gifts = [
      gift({ id: "monthly", currency: " eur " }),
      gift({
        id: "quarterly",
        currency: "EUR",
        frequency: "quarterly",
        amountCents: 15_000,
      }),
      gift({ id: "paused", currency: "USD", status: "paused" }),
      gift({ id: "stopped", currency: "", status: "cancelled" }),
    ];
    render(<RecurringGiftsPage />);

    expect(screen.getByText("€100.00 a month")).toBeTruthy();
    expect(screen.getByText(/From 2 active gifts/)).toBeTruthy();
    expect(screen.queryByText("Monthly total unavailable")).toBeNull();
  });

  it.each(["biweekly", "BiWeEkLy"])(
    "includes %s gifts using 26 annual periods and explains their schedule",
    (frequency) => {
      state.gifts = [
        gift({ currency: "EUR", frequency, amountCents: 1_200, amount: 12 }),
      ];
      render(<RecurringGiftsPage />);

      expect(screen.getByText("€12.00 every 2 weeks")).toBeTruthy();
      expect(screen.getByText("€26.00 a month")).toBeTruthy();
      expect(screen.getByText("From 1 active gift.")).toBeTruthy();
      expect(screen.queryByText(/spread across the months/)).toBeNull();
    },
  );

  it("rounds the combined biweekly equivalent once in canonical minor units", () => {
    state.gifts = [
      gift({
        id: "first",
        frequency: "biweekly",
        amountCents: 3,
        amount: 0.03,
      }),
      gift({
        id: "second",
        frequency: "biweekly",
        amountCents: 3,
        amount: 0.03,
      }),
    ];
    render(<RecurringGiftsPage />);

    expect(screen.getByText("$0.13 a month")).toBeTruthy();
    expect(screen.getAllByText("$0.03 every 2 weeks")).toHaveLength(2);
  });

  it("explains spreading only for quarterly and annual gifts", () => {
    const spread = /spread across the months/;
    state.gifts = [gift({ id: "monthly-only" })];
    const view = render(<RecurringGiftsPage />);
    expect(screen.queryByText(spread)).toBeNull();
    view.unmount();

    state.gifts = [gift({ id: "weekly", frequency: "weekly", amount: 10 })];
    const weekly = render(<RecurringGiftsPage />);
    expect(screen.queryByText(spread)).toBeNull();
    weekly.unmount();

    state.gifts = [gift({ id: "yearly", frequency: "annually", amount: 600 })];
    render(<RecurringGiftsPage />);
    expect(screen.getByText(spread)).toBeTruthy();
  });

  it("explains a paused gift and leaves stopped gifts out of the total", () => {
    state.gifts = [
      gift({ id: "a", status: "paused", nextChargeAt: null }),
      gift({
        id: "b",
        status: "cancelled",
        designation: {
          id: "x",
          name: "Field Team 2",
          type: "missionary",
          avatarUrl: null,
        },
        missionary: { id: "x", name: "Field Team 2", avatarUrl: null },
      }),
    ];
    render(<RecurringGiftsPage />);
    expect(screen.getByText("Paused")).toBeTruthy();
    expect(screen.getByText("No gift scheduled while paused")).toBeTruthy();
    expect(screen.getByText("Stopped")).toBeTruthy();
    expect(screen.getByText("$0.00 a month")).toBeTruthy();
  });

  it("counts a gift every two weeks at its monthly rate", () => {
    state.gifts = [
      gift({
        id: "gift-jordan",
        amountCents: 2_600,
        amount: 26,
        frequency: "biweekly",
      }),
    ];
    render(<RecurringGiftsPage />);
    const jordan = screen.getByRole("listitem", { name: "Jordan Hale" });
    expect(within(jordan).getByText("$26.00 every 2 weeks")).toBeTruthy();
    // 26 gifts a year over 12 months.
    expect(screen.getByText("$56.33 a month")).toBeTruthy();
    expect(screen.queryByText(/spread across the months/)).toBeNull();
  });

  it("shows gifts and their total in the gift's own currency", () => {
    state.gifts = [gift({ id: "gift-jordan", currency: "cad" })];
    render(<RecurringGiftsPage />);
    const jordan = screen.getByRole("listitem", { name: "Jordan Hale" });
    expect(within(jordan).getByText("CA$50.00 a month")).toBeTruthy();
    expect(screen.getAllByText("CA$50.00 a month")).toHaveLength(2);
  });

  it("does not add gifts in different currencies into one total", () => {
    state.gifts = [
      gift({ id: "gift-jordan" }),
      gift({
        id: "gift-team",
        currency: "eur",
        designation: {
          id: "t",
          name: "Field Team 1",
          type: "missionary",
          avatarUrl: null,
        },
        missionary: { id: "t", name: "Field Team 1", avatarUrl: null },
      }),
    ];
    render(<RecurringGiftsPage />);
    expect(screen.getByText("Monthly total unavailable")).toBeTruthy();
    expect(
      screen.getByText(
        /Gift amounts, currencies or schedules cannot be combined/,
      ),
    ).toBeTruthy();
    expect(screen.queryByText("$100.00 a month")).toBeNull();
    const team = screen.getByRole("listitem", { name: "Field Team 1" });
    expect(within(team).getByText("€50.00 a month")).toBeTruthy();
  });

  it("withholds the monthly total when only the newest recurring gifts loaded", () => {
    state.gifts = [gift({ id: "gift-jordan" })];
    state.giftsComplete = false;
    try {
      render(<RecurringGiftsPage />);
      expect(screen.getByText("Monthly total unavailable")).toBeTruthy();
      expect(
        screen.queryByText("$50.00 a month", { exact: true }),
      ).toBeTruthy();
      expect(screen.getByText(/From at least 1 active gifts/)).toBeTruthy();
      expect(
        screen.getByText(/Only your newest recurring gifts are listed here/),
      ).toBeTruthy();
    } finally {
      state.giftsComplete = undefined;
    }
  });

  it("points a donor with no recurring gifts to someone to support", () => {
    render(<RecurringGiftsPage />);
    expect(screen.getByText("No recurring gifts yet")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Find a missionary" })
        .getAttribute("href"),
    ).toBe("/workers");
    expect(
      screen.queryByRole("button", { name: "Change or stop a gift" }),
    ).toBeNull();
  });
});
