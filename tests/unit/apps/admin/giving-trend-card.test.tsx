// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Exercise the shared Home and Reports chart at its public UI boundary.
import { GivingTrendCard } from "../../../../apps/admin/features/mission-control/components/giving-trend-card";

import type {
  GivingTrend,
  GivingTrendMonth,
} from "@asym/api/reads/dashboard-stats";

const chart = vi.hoisted(() => ({ render: vi.fn() }));
vi.mock("next/dynamic", () => ({
  default: () => (props: unknown) => {
    chart.render(props);
    return null;
  },
}));

afterEach(cleanup);

const MONTHS = [
  "2025-11",
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
  "2026-11",
];

function trend(overrides: Partial<GivingTrend> = {}): GivingTrend {
  const months: GivingTrendMonth[] = MONTHS.map((month, index) => ({
    month,
    soFar: index === MONTHS.length - 1,
    giftCount: index === 3 ? 2 : index === 12 ? 1 : 0,
    netCents: index === 3 ? 650050 : index === 12 ? 1200 : 0,
  }));
  return {
    periodStart: "2025-11-01T00:00:00.000Z",
    asOf: "2026-11-11T12:00:00.000Z",
    currency: "USD",
    currencies: ["USD"],
    months,
    ...overrides,
  };
}

describe("GivingTrendCard", () => {
  it("states the period and reads out every month's exact net giving", () => {
    render(<GivingTrendCard trend={trend()} />);

    const region = screen.getByRole("region", { name: "Net giving by month" });
    expect(region.textContent).toContain(
      "Period: November 2025 to November 11, 2026 (UTC)",
    );
    const figure = screen.getByRole("figure", { name: "Net giving by month" });
    const summary = figure.querySelector("figcaption")!.textContent!;
    expect(summary).toContain("February 2026: $6,500.50 from 2 gifts");
    expect(summary).toContain("March 2026: $0.00 from 0 gifts");
    expect(summary).toContain("November 2026 so far: $12.00 from 1 gift");
    // The partial month is called out where everyone can see it.
    expect(region.textContent).toContain(
      "November 2026 is so far, through November 11 (UTC), not a full month.",
    );
  });

  it("formats amounts in the trend's own currency", () => {
    render(
      <GivingTrendCard
        trend={trend({ currency: "CAD", currencies: ["CAD"] })}
      />,
    );
    const summary = screen
      .getByRole("figure", { name: "Net giving by month" })
      .querySelector("figcaption")!.textContent!;
    expect(summary).toContain("CA$6,500.50");
  });

  it.each([
    ["JPY", 10000, "¥10,000", 10000],
    ["KWD", 1230, "KWD\u00a01.230", 1.23],
  ])(
    "preserves %s minor-unit precision in exact labels",
    (currency, minorUnits, expected, majorUnits) => {
      const values = trend({ currency, currencies: [currency] });
      values.months = values.months.map((month) => ({
        ...month,
        netCents: minorUnits,
      }));
      render(<GivingTrendCard trend={values} />);
      const summary = screen
        .getByRole("figure", { name: "Net giving by month" })
        .querySelector("figcaption")!.textContent!;
      expect(summary).toContain(`February 2026: ${expected} from 2 gifts`);
      expect(chart.render).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ net: majorUnits, exact: expected }),
          ]),
        }),
      );
    },
  );

  it("says when currencies are mixed instead of charting a sum", () => {
    const mixed = trend({ currency: null, currencies: ["CAD", "USD"] });
    mixed.months = mixed.months.map((month) => ({ ...month, netCents: null }));
    render(<GivingTrendCard trend={mixed} />);

    expect(screen.queryByRole("figure")).toBeNull();
    expect(
      screen.getByText(
        "Gifts in this period are in more than one currency (CAD and USD), so monthly totals can't be added together.",
      ),
    ).toBeTruthy();
  });

  it("names a gift without a currency rather than guessing one", () => {
    const unknown = trend({ currency: null, currencies: ["USD", "unknown"] });
    unknown.months = unknown.months.map((month) => ({
      ...month,
      netCents: null,
    }));
    render(<GivingTrendCard trend={unknown} />);
    expect(
      screen.getByText(
        "Some gifts in this period have no currency recorded, so monthly totals can't be added together.",
      ),
    ).toBeTruthy();
  });

  it("is honest when nothing settled in the period", () => {
    const empty = trend({ currency: null, currencies: [] });
    empty.months = empty.months.map((month) => ({
      ...month,
      giftCount: 0,
      netCents: 0,
    }));
    render(<GivingTrendCard trend={empty} />);
    expect(
      screen.getByText(
        "No settled gifts from November 2025 to November 11, 2026.",
      ),
    ).toBeTruthy();
  });

  it("shows a loading state without figures", () => {
    render(<GivingTrendCard isLoading />);
    expect(screen.getByRole("status").textContent).toContain(
      "Loading Net giving by month",
    );
    expect(screen.queryByText(/\$/)).toBeNull();
  });

  it("reports a failed load, never an empty chart, and retries", () => {
    const onRetry = vi.fn();
    render(<GivingTrendCard trend={null} onRetry={onRetry} />);

    expect(screen.getByRole("alert").textContent).toContain(
      "Net giving by month couldn't load",
    );
    expect(screen.queryByText(/No settled gifts/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
