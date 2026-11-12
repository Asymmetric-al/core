// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import React, { type ComponentType } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  gifts: [] as unknown[],
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
    data: { recurringGifts: state.gifts },
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

  it("explains spreading only when a gift isn’t monthly", () => {
    const spread = /spread across the months/;
    state.gifts = [gift({ id: "monthly-only" })];
    const view = render(<RecurringGiftsPage />);
    expect(screen.queryByText(spread)).toBeNull();
    view.unmount();

    // A weekly gift isn't spread out, so the note doesn't describe it.
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
