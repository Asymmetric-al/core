// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the agents report's public UI boundary.
import { AgentsReport } from "../../../../../../../apps/admin/features/support-hub/components/reports/surfaces/AgentsReport";

const series = {
  slice: "agent-mix",
  generatedAt: "2026-11-09T12:00:00.000Z",
  unit: "count",
  total: 9,
  buckets: [
    { key: "unassigned", label: "Unassigned", value: 4, secondaryValue: null },
    { key: "agent-1", label: "Dana Reyes", value: 3, secondaryValue: null },
    { key: "agent-2", label: "Alex Moore", value: 2, secondaryValue: null },
  ],
  request: {},
};

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-reports",
  () => ({ useSupportReport: () => ({ data: series }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/report-state",
  () => ({ useSupportReportRouteState: () => ({ request: () => ({}) }) }),
);
const filterProps = vi.hoisted(() => ({
  last: null as Record<string, unknown> | null,
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportFilters",
  () => ({
    ReportFilters: (props: Record<string, unknown>) => {
      filterProps.last = props;
      return null;
    },
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportExportMenu",
  () => ({ ReportExportMenu: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportBarChart",
  () => ({
    ReportBarChart: ({
      series: chartSeries,
    }: {
      series: { buckets: Array<{ label: string }> };
    }) => (
      <ul aria-label="Chart bars">
        {chartSeries.buckets.map((bucket) => (
          <li key={bucket.label}>{bucket.label}</li>
        ))}
      </ul>
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

describe("Agents report", () => {
  it("offers only the filters the agent mix applies: no Group by, no Business hours", () => {
    // The agent mix counts conversations in the window per agent: it has no
    // periods to group and no message times to clip to business hours.
    render(<AgentsReport />);
    expect(filterProps.last).toMatchObject({
      hideScope: true,
      hideGroupBy: true,
      hideBusinessHours: true,
    });
  });

  it("ranks agents only, and counts unassigned conversations apart", () => {
    render(<AgentsReport />);
    const bars = screen.getByRole("list", { name: "Chart bars" });
    expect(within(bars).queryByText("Unassigned")).toBeNull();
    expect(within(bars).getByText("Dana Reyes")).toBeTruthy();
    const table = screen.getByRole("table");
    expect(within(table).queryByText("Unassigned")).toBeNull();
    expect(screen.getByText("4 conversations have no agent yet")).toBeTruthy();
  });

  it("states unassigned work in a callout, not as bare text between filters and chart", () => {
    render(<AgentsReport />);
    const note = screen.getByRole("status", {
      name: "Unassigned conversations",
    });
    expect(note.textContent).toContain("4 conversations have no agent yet");
    expect(note.textContent).toContain("Assign them from the inbox");
  });

  it("links the callout to the inbox's unassigned view, where they can be assigned", () => {
    render(<AgentsReport />);
    const note = screen.getByRole("status", {
      name: "Unassigned conversations",
    });
    const link = within(note).getByRole("link", {
      name: "Assign them from the inbox",
    });
    expect(link.getAttribute("href")).toBe("/support?view=unassigned");
  });
});
