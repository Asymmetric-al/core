/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

const portal = vi.hoisted(() => ({
  isLoading: false,
  // Offline, a load waits for the connection without fetching.
  isPaused: false,
  error: null as Error | null,
  data: undefined as unknown,
  refetch: vi.fn(),
}));

const snapshot = {
  profile: { displayName: "Avery Lopez" },
  summary: { statementYears: [] },
  donations: [],
  recurringGifts: [],
};

vi.mock("@asym/database/hooks", () => ({
  // Like TanStack Query: pending while nothing has loaded and the latest
  // attempt has not failed.
  useDonorPortalSnapshot: () => ({
    ...portal,
    isPending: portal.data === undefined && !portal.error,
  }),
  useDonorWallet: () => ({ data: { status: "linked", methods: [] } }),
  useDonorFeedPosts: () => ({ data: [], isLoading: false, error: null }),
  mapToRecentUpdate: (post: unknown) => post,
  formatPostRelativeTime: () => "Today",
  postAuthorName: () => "Jordan Hale",
  postImages: () => [],
  postTitle: () => "",
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => true,
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

// eslint-disable-next-line no-restricted-imports -- AL-1931: The actual donor overview at its app boundary.
import { DonorDashboardMainBody } from "../../../../apps/donor/features/donor/components/donor-dashboard-main-body";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

afterEach(() => {
  cleanup();
  portal.isLoading = false;
  portal.isPaused = false;
  portal.error = null;
  portal.data = undefined;
  portal.refetch.mockReset();
});

function failToLoad() {
  portal.error = new Error("Offline fixture");
  portal.data = undefined;
  const view = render(<DonorDashboardMainBody />);
  const retry = screen.getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  return { view, retry };
}

it("offers Try again instead of asking the donor to refresh the page", () => {
  failToLoad();
  expect(screen.getByRole("alert").textContent).toBe(
    "We couldn’t load your giving summary.",
  );
  expect(screen.queryByText(/Refresh the page/)).toBeNull();
});

it("keeps focus on Try again while it retries, then moves it to the heading once the summary loads", async () => {
  const pending = deferred<unknown>();
  portal.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad();
  fireEvent.click(retry);
  expect(portal.refetch).toHaveBeenCalledTimes(1);

  // With nothing cached, TanStack Query clears the error and loads again; the
  // button stays put instead of giving way to the skeleton.
  portal.error = null;
  portal.isLoading = true;
  view.rerender(<DonorDashboardMainBody />);
  const busy = screen.getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(retry);
  fireEvent.click(busy);
  expect(portal.refetch).toHaveBeenCalledTimes(1);

  portal.isLoading = false;
  portal.data = snapshot;
  await act(async () => pending.resolve({ isError: false, data: snapshot }));
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(screen.getByRole("region", { name: "Next gift" })).toBeTruthy();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { level: 1, name: "Welcome back, Avery" }),
  );
});

it("returns to Try again and says so again when the retry fails", async () => {
  const pending = deferred<unknown>();
  portal.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad();
  const firstAlert = screen.getByRole("alert");
  fireEvent.click(retry);

  portal.error = null;
  portal.isLoading = true;
  view.rerender(<DonorDashboardMainBody />);

  portal.isLoading = false;
  portal.error = new Error("Still offline");
  await act(async () =>
    pending.resolve({ isError: true, error: portal.error }),
  );
  const again = screen.getByRole("button", { name: "Try again" });
  expect(again).toBe(retry);
  expect(again.getAttribute("aria-disabled")).not.toBe("true");
  expect(document.activeElement).toBe(again);
  // A new alert, so the failure is announced again.
  const secondAlert = screen.getByRole("alert");
  expect(secondAlert).not.toBe(firstAlert);
  expect(secondAlert.textContent).toBe("We couldn’t load your giving summary.");

  portal.refetch.mockResolvedValue({ isError: false, data: snapshot });
  fireEvent.click(again);
  expect(portal.refetch).toHaveBeenCalledTimes(2);
  portal.error = null;
  portal.data = snapshot;
  await act(async () => {});
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { level: 1, name: "Welcome back, Avery" }),
  );
});

const heading = () => screen.getByRole("heading", { level: 1 });

it("shows the giving summary loading, not a failure, while a first load waits offline for the connection", () => {
  // Nothing has loaded or failed, and nothing is fetching.
  portal.isPaused = true;
  const { container } = render(<DonorDashboardMainBody />);
  expect(screen.queryByRole("alert")).toBeNull();
  expect(
    screen.queryByText("We couldn’t load your giving summary."),
  ).toBeNull();
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  // The summary skeleton is the only thing loading on the page.
  expect(container.querySelectorAll('[aria-busy="true"]')).toHaveLength(1);
});

it("moves focus to the heading when the summary recovers on its own while Try again has focus", async () => {
  const pending = deferred<unknown>();
  portal.refetch.mockReturnValue(pending.promise);
  const { view, retry } = failToLoad();
  fireEvent.click(retry);
  portal.error = new Error("Still offline");
  await act(async () =>
    pending.resolve({ isError: true, error: portal.error }),
  );
  expect(document.activeElement).toBe(retry);

  // Later the connection returns and the query refetches by itself. With
  // nothing cached it loads afresh, removing the button the keyboard is on.
  portal.error = null;
  portal.isLoading = true;
  view.rerender(<DonorDashboardMainBody />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(heading());

  portal.isLoading = false;
  portal.data = snapshot;
  view.rerender(<DonorDashboardMainBody />);
  expect(screen.getByRole("region", { name: "Next gift" })).toBeTruthy();
  expect(document.activeElement).toBe(heading());
});
