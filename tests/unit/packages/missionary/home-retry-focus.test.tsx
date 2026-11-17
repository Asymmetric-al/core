/** @vitest-environment jsdom */
import { MotionProvider } from "@asym/lib/motion-provider";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { DashboardHome } from "../../../../packages/missionary/components/dashboard-home";
import { SupportCard } from "../../../../packages/missionary/components/home/home-cards";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  metrics: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: mocks.query,
  usePendingFollowRequestCount: () => ({ data: 0 }),
}));
vi.mock("@asym/lib/hooks", async () => {
  const { useLocaleFormat } =
    await import("../../../../packages/lib/hooks/use-locale-format");
  return {
    useAuth: () => ({ profile: { id: "auth-fixture" }, loading: false }),
    useDonationMetrics: mocks.metrics,
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
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const snapshot = {
  profile: { id: "m1", displayName: "Jordan Hale", avatarUrl: null },
  support: null,
  donorRelationships: [],
  recentGifts: [],
  tasks: [],
  ministryUpdates: [],
};

const metric = { total: 0, change: null, trend: "neutral", data: [] };

function portal(state: Record<string, unknown>) {
  mocks.query.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: mocks.refetch,
    ...state,
  });
  mocks.metrics.mockReturnValue({
    currency: "USD",
    thisMonth: metric,
    lastMonth: metric,
    yearToDate: metric,
    monthlyBreakdown: [],
    isLoading: false,
    error: null,
    retry: vi.fn(),
  });
}

// A new element each time, so a rerender reads the hook mocks again.
const home = () => (
  <MotionProvider>
    <DashboardHome missionaryId="explicit-fixture" />
  </MotionProvider>
);

/** Focuses Try again and presses it, as a keyboard user would. */
function pressTryAgain() {
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  return button;
}

describe("home page Try again", () => {
  it("keeps focus on the button while retrying, then lands on the page heading", () => {
    portal({ error: new Error("Local fixture failure") });
    const view = render(home());
    const button = pressTryAgain();
    expect(mocks.refetch).toHaveBeenCalledOnce();

    portal({ isLoading: true });
    view.rerender(home());
    expect(button.isConnected).toBe(true);
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.textContent).toBe("Trying again…");
    expect(screen.queryByLabelText("Loading your home page")).toBeNull();

    portal({ data: snapshot });
    view.rerender(home());
    expect(button.isConnected).toBe(false);
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 1, name: "Welcome back, Jordan" }),
    );
  });

  it("leaves focus on the button and announces again when the retry fails again", () => {
    portal({ error: new Error("Local fixture failure") });
    const view = render(home());
    const firstAlert = screen.getByRole("alert");
    const button = pressTryAgain();
    portal({ isLoading: true });
    view.rerender(home());
    portal({ error: new Error("Still failing") });
    view.rerender(home());
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    expect(button.textContent).toBe("Try again");
    // A new alert node, so the unchanged message is read out again.
    expect(screen.getByRole("alert")).not.toBe(firstAlert);
  });
});

describe("giving totals Try again", () => {
  function card(props: { failed: boolean; loading: boolean }) {
    return (
      <SupportCard
        committedCents={10000}
        committedCurrency="USD"
        goalCents={20000}
        goalCurrency="USD"
        metricsCurrency="USD"
        thisMonthCents={500}
        lastMonthCents={600}
        yearCents={700}
        monthlyPartners={2}
        metricsLoading={props.loading}
        metricsFailed={props.failed}
        onRetryMetrics={mocks.refetch}
      />
    );
  }

  it("keeps focus on the button while retrying, then lands on the card heading", () => {
    const view = render(card({ failed: true, loading: false }));
    const button = pressTryAgain();
    expect(mocks.refetch).toHaveBeenCalledOnce();

    view.rerender(card({ failed: false, loading: true }));
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).toBe("true");

    view.rerender(card({ failed: false, loading: false }));
    const region = screen.getByRole("region", { name: "Monthly support" });
    expect(within(region).getByText("This month so far")).toBeTruthy();
    expect(document.activeElement).toBe(
      within(region).getByRole("heading", { name: "Monthly support" }),
    );
  });

  it("leaves focus on the button and announces again when the totals still can't load", () => {
    const view = render(card({ failed: true, loading: false }));
    const firstAlert = screen.getByRole("alert");
    const button = pressTryAgain();
    view.rerender(card({ failed: false, loading: true }));
    view.rerender(card({ failed: true, loading: false }));
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    expect(screen.getByRole("alert")).not.toBe(firstAlert);
  });
});
