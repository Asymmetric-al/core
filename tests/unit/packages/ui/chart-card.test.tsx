// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ChartCard,
  ChartTooltip,
} from "../../../../packages/ui/components/primitives/chart-wrappers";
import { chartColor } from "../../../../packages/ui/components/shadcn/chart";

afterEach(cleanup);

describe("ChartCard for area builders", () => {
  it("names the chart by its title and describes it with the text summary", () => {
    render(
      <ChartCard
        title="Gifts by month"
        summary="Gifts rose from 40 in January to 65 in June."
      >
        <svg aria-hidden />
      </ChartCard>,
    );

    const figure = screen.getByRole("figure", { name: "Gifts by month" });
    expect(figure.getAttribute("aria-describedby")).toBeTruthy();
    const description = document.getElementById(
      figure.getAttribute("aria-describedby")!.split(" ")[0]!,
    );
    expect(description?.textContent).toBe(
      "Gifts rose from 40 in January to 65 in June.",
    );
  });

  it("says plainly when the chart shows only part of the data", () => {
    render(
      <ChartCard
        title="Gifts by month"
        summary="Gifts rose in spring."
        note="Shows the 500 most recent gifts, not every gift."
      >
        <svg aria-hidden />
      </ChartCard>,
    );

    expect(
      screen.getByText("Shows the 500 most recent gifts, not every gift."),
    ).toBeTruthy();
    const figure = screen.getByRole("figure", { name: "Gifts by month" });
    expect(figure.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
  });

  it("makes the title a heading at the level the page needs", () => {
    render(
      <ChartCard title="Gifts by month" headingLevel={2}>
        <svg aria-hidden />
      </ChartCard>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Gifts by month" }),
    ).toBeTruthy();
  });

  it("offers a retry when the data failed to load", () => {
    const onRetry = vi.fn();
    render(
      <ChartCard title="Gifts by month" isError onRetry={onRetry}>
        <svg aria-hidden />
      </ChartCard>,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "The chart could not load",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("figure")).toBeNull();
  });
});

describe("chart helpers", () => {
  it("formats tooltip values with the caller's formatter", () => {
    render(
      <ChartTooltip
        active
        label="June"
        payload={[{ name: "Gifts", value: 65, color: "var(--chart-1)" }]}
        formatValue={(value) => `${value} gifts`}
      />,
    );

    expect(screen.getByText("65 gifts")).toBeTruthy();
  });

  it("cycles through the five semantic chart tokens", () => {
    expect(chartColor(0)).toBe("var(--chart-1)");
    expect(chartColor(4)).toBe("var(--chart-5)");
    expect(chartColor(5)).toBe("var(--chart-1)");
  });
});
