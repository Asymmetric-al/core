// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React, { type ComponentType } from "react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

const loaded = { recurringGifts: [], recurringGiftsComplete: true };

const state = vi.hoisted(() => ({
  isLoading: false,
  // Offline, a load waits for the connection without fetching.
  isPaused: false,
  error: null as Error | null,
  data: undefined as unknown,
  refetch: vi.fn(),
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
  // Like TanStack Query: pending while nothing has loaded or failed.
  useDonorPortalSnapshot: () => ({
    data: state.data,
    isLoading: state.isLoading,
    isPending: state.data === undefined && !state.error,
    isPaused: state.isPaused,
    error: state.error,
    refetch: state.refetch,
  }),
  useDonorWallet: () => ({ data: { status: "not_linked", methods: [] } }),
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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

afterEach(() => {
  cleanup();
  state.isLoading = false;
  state.isPaused = false;
  state.error = null;
  state.data = undefined;
  state.refetch.mockReset();
});

function failToLoad({ cached = false } = {}) {
  state.error = new Error("Offline fixture");
  state.data = cached ? loaded : undefined;
  const view = render(<RecurringGiftsPage />);
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  return { view, retry };
}

const heading = () =>
  screen.getByRole("heading", { level: 1, name: "Recurring gifts" });

it("exposes the loading recurring gifts as a named status", () => {
  state.isLoading = true;
  render(<RecurringGiftsPage />);
  expect(
    screen.getByRole("status", { name: "Loading recurring gifts" }),
  ).toBeTruthy();
});

it("shows the gifts loading, not an empty list, while a first load waits offline for the connection", () => {
  // Nothing has loaded or failed, and nothing is fetching.
  state.isPaused = true;
  render(<RecurringGiftsPage />);
  expect(
    screen.getByRole("status", { name: "Loading recurring gifts" }),
  ).toBeTruthy();
  expect(screen.queryByText("No recurring gifts yet")).toBeNull();
  expect(screen.queryByRole("link", { name: "Find a missionary" })).toBeNull();
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
});

it("keeps focus on Try again while it retries, then moves it to the heading once the gifts load", async () => {
  const pending = deferred<unknown>();
  state.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad();
  fireEvent.click(retry);
  expect(state.refetch).toHaveBeenCalledTimes(1);

  // With nothing cached, TanStack Query clears the error and loads again; the
  // button stays put instead of giving way to the skeleton.
  state.error = null;
  state.isLoading = true;
  view.rerender(<RecurringGiftsPage />);
  const busy = screen.getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(retry);

  state.isLoading = false;
  state.data = loaded;
  await act(async () => pending.resolve({ isError: false, data: loaded }));
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(heading());
});

it("shows Try again as busy while it retries over cached gifts, and refetches once", async () => {
  const pending = deferred<unknown>();
  state.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad({ cached: true });
  fireEvent.click(retry);

  // With gifts cached, the error stays set and nothing loads while the
  // retry runs.
  view.rerender(<RecurringGiftsPage />);
  const busy = screen.getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(busy);
  fireEvent.click(busy);
  expect(state.refetch).toHaveBeenCalledTimes(1);

  state.error = null;
  await act(async () => pending.resolve({ isError: false, data: loaded }));
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(heading());
});

it("returns to Try again and says so again when the retry fails", async () => {
  const pending = deferred<unknown>();
  state.refetch.mockReturnValue(pending.promise);
  const { retry } = failToLoad({ cached: true });
  const firstAlert = screen.getByRole("alert");
  fireEvent.click(retry);

  state.error = new Error("Still offline");
  await act(async () => pending.resolve({ isError: true, error: state.error }));
  const again = screen.getByRole("button", { name: "Try again" });
  expect(again).toBe(retry);
  expect(again.getAttribute("aria-disabled")).not.toBe("true");
  expect(document.activeElement).toBe(again);
  // A new alert, so the failure is announced again.
  const secondAlert = screen.getByRole("alert");
  expect(secondAlert).not.toBe(firstAlert);
  expect(secondAlert.textContent).toBe(
    "We couldn’t load your recurring gifts.",
  );

  state.refetch.mockResolvedValue({ isError: false, data: loaded });
  fireEvent.click(again);
  expect(state.refetch).toHaveBeenCalledTimes(2);
  state.error = null;
  state.data = loaded;
  await act(async () => {});
  expect(document.activeElement).toBe(heading());
});

it("leaves focus alone when the gifts recover on their own after a retry that failed again", async () => {
  const pending = deferred<unknown>();
  state.refetch.mockReturnValue(pending.promise);
  const { view } = failToLoad({ cached: true });
  // A tap on Safari does not focus the button; nothing holds focus.
  act(() => (document.activeElement as HTMLElement).blur());
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(document.activeElement).toBe(document.body);

  state.error = new Error("Still offline");
  await act(async () => pending.resolve({ isError: true, error: state.error }));
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();

  // Later the connection returns and the query refetches by itself.
  state.error = null;
  view.rerender(<RecurringGiftsPage />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(document.body);
  expect(heading().hasAttribute("tabindex")).toBe(false);
});

it("moves focus to the heading when the gifts recover on their own while Try again has focus", async () => {
  const pending = deferred<unknown>();
  state.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad({ cached: true });
  fireEvent.click(retry);
  state.error = new Error("Still offline");
  await act(async () => pending.resolve({ isError: true, error: state.error }));
  expect(document.activeElement).toBe(retry);

  // Later the connection returns and the query refetches by itself, removing
  // the button the keyboard is on.
  state.error = null;
  view.rerender(<RecurringGiftsPage />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(heading());
});
