"use client";

import { ChartCard } from "@asym/ui/components/primitives/chart-wrappers";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import dynamic from "next/dynamic";

import type { SupportReportSeries } from "../../types";

interface ReportBarChartProps {
  series: SupportReportSeries;
  title: string;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  note?: string;
  /** Tooltip name for the bar values; defaults to the title. */
  valueLabel?: string;
}

function Fallback() {
  return (
    <div role="status" aria-label="Loading chart">
      <Skeleton className="h-70 w-full" />
      <span className="sr-only">Loading chart…</span>
    </div>
  );
}

const BarChartContent = dynamic(
  async () => {
    const [
      { Bar, BarChart, CartesianGrid, XAxis, YAxis },
      { ChartContainer, ChartTooltip, ChartTooltipContent },
    ] = await Promise.all([
      import("recharts"),
      import("@asym/ui/components/shadcn/chart"),
    ]);

    function BarChartInner({
      series,
      valueLabel,
    }: {
      series: SupportReportSeries;
      valueLabel: string;
    }) {
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
      return (
        <div className="h-70 w-full">
          <ChartContainer
            layout="fill"
            className="w-full"
            config={{ value: { label: valueLabel, color: "var(--chart-1)" } }}
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
              barSize={24}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="label"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
                allowDecimals={false}
              />
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

    return BarChartInner;
  },
  { ssr: false, loading: () => <Fallback /> },
);

export function ReportBarChart({
  series,
  title,
  description,
  isLoading = false,
  isError = false,
  onRetry,
  valueLabel,
  note,
}: ReportBarChartProps) {
  return (
    <ChartCard
      title={title}
      description={description}
      headingLevel={2}
      summary={series.buckets
        .map(
          (bucket) =>
            `${bucket.label}: ${bucket.value} ${valueLabel?.toLowerCase() ?? (series.unit === "count" ? title.toLowerCase() : series.unit)}.`,
        )
        .join(" ")}
      note={note}
      isLoading={isLoading && !isError}
      isError={isError}
      isEmpty={series.buckets.every((bucket) => bucket.value === 0)}
      emptyMessage="No activity in this range"
      onRetry={onRetry}
    >
      <BarChartContent series={series} valueLabel={valueLabel ?? title} />
    </ChartCard>
  );
}
