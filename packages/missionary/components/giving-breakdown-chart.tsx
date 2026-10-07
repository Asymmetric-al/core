"use client";
import { useDonationMetrics } from "@asym/lib/hooks";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import * as React from "react";

function GivingBreakdownSkeleton() {
  return (
    <div className="h-50 sm:h-62.5 md:h-75 w-full flex flex-col">
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
}

/**
 * GivingBreakdownChart displays a stacked bar chart showing donation trends
 * over 13 months, broken down by donation type:
 * - Recurring: Monthly automated donations
 * - One-Time: Single online donations
 * - Offline: Checks, cash, and other offline gifts
 */
export function GivingBreakdownChart({
  missionaryId,
}: GivingBreakdownChartProps) {
  const { monthlyBreakdown, isLoading, error } =
    useDonationMetrics(missionaryId);

  if (isLoading) {
    return <GivingBreakdownSkeleton />;
  }

  if (error) {
    return (
      <div className="h-50 sm:h-62.5 md:h-75 w-full flex items-center justify-center text-sm text-muted-foreground">
        Unable to load chart data
      </div>
    );
  }

  const hasData = monthlyBreakdown.some((m) => m.total > 0);

  if (!hasData) {
    return (
      <div className="h-50 sm:h-62.5 md:h-75 w-full flex items-center justify-center text-sm text-muted-foreground">
        No donation data available
      </div>
    );
  }

  return (
    <React.Suspense fallback={<GivingBreakdownSkeleton />}>
      <GivingBreakdownView monthlyBreakdown={monthlyBreakdown} />
    </React.Suspense>
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
