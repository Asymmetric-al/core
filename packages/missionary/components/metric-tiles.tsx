"use client";

import { useDonationMetrics, type ChartDataPoint } from "@asym/lib/hooks";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import {
  ChartContainer,
  type ChartConfig,
} from "@asym/ui/components/shadcn/chart";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import * as React from "react";
import { Area, AreaChart } from "recharts";

const chartConfig = {
  value: {
    label: "Amount",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface MetricTileProps {
  title: string;
  amount: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  data: ChartDataPoint[];
  color?: string;
  isLoading?: boolean;
}

function MetricTileSkeleton() {
  return (
    <Card>
      <CardContent className="p-0 flex flex-row items-stretch h-18 md:h-20">
        <div className="flex flex-col justify-between p-2.5 pr-0 flex-shrink-0 min-w-25 sm:min-w-30 max-w-3/5">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex-1 min-w-15 relative">
          <div className="absolute inset-0 m-1">
            <Skeleton className="size-full rounded-sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricTile({
  title,
  amount,
  change,
  trend,
  data,
  color = "var(--primary)",
  isLoading,
}: MetricTileProps) {
  const gradientId = React.useId();

  if (isLoading) {
    return <MetricTileSkeleton />;
  }

  const chartData = data.length > 0 ? data : [{ date: "1", value: 0 }];

  return (
    <Card>
      <CardContent className="p-0 flex flex-row items-stretch min-h-24">
        <div className="flex flex-col justify-between p-2.5 pr-0 flex-shrink-0 min-w-25 sm:min-w-30 max-w-3/5">
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-0.5 truncate">
              {title}
            </p>
            <h3 className="wrap-anywhere text-lg md:text-xl font-semibold text-foreground tracking-tighter leading-tight">
              {amount}
            </h3>
          </div>
          {change && (
            <div className="flex items-center gap-1">
              <Badge variant="secondary">
                {trend === "up" ? "+" : ""}
                {change}
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-tighter whitespace-nowrap truncate">
                vs prior
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-15 relative overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-1 grid-rows-1 items-stretch">
            <ChartContainer
              config={chartConfig}
              className="w-full self-stretch"
            >
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${value.toLocaleString()}`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? "" : "";
  return `${sign}${change.toFixed(1)}%`;
}

interface MetricTilesProps {
  missionaryId: string;
}

export function MetricTiles({ missionaryId }: MetricTilesProps) {
  const { thisMonth, lastMonth, yearToDate, isLoading, error } =
    useDonationMetrics(missionaryId);

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        <Card>Unable to load donation metrics</Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
      <MetricTile
        title="This Month"
        amount={formatCurrency(thisMonth.total)}
        change={formatChange(thisMonth.change)}
        trend={thisMonth.trend}
        data={thisMonth.data}
        color="var(--chart-1)"
        isLoading={isLoading}
      />
      <MetricTile
        title="Last Month"
        amount={formatCurrency(lastMonth.total)}
        change={formatChange(lastMonth.change)}
        trend={lastMonth.trend}
        data={lastMonth.data}
        color="var(--chart-2)"
        isLoading={isLoading}
      />
      <MetricTile
        title="Year to Date"
        amount={formatCurrency(yearToDate.total)}
        change={formatChange(yearToDate.change)}
        trend={yearToDate.trend}
        data={yearToDate.data}
        color="var(--chart-3)"
        isLoading={isLoading}
      />
    </div>
  );
}
