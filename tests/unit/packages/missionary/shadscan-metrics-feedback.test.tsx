/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  loading: true,
  error: null as Error | null,
}));
vi.mock("@asym/lib/hooks", () => ({
  useDonationMetrics: () => ({
    isLoading: state.loading,
    error: state.error,
    thisMonth: { total: 0, change: 0, data: [] },
    lastMonth: { total: 0, change: 0, data: [] },
    yearToDate: { total: 0, change: 0, data: [] },
  }),
}));

import { MetricTiles } from "../../../../packages/missionary/components/metric-tiles";

afterEach(() => {
  cleanup();
  state.loading = true;
  state.error = null;
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
