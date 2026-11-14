"use client";
import { useDonationMetrics } from "@asym/lib/hooks";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import * as React from "react";

import { MONEY_UNAVAILABLE, moneyCurrency } from "./money-units";

import type { DonationMetrics } from "@asym/lib/hooks";

function GivingBreakdownSkeleton() {
  return (
    <div className="h-64 sm:h-72 w-full flex flex-col">
      <div className="flex-1 flex items-end justify-around gap-1 px-4 pb-6">
        {SKELETON_BARS.map(({ id, height }) => (
          <div
            key={id}
            className="h-full flex-1 flex flex-col items-center justify-end gap-1"
          >
            <Skeleton
              className="h-(--skeleton-bar-height) w-full rounded-t-sm"
              style={
                {
                  "--skeleton-bar-height": `${height}%`,
                } as React.CSSProperties
              }
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

interface GivingBreakdownChartProps {
  missionaryId: string;
  committedCents?: number | null;
  committedCurrency?: string | null;
}

/**
 * Giving over the last 13 months as stacked bars by gift type (recurring,
 * one-time, offline), from metrics the caller already holds.
 */
export function GivingBreakdownChartContent({
  metrics,
  committedCents,
  committedCurrency,
}: {
  metrics: Pick<
    DonationMetrics,
    "monthlyBreakdown" | "isLoading" | "error" | "currency"
  >;
  committedCents?: number | null;
  committedCurrency?: string | null;
}) {
  const { monthlyBreakdown, isLoading, error } = metrics;

  if (isLoading) {
    return <GivingBreakdownSkeleton />;
  }

  if (error) {
    return (
      <div className="h-64 sm:h-72 w-full flex items-center justify-center text-sm text-muted-foreground">
        We couldn’t load your giving chart.
      </div>
    );
  }

  const currency = moneyCurrency(metrics.currency);
  if (!currency) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        {MONEY_UNAVAILABLE}
      </p>
    );
  }

  const hasData = monthlyBreakdown.some((m) => m.total > 0);

  if (!hasData) {
    return (
      <div className="h-64 sm:h-72 w-full flex items-center justify-center text-sm text-muted-foreground">
        No gifts in the last 13 months yet.
      </div>
    );
  }

  return (
    <React.Suspense fallback={<GivingBreakdownSkeleton />}>
      <GivingBreakdownView
        monthlyBreakdown={monthlyBreakdown}
        currency={currency}
        committedCents={committedCents}
        committedCurrency={committedCurrency}
      />
    </React.Suspense>
  );
}

/** The giving chart for a missionary, fetching its own metrics. */
export function GivingBreakdownChart({
  missionaryId,
  committedCents,
  committedCurrency,
}: GivingBreakdownChartProps) {
  const metrics = useDonationMetrics(missionaryId);
  return (
    <GivingBreakdownChartContent
      metrics={metrics}
      committedCents={committedCents}
      committedCurrency={committedCurrency}
    />
  );
}

const GivingBreakdownView = React.lazy(
  () => import("../internal/charts/giving-breakdown-view"),
);

const SKELETON_BARS = [
  { id: "bar-1", height: 45 },
  { id: "bar-2", height: 62 },
  { id: "bar-3", height: 38 },
  { id: "bar-4", height: 71 },
  { id: "bar-5", height: 55 },
  { id: "bar-6", height: 82 },
  { id: "bar-7", height: 48 },
  { id: "bar-8", height: 67 },
  { id: "bar-9", height: 41 },
  { id: "bar-10", height: 75 },
  { id: "bar-11", height: 58 },
  { id: "bar-12", height: 89 },
  { id: "bar-13", height: 52 },
] as const;
