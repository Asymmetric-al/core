"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import dynamic from "next/dynamic";

export interface GivingByFundPoint {
  label: string;
  amount: number;
}

export interface DonorsByFundPoint {
  label: string;
  donors: number;
}

interface ReportsChartsProps {
  giving: GivingByFundPoint[];
  donors: DonorsByFundPoint[];
  isEmpty: boolean;
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-xl border border-border bg-muted/40"
      style={{ height }}
    />
  );
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 text-center text-sm font-medium text-muted-foreground">
      {message}
    </div>
  );
}

const GivingChart = dynamic<{ data: GivingByFundPoint[] }>(
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

    function GivingChartInner({ data }: { data: GivingByFundPoint[] }) {
      return (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={0}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
                tickFormatter={(value: number) =>
                  `$${Math.round(value / 1000)}k`
                }
              />
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString("en-US")}`,
                  "Giving",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmt)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return GivingChartInner;
  },
  {
    ssr: false,
    loading: () => <ChartSkeleton height={320} />,
  },
);

const DonorsChart = dynamic<{ data: DonorsByFundPoint[] }>(
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

    function DonorsChartInner({ data }: { data: DonorsByFundPoint[] }) {
      return (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={24}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="label"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={0}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                stroke="var(--muted-foreground)"
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                formatter={(value: number) => [value, "Donors"]}
              />
              <Bar
                dataKey="donors"
                name="Donors"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return DonorsChartInner;
  },
  {
    ssr: false,
    loading: () => <ChartSkeleton height={300} />,
  },
);

export function ReportsCharts({ donors, giving, isEmpty }: ReportsChartsProps) {
  return (
    <div className="grid gap-4 text-left md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4 rounded-2xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Giving by Fund
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            Completed giving by fund (top funds).
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          {isEmpty ? (
            <ChartEmptyState message="No completed giving in range." />
          ) : (
            <GivingChart data={giving} />
          )}
        </CardContent>
      </Card>

      <Card className="col-span-3 rounded-2xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Donors by Fund
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            Unique donors giving to each fund.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          {isEmpty ? (
            <ChartEmptyState message="No donors in range." />
          ) : (
            <DonorsChart data={donors} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
