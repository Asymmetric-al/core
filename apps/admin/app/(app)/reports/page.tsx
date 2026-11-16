import { Suspense } from "react";

import { ReportsGivingTrend } from "./giving-trend-section";
import PageClient from "./page-client";

import type { Metadata } from "next";

import { GivingTrendCard } from "@/features/mission-control/components/giving-trend-card";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  // Stream: the trend reads its own data, so the report never waits for it.
  const givingTrend = (
    <Suspense fallback={<GivingTrendCard isLoading />}>
      <ReportsGivingTrend />
    </Suspense>
  );
  return <PageClient givingTrend={givingTrend} />;
}
