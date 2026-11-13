// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import type { ComponentProps } from "react";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Chart state regression.
import { ReportLineChart } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportLineChart";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Chart state regression.
import { ReportBarChart } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportBarChart";
const series = {
  slice: "volume",
  generatedAt: "2026-11-11T00:00:00.000Z",
  unit: "count",
  total: 0,
  buckets: [{ key: "day", label: "Day", value: 0, secondaryValue: null }],
} satisfies ComponentProps<typeof ReportLineChart>["series"];
afterEach(cleanup);
it.each([ReportLineChart, ReportBarChart])(
  "does not call a zero-filled ready series activity in %s",
  (Chart) => {
    render(<Chart title="Activity" series={series} />);
    expect(screen.getByText("No activity in this range")).toBeTruthy();
  },
);
it.each([ReportLineChart, ReportBarChart])(
  "gives %s a named figure, data summary and visible caveat",
  (Chart) => {
    render(
      <Chart
        title="Conversations created"
        series={{
          ...series,
          total: 3,
          buckets: [{ ...series.buckets[0]!, value: 3 }],
        }}
        note="Counts conversations created in this range."
      />,
    );
    expect(
      screen.getByRole("figure", { name: "Conversations created" }),
    ).toBeTruthy();
    expect(screen.getByText("Day: 3 conversations created.")).toBeTruthy();
    expect(
      screen.getByText("Counts conversations created in this range."),
    ).toBeTruthy();
  },
);
it.each([ReportLineChart, ReportBarChart])(
  "does not offer a retry without a handler in %s",
  (Chart) => {
    render(<Chart title="Activity" series={series} isError />);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  },
);
it.each([ReportLineChart, ReportBarChart])(
  "retries %s rather than displaying zero data on error",
  (Chart) => {
    const retry = vi.fn();
    render(<Chart title="Activity" series={series} isError onRetry={retry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.queryByText("No activity in this range")).toBeNull();
  },
);
