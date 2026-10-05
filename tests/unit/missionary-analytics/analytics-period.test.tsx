/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

// Expose chart input at the external Next dynamic/Recharts rendering boundary.
// The page, projection, Base UI Select and shared cards remain real.
vi.mock("next/dynamic", () => ({
  default: () =>
    function ChartBoundary({
      children,
      data,
    }: {
      children?: React.ReactNode;
      data?: {
        month: string;
        recurring: number;
        oneTime: number;
        total: number;
      }[];
    }) {
      if (!data) return <>{children}</>;
      return (
        <ol aria-label="Projected giving trend">
          {data.map((point) => (
            <li key={point.month}>
              {point.month}:{point.recurring}:{point.oneTime}:{point.total}
            </li>
          ))}
        </ol>
      );
    },
}));

beforeEach(() => {
  mocks.auth.mockReturnValue({
    profile: { id: "missionary-fixture" },
    loading: false,
  });
  mocks.metrics.mockReturnValue({
    monthlyBreakdown: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
    ].map((month, index) => ({
      month,
      recurring: (index + 1) * 100,
      oneTime: 100,
      offline: 90000,
      total: 99999,
    })),
    isLoading: false,
    error: null,
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("missionary analytics period selection", () => {
  it("projects twelve months through the real Select and returns to the default six-month window", async () => {
    render(<AnalyticsPage />);
    const period = screen.getByRole("combobox", {
      name: "Giving trend period",
    });
    const chart = () =>
      screen.getByRole("list", { name: "Projected giving trend" });
    expect(period.textContent).toContain("Last 6m");
    expect(within(chart()).getAllByRole("listitem")).toHaveLength(6);
    expect(within(chart()).getAllByRole("listitem")[0]?.textContent).toBe(
      "Aug:8:1:9",
    );

    fireEvent.click(period);
    const twelveMonths = await screen.findByRole("option", {
      name: "Last 12m",
    });
    fireEvent.pointerDown(twelveMonths, { pointerType: "mouse", button: 0 });
    fireEvent.click(twelveMonths);
    await waitFor(() => expect(period.textContent).toContain("Last 12m"));
    await waitFor(() => {
      expect(within(chart()).getAllByRole("listitem")).toHaveLength(12);
    });
    expect(period.textContent).toContain("Last 12m");
    expect(within(chart()).getAllByRole("listitem")[0]?.textContent).toBe(
      "Feb:2:1:3",
    );
    expect(within(chart()).getAllByRole("listitem")[11]?.textContent).toBe(
      "Jan:13:1:14",
    );

    fireEvent.click(period);
    const sixMonths = await screen.findByRole("option", { name: "Last 6m" });
    fireEvent.pointerDown(sixMonths, { pointerType: "mouse", button: 0 });
    fireEvent.click(sixMonths);
    await waitFor(() => {
      expect(within(chart()).getAllByRole("listitem")).toHaveLength(6);
    });
    expect(period.textContent).toContain("Last 6m");
    expect(within(chart()).getAllByRole("listitem")[0]?.textContent).toBe(
      "Aug:8:1:9",
    );
  });

  it("offers only the supported six- and twelve-month periods", async () => {
    render(<AnalyticsPage />);
    fireEvent.click(
      screen.getByRole("combobox", { name: "Giving trend period" }),
    );
    const options = within(await screen.findByRole("listbox"));
    expect(options.queryByRole("option", { name: "All Time" })).toBeNull();
    expect(
      options.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Last 6m", "Last 12m"]);
  });
});
