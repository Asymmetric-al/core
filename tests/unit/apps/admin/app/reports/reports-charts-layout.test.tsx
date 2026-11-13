// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ReportsCharts } from "../../../../../../apps/admin/app/(app)/reports/reports-charts";

const GIVING = [
  { label: "General Fund", amount: 48_250 },
  { label: "Clean Water Initiative", amount: 19_600 },
];
const DONORS = [
  { label: "General Fund", donors: 141 },
  { label: "Clean Water Initiative", donors: 74 },
];

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    }),
  });
});

afterEach(cleanup);

async function renderAt(width: number) {
  window.innerWidth = width;
  await act(async () => {
    render(
      <ReportsCharts
        giving={GIVING}
        donors={DONORS}
        coverage="All 2 funds."
        isEmpty={false}
        period="Nov 1, 2026 – Nov 11, 2026"
      />,
    );
  });
}

describe("Reports charts layout", () => {
  it("describes exact values and the period without depending on the graphic", async () => {
    await renderAt(1440);
    const figures = screen.getAllByRole("figure");
    expect(figures).toHaveLength(2);
    const summary = document.getElementById(
      figures[0]!.getAttribute("aria-describedby")!.split(" ")[0]!,
    );
    expect(summary?.textContent).toContain("General Fund: $48,250.00");
    expect(summary?.textContent).toContain(
      "Clean Water Initiative: $19,600.00",
    );
    expect(summary?.textContent).toContain("Nov 1, 2026 – Nov 11, 2026");
    expect(figures[1]!.textContent).toContain("General Fund: 141 donors");
  });

  it("uses the shared loading and retry states without showing a chart", () => {
    const onRetry = vi.fn();
    const view = render(
      <ReportsCharts
        giving={GIVING}
        donors={DONORS}
        coverage="All 2 funds."
        period="All time"
        isEmpty={false}
        isLoading
        onRetry={onRetry}
      />,
    );
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    expect(screen.queryByRole("figure")).toBeNull();
    view.rerender(
      <ReportsCharts
        giving={GIVING}
        donors={DONORS}
        coverage="All 2 funds."
        period="All time"
        isEmpty={false}
        isError
        onRetry={onRetry}
      />,
    );
    expect(screen.queryByRole("figure")).toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: "Try again" })[0]!);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not graph an incomplete report as a complete comparison", () => {
    render(
      <ReportsCharts
        giving={GIVING}
        donors={DONORS}
        coverage="All 2 funds."
        period="All time"
        isEmpty={false}
        isIncomplete
      />,
    );
    expect(screen.queryByRole("figure")).toBeNull();
    expect(
      screen.getAllByText("Charts need a complete report").length,
    ).toBeGreaterThan(0);
  });

  it("omits the meaningless distinct-donor comparison when grouped by individual donor", () => {
    render(
      <ReportsCharts
        giving={GIVING}
        donors={DONORS}
        coverage="All 2 donors."
        period="All time"
        isEmpty={false}
        group={{ singular: "donor", plural: "donors", title: "Donors" }}
      />,
    );
    expect(
      screen.queryByRole("region", { name: "Donors by donor" }),
    ).toBeNull();
    expect(screen.getAllByRole("figure")).toHaveLength(1);
  });

  it("keeps both charts side by side on wide screens", async () => {
    await renderAt(1440);
    expect(screen.getByRole("region", { name: "Giving by fund" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Donors by fund" })).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Chart" })).toBeNull();
  });

  it("shows one switchable chart below lg, so phones do not scroll past the funds twice", async () => {
    await renderAt(390);
    const region = screen.getByRole("region", { name: "By fund" });
    expect(screen.queryByRole("region", { name: "Donors by fund" })).toBeNull();
    const giving = screen.getByRole("button", { name: "Giving" });
    const donors = screen.getByRole("button", { name: "Donors" });
    expect(giving.getAttribute("aria-pressed")).toBe("true");
    expect(region.textContent).toContain("Net giving, largest first.");
    fireEvent.click(donors);
    expect(donors.getAttribute("aria-pressed")).toBe("true");
    expect(region.textContent).toContain(
      "Different donors giving to each fund",
    );
  });
});
