// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { type ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ChartContainer,
  ChartTooltipContent,
} from "../../../../packages/ui/components/shadcn/chart";

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 640,
    height: 320,
    top: 0,
    left: 0,
    right: 640,
    bottom: 320,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderTooltip(
  value: number | undefined,
  formatter?: ComponentProps<typeof ChartTooltipContent>["formatter"],
) {
  return render(
    <ChartContainer config={{ gifts: { label: "Gifts" } }}>
      <ChartTooltipContent
        active
        hideLabel
        formatter={formatter}
        payload={[{ dataKey: "gifts", name: "gifts", value, payload: {} }]}
      />
    </ChartContainer>,
  );
}

describe("chart tooltip values", () => {
  it("displays a measured zero instead of presenting a missing value", () => {
    renderTooltip(0);
    expect(screen.getByText("Gifts")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("preserves negative values and caller formatting", () => {
    renderTooltip(-1200);
    expect(screen.getByText("-1,200")).toBeTruthy();
    cleanup();
    renderTooltip(0, (value) => `Total: ${value}`);
    expect(screen.getByText("Total: 0")).toBeTruthy();
  });

  it("does not fabricate a zero for an absent value", () => {
    renderTooltip(undefined);
    expect(screen.getByText("Gifts")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();
  });
});
