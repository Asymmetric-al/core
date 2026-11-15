---
name: rechart
description: "Build responsive, readable charts with Recharts using correct data mapping and composition. Use whenever creating charts with Recharts — LineChart, BarChart, AreaChart, PieChart, wrapped in ResponsiveContainer with a fixed-height parent. Not for charts built with other libraries."
---

# Recharts in Core

Core pins Recharts 3 (`recharts` in `packages/ui/package.json` and the app manifests). Build charts with the shared shadcn chart wrapper in `packages/ui/components/shadcn/chart.tsx`; `packages/ui/components/primitives/chart-wrappers.tsx` adds `ChartCard` and `KpiTile` compositions.

## Rules

- **Use `ChartContainer`:** It supplies `ResponsiveContainer`, theme-aware `--color-<key>` variables from a `ChartConfig`, and token-based axis/grid styling. Default layout keeps an aspect ratio; `layout="fill"` fills a parent with a definite height class (no inline `style`).
- **Theme colors:** Set series colors in `ChartConfig` with `chartColor(index)` or `var(--chart-N)`, then reference `var(--color-<key>)` in `fill`/`stroke`. No raw palette colors.
- **Tooltips and legends:** Use `ChartTooltip` with `ChartTooltipContent` and `ChartLegend` with `ChartLegendContent`; format money and units with the owning formatter.
- **Explicit data model:** Normalize data and use stable `dataKey` values. Pick the simplest chart: line for trends, bar for comparisons, area for cumulative volume, pie only for part-to-whole.
- **Accessibility:** Provide an accessible alternative (a table or text summary) for the data. If the chart is hidden from assistive technology, set `accessibilityLayer={false}` and say why in a comment.
- **Performance:** Set `isAnimationActive={false}` for dashboards and large or frequently updated data, aggregate large sets, and consider `next/dynamic` to keep Recharts out of the initial bundle.

## Checklist

- [ ] Chart wrapped in `ChartContainer` with a `ChartConfig`
- [ ] Series colors come from chart tokens via `--color-<key>`
- [ ] `dataKey` values match field names; tooltip shows correct units
- [ ] Accessible alternative for the data exists
- [ ] Animation disabled where data is large or live

## Example

See `apps/admin/app/(app)/crm/giving-by-year-chart.tsx` for a complete chart with `next/dynamic`, `layout="fill"`, a formatted tooltip, and a table alternative.

```tsx
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@asym/ui/components/shadcn/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const config = {
  amount: { label: "Settled giving", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function GivingBars({
  data,
}: {
  data: { label: string; amount: number }[];
}) {
  return (
    <ChartContainer config={config}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="amount"
          fill="var(--color-amount)"
          radius={4}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}
```
