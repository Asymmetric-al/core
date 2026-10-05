/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931 This integration test mounts the real page; no app imports another app.
import AnalyticsPage from "../../../apps/missionary/app/analytics/page-client";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), metrics: vi.fn() }));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: mocks.auth,
  useDonationMetrics: mocks.metrics,
}));
vi.mock("@asym/env", () => ({
  clientEnv: { NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: false },
}));
// Chart layout belongs in browser tests; keep the real page and shared cards.
vi.mock("next/dynamic", () => ({ default: () => () => null }));

beforeEach(() => {
  mocks.auth.mockReturnValue({
    profile: { id: "missionary-fixture" },
    loading: false,
  });
  mocks.metrics.mockReturnValue({
    monthlyBreakdown: [],
    isLoading: false,
    error: null,
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("missionary analytics availability", () => {
  it("does not offer download or insights actions without an implementation", () => {
    render(<AnalyticsPage />);
    expect(
      screen.getByRole("heading", { name: "Analytics", exact: true }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Download", exact: true }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Insights", exact: true }),
    ).toBeNull();
    expect(mocks.metrics).toHaveBeenCalledWith("missionary-fixture");
  });

  it("shows unavailable headline metrics instead of fabricated values and comparisons", () => {
    render(<AnalyticsPage />);
    for (const label of [
      "Monthly Support",
      "Active Partners",
      "Retention Rate",
      "Avg. Gift Size",
    ]) {
      expect(screen.getByText(label, { exact: true })).toBeTruthy();
    }
    expect(
      screen.getAllByRole("heading", { name: "Unavailable", exact: true }),
    ).toHaveLength(4);
    for (const value of [
      "$4,250",
      "of $5,000 goal",
      "42",
      "94.2%",
      "$101",
      "+3 this month",
      "vs last month",
      "vs last year",
    ]) {
      expect(screen.queryByText(value, { exact: true })).toBeNull();
    }
  });

  it.each([
    { state: "loading", isLoading: true, error: null },
    {
      state: "error",
      isLoading: false,
      error: new Error("Donation metrics are unavailable."),
    },
    { state: "empty", isLoading: false, error: null },
  ])(
    "retains the real giving-trend $state state without claiming headline values",
    ({ state, isLoading, error }) => {
      mocks.metrics.mockReturnValue({ monthlyBreakdown: [], isLoading, error });
      render(<AnalyticsPage />);
      expect(
        screen.getAllByRole("heading", { name: "Unavailable", exact: true }),
      ).toHaveLength(4);
      expect(screen.queryByText("$4,250", { exact: true })).toBeNull();
      if (state === "loading") {
        expect(
          screen.getByText("Loading Giving Trends", { exact: true }),
        ).toBeTruthy();
        expect(screen.queryByRole("alert")).toBeNull();
      } else if (state === "error") {
        expect(screen.getByRole("alert").textContent).toContain(
          "We couldn't load your giving trends.",
        );
      } else {
        expect(
          screen.getByText(
            "No giving activity yet. Recurring and one-time gifts will appear here.",
            { exact: true },
          ),
        ).toBeTruthy();
      }
      if (state !== "empty") {
        expect(
          screen.queryByText(
            "No giving activity yet. Recurring and one-time gifts will appear here.",
            { exact: true },
          ),
        ).toBeNull();
      }
    },
  );

  it("keeps the existing unauthenticated loading identity boundary", () => {
    mocks.auth.mockReturnValue({ profile: null, loading: true });
    render(<AnalyticsPage />);
    expect(mocks.metrics).toHaveBeenCalledWith("");
    expect(
      screen.getByText("Loading Giving Trends", { exact: true }),
    ).toBeTruthy();
    expect(
      screen.queryByText(
        "No giving activity yet. Recurring and one-time gifts will appear here.",
        { exact: true },
      ),
    ).toBeNull();
  });
});
