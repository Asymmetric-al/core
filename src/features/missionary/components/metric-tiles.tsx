"use client";

import * as React from "react";
import { Area, AreaChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useDonationMetrics, type ChartDataPoint } from "@/hooks";

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
    <Card className="overflow-hidden border-zinc-200 shadow-sm bg-white">
      <CardContent className="p-0 flex flex-row items-stretch h-[72px] md:h-[80px]">
        <div className="flex flex-col justify-between p-2.5 pr-0 flex-shrink-0 min-w-[100px] sm:min-w-[120px] max-w-[60%]">
          <div className="space-y-1.5">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex-1 min-w-[60px] relative">
          <Skeleton className="absolute inset-0 m-1 rounded-sm" />
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
    <Card className="overflow-hidden border-zinc-200 shadow-sm bg-white hover:border-zinc-300 transition-all duration-300 group rounded-xl">
      <CardContent className="p-0 flex flex-row items-stretch h-[72px] md:h-[80px]">
        <div className="flex flex-col justify-between p-2.5 pr-0 flex-shrink-0 min-w-[100px] sm:min-w-[120px] max-w-[60%]">
          <div className="space-y-0">
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-0.5 truncate">
              {title}
            </p>
            <h3 className="text-lg md:text-xl font-black text-zinc-900 tracking-tighter leading-tight">
              {amount}
            </h3>
          </div>
          {change && (
            <div className="flex items-center gap-1">
              <Badge
                variant="secondary"
                className={cn(
                  "px-1 py-0 text-[8px] font-bold border-none shrink-0",
                  trend === "up"
                    ? "bg-emerald-50 text-emerald-600"
                    : trend === "down"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-zinc-100 text-zinc-500",
                )}
              >
                {trend === "up" ? "+" : ""}
                {change}
              </Badge>
              <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-tighter whitespace-nowrap truncate">
                vs prior
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[60px] relative overflow-hidden">
          <ChartContainer
            config={chartConfig}
            className="absolute inset-0 !aspect-auto min-h-[50px]"
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
        <Card className="md:col-span-3 p-4 text-center text-sm text-zinc-500">
          Unable to load donation metrics
        </Card>
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
        color="oklch(0.627 0.265 303.891)"
        isLoading={isLoading}
      />
      <MetricTile
        title="Last Month"
        amount={formatCurrency(lastMonth.total)}
        change={formatChange(lastMonth.change)}
        trend={lastMonth.trend}
        data={lastMonth.data}
        color="oklch(0.707 0.165 254.624)"
        isLoading={isLoading}
      />
      <MetricTile
        title="Year to Date"
        amount={formatCurrency(yearToDate.total)}
        change={formatChange(yearToDate.change)}
        trend={yearToDate.trend}
        data={yearToDate.data}
        color="oklch(0.609 0.126 221.723)"
        isLoading={isLoading}
      />
    </div>
  );
}
