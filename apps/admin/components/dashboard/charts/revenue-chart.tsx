"use client";
import { lazy, memo, Suspense } from "react";

import type { RevenueDataPoint } from "./chart-data-types";
export type { RevenueDataPoint } from "./chart-data-types";
interface RevenueChartProps {
  data: RevenueDataPoint[];
  height?: number;
}
const ChartView = lazy(() =>
  import("./revenue-chart-view").then((module) => ({
    default: module.RevenueChartView,
  })),
);
export const RevenueChart = memo(function RevenueChart({
  data,
  height = 280,
}: RevenueChartProps) {
  return (
    <Suspense
      fallback={
        <div
          style={{ height }}
          className="h-(--chart-height) rounded-lg bg-muted/30"
          role="status"
          aria-label="Loading chart"
        />
      }
    >
      <ChartView data={data} height={height} />
    </Suspense>
  );
});
