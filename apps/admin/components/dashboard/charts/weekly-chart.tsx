"use client";
import { lazy, memo, Suspense } from "react";

import type { WeeklyDataPoint } from "./chart-data-types";
export type { WeeklyDataPoint } from "./chart-data-types";
interface WeeklyChartProps {
  data: WeeklyDataPoint[];
  height?: number;
}
const ChartView = lazy(() =>
  import("./weekly-chart-view").then((module) => ({
    default: module.WeeklyChartView,
  })),
);
export const WeeklyChart = memo(function WeeklyChart({
  data,
  height = 200,
}: WeeklyChartProps) {
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
