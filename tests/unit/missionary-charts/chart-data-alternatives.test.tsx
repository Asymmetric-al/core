/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import YearOverYearChart from "../../../apps/missionary/app/analytics/analytics-charts";
import GivingBreakdownView from "../../../packages/missionary/internal/charts/giving-breakdown-view";

// jsdom has no layout. Give the chart's container a size so Recharts draws
// its SVG and can place the pointer; everything else measures zero.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }),
  });
  class NoopResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", {
    configurable: true,
    value: NoopResizeObserver,
  });
  const sized = (element: Element) =>
    element.classList.contains("recharts-responsive-container") ||
    element.classList.contains("recharts-wrapper");
  HTMLElement.prototype.getBoundingClientRect = function () {
    const [width, height] = sized(this) ? [600, 300] : [0, 0];
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      width,
      height,
      toJSON() {},
    } as DOMRect;
  };
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return sized(this) ? 600 : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return sized(this) ? 300 : 0;
    },
  });
});

afterEach(() => cleanup());

/** The plotted area: drawn for sighted people, hidden from screen readers. */
function expectHiddenPlot(container: HTMLElement) {
  const svg = container.querySelector("svg.recharts-surface");
  expect(svg).not.toBeNull();
  expect(svg!.getAttribute("aria-hidden")).toBe("true");
  // Nothing hidden from screen readers may take keyboard focus.
  expect(svg!.hasAttribute("tabindex")).toBe(false);
  expect(svg!.hasAttribute("role")).toBe(false);
}

/** Hovers the first month and returns the tooltip's text. */
async function firstMonthTooltip(container: HTMLElement) {
  fireEvent.mouseMove(container.querySelector(".recharts-wrapper")!, {
    clientX: 150,
    clientY: 150,
  });
  const tooltip = container.querySelector(".recharts-tooltip-wrapper")!;
  await waitFor(() => expect(tooltip.textContent).not.toBe(""));
  return tooltip.textContent;
}

/** Each body row of a table as its cells' text. */
function bodyRows(table: HTMLElement) {
  return within(table)
    .getAllByRole("row")
    .slice(1)
    .map((row) => [...row.children].map((cell) => cell.textContent));
}

// Dollars, as the Home chart receives them.
const homeMonths = [
  {
    month: "Oct",
    year: 2025,
    recurring: 100,
    oneTime: 25.5,
    offline: 0,
    total: 125.5,
  },
  {
    month: "Jan",
    year: 2026,
    recurring: 706.67,
    oneTime: 0,
    offline: 0,
    total: 706.67,
  },
  {
    month: "Feb",
    year: 2026,
    recurring: 0,
    oneTime: 50,
    offline: 0,
    total: 50,
  },
];

describe("Home giving chart data alternative", () => {
  it("hides the plotted area and keeps it out of the tab order", () => {
    const { container } = render(
      <GivingBreakdownView monthlyBreakdown={homeMonths} />,
    );
    expectHiddenPlot(container);
  });

  it("lists each month's amounts by kind of gift in a visually hidden table", () => {
    render(<GivingBreakdownView monthlyBreakdown={homeMonths} />);
    const table = screen.getByRole("table", {
      name: "Giving by month, October 2025 to February 2026",
    });
    // A table grows to fit its content whatever its width, so sr-only on the
    // table itself can widen the page on phones. A hidden wrapper clips it.
    expect(table.classList.contains("sr-only")).toBe(false);
    expect(table.parentElement?.classList.contains("sr-only")).toBe(true);
    // One column per plotted series: nobody gave offline, so it has none.
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Month", "Recurring", "One-time"]);
    expect(
      within(table)
        .getAllByRole("rowheader")
        .map((header) => header.textContent),
    ).toEqual(["October 2025", "January 2026", "February 2026 (so far)"]);
    expect(bodyRows(table)).toEqual([
      ["October 2025", "$100.00", "$25.50"],
      ["January 2026", "$706.67", "$0.00"],
      ["February 2026 (so far)", "$0.00", "$50.00"],
    ]);
  });

  it("keeps the legend visible to everyone", () => {
    const { container } = render(
      <GivingBreakdownView monthlyBreakdown={homeMonths} />,
    );
    const legend = container.querySelector(".recharts-legend-wrapper")!;
    expect(legend.closest("[aria-hidden]")).toBeNull();
    expect(legend.textContent).toContain("Recurring");
    expect(legend.textContent).toContain("One-time");
  });

  it("shows exact amounts with cents in the tooltip", async () => {
    const { container } = render(
      <GivingBreakdownView monthlyBreakdown={homeMonths} />,
    );
    const text = await firstMonthTooltip(container);
    expect(text).toContain("Recurring$100.00");
    expect(text).toContain("One-time$25.50");
  });
});

describe("Analytics year-over-year chart", () => {
  const months = [
    { label: "Oct", thisYear: 100, lastYear: 25.5 },
    { label: "Nov", thisYear: 706.67, lastYear: 0 },
  ];

  it("hides the plotted area and keeps it out of the tab order", () => {
    const { container } = render(<YearOverYearChart data={months} />);
    expectHiddenPlot(container);
  });

  it("shows exact amounts with cents in the tooltip", async () => {
    const { container } = render(<YearOverYearChart data={months} />);
    const text = await firstMonthTooltip(container);
    expect(text).toContain("Last 12 months$100.00");
    expect(text).toContain("Year before$25.50");
  });

  it("keeps whole-dollar axis ticks", () => {
    const { container } = render(<YearOverYearChart data={months} />);
    const ticks = [
      ...container.querySelectorAll(
        ".recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value",
      ),
    ].map((tick) => tick.textContent);
    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) expect(tick).toMatch(/^\$\d+(\.\d)?k?$/);
  });
});
