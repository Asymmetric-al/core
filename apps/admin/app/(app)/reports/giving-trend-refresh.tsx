"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import type { GivingTrend } from "@asym/api/reads/dashboard-stats";

import { GivingTrendCard } from "@/features/mission-control/components/giving-trend-card";

const TITLE = "Net giving by month";

/**
 * The server-read trend, with Try again re-running the server read. It
 * keeps its own fixed period, so it says the page's selection doesn't apply.
 */
export function RefreshableGivingTrendCard({
  trend,
}: {
  trend: GivingTrend | null;
}) {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();
  const retry = () => startRetry(() => router.refresh());
  if (trend === null && !isRetrying) {
    // A compact notice: the chart card's error state took ~340px for one
    // sentence.
    return (
      <section aria-label={TITLE}>
        <Alert>
          <AlertTitle>{TITLE} couldn&apos;t load</AlertTitle>
          <AlertDescription>
            <p>The figures for the selection above are not affected.</p>
            <Button variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </section>
    );
  }
  return (
    <GivingTrendCard
      trend={trend}
      isLoading={isRetrying}
      onRetry={retry}
      scopeNote="The grouping and period above don't change it."
    />
  );
}
