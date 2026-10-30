"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import dynamic from "next/dynamic";

const REGISTRATION_TRENDS = [
  { date: "Aug 1", count: 120 },
  { date: "Aug 8", count: 180 },
  { date: "Aug 15", count: 240 },
  { date: "Aug 22", count: 310 },
  { date: "Aug 29", count: 380 },
  { date: "Sep 5", count: 450 },
];

function RegistrationTrendsChartFallback() {
  return (
    <Card className="col-span-4 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base font-bold">
          Registration Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-75 rounded-xl border border-border bg-muted/50" />
      </CardContent>
    </Card>
  );
}

const RegistrationTrendsChartContent = dynamic(
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

    function RegistrationTrendsChartContentInner() {
      return (
        <Card className="col-span-4 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Registration Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REGISTRATION_TRENDS}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chart-1)"
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
                    dataKey="date"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--chart-1)"
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      );
    }

    return RegistrationTrendsChartContentInner;
  },
  {
    ssr: false,
    loading: () => <RegistrationTrendsChartFallback />,
  },
);

export function RegistrationTrendsChart() {
  return <RegistrationTrendsChartContent />;
}
