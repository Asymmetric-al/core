// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WalletPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client";

const state = vi.hoisted(() => ({
  wallet: {
    isLoading: false,
    error: null as Error | null,
    data: undefined as unknown,
    refetch: vi.fn(),
  },
  portal: { mutateAsync: vi.fn(), isPending: false, error: null },
  snapshotFailed: false,
  gift: { amountCents: 3000, currency: "usd" },
}));

vi.mock("@asym/database/hooks", () => ({
  useDonorWallet: () => state.wallet,
  useCreateDonorBillingPortalSession: () => state.portal,
  useDonorPortalSnapshot: () =>
    state.snapshotFailed
      ? { isLoading: false, error: new Error("snapshot down"), data: undefined }
      : {
          isLoading: false,
          error: null,
          data: {
            recurringGifts: [
              {
                id: "pledge-1",
                amountCents: state.gift.amountCents,
                amount: 30,
                currency: state.gift.currency,
                frequency: "monthly",
                status: "active",
                designation: {
                  id: "f1",
                  name: "Nairobi Water Wells",
                  type: "fund",
                  avatarUrl: null,
                },
              },
            ],
          },
        },
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => false,
}));

const assign = vi.fn();
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 10));
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...window.location, assign },
  });
  state.wallet.isLoading = false;
  state.wallet.error = null;
  state.snapshotFailed = false;
  state.gift = { amountCents: 3000, currency: "usd" };
  state.wallet.data = {
    status: "linked",
    methods: [
      {
        id: "pm_visa",
        kind: "card",
        brand: "Visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2028,
        isDefault: true,
        recurringGiftIds: ["pledge-1"],
      },
      {
        id: "pm_mc",
        kind: "card",
        brand: "Mastercard",
        last4: "5454",
        expMonth: 12,
        expYear: 2026,
        isDefault: false,
        recurringGiftIds: [],
      },
      {
        id: "pm_old",
        kind: "card",
        brand: "Amex",
        last4: "0005",
        expMonth: 1,
        expYear: 2025,
        isDefault: false,
        recurringGiftIds: [],
      },
    ],
  };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("WalletPage", () => {
  it.each([
    [1000, "jpy", "¥1,000 a month"],
    [1234, "kwd", "KWD 1.234 a month"],
    [9007199254740991, "usd", "$90,071,992,547,409.91 a month"],
  ])(
    "formats %i minor units in %s exactly",
    (amountCents, currency, expected) => {
      state.gift = { amountCents, currency };
      render(<WalletPage />);
      const visa = screen.getByRole("listitem", {
        name: "Visa ending in 4242",
      });
      expect(within(visa).getByText(expected)).toBeTruthy();
    },
  );

  it.each([
    [1000, ""],
    [1000, "unknown"],
    [1.5, "usd"],
    [-1, "usd"],
    [9007199254740992, "usd"],
  ])(
    "does not invent an amount for %s minor units in %s",
    (amountCents, currency) => {
      state.gift = { amountCents, currency };
      render(<WalletPage />);
      const visa = screen.getByRole("listitem", {
        name: "Visa ending in 4242",
      });
      expect(within(visa).getByText("Amount unavailable")).toBeTruthy();
    },
  );

  it("shows recorded gift links without claiming current billing use", () => {
    render(<WalletPage />);
    expect(
      screen.getByRole("heading", { name: "Payment methods" }),
    ).toBeTruthy();

    const visa = screen.getByRole("listitem", { name: "Visa ending in 4242" });
    expect(within(visa).getByText("Default")).toBeTruthy();
    expect(within(visa).getByText("Expires 12/2028")).toBeTruthy();
    expect(within(visa).getByText("Nairobi Water Wells")).toBeTruthy();
    expect(within(visa).getByText("$30.00 a month")).toBeTruthy();
    expect(within(visa).getByText("Recorded recurring gifts")).toBeTruthy();

    const mastercard = screen.getByRole("listitem", {
      name: "Mastercard ending in 5454",
    });
    expect(within(mastercard).getByText("Expires soon")).toBeTruthy();
    expect(
      within(mastercard).getByText("Recurring use not confirmed"),
    ).toBeTruthy();

    const amex = screen.getByRole("listitem", { name: "Amex ending in 0005" });
    expect(within(amex).getByText("Expired")).toBeTruthy();

    // No preview or sample framing anywhere.
    expect(screen.queryByText(/preview|sample/i)).toBeNull();
  });

  it("never calls a card unused when its gifts couldn't load", () => {
    state.snapshotFailed = true;
    render(<WalletPage />);
    const visa = screen.getByRole("listitem", { name: "Visa ending in 4242" });
    expect(
      within(visa).getByText("Recorded for 1 recurring gift"),
    ).toBeTruthy();
    expect(
      within(visa).queryByText("Not used for a recurring gift"),
    ).toBeNull();
    const mastercard = screen.getByRole("listitem", {
      name: "Mastercard ending in 5454",
    });
    expect(
      within(mastercard).getByText("Recurring use not confirmed"),
    ).toBeTruthy();
  });

  it("opens Stripe's billing portal to add or change payment methods", async () => {
    state.portal.mutateAsync.mockResolvedValue({
      url: "https://billing.stripe.com/p/session/test",
      stripeManaged: true,
    });
    render(<WalletPage />);
    fireEvent.click(
      screen.getByRole("button", { name: "Manage payment methods" }),
    );
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        "https://billing.stripe.com/p/session/test",
      ),
    );
  });

  it("explains how payment methods get saved when there are none", () => {
    state.wallet.data = { status: "not_linked", methods: [] };
    render(<WalletPage />);
    expect(
      screen.getByRole("heading", { name: "No payment methods to show here" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Find a missionary" })
        .getAttribute("href"),
    ).toBe("/workers");
    expect(
      screen.queryByRole("button", { name: "Manage payment methods" }),
    ).toBeNull();
  });

  it("directs an empty linked wallet to Stripe without declaring it has no saved methods", () => {
    state.wallet.data = { status: "linked", methods: [] };
    render(<WalletPage />);
    expect(
      screen.getByRole("heading", { name: "No payment methods to show here" }),
    ).toBeTruthy();
    expect(screen.getByText(/other or older payment details/i)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "View payment methods in Stripe" }),
    ).toBeTruthy();
    expect(screen.queryByText("No saved payment methods")).toBeNull();
  });

  it("offers a retry when the payment methods couldn't load", () => {
    state.wallet.data = undefined;
    state.wallet.error = new Error("stripe down");
    render(<WalletPage />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(state.wallet.refetch).toHaveBeenCalled();
  });
});
