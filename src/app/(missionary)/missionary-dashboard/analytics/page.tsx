"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  DollarSign,
  Target,
  Calendar,
  Download,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartCard,
  KpiTile,
  ChartLegend,
  ChartTooltip,
} from "@/components/ui/chart-wrappers";

const monthlyData = [
  { month: "Jul", total: 3200, recurring: 2800, oneTime: 400 },
  { month: "Aug", total: 3450, recurring: 2900, oneTime: 550 },
  { month: "Sep", total: 3100, recurring: 2850, oneTime: 250 },
  { month: "Oct", total: 4200, recurring: 3000, oneTime: 1200 },
  { month: "Nov", total: 3800, recurring: 3100, oneTime: 700 },
  { month: "Dec", total: 4250, recurring: 3250, oneTime: 1000 },
];

const donorSegments = [
  { name: "Active", value: 4, color: "#18181b" },
  { name: "New", value: 2, color: "#71717a" },
  { name: "At Risk", value: 1, color: "#eab308" },
  { name: "Lapsed", value: 1, color: "#a1a1aa" },
];

const yearOverYear = [
  { month: "Jan", current: 3500, previous: 3200 },
  { month: "Feb", current: 3800, previous: 3100 },
  { month: "Mar", current: 4100, previous: 3400 },
  { month: "Apr", current: 3900, previous: 3600 },
  { month: "May", current: 4200, previous: 3800 },
  { month: "Jun", current: 4000, previous: 3500 },
  { month: "Jul", current: 3200, previous: 3000 },
  { month: "Aug", current: 3450, previous: 3200 },
  { month: "Sep", current: 3100, previous: 2900 },
  { month: "Oct", current: 4200, previous: 3700 },
  { month: "Nov", current: 3800, previous: 3400 },
  { month: "Dec", current: 4250, previous: 3600 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Analytics"
        description="Detailed insights into your support network and trends."
      >
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs font-medium"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button size="sm" className="h-9 px-4 text-xs font-medium">
          <Sparkles className="mr-2 h-4 w-4" />
          Insights
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Monthly Support"
          value="$4,250"
          subtitle="of $5,000 goal"
          delta={{ value: "12%", trend: "up", label: "vs last month" }}
          icon={DollarSign}
        />
        <KpiTile
          label="Active Partners"
          value="42"
          subtitle="+3 this month"
          delta={{ value: "8%", trend: "up", label: "vs last month" }}
          icon={Users}
        />
        <KpiTile
          label="Retention Rate"
          value="94.2%"
          subtitle="Past 12 months"
          delta={{ value: "2%", trend: "up", label: "vs last year" }}
          icon={Target}
        />
        <KpiTile
          label="Avg. Gift Size"
          value="$101"
          subtitle="Per partner"
          delta={{ value: "4%", trend: "down", label: "vs last month" }}
          icon={Calendar}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Giving Trends"
          description="Support Overview"
          actions={
            <Select defaultValue="6m">
              <SelectTrigger className="w-[100px] h-8 rounded-lg text-[9px] font-bold uppercase tracking-wider border-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-zinc-100">
                <SelectItem value="6m">Last 6m</SelectItem>
                <SelectItem value="12m">Last 12m</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <div className="h-[250px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={6}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 700, fill: "#a1a1aa" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 700, fill: "#a1a1aa" }}
                  tickFormatter={(value) => `$${value}`}
                  width={35}
                />
                <Tooltip
                  cursor={{ fill: "#f4f4f5", radius: 4 }}
                  content={<ChartTooltip />}
                />
                <Bar
                  dataKey="recurring"
                  fill="#18181b"
                  radius={[3, 3, 0, 0]}
                  name="Recurring"
                />
                <Bar
                  dataKey="oneTime"
                  fill="#e4e4e7"
                  radius={[3, 3, 0, 0]}
                  name="One-time"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Partner Segments"
          description="Breakdown"
          footer={
            <ChartLegend
              items={donorSegments.map((s) => ({
                label: s.name,
                color: s.color,
                value: s.value,
              }))}
            />
          }
        >
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donorSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donorSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Yearly Performance"
        description="YOY Comparison"
        actions={
          <Badge className="bg-emerald-50 text-emerald-700 border-0 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider">
            +12.4% vs 2023
          </Badge>
        }
      >
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearOverYear}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.06} />
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: "#a1a1aa" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: "#a1a1aa" }}
                tickFormatter={(value) => `$${value}`}
                width={35}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#18181b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCurrent)"
                name="2024"
              />
              <Area
                type="monotone"
                dataKey="previous"
                stroke="#e4e4e7"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="transparent"
                name="2023"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
