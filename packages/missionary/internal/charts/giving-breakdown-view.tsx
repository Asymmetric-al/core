"use client";
import { useReducedMotion } from "@asym/lib/motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@asym/ui/components/shadcn/chart";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatCents,
  formatCurrencyFromCents,
  MONEY_UNAVAILABLE,
  moneyCurrency,
} from "../../components/money-units";

import type { useDonationMetrics } from "@asym/lib/hooks";
import type { ChartConfig } from "@asym/ui/components/shadcn/chart";
import type { XAxisTickContentProps } from "recharts";
const chartConfig = {
  recurring: {
    label: "Recurring",
    color: "var(--chart-1)",
  },
  oneTime: {
    label: "One-time",
    color: "var(--chart-2)",
  },
  offline: {
    label: "Offline",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;
const CORNER_RADIUS = 4;
type DonationBarKey = "recurring" | "oneTime" | "offline";
interface MonthlyData {
  recurring: number;
  oneTime: number;
  offline: number;
}
interface RenderableBarGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  payload?: MonthlyData;
}
function readRenderableBarGeometry(
  props: unknown,
): RenderableBarGeometry | null {
  const barProps = props as {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    payload?: MonthlyData;
  };

  const { x, y, width, height, fill, payload } = barProps;

  if (x === undefined || y === undefined || !width || !height || height <= 0) {
    return null;
  }

  return { x, y, width, height, fill, payload };
}
function stackedBarAmounts(payload: MonthlyData | undefined) {
  return {
    recurring: payload?.recurring ?? 0,
    oneTime: payload?.oneTime ?? 0,
    offline: payload?.offline ?? 0,
  };
}
function stackedBarIsBottom(
  dataKey: DonationBarKey,
  payload: MonthlyData | undefined,
): boolean {
  const { recurring, oneTime } = stackedBarAmounts(payload);

  switch (dataKey) {
    case "recurring":
      return true;
    case "oneTime":
      return recurring === 0;
    case "offline":
      return recurring === 0 && oneTime === 0;
    default: {
      const exhaustive: never = dataKey;
      return exhaustive;
    }
  }
}
function stackedBarIsTop(
  dataKey: DonationBarKey,
  payload: MonthlyData | undefined,
): boolean {
  const { oneTime, offline } = stackedBarAmounts(payload);

  switch (dataKey) {
    case "offline":
      return true;
    case "oneTime":
      return offline === 0;
    case "recurring":
      return oneTime === 0 && offline === 0;
    default: {
      const exhaustive: never = dataKey;
      return exhaustive;
    }
  }
}
function clampCornerRadius(radius: number, width: number, height: number) {
  return Math.min(radius, width / 2, height / 2);
}
function roundedStackedBarPath(
  dataKey: DonationBarKey,
  bar: RenderableBarGeometry,
): string {
  const { x, y, width, height, payload } = bar;
  const isBottom = stackedBarIsBottom(dataKey, payload);
  const isTop = stackedBarIsTop(dataKey, payload);

  const topLeft = isTop ? CORNER_RADIUS : 0;
  const topRight = isTop ? CORNER_RADIUS : 0;
  const bottomRight = isBottom ? CORNER_RADIUS : 0;
  const bottomLeft = isBottom ? CORNER_RADIUS : 0;

  const tl = clampCornerRadius(topLeft, width, height);
  const tr = clampCornerRadius(topRight, width, height);
  const br = clampCornerRadius(bottomRight, width, height);
  const bl = clampCornerRadius(bottomLeft, width, height);

  return `
      M ${x + tl},${y}
      L ${x + width - tr},${y}
      Q ${x + width},${y} ${x + width},${y + tr}
      L ${x + width},${y + height - br}
      Q ${x + width},${y + height} ${x + width - br},${y + height}
      L ${x + bl},${y + height}
      Q ${x},${y + height} ${x},${y + height - bl}
      L ${x},${y + tl}
      Q ${x},${y} ${x + tl},${y}
      Z
    `;
}
function createRoundedBarShape(dataKey: DonationBarKey) {
  function RoundedBar(props: unknown): React.ReactElement {
    const bar = readRenderableBarGeometry(props);
    if (!bar) {
      return React.createElement(React.Fragment);
    }

    return <path d={roundedStackedBarPath(dataKey, bar)} fill={bar.fill} />;
  }

  return RoundedBar;
}
const RecurringBarShape = createRoundedBarShape("recurring");
const OneTimeBarShape = createRoundedBarShape("oneTime");
const OfflineBarShape = createRoundedBarShape("offline");
export function formatAxisMoney(value: number, currency: string) {
  return formatCurrencyFromCents(Math.round(value), currency);
}

const SERIES: DonationBarKey[] = ["recurring", "oneTime", "offline"];
const SHAPES = {
  recurring: RecurringBarShape,
  oneTime: OneTimeBarShape,
  offline: OfflineBarShape,
};

const SHORT_MONTH = new Intl.DateTimeFormat("en-US", { month: "short" });
const SHORT_MONTHS = Array.from({ length: 12 }, (_, index) =>
  SHORT_MONTH.format(new Date(2000, index, 1)),
);
const MONTH_NAME = new Intl.DateTimeFormat("en-US", { month: "long" });
const MONTH_AND_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

/** "Oct" of 2025 as "October 2025", or "October" without a year. */
function fullMonthName(month: string, year?: number) {
  const index = SHORT_MONTHS.indexOf(month);
  if (index === -1) return year ? `${month} ${year}` : month;
  const date = new Date(year || 2000, index, 1);
  return (year ? MONTH_AND_YEAR : MONTH_NAME).format(date);
}

interface GivingMonthRow extends MonthlyData {
  month: string;
  year: number;
  /** The month in full, as the table reads it out. */
  monthName: string;
}

/**
 * The chart's values for screen readers: the plotted bars are hidden from
 * them, so each month's exact amounts by kind of gift are read from here.
 */
function GivingByMonthTable({
  rows,
  series,
  currency,
}: {
  rows: GivingMonthRow[];
  series: DonationBarKey[];
  currency: string;
}) {
  const first = rows[0];
  const last = rows.at(-1);
  const period =
    first && last
      ? `, ${fullMonthName(first.month, first.year)} to ${fullMonthName(last.month, last.year)}`
      : "";
  return (
    // A table grows to fit its content whatever its width, so the hidden
    // wrapper does the clipping; sr-only on the table could widen the page.
    <div className="sr-only">
      <table>
        <caption>{`Giving by month${period}`}</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            {series.map((key) => (
              <th key={key} scope="col">
                {chartConfig[key].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.year}-${row.month}`}>
              <th scope="row">{row.monthName}</th>
              {series.map((key) => (
                <td key={key}>{formatCents(row[key], currency)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GivingBreakdownView({
  monthlyBreakdown,
  currency,
  committedCents,
  committedCurrency,
}: {
  monthlyBreakdown: ReturnType<typeof useDonationMetrics>["monthlyBreakdown"];
  /** Monthly recurring support now committed; drawn as a dashed line. */
  committedCents?: number | null;
  committedCurrency?: string | null;
  currency: string;
}) {
  const reduceMotion = useReducedMotion();
  if (!moneyCurrency(currency)) return <p>{MONEY_UNAVAILABLE}</p>;
  const canCompareCommitments =
    moneyCurrency(committedCurrency) === moneyCurrency(currency) &&
    committedCents != null &&
    Number.isSafeInteger(committedCents) &&
    committedCents >= 0;
  // Only series with gifts get a bar and a legend entry.
  const series = SERIES.filter((key) =>
    monthlyBreakdown.some((month) => month[key] > 0),
  );
  const lastIndex = monthlyBreakdown.length - 1;
  // The table names each month in full, with its year once they span two.
  const spansYears =
    new Set(monthlyBreakdown.map((month) => month.year)).size > 1;
  // The current month is still in progress, so it reads "so far".
  const data = monthlyBreakdown.map((month, index) => {
    const soFar = index === lastIndex ? " (so far)" : "";
    const name = month.year ? `${month.month} ${month.year}` : month.month;
    const monthName = fullMonthName(
      month.month,
      spansYears ? month.year : undefined,
    );
    return {
      ...month,
      label: `${name}${soFar}`,
      monthName: `${monthName}${soFar}`,
    };
  });
  // The first month and each January show the year underneath ("’26"), so
  // every label stays as narrow as the month and none are dropped for room.
  const yearUnder = (index: number) => {
    const point = data[index];
    if (!point?.year || (index !== 0 && point.month !== "Jan")) return null;
    return `’${String(point.year).slice(2)}`;
  };
  const monthTick = ({ x, y, payload, index }: XAxisTickContentProps) => {
    const year = yearUnder(index);
    return (
      <text
        x={x}
        y={y}
        dy={12}
        textAnchor="middle"
        fontSize={12}
        fill="var(--muted-foreground)"
      >
        <tspan x={x}>{String(payload.value)}</tspan>
        {year ? (
          <tspan x={x} dy={14}>
            {year}
          </tspan>
        ) : null}
      </text>
    );
  };
  return (
    <>
      <div className="h-64 w-full min-w-0 sm:h-72">
        {/* The table below reads these values out, so the plotted area is
          hidden from screen readers and, being hidden, takes no focus. */}
        <ChartContainer config={chartConfig} layout="fill" className="w-full">
          <BarChart
            aria-hidden
            accessibilityLayer={false}
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 0,
              bottom: 0,
            }}
            barGap={2}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={5}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
              interval="preserveStartEnd"
              height={36}
              tick={monthTick}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) =>
                formatAxisMoney(Number(value), currency)
              }
              width={48}
              tickMargin={4}
              stroke="var(--muted-foreground)"
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(_, payload) =>
                    String(payload?.[0]?.payload?.label ?? "")
                  }
                  formatter={(value, name) => (
                    <span className="flex items-center gap-2">
                      <span>
                        {chartConfig[name as DonationBarKey]?.label ?? name}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatCents(Number(value), currency)}
                      </span>
                    </span>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {series.map((key) => (
              <Bar
                key={key}
                isAnimationActive={!reduceMotion}
                dataKey={key}
                stackId="donations"
                fill={`var(--color-${key})`}
                maxBarSize={48}
                shape={SHAPES[key]}
              />
            ))}
            {canCompareCommitments && committedCents > 0 ? (
              <ReferenceLine
                y={committedCents}
                stroke="var(--foreground)"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                ifOverflow="extendDomain"
              />
            ) : null}
          </BarChart>
        </ChartContainer>
        <GivingByMonthTable rows={data} series={series} currency={currency} />
      </div>
      {(committedCents !== undefined || committedCurrency !== undefined) &&
      !canCompareCommitments ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Committed-support line unavailable: chart and commitments need
          matching known currencies and valid amounts.
        </p>
      ) : null}
    </>
  );
}
