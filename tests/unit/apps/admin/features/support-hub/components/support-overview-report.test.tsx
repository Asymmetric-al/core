// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the report surface's public UI boundary.
import { OverviewReport } from "../../../../../../../apps/admin/features/support-hub/components/reports/surfaces/OverviewReport";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test for the shared duration format.
import { formatSupportDuration } from "../../../../../../../apps/admin/features/support-hub/lib/format-duration";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the module's public boundary.
import type { SupportReportSeries } from "../../../../../../../apps/admin/features/support-hub/types";

function series(
  slice: SupportReportSeries["slice"],
  total: number,
  buckets: Array<[key: string, label: string, value: number]> = [],
  unit: SupportReportSeries["unit"] = "count",
): SupportReportSeries {
  return {
    slice,
    unit,
    total,
    generatedAt: "2026-11-09T00:00:00.000Z",
    buckets: buckets.map(([key, label, value]) => ({
      key,
      label,
      value,
      secondaryValue: null,
    })),
  };
}

const exportMenu = vi.hoisted(() => vi.fn(() => null));

const SERIES: Record<string, SupportReportSeries> = {
  volume: series("volume", 14, [
    ["2026-11-07", "Nov 7", 0],
    ["2026-11-08", "Nov 8", 14],
  ]),
  "open-count": series("open-count", 9, [
    ["open", "Open", 6],
    ["pending", "Pending", 3],
  ]),
  "first-response": series(
    "first-response",
    420,
    [["responded", "Responded count", 2]],
    "minutes",
  ),
  resolution: series(
    "resolution",
    2880,
    [["resolved", "Resolved count", 1]],
    "minutes",
  ),
  "customer-waiting": series(
    "customer-waiting",
    95,
    [
      ["conversations-waiting", "Conversations waiting", 3],
      ["average-wait", "Average wait (min)", 95],
      ["longest-wait", "Longest wait (min)", 300],
    ],
    "minutes",
  ),
};

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-reports",
  () => ({
    useSupportReport: (slice: string) => ({ data: SERIES[slice] }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/report-state",
  () => ({
    useSupportReportRouteState: () => ({
      request: (slice: string) => slice,
      state: { groupBy: "week" },
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportFilters",
  () => ({
    ReportFilters: ({ trailing }: { trailing: React.ReactNode }) => (
      <>{trailing}</>
    ),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportExportMenu",
  () => ({ ReportExportMenu: exportMenu }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportLineChart",
  () => ({ ReportLineChart: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportBarChart",
  () => ({
    ReportBarChart: ({
      series: chart,
      title,
      description,
    }: {
      series: SupportReportSeries;
      title: string;
      description?: string;
    }) => (
      <figure aria-label={title}>
        <figcaption>{description}</figcaption>
        {chart.buckets.map((bucket) => (
          <span key={bucket.key} data-value={bucket.value}>
            {bucket.label}
          </span>
        ))}
      </figure>
    ),
  }),
);

beforeEach(() => {
  // The report table sits on the shared data grid, which reads the
  // viewport and its own width.
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Support overview report", () => {
  it("exports all five raw series and names the waiting duration unit", () => {
    render(<OverviewReport />);
    expect(exportMenu).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          { label: "Conversations created", series: SERIES.volume },
          { label: "Open or pending", series: SERIES["open-count"] },
          { label: "First reply", series: SERIES["first-response"] },
          { label: "Resolution", series: SERIES.resolution },
          {
            label: "Customer waiting (minutes)",
            series: SERIES["customer-waiting"],
          },
        ],
      }),
      undefined,
    );
  });
  it("groups current figures apart from the range and names the timing samples", () => {
    render(<OverviewReport />);
    expect(screen.getByRole("heading", { name: "In this range" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Right now" })).toBeTruthy();
    expect(
      screen.getByText("Average of 2 conversations started in this range"),
    ).toBeTruthy();
    expect(
      screen.getByText("Average of 1 conversation started in this range"),
    ).toBeTruthy();
  });
  it("distinguishes no sample from a genuine zero-minute first reply", () => {
    const original = SERIES["first-response"]!;
    SERIES["first-response"] = {
      ...original,
      total: 0,
      buckets: [
        {
          key: "responded",
          label: "Responded count",
          value: 1,
          secondaryValue: null,
        },
      ],
    };
    const { rerender } = render(<OverviewReport />);
    expect(screen.getByText("<1 min")).toBeTruthy();
    SERIES["first-response"] = { ...original, total: 0, buckets: [] };
    rerender(<OverviewReport />);
    expect(screen.getByText("No replies in this range")).toBeTruthy();
    SERIES["first-response"] = original;
  });
  it("formats durations the same way as the inbox", () => {
    expect(formatSupportDuration(45)).toBe("45 min");
    expect(formatSupportDuration(420)).toBe("7 h");
    expect(formatSupportDuration(4320)).toBe("3 d");
    expect(formatSupportDuration(0)).toBe("—");
  });

  it("charts only wait times and states the waiting count in words", () => {
    render(<OverviewReport />);
    const chart = screen.getByRole("figure", { name: "Customer waiting" });
    expect(within(chart).queryByText(/Conversations waiting/)).toBeNull();
    expect(within(chart).getByText("Average wait")).toBeTruthy();
    expect(within(chart).getByText(/3 donors are waiting/)).toBeTruthy();
  });

  it("plots wait times in hours, like the table and cards beside it", () => {
    render(<OverviewReport />);
    const chart = screen.getByRole("figure", { name: "Customer waiting" });
    // 95 and 300 minutes plot as 1.6 and 5 hours, not a minutes axis.
    expect(
      within(chart).getByText("Average wait").getAttribute("data-value"),
    ).toBe("1.6");
    expect(
      within(chart).getByText("Longest wait").getAttribute("data-value"),
    ).toBe("5");
    expect(within(chart).getByText(/Wait times in hours/)).toBeTruthy();
  });

  it("gives the customer waiting chart a table of the same values with named columns", () => {
    render(<OverviewReport />);
    // The shared grid's region carries the caption; the table sits inside.
    const table = within(
      screen.getByRole("region", { name: "Customer waiting" }),
    ).getByRole("table");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual(["Measure", "Value"]);
    expect(within(table).getByText("5 h")).toBeTruthy();
    // Values are durations, so the "(min)" unit is not in the row names.
    expect(within(table).getByText("Average wait")).toBeTruthy();
    expect(within(table).queryByText(/\(min\)/)).toBeNull();
    expect(within(table).getByText("1.6 h")).toBeTruthy();
    expect(within(table).getByText("3")).toBeTruthy();
  });

  it("keeps the short Customer waiting table its own height beside a long period table", () => {
    render(<OverviewReport />);
    const waiting = screen.getByRole("region", { name: "Customer waiting" });
    const created = screen.getByRole("region", {
      name: "Conversations created",
    });
    // Both tables share one grid row, which aligns its cards to the top
    // instead of stretching the three-row card to a month of days.
    let grid: HTMLElement | null = waiting.parentElement;
    while (grid && !grid.contains(created)) grid = grid.parentElement;
    expect(grid!.className.split(" ")).toContain("items-start");
  });

  it("offers to hide periods with no activity in the selected grouping, keeping them by default", () => {
    render(<OverviewReport />);
    const created = screen.getByRole("region", {
      name: "Conversations created",
    });
    const toggle = within(created).getByRole("switch", {
      name: "Hide weeks with no activity",
    });
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(within(created).getByText("Nov 7")).toBeTruthy();
  });

  it("splits the active conversations into open and pending, as A's table did", () => {
    render(<OverviewReport />);
    const summary = screen.getByRole("region", {
      name: "Current support summary",
    });
    expect(within(summary).getByText("9")).toBeTruthy();
    expect(within(summary).getByText("6 open · 3 pending")).toBeTruthy();
  });

  it("shows summary durations in hours and days, not raw minutes", () => {
    render(<OverviewReport />);
    const summary = screen.getByRole("region", { name: "Support summary" });
    expect(within(summary).getByText("7 h")).toBeTruthy();
    expect(within(summary).getByText("2 d")).toBeTruthy();
    expect(within(summary).queryByText(/min$/)).toBeNull();
  });
});
