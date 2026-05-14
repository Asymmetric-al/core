import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ChartStyle } from "@asym/ui/components/shadcn/chart";

describe("ChartStyle", () => {
  it("renders chart CSS variables in a style tag", () => {
    const markup = renderToStaticMarkup(
      <ChartStyle
        id="chart-regression"
        config={{
          donations: { color: "hsl(var(--chart-1))" },
          pledges: {
            theme: {
              light: "hsl(var(--chart-2))",
              dark: "hsl(var(--chart-3))",
            },
          },
          labelOnly: { label: "No color" },
        }}
      />,
    );

    expect(markup).toContain("<style>");
    expect(markup).toContain("[data-chart=chart-regression]");
    expect(markup).toContain("--color-donations: hsl(var(--chart-1));");
    expect(markup).toContain("--color-pledges: hsl(var(--chart-2));");
    expect(markup).toContain(".dark [data-chart=chart-regression]");
    expect(markup).toContain("--color-pledges: hsl(var(--chart-3));");
    expect(markup).not.toContain("--color-labelOnly");
  });

  it("omits the style tag when no color variables are configured", () => {
    const markup = renderToStaticMarkup(
      <ChartStyle
        id="chart-empty"
        config={{
          labelOnly: { label: "No color" },
        }}
      />,
    );

    expect(markup).toBe("");
  });
});
