// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Chart keyboard layer regression.
import { ReportBarChart } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportBarChart";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Chart keyboard layer regression.
import { ReportLineChart } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportLineChart";

import type { ComponentProps } from "react";

type Series = ComponentProps<typeof ReportLineChart>["series"];

function seriesOf(days: number): Series {
  const buckets = Array.from({ length: days }, (_, index) => ({
    key: `day-${index + 1}`,
    label: `Day ${index + 1}`,
    value: index + 1,
    secondaryValue: null,
  }));
  return {
    slice: "volume",
    generatedAt: "2026-11-11T00:00:00.000Z",
    unit: "count",
    total: buckets.reduce((sum, bucket) => sum + bucket.value, 0),
    buckets,
  };
}

// jsdom has no layout. Give the chart's container a size so Recharts draws
// its SVG; everything else measures zero.
const originalRect = HTMLElement.prototype.getBoundingClientRect;
const originalResizeObserver = window.ResizeObserver;
const originalMatchMedia = window.matchMedia;
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
afterAll(() => {
  HTMLElement.prototype.getBoundingClientRect = originalRect;
  Object.defineProperty(window, "ResizeObserver", {
    configurable: true,
    value: originalResizeObserver,
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia,
  });
  Reflect.deleteProperty(HTMLElement.prototype, "offsetWidth");
  Reflect.deleteProperty(HTMLElement.prototype, "offsetHeight");
});
afterEach(cleanup);

async function renderedSurface(container: HTMLElement) {
  return waitFor(
    () => {
      const svg = container.querySelector("svg.recharts-surface");
      expect(svg).not.toBeNull();
      return svg!;
    },
    { timeout: 10_000 },
  );
}

it.each([
  [
    "the trend chart as an area",
    <ReportLineChart
      key="area"
      title="Conversations created"
      series={seriesOf(7)}
    />,
    "Conversations created",
    ".recharts-area",
  ],
  [
    "the trend chart as bars",
    <ReportLineChart
      key="bars"
      title="Conversations created"
      series={seriesOf(30)}
    />,
    "Conversations created",
    ".recharts-bar",
  ],
  [
    "the bar chart after its card, not its tooltip series",
    <ReportBarChart
      key="bar"
      title="Customer waiting"
      valueLabel="Hours"
      series={seriesOf(3)}
    />,
    "Customer waiting",
    ".recharts-bar",
  ],
])(
  "names the keyboard layer of %s",
  async (_case, chart, title, form) => {
    const { container } = render(chart);
    const svg = await renderedSurface(container);
    expect(svg.querySelector(form)).not.toBeNull();
    // Recharts' keyboard layer: one tab stop that arrow keys walk through.
    expect(svg.getAttribute("role")).toBe("application");
    expect(svg.getAttribute("tabindex")).toBe("0");
    expect(svg.getAttribute("aria-label")).toBe(title);
    expect(screen.getByRole("application", { name: title })).toBe(svg);
    // A non-empty svg <title> would add a native hover tooltip.
    expect(svg.querySelector(":scope > title")?.textContent ?? "").toBe("");
  },
  20_000,
);
