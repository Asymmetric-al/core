// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the report table's public UI boundary.
import { ReportTable } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportTable";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the module's public boundary.
import type { SupportReportSeries } from "../../../../../../../apps/admin/features/support-hub/types";

const series: SupportReportSeries = {
  slice: "agent-mix",
  generatedAt: "2026-11-09T12:00:00.000Z",
  unit: "count",
  total: 3500,
  buckets: [
    { key: "agent-1", label: "Dana Reyes", value: 300, secondaryValue: null },
    { key: "agent-2", label: "Alex Moore", value: 3200, secondaryValue: null },
  ],
};

const media = vi.hoisted(() => ({ phone: false }));

beforeEach(() => {
  media.phone = false;
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: media.phone && query === "(max-width: 639px)",
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

function bodyRowLabels(table: HTMLElement) {
  return Array.from(table.querySelectorAll("tbody tr")).map(
    (row) => row.querySelector("td")?.textContent ?? "",
  );
}

describe("Support report table", () => {
  it("lists every period of a long range, not the first page of ten", () => {
    // A 31-day range: the table is the chart's accessible equivalent, so
    // every day has a row (round 9 showed only the first ten, no pager).
    const days: SupportReportSeries = {
      ...series,
      slice: "volume",
      buckets: Array.from({ length: 31 }, (_, index) => ({
        key: `day-${index + 1}`,
        label: `Day ${index + 1}`,
        value: index,
        secondaryValue: null,
      })),
    };
    render(
      <ReportTable
        series={days}
        caption="Conversations created"
        columns={["Day", "Conversations"]}
      />,
    );
    const table = within(
      screen.getByRole("region", { name: "Conversations created" }),
    ).getByRole("table");
    const labels = bodyRowLabels(table);
    expect(labels).toHaveLength(31);
    expect(labels.at(-1)).toBe("Day 31");
  });

  it("sits on Core's shared data grid, named by its caption", () => {
    render(
      <ReportTable
        series={series}
        caption="Conversations per agent"
        columns={["Agent", "Conversations"]}
      />,
    );
    const region = screen.getByRole("region", {
      name: "Conversations per agent",
    });
    expect(region.getAttribute("data-slot")).toBe("data-grid-panel");
    const table = within(region).getByRole("table");
    expect(
      within(table).getByRole("columnheader", { name: /Agent/ }),
    ).toBeTruthy();
    expect(
      within(table).getByRole("columnheader", { name: /Conversations/ }),
    ).toBeTruthy();
    // The series order (a day axis, a ranking) is kept until someone sorts.
    expect(bodyRowLabels(table)).toEqual(["Dana Reyes", "Alex Moore"]);
    expect(within(table).getByText("3,200")).toBeTruthy();
  });

  it("formats values with the caller's formatter", () => {
    render(
      <ReportTable
        series={series}
        caption="Conversations per agent"
        columns={["Agent", "Conversations"]}
        formatValue={(bucket) => `${bucket.value} min`}
      />,
    );
    expect(screen.getByText("3200 min")).toBeTruthy();
  });

  it("sorts rows by their number from the column header", () => {
    render(
      <ReportTable
        series={{ ...series, buckets: [...series.buckets].reverse() }}
        caption="Conversations per agent"
        columns={["Agent", "Conversations"]}
      />,
    );
    const table = screen.getByRole("table");
    const sortByCount = () =>
      fireEvent.click(
        within(table).getByRole("button", { name: /Conversations/ }),
      );
    sortByCount();
    expect(bodyRowLabels(table)).toEqual(["Dana Reyes", "Alex Moore"]);
    sortByCount();
    expect(bodyRowLabels(table)).toEqual(["Alex Moore", "Dana Reyes"]);
  });

  it("keeps every period by default and offers to hide the ones with no activity", () => {
    const days: SupportReportSeries = {
      ...series,
      slice: "volume",
      buckets: Array.from({ length: 10 }, (_, index) => ({
        key: `day-${index + 1}`,
        label: `Day ${index + 1}`,
        // Activity on days 3 and 7 only.
        value: index === 2 ? 4 : index === 6 ? 1 : 0,
        secondaryValue: null,
      })),
    };
    render(
      <ReportTable
        series={days}
        caption="Conversations created"
        columns={["Period", "Conversations"]}
        periodUnit="day"
      />,
    );
    const region = screen.getByRole("region", {
      name: "Conversations created",
    });
    const table = within(region).getByRole("table");
    expect(bodyRowLabels(table)).toHaveLength(10);
    const toggle = within(region).getByRole("switch", {
      name: "Hide days with no activity",
    });
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(toggle);
    expect(bodyRowLabels(table)).toEqual(["Day 3", "Day 7"]);
    // What is hidden is stated, not silently dropped.
    expect(region.textContent).toContain("8 days with no activity hidden");
    fireEvent.click(toggle);
    expect(bodyRowLabels(table)).toHaveLength(10);
  });

  it("hides periods with no activity by default on phones, and the switch shows them again", () => {
    media.phone = true;
    const days: SupportReportSeries = {
      ...series,
      slice: "volume",
      buckets: Array.from({ length: 31 }, (_, index) => ({
        key: `day-${index + 1}`,
        label: `Day ${index + 1}`,
        value: index === 4 ? 2 : index === 20 ? 5 : 0,
        secondaryValue: null,
      })),
    };
    render(
      <ReportTable
        series={days}
        caption="Conversations created"
        columns={["Period", "Conversations"]}
        periodUnit="day"
      />,
    );
    const region = screen.getByRole("region", {
      name: "Conversations created",
    });
    const table = within(region).getByRole("table");
    const toggle = within(region).getByRole("switch", {
      name: "Hide days with no activity",
    });
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(bodyRowLabels(table)).toEqual(["Day 5", "Day 21"]);
    expect(region.textContent).toContain("29 days with no activity hidden");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(bodyRowLabels(table)).toHaveLength(31);
  });

  it("offers no hide switch when every period has activity, or none is asked for", () => {
    render(
      <ReportTable
        series={series}
        caption="Conversations per agent"
        columns={["Agent", "Conversations"]}
      />,
    );
    expect(screen.queryByRole("switch")).toBeNull();
    cleanup();
    render(
      <ReportTable
        series={series}
        caption="Conversations created"
        columns={["Period", "Conversations"]}
        periodUnit="day"
      />,
    );
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("renders nothing for an empty series", () => {
    const { container } = render(
      <ReportTable
        series={{ ...series, buckets: [] }}
        caption="Conversations per agent"
        columns={["Agent", "Conversations"]}
      />,
    );
    expect(container.innerHTML).toBe("");
  });
});
