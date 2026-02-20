"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

export function ReportsCharts({
  donationData,
  engagementData,
}: ReportsChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 text-left">
      <Card className="col-span-4 border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider">
            Giving Trends
          </CardTitle>
          <CardDescription className="text-xs">
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
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3 border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider">
            Donor Engagement
          </CardTitle>
          <CardDescription className="text-xs">
            Retention velocity (6 Month).
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
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar
                  dataKey="retained"
                  name="Retained"
                  stackId="a"
                  fill="#0f172a"
                />
                <Bar dataKey="new" name="New" stackId="a" fill="#3b82f6" />
                <Bar
                  dataKey="lapsed"
                  name="Lapsed"
                  stackId="a"
                  fill="#e2e8f0"
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
