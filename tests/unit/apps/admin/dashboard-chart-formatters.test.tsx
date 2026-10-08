import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1965: Exercises the refactored app-owned chart views against the upgraded Recharts tooltip boundary.
import { RevenueChartView } from "../../../../apps/admin/components/dashboard/charts/revenue-chart-view";
// eslint-disable-next-line no-restricted-imports -- AL-1965: Exercises the refactored app-owned chart views against the upgraded Recharts tooltip boundary.
import { WeeklyChartView } from "../../../../apps/admin/components/dashboard/charts/weekly-chart-view";
// eslint-disable-next-line no-restricted-imports -- AL-1965: Exercises both extracted Mission Control charts at their tooltip boundary.
import {
  MinistryHealthMixChart,
  MinistryHealthTrendChart,
} from "../../../../apps/admin/features/mission-control/components/tiles/mission-control-chart-views";

import type { ReactNode } from "react";

const boundary = vi.hoisted(() => ({
  formatters: [] as Array<
    (value: number | undefined, name?: string) => unknown
  >,
}));

vi.mock("@asym/lib/motion", () => ({ useReducedMotion: () => true }));
// Recharts owns tooltip invocation. Capture only that boundary and bypass chart
// measurement so missing values can be checked deterministically without a DOM.
vi.mock("../../../../apps/admin/node_modules/recharts", () => {
  const children = ({ children }: { children?: ReactNode }) => children;
  return {
    Area: () => null,
    AreaChart: children,
    Bar: () => null,
    BarChart: children,
    CartesianGrid: () => null,
    Line: () => null,
    LineChart: children,
    ResponsiveContainer: children,
    Tooltip: ({
      formatter,
    }: {
      formatter: (value: number | undefined, name?: string) => unknown;
    }) => {
      boundary.formatters.push(formatter);
      return null;
    },
    XAxis: () => null,
    YAxis: () => null,
  };
});

beforeEach(() => {
  boundary.formatters.length = 0;
});

describe("extracted dashboard chart tooltip contracts", () => {
  it.each([
    ["Revenue", <RevenueChartView key="revenue" data={[]} />, "Revenue"],
    ["Donations", <WeeklyChartView key="weekly" data={[]} />, "Donations"],
  ])("formats %s amounts and omits a missing value", (_name, chart, label) => {
    renderToStaticMarkup(chart);
    expect(boundary.formatters).toHaveLength(1);
    const formatter = boundary.formatters[0]!;
    expect(formatter(0)).toEqual(["$0", label]);
    expect(formatter(1250)).toEqual(["$1,250", label]);
    expect(formatter(undefined)).toBeNull();
  });

  it.each([
    ["trend", <MinistryHealthTrendChart key="trend" />],
    ["mix", <MinistryHealthMixChart key="mix" />],
  ])(
    "formats %s percentages and permits an absent series name",
    (_name, chart) => {
      renderToStaticMarkup(chart);
      expect(boundary.formatters).toHaveLength(1);
      const formatter = boundary.formatters[0]!;
      expect(formatter(0, "Giving")).toEqual(["0%", "Giving"]);
      expect(formatter(83)).toEqual(["83%", ""]);
      expect(formatter(undefined, "Giving")).toBeNull();
    },
  );
});
