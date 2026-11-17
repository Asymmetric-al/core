// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: The real donor wallet page at its app boundary.
import WalletPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client";

const state = vi.hoisted(() => ({
  wallet: {
    isLoading: false,
    // Offline, a load waits for the connection without fetching.
    isPaused: false,
    error: null as Error | null,
    data: undefined as unknown,
    refetch: vi.fn(),
  },
  portal: { mutateAsync: vi.fn(), isPending: false, error: null },
  snapshotFailed: false,
  gift: { amountCents: 3000, currency: "usd" },
}));

vi.mock("@asym/database/hooks", () => ({
  // Like TanStack Query: pending while nothing has loaded or failed.
  useDonorWallet: () => ({
    ...state.wallet,
    isPending: state.wallet.data === undefined && !state.wallet.error,
  }),
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
  state.wallet.isPaused = false;
  state.wallet.error = null;
  state.portal.isPending = false;
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
    state.wallet.refetch.mockResolvedValue({ isError: true });
    render(<WalletPage />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(state.wallet.refetch).toHaveBeenCalled();
  });

  it("shows the empty wallet's Stripe button as pending while the portal opens", () => {
    state.wallet.data = { status: "linked", methods: [] };
    state.portal.mutateAsync.mockReturnValueOnce(new Promise(() => {}));
    const view = render(<WalletPage />);
    const open = screen.getByRole("button", {
      name: "View payment methods in Stripe",
    });
    act(() => open.focus());
    fireEvent.click(open);
    expect(state.portal.mutateAsync).toHaveBeenCalledTimes(1);

    state.portal.isPending = true;
    view.rerender(<WalletPage />);
    expect(open.getAttribute("aria-disabled")).toBe("true");
    expect(open.querySelector(".animate-spin")).not.toBeNull();
    expect(document.activeElement).toBe(open);
    fireEvent.click(open);
    expect(state.portal.mutateAsync).toHaveBeenCalledTimes(1);
  });

  it("exposes the loading payment methods as a named status", () => {
    state.wallet.isLoading = true;
    state.wallet.data = undefined;
    render(<WalletPage />);
    expect(
      screen.getByRole("status", { name: "Loading payment methods" }),
    ).toBeTruthy();
  });

  it("shows the payment methods loading, not a failure, while a first load waits offline for the connection", () => {
    // Nothing has loaded or failed, and nothing is fetching.
    state.wallet.data = undefined;
    state.wallet.isPaused = true;
    render(<WalletPage />);
    expect(
      screen.getByRole("status", { name: "Loading payment methods" }),
    ).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  });

  function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((settle) => {
      resolve = settle;
    });
    return { promise, resolve };
  }

  const heading = () =>
    screen.getByRole("heading", { level: 1, name: "Payment methods" });

  function failToLoad({ cached = false } = {}) {
    const loaded = state.wallet.data;
    if (!cached) state.wallet.data = undefined;
    state.wallet.error = new Error("stripe down");
    const view = render(<WalletPage />);
    const retry = screen.getByRole("button", { name: "Try again" });
    act(() => retry.focus());
    return { view, retry, loaded };
  }

  it("keeps focus on Try again while it retries, then moves it to the heading once the payment methods load", async () => {
    const pending = deferred<unknown>();
    state.wallet.refetch.mockReturnValue(pending.promise);
    const { view, retry, loaded } = failToLoad();
    fireEvent.click(retry);
    expect(state.wallet.refetch).toHaveBeenCalledTimes(1);

    // With nothing cached, TanStack Query clears the error and loads again;
    // the button stays put instead of giving way to the skeleton.
    state.wallet.error = null;
    state.wallet.isLoading = true;
    view.rerender(<WalletPage />);
    const busy = screen.getByRole("button", { name: "Trying again…" });
    expect(busy).toBe(retry);
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(retry);

    state.wallet.isLoading = false;
    state.wallet.data = loaded;
    await act(async () => pending.resolve({ isError: false, data: loaded }));
    expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
    expect(document.activeElement).toBe(heading());
  });

  it("shows Try again as busy while it retries over cached payment methods, and refetches once", async () => {
    const pending = deferred<unknown>();
    state.wallet.refetch.mockReturnValue(pending.promise);
    const { view, retry, loaded } = failToLoad({ cached: true });
    fireEvent.click(retry);

    // With methods cached, the error stays set and nothing loads while the
    // retry runs.
    view.rerender(<WalletPage />);
    const busy = screen.getByRole("button", { name: "Trying again…" });
    expect(busy).toBe(retry);
    expect(busy.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(busy);
    fireEvent.click(busy);
    expect(state.wallet.refetch).toHaveBeenCalledTimes(1);

    state.wallet.error = null;
    await act(async () => pending.resolve({ isError: false, data: loaded }));
    expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
    expect(document.activeElement).toBe(heading());
  });

  it("returns to Try again and says so again when the retry fails", async () => {
    const pending = deferred<unknown>();
    state.wallet.refetch.mockReturnValue(pending.promise);
    const { retry, loaded } = failToLoad({ cached: true });
    const firstAlert = screen.getByRole("alert");
    fireEvent.click(retry);

    state.wallet.error = new Error("still down");
    await act(async () =>
      pending.resolve({ isError: true, error: state.wallet.error }),
    );
    const again = screen.getByRole("button", { name: "Try again" });
    expect(again).toBe(retry);
    expect(again.getAttribute("aria-disabled")).not.toBe("true");
    expect(document.activeElement).toBe(again);
    // A new alert, so the failure is announced again.
    const secondAlert = screen.getByRole("alert");
    expect(secondAlert).not.toBe(firstAlert);
    expect(secondAlert.textContent).toBe(
      "We couldn’t load your payment methods.",
    );

    state.wallet.refetch.mockResolvedValue({ isError: false, data: loaded });
    fireEvent.click(again);
    expect(state.wallet.refetch).toHaveBeenCalledTimes(2);
    state.wallet.error = null;
    await act(async () => {});
    expect(document.activeElement).toBe(heading());
  });

  it("leaves focus alone when the payment methods recover on their own after a retry that failed again", async () => {
    const pending = deferred<unknown>();
    state.wallet.refetch.mockReturnValue(pending.promise);
    const { view } = failToLoad({ cached: true });
    // A tap on Safari does not focus the button; nothing holds focus.
    act(() => (document.activeElement as HTMLElement).blur());
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(document.activeElement).toBe(document.body);

    state.wallet.error = new Error("still down");
    await act(async () =>
      pending.resolve({ isError: true, error: state.wallet.error }),
    );
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();

    // Later the connection returns and the query refetches by itself.
    state.wallet.error = null;
    view.rerender(<WalletPage />);
    expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
    expect(document.activeElement).toBe(document.body);
    expect(heading().hasAttribute("tabindex")).toBe(false);
  });

  it("moves focus to the heading when the payment methods recover on their own while Try again has focus", async () => {
    const pending = deferred<unknown>();
    state.wallet.refetch.mockReturnValue(pending.promise);
    const { view, retry } = failToLoad({ cached: true });
    fireEvent.click(retry);
    state.wallet.error = new Error("still down");
    await act(async () =>
      pending.resolve({ isError: true, error: state.wallet.error }),
    );
    expect(document.activeElement).toBe(retry);

    // Later the connection returns and the query refetches by itself,
    // removing the button the keyboard is on.
    state.wallet.error = null;
    view.rerender(<WalletPage />);
    expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
    expect(document.activeElement).toBe(heading());
  });
});
