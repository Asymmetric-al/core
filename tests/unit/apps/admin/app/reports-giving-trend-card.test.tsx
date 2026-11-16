// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Exercise the Reports trend at its boundary.
import { RefreshableGivingTrendCard } from "../../../../../apps/admin/app/(app)/reports/giving-trend-refresh";

import type { GivingTrend } from "@asym/api/reads/dashboard-stats";

const loaded: GivingTrend = {
  periodStart: "2025-11-01T00:00:00.000Z",
  asOf: "2026-11-11T12:00:00.000Z",
  currency: "USD",
  currencies: ["USD"],
  months: Array.from({ length: 13 }, (_, index) => ({
    month: new Date(Date.UTC(2025, 10 + index, 1)).toISOString().slice(0, 7),
    soFar: index === 12,
    giftCount: 1,
    netCents: 2500,
  })),
};

afterEach(() => {
  cleanup();
  refresh.mockClear();
});

describe("Reports net giving by month", () => {
  it("states a failed trend once in a compact notice with Try again, not a tall empty chart", () => {
    render(<RefreshableGivingTrendCard trend={null} />);
    const region = screen.getByRole("region", { name: "Net giving by month" });
    expect(region.textContent).toContain("Net giving by month couldn't load");
    expect(region.querySelector('[data-slot="alert"]')).not.toBeNull();
    // The chart card's error state was ~340px between the charts and funds.
    expect(region.querySelector('[data-slot="card"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("says its period is fixed, whatever the page's grouping and period", () => {
    render(<RefreshableGivingTrendCard trend={loaded} />);
    const region = screen.getByRole("region", { name: "Net giving by month" });
    expect(region.textContent).toContain(
      "Period: November 2025 to November 11, 2026 (UTC).",
    );
    expect(region.textContent).toContain(
      "The grouping and period above don't change it.",
    );
  });

  it("states that applied amount and currency corrections are included", () => {
    render(<RefreshableGivingTrendCard trend={loaded} />);
    const region = screen.getByRole("region", { name: "Net giving by month" });
    expect(region.textContent).toContain("Settled gifts, after refunds.");
    expect(region.textContent).toContain(
      "Applied amount and currency corrections are included.",
    );
    expect(region.textContent).not.toContain("corrections are not applied");
    expect(region.textContent).not.toContain("net of refunds");
  });
});
