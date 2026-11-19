/** @vitest-environment jsdom */
import { MotionProvider } from "@asym/lib/motion-provider";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

import { onlineManager } from "../../../../packages/database/node_modules/@tanstack/react-query/build/modern/index.js";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";
import { DashboardHome } from "../../../../packages/missionary/components/dashboard-home";

// The portal snapshot and follow-request count load through their real
// query hooks; only the signed-in user and the giving totals are fixtures.
vi.mock("@asym/lib/hooks", async () => {
  const { useLocaleFormat } =
    await import("../../../../packages/lib/hooks/use-locale-format");
  const metric = { total: 0, change: null, trend: "neutral", data: [] };
  return {
    useAuth: () => ({ profile: { id: "auth-fixture" }, loading: false }),
    useDonationMetrics: () => ({
      currency: "USD",
      thisMonth: metric,
      lastMonth: metric,
      yearToDate: metric,
      monthlyBreakdown: [],
      gifts: [],
      isLoading: false,
      error: null,
      retry: () => {},
    }),
    useLocaleFormat,
  };
});
vi.mock("@asym/env", () => ({
  clientEnv: { NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: false },
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }),
  });
  class NoopResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", {
    configurable: true,
    value: NoopResizeObserver,
  });
});

/**
 * The device's connection, set on TanStack Query's online manager itself, so
 * it holds even before a mounted provider listens for the browser's events.
 */
function setOnline(online: boolean) {
  act(() => {
    onlineManager.setOnline(online);
  });
}

afterEach(() => {
  cleanup();
  setOnline(true);
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

const snapshot = {
  profile: { id: "m1", displayName: "Jordan Hale", avatarUrl: null },
  support: null,
  donorRelationships: [],
  recentGifts: [],
  tasks: [],
  ministryUpdates: [],
};

/** Answers the home page's requests; the portal fails while `failing`. */
function serve(state: { failing: boolean }) {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.startsWith("/api/missionary/portal")) {
      return state.failing
        ? new Response(JSON.stringify({ error: "Fixture failure" }), {
            status: 500,
          })
        : new Response(JSON.stringify({ portal: snapshot }), { status: 200 });
    }
    return new Response(JSON.stringify({ requests: [] }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const home = () => (
  <QueryProvider>
    <MotionProvider>
      <DashboardHome missionaryId="explicit-fixture" />
    </MotionProvider>
  </QueryProvider>
);

/** Long enough for a load that could run to answer. */
const settle = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 50)));

it("shows the loading view, not an empty home, while the first load waits offline", async () => {
  setOnline(false);
  const fetchMock = serve({ failing: false });
  render(home());
  await settle();

  // Waiting for the connection, not running and not failed.
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Loading your home page")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.queryByRole("region", { name: "Monthly support" })).toBeNull();
  expect(
    screen.queryByText("No partners have committed monthly support yet."),
  ).toBeNull();

  setOnline(true);
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome back, Jordan" }),
    ).toBeTruthy(),
  );
  expect(screen.queryByLabelText("Loading your home page")).toBeNull();
});

it("keeps Try again busy while the retry waits offline, then lands on the page heading", async () => {
  getQueryClient().setQueryDefaults(["missionary", "portal"], { retry: false });
  const state = { failing: true };
  serve(state);
  render(home());
  const button = await screen.findByRole("button", { name: "Try again" });

  setOnline(false);
  state.failing = false;
  button.focus();
  fireEvent.click(button);
  await settle();

  // The retry has not answered, so the error view and its button stay.
  expect(button.isConnected).toBe(true);
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.textContent).toBe("Trying again…");
  expect(screen.queryByRole("region", { name: "Monthly support" })).toBeNull();

  setOnline(true);
  // The retry moves focus to the heading as it ends; the error view and its
  // Try again leave in the render after that. Wait for both.
  await waitFor(() => {
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 1, name: "Welcome back, Jordan" }),
    );
    expect(button.isConnected).toBe(false);
  });
});
