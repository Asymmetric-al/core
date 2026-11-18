/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

const feed = vi.hoisted(() => ({
  isLoading: false,
  // Nothing has loaded or failed yet.
  isPending: false,
  // Offline, a load waits for the connection without fetching.
  isPaused: false,
  error: null as Error | null,
  data: [] as unknown[],
  refetch: vi.fn(),
}));

const snapshot = {
  profile: { displayName: "Avery Lopez" },
  summary: { statementYears: [] },
  donations: [],
  recurringGifts: [],
};

const update = {
  id: "post-1",
  title: "Wells completed in Kajiado",
  content: "Three new boreholes.",
  created_at: "2026-01-29T09:00:00.000Z",
};

vi.mock("@asym/database/hooks", () => ({
  useDonorPortalSnapshot: () => ({
    isLoading: false,
    error: null,
    data: snapshot,
    refetch: vi.fn(),
  }),
  useDonorWallet: () => ({ data: { status: "linked", methods: [] } }),
  useDonorFeedPosts: () => ({ ...feed }),
  mapToRecentUpdate: (post: typeof update) => ({
    id: post.id,
    author: "Jordan Hale",
    title: post.title,
    time: "Today",
    avatar: "JH",
  }),
  formatPostRelativeTime: () => "Today",
  postAuthorName: () => "Jordan Hale",
  postCategory: () => undefined,
  postImages: () => [],
  postPlainText: (content: string) => content,
  postTitle: (post: typeof update) => post.title,
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
  feed.isLoading = false;
  feed.isPending = false;
  feed.isPaused = false;
  feed.error = null;
  feed.data = [];
  feed.refetch.mockReset();
});

function latest() {
  return within(screen.getByRole("region", { name: "Latest update" }));
}

function more() {
  return within(screen.getByRole("region", { name: "More updates" }));
}

function failToLoad() {
  feed.error = new Error("Offline fixture");
  feed.data = [];
  return render(<DonorDashboardMainBody />);
}

it("offers Try again where updates couldn’t load, and says so once", () => {
  failToLoad();
  expect(latest().getByRole("button", { name: "Try again" })).toBeTruthy();
  expect(more().getByText("Updates couldn’t load right now.")).toBeTruthy();
  expect(more().getByRole("button", { name: "Try again" })).toBeTruthy();
  expect(
    screen.getAllByRole("alert").map((alert) => alert.textContent),
  ).toEqual(["Updates couldn't load right now"]);
});

it("keeps focus on Try again while updates load again, then moves it to the heading", async () => {
  const pending = deferred<unknown>();
  feed.refetch.mockReturnValue(pending.promise);
  const view = failToLoad();
  const retry = more().getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  expect(feed.refetch).toHaveBeenCalledTimes(1);

  // With nothing cached, TanStack Query clears the error and loads again; the
  // buttons stay put instead of giving way to the skeletons.
  feed.error = null;
  feed.isLoading = true;
  view.rerender(<DonorDashboardMainBody />);
  const busy = more().getByRole("button", { name: "Trying again…" });
  expect(busy).toBe(retry);
  expect(busy.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(retry);
  expect(
    latest()
      .getByRole("button", { name: "Trying again…" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  fireEvent.click(busy);
  expect(feed.refetch).toHaveBeenCalledTimes(1);

  feed.isLoading = false;
  feed.data = [update, { ...update, id: "post-2", title: "Clinic opened" }];
  await act(async () => pending.resolve({ isError: false, data: feed.data }));
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(
    latest().getByRole("heading", { name: "Wells completed in Kajiado" }),
  ).toBeTruthy();
  expect(more().getByText("Clinic opened")).toBeTruthy();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { level: 1, name: "Welcome back, Avery" }),
  );
});

it("returns to Try again and says so again when updates still don’t load", async () => {
  const pending = deferred<unknown>();
  feed.refetch.mockReturnValue(pending.promise);
  const view = failToLoad();
  const firstAlert = screen.getByRole("alert");
  const retry = latest().getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);

  feed.error = null;
  feed.isLoading = true;
  view.rerender(<DonorDashboardMainBody />);
  expect(document.activeElement).toBe(retry);

  feed.isLoading = false;
  feed.error = new Error("Still offline");
  await act(async () => pending.resolve({ isError: true, error: feed.error }));
  const again = latest().getByRole("button", { name: "Try again" });
  expect(again).toBe(retry);
  expect(again.getAttribute("aria-disabled")).not.toBe("true");
  expect(document.activeElement).toBe(again);
  // A new alert, so the failure is announced again.
  const secondAlert = screen.getByRole("alert");
  expect(secondAlert).not.toBe(firstAlert);
  expect(secondAlert.textContent).toBe("Updates couldn't load right now");
});

it("leaves focus alone when updates recover on their own after a retry that failed again", async () => {
  const pending = deferred<unknown>();
  feed.refetch.mockReturnValue(pending.promise);
  const view = failToLoad();
  // A tap on Safari does not focus the button; nothing holds focus.
  fireEvent.click(latest().getByRole("button", { name: "Try again" }));
  expect(document.activeElement).toBe(document.body);

  feed.error = new Error("Still offline");
  await act(async () => pending.resolve({ isError: true, error: feed.error }));
  expect(latest().getByRole("button", { name: "Try again" })).toBeTruthy();

  // Later the connection returns and the query refetches by itself.
  feed.error = null;
  feed.data = [update];
  view.rerender(<DonorDashboardMainBody />);
  expect(
    latest().getByRole("heading", { name: "Wells completed in Kajiado" }),
  ).toBeTruthy();
  const heading = screen.getByRole("heading", { level: 1 });
  expect(document.activeElement).toBe(document.body);
  expect(heading.hasAttribute("tabindex")).toBe(false);
});

const heading = () => screen.getByRole("heading", { level: 1 });

it("shows updates loading, not an empty feed, while a first load waits offline for the connection", () => {
  // Nothing has loaded or failed, and nothing is fetching.
  feed.isPending = true;
  feed.isPaused = true;
  render(<DonorDashboardMainBody />);
  expect(
    latest().getByRole("status", {
      name: "Loading the latest ministry update",
    }),
  ).toBeTruthy();
  expect(screen.queryByText("No ministry updates yet")).toBeNull();
  expect(
    more().queryByText(
      "New updates from the missionaries you support will show up here.",
    ),
  ).toBeNull();
  expect(
    screen
      .getByRole("region", { name: "More updates" })
      .querySelector('[aria-busy="true"]'),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
});

it("moves focus to the heading when updates recover on their own while Try again in the list has focus", async () => {
  const pending = deferred<unknown>();
  feed.refetch.mockReturnValue(pending.promise);
  const view = failToLoad();
  const retry = more().getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  feed.error = new Error("Still offline");
  await act(async () => pending.resolve({ isError: true, error: feed.error }));
  expect(document.activeElement).toBe(retry);

  // Later the connection returns and the query refetches by itself. With
  // nothing cached it loads afresh, removing the button the keyboard is on.
  feed.error = null;
  feed.isLoading = true;
  view.rerender(<DonorDashboardMainBody />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(document.activeElement).toBe(heading());

  feed.isLoading = false;
  feed.data = [update, { ...update, id: "post-2", title: "Clinic opened" }];
  view.rerender(<DonorDashboardMainBody />);
  expect(more().getByText("Clinic opened")).toBeTruthy();
  expect(document.activeElement).toBe(heading());
});

it("moves focus to the heading when updates recover on their own while the latest update's Try again has focus", async () => {
  const pending = deferred<unknown>();
  feed.refetch.mockReturnValue(pending.promise);
  // A refresh failed over a cached update, so the error shows while the
  // update is kept.
  feed.error = new Error("Offline fixture");
  feed.data = [update];
  const view = render(<DonorDashboardMainBody />);
  const retry = latest().getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  await act(async () => pending.resolve({ isError: true, error: feed.error }));
  expect(document.activeElement).toBe(retry);

  // Later a refetch the donor did not ask for succeeds.
  feed.error = null;
  view.rerender(<DonorDashboardMainBody />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(
    latest().getByRole("heading", { name: "Wells completed in Kajiado" }),
  ).toBeTruthy();
  expect(document.activeElement).toBe(heading());
});

it("moves focus to the heading when updates recover on their own to an empty feed while the latest update's Try again has focus", async () => {
  const pending = deferred<unknown>();
  feed.refetch.mockReturnValue(pending.promise);
  // A refresh of a loaded, empty feed failed.
  feed.error = new Error("Offline fixture");
  const view = render(<DonorDashboardMainBody />);
  const retry = latest().getByRole("button", { name: "Try again" });
  act(() => retry.focus());
  fireEvent.click(retry);
  await act(async () => pending.resolve({ isError: true, error: feed.error }));
  expect(document.activeElement).toBe(retry);

  feed.error = null;
  view.rerender(<DonorDashboardMainBody />);
  expect(screen.queryByRole("button", { name: /Try/ })).toBeNull();
  expect(latest().getByText("No ministry updates yet")).toBeTruthy();
  expect(document.activeElement).toBe(heading());
});

it("keeps focus on Go to Updates when a refresh of an empty feed fails on its own", () => {
  // A loaded, empty feed: the latest update offers only Go to Updates.
  const view = render(<DonorDashboardMainBody />);
  const goToUpdates = latest().getByRole("link", { name: "Go to Updates" });
  act(() => goToUpdates.focus());

  // A refetch the donor did not start fails; the failure view adds Try again
  // beside the same link, which keeps focus.
  feed.error = new Error("Offline fixture");
  view.rerender(<DonorDashboardMainBody />);
  expect(latest().getByRole("button", { name: "Try again" })).toBeTruthy();
  expect(document.activeElement).toBe(goToUpdates);
});
