// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { StatsStrip } from "../../../../../../../apps/admin/features/support-hub/components/stats/StatsStrip";
const state = vi.hoisted(() => ({ loading: true, error: false }));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-stats",
  () => ({
    useSupportInboxStats: () => ({
      isLoading: state.loading,
      isError: state.error,
      data: { buckets: [], pastDueCount: 0, averageFirstResponseMinutes: 0 },
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversations",
  () => ({
    useSupportConversations: () => ({
      data: [],
      isLoading: state.loading,
      isError: state.error,
    }),
  }),
);
afterEach(cleanup);
it("delegates loading and unavailable figures to shared MetricCard state", () => {
  const { rerender, container } = render(<StatsStrip />);
  expect(
    [...container.querySelectorAll('[data-slot="metric-card"]')].every(
      (card) => card.getAttribute("data-state") === "loading",
    ),
  ).toBe(true);
  state.loading = false;
  state.error = true;
  rerender(<StatsStrip />);
  expect(screen.getAllByText("Couldn't load the inbox totals.")).toHaveLength(
    4,
  );
  expect(
    [...container.querySelectorAll('[data-slot="metric-card"]')].every(
      (card) => card.getAttribute("data-state") === "unavailable",
    ),
  ).toBe(true);
  state.error = false;
  rerender(<StatsStrip />);
  expect(screen.getByText("Awaiting first reply")).toBeTruthy();
  expect(
    [...container.querySelectorAll('[data-slot="metric-card"]')].every(
      (card) => card.getAttribute("data-state") === "ready",
    ),
  ).toBe(true);
});
