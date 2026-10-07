"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import dynamic from "next/dynamic";

import type { SupportReportSeries } from "../../types";

interface ReportBarChartProps {
  series: SupportReportSeries;
  title: string;
  description?: string;
}

function Fallback() {
  return (
    <div className="h-70 w-full animate-pulse rounded-xl bg-muted/40 ring-1 ring-border" />
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
      title,
    }: {
      series: SupportReportSeries;
      title: string;
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
            className="h-full w-full aspect-auto"
            config={{ value: { label: title, color: "var(--chart-1)" } }}
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
}: ReportBarChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pl-0">
        <BarChartContent series={series} title={title} />
      </CardContent>
    </Card>
  );
}
