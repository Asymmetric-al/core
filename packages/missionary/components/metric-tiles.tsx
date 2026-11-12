"use client";

import { useDonationMetrics, type ChartDataPoint } from "@asym/lib/hooks";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import * as React from "react";

import {
  formatCents,
  formatCurrencyFromCents,
  moneyCurrency,
  MONEY_UNAVAILABLE,
} from "./money-units";

interface MetricTileProps {
  title: string;
  amount: string;
  exactAmount: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  data: ChartDataPoint[];
  color?: string;
  isLoading?: boolean;
}

function MetricTileSkeleton({ title }: { title: string }) {
  return (
    <Card role="status" aria-atomic="true">
      <span className="sr-only">Loading {title}</span>
      <CardContent className="p-0 flex flex-row items-stretch h-18 md:h-20">
        <div className="flex min-w-25 max-w-3/5 shrink-0 flex-col justify-between p-2.5 pr-3 sm:min-w-30">
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
  exactAmount,
  change,
  trend,
  data,
  color = "var(--primary)",
  isLoading,
}: MetricTileProps) {
  const gradientId = React.useId();

  if (isLoading) {
    return <MetricTileSkeleton title={title} />;
  }

  return (
    <Card>
      <CardContent className="p-0 flex flex-row items-stretch min-h-24">
        <div className="flex flex-col justify-between p-2.5 pr-3 shrink-0 min-w-25 sm:min-w-30 max-w-3/5">
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted-foreground leading-none mb-1 truncate">
              {title}
            </p>
            <h3
              aria-label={exactAmount}
              title={exactAmount}
              className="wrap-anywhere text-lg md:text-xl font-semibold text-foreground tracking-tighter leading-tight"
            >
              {amount}
            </h3>
          </div>
          {change !== undefined ? (
            <div className="flex min-w-0 items-center gap-1">
              <Badge variant="secondary">
                {trend === "up" ? "+" : ""}
                {change}
              </Badge>
              <span className="min-w-0 truncate text-xs text-muted-foreground">
                vs prior
              </span>
            </div>
          ) : (
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              No prior-period comparison
            </p>
          )}
        </div>
        <div className="flex-1 min-w-15 relative overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-1 grid-rows-1 items-stretch">
            <React.Suspense
              fallback={<div aria-hidden className="size-full bg-muted/30" />}
            >
              {data.length > 0 ? (
                <MetricSparkline
                  chartData={data}
                  color={color}
                  gradientId={gradientId}
                />
              ) : null}
            </React.Suspense>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Undefined when there is no prior period to compare against. */
function formatChange(change: number | null): string | undefined {
  return change === null ? undefined : `${change.toFixed(1)}%`;
}

interface MetricTilesProps {
  missionaryId: string;
}

export function MetricTiles({ missionaryId }: MetricTilesProps) {
  const { thisMonth, lastMonth, yearToDate, isLoading, error, currency } =
    useDonationMetrics(missionaryId);
  const qualifiedCurrency = moneyCurrency(currency);

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        <Card role="alert">Unable to load donation metrics</Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
      {!isLoading && !qualifiedCurrency ? (
        <p className="col-span-full text-sm text-muted-foreground">
          {MONEY_UNAVAILABLE}
        </p>
      ) : null}
      <MetricTile
        title="This Month"
        amount={formatCurrencyFromCents(thisMonth.total, currency)}
        exactAmount={formatCents(thisMonth.total, currency)}
        change={qualifiedCurrency ? formatChange(thisMonth.change) : undefined}
        trend={thisMonth.trend}
        data={qualifiedCurrency ? thisMonth.data : []}
        color="var(--chart-1)"
        isLoading={isLoading}
      />
      <MetricTile
        title="Last Month"
        amount={formatCurrencyFromCents(lastMonth.total, currency)}
        exactAmount={formatCents(lastMonth.total, currency)}
        change={qualifiedCurrency ? formatChange(lastMonth.change) : undefined}
        trend={lastMonth.trend}
        data={qualifiedCurrency ? lastMonth.data : []}
        color="var(--chart-2)"
        isLoading={isLoading}
      />
      <MetricTile
        title="Year to Date"
        amount={formatCurrencyFromCents(yearToDate.total, currency)}
        exactAmount={formatCents(yearToDate.total, currency)}
        change={qualifiedCurrency ? formatChange(yearToDate.change) : undefined}
        trend={yearToDate.trend}
        data={qualifiedCurrency ? yearToDate.data : []}
        color="var(--chart-3)"
        isLoading={isLoading}
      />
    </div>
  );
}

const MetricSparkline = React.lazy(
  () => import("../internal/charts/metric-sparkline"),
);
