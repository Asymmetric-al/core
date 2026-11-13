"use client";

import { ChartCard } from "@asym/ui/components/primitives/chart-wrappers";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import dynamic from "next/dynamic";
import { useId } from "react";

import { reportTrendChartForm } from "../../lib/report-chart-form";

import type { SupportReportSeries } from "../../types";

interface ReportLineChartProps {
  series: SupportReportSeries;
  title: string;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  note?: string;
}

function Fallback() {
  return (
    <div role="status" aria-label="Loading chart">
      <Skeleton className="h-70 w-full" />
      <span className="sr-only">Loading chart…</span>
    </div>
  );
}

const LineChartContent = dynamic(
  async () => {
    const [
      { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis },
      { ChartContainer, ChartTooltip, ChartTooltipContent },
    ] = await Promise.all([
      import("recharts"),
      import("@asym/ui/components/shadcn/chart"),
    ]);

    function LineChartInner({
      series,
      title,
    }: {
      series: SupportReportSeries;
      title: string;
    }) {
      const gradientId = `support-line-${useId().replace(/:/g, "")}`;
      if (series.buckets.length === 0) {
        return (
          <div className="flex h-70 items-center justify-center text-xs text-muted-foreground">
            No activity in the selected window.
          </div>
        );
      }
      const data = series.buckets.map((bucket) => ({
        label: bucket.label,
        value: bucket.value,
      }));
      const config = { value: { label: title, color: "var(--chart-1)" } };
      const grid = (
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--border)"
        />
      );
      const xAxis = (
        <XAxis
          dataKey="label"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke="var(--muted-foreground)"
        />
      );
      const yAxis = (
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke="var(--muted-foreground)"
          allowDecimals={false}
        />
      );
      // A month by day drawn as a curve reads as one spike over quiet days;
      // bars keep each day its own mark.
      if (reportTrendChartForm(data.length) === "bar") {
        return (
          <div className="h-70 w-full">
            <ChartContainer layout="fill" className="w-full" config={config}>
              <BarChart
                accessibilityLayer
                data={data}
                margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                maxBarSize={24}
              >
                {grid}
                {xAxis}
                {yAxis}
                <ChartTooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        );
      }
      return (
        <div className="h-70 w-full">
          <ChartContainer layout="fill" className="w-full" config={config}>
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.04}
                  />
                </linearGradient>
              </defs>
              {grid}
              {xAxis}
              {yAxis}
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      );
    }

    return LineChartInner;
  },
  { ssr: false, loading: () => <Fallback /> },
);

export function ReportLineChart({
  series,
  title,
  description,
  isLoading = false,
  isError = false,
  onRetry,
  note,
}: ReportLineChartProps) {
  return (
    <ChartCard
      title={title}
      description={description}
      headingLevel={2}
      summary={series.buckets
        .map(
          (bucket) =>
            `${bucket.label}: ${bucket.value} ${series.unit === "count" ? title.toLowerCase() : series.unit}.`,
        )
        .join(" ")}
      note={note}
      isLoading={isLoading && !isError}
      isError={isError}
      isEmpty={series.buckets.every((bucket) => bucket.value === 0)}
      emptyMessage="No activity in this range"
      onRetry={onRetry}
    >
      <LineChartContent series={series} title={title} />
    </ChartCard>
  );
}
