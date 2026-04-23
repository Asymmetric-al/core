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
    <div className="h-[280px] w-full animate-pulse rounded-xl bg-zinc-50 ring-1 ring-zinc-100" />
  );
}

const BarChartContent = dynamic(
  async () => {
    const {
      Bar,
      BarChart,
      CartesianGrid,
      ResponsiveContainer,
      Tooltip,
      XAxis,
      YAxis,
    } = await import("recharts");

    function BarChartInner({ series }: { series: SupportReportSeries }) {
      if (series.buckets.length === 0) {
        return (
          <div className="flex h-[280px] items-center justify-center text-[12px] text-zinc-400">
            No activity in the selected window.
          </div>
        );
      }
      const data = series.buckets.map((bucket) => ({
        label: bucket.label,
        value: bucket.value,
      }));
      return (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
              barSize={24}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f4f4f5"
              />
              <XAxis
                dataKey="label"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                stroke="#a1a1aa"
              />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                stroke="#a1a1aa"
                allowDecimals={false}
              />
              <Tooltip cursor={{ fill: "#fafafa" }} />
              <Bar dataKey="value" fill="#18181b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
    <Card className="rounded-2xl border-zinc-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-[12px] text-zinc-500">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pl-0">
        <BarChartContent series={series} />
      </CardContent>
    </Card>
  );
}
