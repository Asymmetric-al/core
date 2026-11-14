/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  loading: true,
  error: null as Error | null,
  currency: "USD" as string | null,
  total: 0,
  change: null as number | null,
}));
vi.mock("@asym/lib/hooks", () => ({
  useDonationMetrics: () => ({
    currency: state.currency,
    isLoading: state.loading,
    error: state.error,
    thisMonth: {
      total: state.total,
      change: state.change,
      trend: "up",
      data: [],
    },
    lastMonth: {
      total: state.total,
      change: state.change,
      trend: "up",
      data: [],
    },
    yearToDate: {
      total: state.total,
      change: state.change,
      trend: "up",
      data: [],
    },
  }),
}));

import { MetricTiles } from "../../../../packages/missionary/components/metric-tiles";

afterEach(() => {
  cleanup();
  state.loading = true;
  state.error = null;
  state.currency = "USD";
  state.total = 0;
  state.change = null;
});

it("announces metric loading and failures without presenting a failed request as zero giving", () => {
  const { rerender } = render(<MetricTiles missionaryId="fixture" />);
  expect(screen.getAllByRole("status").map((node) => node.textContent)).toEqual(
    ["Loading This Month", "Loading Last Month", "Loading Year to Date"],
  );
  state.loading = false;
  state.error = new Error("Offline");
  rerender(<MetricTiles missionaryId="fixture" />);
  expect(screen.getByRole("alert").textContent).toBe(
    "Unable to load donation metrics",
  );
});

it("shows no comparison instead of an invented percentage", async () => {
  vi.resetModules();
  vi.doMock("@asym/lib/hooks", () => ({
    useDonationMetrics: () => ({
      currency: "USD",
      isLoading: false,
      error: null,
      thisMonth: { total: 5000, change: null, trend: "neutral", data: [] },
      lastMonth: { total: 0, change: 0, trend: "neutral", data: [] },
      yearToDate: { total: 5000, change: 12.5, trend: "up", data: [] },
    }),
  }));
  const { MetricTiles: Tiles } =
    await import("../../../../packages/missionary/components/metric-tiles");
  render(<Tiles missionaryId="fixture" />);
  expect(screen.getAllByText("No prior-period comparison")).toHaveLength(1);
  expect(screen.queryByText("+100.0%")).toBeNull();
  expect(screen.getByText("+12.5%")).toBeTruthy();
  vi.doUnmock("@asym/lib/hooks");
});

it("keeps compact USD while exposing the exact original amount", () => {
  state.loading = false;
  state.total = 3000000;
  render(<MetricTiles missionaryId="fixture" />);
  const amounts = screen.getAllByRole("heading", { name: "$30,000.00" });
  expect(amounts).toHaveLength(3);
  for (const amount of amounts) {
    expect(amount.textContent).toBe("$30k");
    expect(amount.getAttribute("title")).toBe("$30,000.00");
  }
});

it.each([null, "XXX"])(
  "suppresses monetary changes for unknown currency %s",
  (currency) => {
    state.loading = false;
    state.currency = currency;
    state.total = 1000;
    state.change = 12.5;
    render(<MetricTiles missionaryId="fixture" />);
    expect(
      screen.getAllByRole("heading", { name: "Unavailable" }),
    ).toHaveLength(3);
    expect(screen.queryAllByText("+12.5%")).toHaveLength(0);
    expect(screen.getByText(/currencies are mixed or unknown/)).toBeTruthy();
  },
);
