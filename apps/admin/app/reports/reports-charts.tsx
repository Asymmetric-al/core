"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import dynamic from "next/dynamic";

interface DonationPoint {
  month: string;
  amount: number;
}

interface EngagementPoint {
  month: string;
  new: number;
  retained: number;
  lapsed: number;
}

interface ReportsChartsProps {
  donationData: DonationPoint[];
  engagementData: EngagementPoint[];
}

function ReportsChartsFallback() {
  return (
    <div className="grid gap-4 text-left md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4 border-zinc-100 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Giving Trends
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            Monthly volume across all regions.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <div className="h-[320px] w-full rounded-xl border border-zinc-100 bg-zinc-50/60" />
        </CardContent>
      </Card>

      <Card className="col-span-3 border-zinc-100 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Donor Engagement
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            New, retained, and lapsed donor movement.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <div className="h-[300px] w-full rounded-xl border border-zinc-100 bg-zinc-50/60" />
        </CardContent>
      </Card>
    </div>
  );
}

const ReportsChartsContent = dynamic<ReportsChartsProps>(
  async () => {
    const {
      Area,
      AreaChart,
      Bar,
      BarChart,
      CartesianGrid,
      ResponsiveContainer,
      Tooltip,
      XAxis,
      YAxis,
    } = await import("recharts");

    function ReportsChartsContentInner({
      donationData,
      engagementData,
    }: ReportsChartsProps) {
      return (
        <div className="grid gap-4 text-left md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-zinc-100 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Giving Trends
              </CardTitle>
              <CardDescription className="text-xs font-medium">
                Monthly volume across all regions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={donationData}
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
                      dataKey="month"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted-foreground)"
                      tickFormatter={(value: number) => `$${value / 1000}k`}
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border)"
                    />
                    <Tooltip
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
            </CardContent>
          </Card>

          <Card className="col-span-3 border-zinc-100 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Donor Engagement
              </CardTitle>
              <CardDescription className="text-xs font-medium">
                New, retained, and lapsed donor movement.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={engagementData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={24}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="month"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip cursor={{ fill: "var(--muted)" }} />
                    <Bar
                      dataKey="retained"
                      name="Retained"
                      stackId="a"
                      fill="var(--chart-1)"
                    />
                    <Bar
                      dataKey="new"
                      name="New"
                      stackId="a"
                      fill="var(--chart-2)"
                    />
                    <Bar
                      dataKey="lapsed"
                      name="Lapsed"
                      stackId="a"
                      fill="var(--muted)"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return ReportsChartsContentInner;
  },
  {
    ssr: false,
    loading: () => <ReportsChartsFallback />,
  },
);

export function ReportsCharts(props: ReportsChartsProps) {
  return <ReportsChartsContent {...props} />;
}
