/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { MotionProvider } from "@asym/lib/motion";

import { DashboardHome } from "../../../packages/missionary/components/dashboard-home";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  auth: vi.fn(),
  metrics: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: mocks.query,
}));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: mocks.auth,
  useDonationMetrics: mocks.metrics,
}));
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
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const snapshot = {
  support: {
    goalCents: 500000,
    raisedCents: 200000,
    percentFunded: 40,
    activeDonorCount: 3,
    giftCount: 7,
  },
  tasks: [
    {
      id: "1",
      title: "Call partner",
      status: "not_started",
      priority: "high",
      due_date: null,
    },
    {
      id: "2",
      title: "Completed task",
      status: "completed",
      priority: "low",
      due_date: null,
    },
  ],
  ministryUpdates: [
    { id: "1", excerpt: "An actual fixture update", createdAt: null },
  ],
};
function setup(overrides: Record<string, unknown> = {}) {
  mocks.query.mockReturnValue({
    data: snapshot,
    isLoading: false,
    error: null,
    refetch: mocks.refetch,
    ...overrides,
  });
  mocks.auth.mockReturnValue({
    profile: { id: "auth-fixture" },
    loading: false,
  });
  const metric = { total: 0, change: 0, trend: "neutral", data: [] };
  mocks.metrics.mockReturnValue({
    thisMonth: metric,
    lastMonth: metric,
    yearToDate: metric,
    monthlyBreakdown: [],
    isLoading: true,
    error: null,
  });
}
function show(
  props: React.ComponentProps<typeof DashboardHome> = {
    missionaryId: "explicit-fixture",
  },
) {
  return render(
    <MotionProvider>
      <DashboardHome
        {...props}
        belowHeaderSlot={<p>Inserted dashboard content</p>}
      />
    </MotionProvider>,
  );
}
describe("missionary dashboard composition", () => {
  it("retains snapshot amounts and excludes completed tasks", () => {
    setup();
    show();
    expect(screen.getByText("$2k", { exact: true })).toBeTruthy();
    expect(screen.getByText("/ $5k", { exact: true })).toBeTruthy();
    expect(screen.getByText("40% Funded", { exact: true })).toBeTruthy();
    expect(screen.getByText("1 Pending", { exact: true })).toBeTruthy();
    expect(screen.getByText("Call partner", { exact: true })).toBeTruthy();
    expect(screen.queryByText("Completed task", { exact: true })).toBeNull();
    expect(
      screen.getByText("An actual fixture update", { exact: true }),
    ).toBeTruthy();
    expect(mocks.auth).not.toHaveBeenCalled();
    expect(mocks.metrics).toHaveBeenCalledWith("explicit-fixture");
  });
  it("retains the injected slot and retry callback in the error state", () => {
    setup({ error: new Error("Local fixture failure"), data: undefined });
    show();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Inserted dashboard content")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Try again", exact: true }),
    );
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
  it("uses the authenticated identity when no explicit id is provided", () => {
    setup();
    show({});
    expect(mocks.auth).toHaveBeenCalledOnce();
    expect(mocks.metrics).toHaveBeenCalledWith("auth-fixture");
  });
  it("names the update icon action and retains navigation callbacks", () => {
    setup();
    const navigate = vi.fn();
    show({ missionaryId: "explicit-fixture", setActiveTab: navigate });
    fireEvent.click(
      screen.getByRole("button", {
        name: "View ministry updates",
        exact: true,
      }),
    );
    expect(navigate).toHaveBeenLastCalledWith("feed");
    fireEvent.click(
      screen.getByRole("button", { name: "Analytics", exact: true }),
    );
    expect(navigate).toHaveBeenLastCalledWith("analytics");
    fireEvent.click(
      screen.getByRole("button", { name: "Compose New Update", exact: true }),
    );
    expect(navigate).toHaveBeenLastCalledWith("feed");
  });
  it("announces overfunding without exceeding the progress range", () => {
    setup({
      data: {
        ...snapshot,
        support: {
          ...snapshot.support,
          raisedCents: 750000,
          percentFunded: 150,
        },
      },
    });
    show();
    expect(screen.getByText("150% Funded", { exact: true })).toBeTruthy();
    expect(screen.getByText("$0 remaining", { exact: true })).toBeTruthy();
    const bar = screen.getByRole("progressbar", {
      name: "Support funded",
      exact: true,
    });
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
    expect(bar.getAttribute("aria-valuetext")).toBe("150% funded");
  });
  it("bounds negative progress announcements without rewriting support values", () => {
    setup({
      data: {
        ...snapshot,
        support: {
          ...snapshot.support,
          raisedCents: -125000,
          percentFunded: -25,
        },
      },
    });
    show();
    expect(screen.getByText("-25% Funded", { exact: true })).toBeTruthy();
    const bar = screen.getByRole("progressbar", {
      name: "Support funded",
      exact: true,
    });
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    expect(bar.getAttribute("aria-valuetext")).toBe("-25% funded");
  });
  it("names the busy loading group while retaining the inserted content", () => {
    setup({ isLoading: true, data: undefined });
    show();
    expect(
      screen
        .getByRole("group", { name: "Loading dashboard", exact: true })
        .getAttribute("aria-busy"),
    ).toBe("true");
    expect(screen.getByText("Inserted dashboard content")).toBeTruthy();
  });
});
