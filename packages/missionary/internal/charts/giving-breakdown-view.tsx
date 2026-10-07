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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { useDonationMetrics } from "@asym/lib/hooks";
import type { ChartConfig } from "@asym/ui/components/shadcn/chart";
const chartConfig = {
  recurring: {
    label: "Recurring",
    color: "var(--chart-1)",
  },
  oneTime: {
    label: "One-Time",
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
export default function GivingBreakdownView({
  monthlyBreakdown,
}: {
  monthlyBreakdown: ReturnType<typeof useDonationMetrics>["monthlyBreakdown"];
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="h-50 sm:h-62.5 md:h-75 w-full grid grid-cols-1 grid-rows-1 items-stretch">
      <ChartContainer config={chartConfig} className="w-full self-stretch">
        <BarChart
          data={monthlyBreakdown}
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
            fontWeight={700}
            stroke="var(--muted-foreground)"
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            fontWeight={700}
            tickFormatter={(value) =>
              value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
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
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    recurring: "Recurring",
                    oneTime: "One-Time",
                    offline: "Offline",
                  };
                  return (
                    <span className="flex items-center gap-2">
                      <span>{labels[name as string] || name}</span>
                      <span className="font-black">
                        ${Number(value).toLocaleString()}
                      </span>
                    </span>
                  );
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            isAnimationActive={!reduceMotion}
            dataKey="recurring"
            stackId="donations"
            fill="var(--color-recurring)"
            maxBarSize={48}
            shape={RecurringBarShape}
          />
          <Bar
            isAnimationActive={!reduceMotion}
            dataKey="oneTime"
            stackId="donations"
            fill="var(--color-oneTime)"
            maxBarSize={48}
            shape={OneTimeBarShape}
          />
          <Bar
            isAnimationActive={!reduceMotion}
            dataKey="offline"
            stackId="donations"
            fill="var(--color-offline)"
            maxBarSize={48}
            shape={OfflineBarShape}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
