import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
} from "@asym/ui/components/shadcn/chart";

import type { ReactNode } from "react";

// Server rendering cannot measure a responsive chart. Keep the real Recharts
// content contracts and bypass only its browser-dependent sizing boundary.
vi.mock(
  "../../../../packages/ui/node_modules/recharts",
  async (importOriginal) => {
    const upstream = await importOriginal<typeof import("recharts")>();
    return {
      ...upstream,
      ResponsiveContainer: ({ children }: { children: ReactNode }) => children,
    };
  },
);

const config = {
  donations: { label: "Donations", color: "var(--chart-1)" },
  pledges: { label: "Pledges", color: "var(--chart-2)" },
};

function renderContent(children: ReactNode) {
  return renderToStaticMarkup(
    <ChartContainer config={config}>{children}</ChartContainer>,
  );
}

describe("shared chart content contracts", () => {
  it("renders configured tooltip labels and formatted values", () => {
    const markup = renderContent(
      <ChartTooltipContent
        active
        label="donations"
        payload={[
          {
            dataKey: "donations",
            name: "donations",
            value: 1250,
            color: "var(--chart-1)",
            payload: { donations: 1250 },
          },
        ]}
      />,
    );

    expect(markup).toContain("Donations");
    expect(markup).toContain("1,250");
    expect(markup).toContain("--color-bg:var(--chart-1)");
  });

  it("passes the original series item and source row to formatters", () => {
    const row = { donations: 35 };
    const item = {
      dataKey: "donations",
      name: "donations",
      value: 35,
      payload: row,
    };
    const formatter = vi.fn(() => <span>Custom amount</span>);
    const markup = renderContent(
      <ChartTooltipContent active payload={[item]} formatter={formatter} />,
    );

    expect(markup).toContain("Custom amount");
    expect(formatter).toHaveBeenCalledWith(35, "donations", item, 0, row);
  });

  it("omits inactive tooltips and legend entries explicitly hidden by Recharts", () => {
    const markup = renderContent(
      <>
        <ChartTooltipContent active={false} payload={[]} />
        <ChartLegendContent
          verticalAlign="top"
          payload={[
            {
              dataKey: "donations",
              value: "donations",
              color: "var(--chart-1)",
            },
            { dataKey: "pledges", value: "pledges", type: "none" },
          ]}
        />
      </>,
    );

    expect(markup).toContain("Donations");
    expect(markup).not.toContain("Pledges");
    expect(markup).toContain("pb-3");
    expect(markup).not.toContain("min-w-[8rem]");
  });
});
