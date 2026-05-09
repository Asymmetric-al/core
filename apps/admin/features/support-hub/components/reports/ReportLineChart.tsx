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

interface ReportLineChartProps {
  series: SupportReportSeries;
  title: string;
  description?: string;
}

function Fallback() {
  return (
    <div className="h-[280px] w-full animate-pulse rounded-xl bg-zinc-50 ring-1 ring-zinc-100" />
  );
}

const LineChartContent = dynamic(
  async () => {
    const {
      Area,
      AreaChart,
      CartesianGrid,
      ResponsiveContainer,
      Tooltip,
      XAxis,
      YAxis,
    } = await import("recharts");

    function LineChartInner({ series }: { series: SupportReportSeries }) {
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
            <AreaChart
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="support-line" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e4e4e7",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#18181b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#support-line)"
              />
            </AreaChart>
          </ResponsiveContainer>
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
        <LineChartContent series={series} />
      </CardContent>
    </Card>
  );
}
