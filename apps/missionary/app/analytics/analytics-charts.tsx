"use client";

import {
  formatCurrencyFromCents,
  MONEY_UNAVAILABLE,
  moneyCurrency,
} from "@asym/missionary/components/money-units";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@asym/ui/components/shadcn/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { formatMoney, YEAR_OVER_YEAR_SERIES } from "./analytics-model";

export type YearOverYearPoint = {
  label: string;
  thisYear: number;
  lastYear: number;
};

// This year in the primary series colour; the year before is a quiet grey so
// it never reads as "one-time" (chart-2) from the home chart. One mixed colour
// keeps the bars, legend and tooltip dots the same shade.
const chartConfig = {
  thisYear: { label: YEAR_OVER_YEAR_SERIES.thisYear, color: "var(--chart-1)" },
  lastYear: {
    label: YEAR_OVER_YEAR_SERIES.lastYear,
    color: "color-mix(in oklab, var(--muted-foreground) 40%, transparent)",
  },
} satisfies ChartConfig;

/**
 * Each of the last 12 months beside the same month a year earlier. The page
 * reads the same values out as a table, so the plotted area is hidden from
 * screen readers and, being hidden, must not take keyboard focus either.
 */
export default function YearOverYearChart({
  data,
  currency,
}: {
  data: YearOverYearPoint[];
  currency: string;
}) {
  if (!moneyCurrency(currency)) return <p>{MONEY_UNAVAILABLE}</p>;
  return (
    <ChartContainer config={chartConfig} layout="fill" className="w-full">
      <BarChart
        data={data}
        margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
        aria-hidden
        accessibilityLayer={false}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="var(--border)"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          fontSize={12}
          stroke="var(--muted-foreground)"
          tickFormatter={(value) =>
            formatCurrencyFromCents(Math.round(Number(value)), currency)
          }
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value, name) => (
                <span className="flex items-center gap-2">
                  <span>
                    {chartConfig[name as keyof typeof chartConfig]?.label ??
                      name}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(Number(value), currency)}
                  </span>
                </span>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="lastYear"
          fill="var(--color-lastYear)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="thisYear"
          fill="var(--color-thisYear)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ChartContainer>
  );
}
