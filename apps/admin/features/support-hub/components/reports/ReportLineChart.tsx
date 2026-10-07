"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import dynamic from "next/dynamic";
import { useId } from "react";

import type { SupportReportSeries } from "../../types";

interface ReportLineChartProps {
  series: SupportReportSeries;
  title: string;
  description?: string;
}

function Fallback() {
  return (
    <div className="h-70 w-full animate-pulse rounded-xl bg-muted/40 ring-1 ring-border" />
  );
}

const LineChartContent = dynamic(
  async () => {
    const [
      { Area, AreaChart, CartesianGrid, XAxis, YAxis },
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
      return (
        <div className="h-70 w-full">
          <ChartContainer
            className="h-full w-full aspect-auto"
            config={{ value: { label: title, color: "var(--chart-1)" } }}
          >
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
                    stopOpacity={0.14}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
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
}: ReportLineChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pl-0">
        <LineChartContent series={series} title={title} />
      </CardContent>
    </Card>
  );
}
