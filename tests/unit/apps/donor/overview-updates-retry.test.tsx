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
