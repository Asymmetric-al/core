"use client";

import { useMediaQuery } from "@asym/lib/hooks/use-mobile";
import { formatCurrency } from "@asym/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@asym/ui/components/shadcn/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export type MonthlyGivingPoint = { month: string; amount: number };

/** Three even, round steps up to at least the biggest month. */
export function roundTicks(max: number): number[] {
  if (max <= 0) return [0];
  const rough = max / 3;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
      .map((n) => n * magnitude)
      .find((n) => n >= rough) ?? 10 * magnitude;
  return [0, step, step * 2, step * 3];
}

/**
 * Phone labels: every other month counted back from the current one, so the
 * month in progress is always labelled and the steps stay even.
 */
export function phoneMonthTicks(
  data: MonthlyGivingPoint[],
  currentMonth: number,
) {
  return data
    .filter(
      (_, index) => index <= currentMonth && (currentMonth - index) % 2 === 0,
    )
    .map((point) => point.month);
}

/** "$80", "$1.2k": short enough for a narrow axis. */
function axisDollars(value: number) {
  if (value < 1000) return `$${value}`;
  const thousands = value / 1000;
  return `$${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
}

const chartConfig = {
  amount: { label: "Paid", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** Paid gifts per month of the selected year. Loaded on demand. */
export default function MonthlyGivingChart({
  data,
  currentMonth,
}: {
  data: MonthlyGivingPoint[];
  /** Index of the month in progress (11 for a past year). */
  currentMonth: number;
}) {
  const isPhone = useMediaQuery("(max-width: 639px)");
  const ticks = roundTicks(Math.max(0, ...data.map((point) => point.amount)));
  return (
    <ChartContainer config={chartConfig} layout="fill" className="w-full">
      {/* The page hides this picture from assistive tech and gives screen
          readers a table of the same months, so the chart stays out of the
          tab order (Recharts would otherwise make it focusable). */}
      <BarChart
        data={data}
        margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        accessibilityLayer={false}
      >
        <CartesianGrid vertical={false} stroke="var(--border)" opacity={0.4} />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          interval={0}
          ticks={isPhone ? phoneMonthTicks(data, currentMonth) : undefined}
          tickMargin={6}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={44}
          ticks={ticks}
          domain={[0, ticks[ticks.length - 1]!]}
          fontSize={12}
          stroke="var(--muted-foreground)"
          tickFormatter={axisDollars}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value) => (
                <span className="flex items-center gap-2">
                  <span>Paid</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Number(value))}
                  </span>
                </span>
              )}
            />
          }
        />
        <Bar
          dataKey="amount"
          fill="var(--color-amount)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ChartContainer>
  );
}
