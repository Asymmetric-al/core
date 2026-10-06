"use client";
import { useReducedMotion } from "@asym/lib/motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const MINISTRY_HEALTH_TREND = [
  { month: "Jan", giving: 64, engagement: 58, care: 72 },
  { month: "Feb", giving: 68, engagement: 62, care: 70 },
  { month: "Mar", giving: 71, engagement: 66, care: 76 },
  { month: "Apr", giving: 74, engagement: 69, care: 73 },
  { month: "May", giving: 79, engagement: 72, care: 78 },
  { month: "Jun", giving: 83, engagement: 76, care: 81 },
];
const MINISTRY_HEALTH_MIX = [
  { area: "Giving", healthy: 83, watch: 12, risk: 5 },
  { area: "People", healthy: 76, watch: 18, risk: 6 },
  { area: "Care", healthy: 81, watch: 14, risk: 5 },
  { area: "Events", healthy: 69, watch: 22, risk: 9 },
];
export function MinistryHealthTrendChart() {
  const reduceMotion = useReducedMotion();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={MINISTRY_HEALTH_TREND}
        margin={{ top: 8, right: 16, bottom: 4, left: -16 }}
      >
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={34}
          domain={[0, 100]}
          tickFormatter={(value: number) => `${value}%`}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          cursor={{ stroke: "var(--border)" }}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--foreground)",
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
          }}
          formatter={(value: number, name: string) => [`${value}%`, name]}
        />
        <Line
          isAnimationActive={!reduceMotion}
          type="monotone"
          dataKey="giving"
          name="Giving"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          isAnimationActive={!reduceMotion}
          type="monotone"
          dataKey="engagement"
          name="Engagement"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          isAnimationActive={!reduceMotion}
          type="monotone"
          dataKey="care"
          name="Care"
          stroke="var(--chart-5)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
export function MinistryHealthMixChart() {
  const reduceMotion = useReducedMotion();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={MINISTRY_HEALTH_MIX}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 4, left: 12 }}
      >
        <CartesianGrid
          horizontal={false}
          stroke="var(--border)"
          strokeDasharray="3 3"
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => `${value}%`}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          type="category"
          dataKey="area"
          width={78}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--foreground)" }}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--foreground)",
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
          }}
          formatter={(value: number, name: string) => [`${value}%`, name]}
        />
        <Bar
          isAnimationActive={!reduceMotion}
          dataKey="healthy"
          name="Healthy"
          stackId="health"
          fill="var(--chart-2)"
          radius={[4, 0, 0, 4]}
        />
        <Bar
          isAnimationActive={!reduceMotion}
          dataKey="watch"
          name="Watch"
          stackId="health"
          fill="var(--chart-4)"
        />
        <Bar
          isAnimationActive={!reduceMotion}
          dataKey="risk"
          name="Risk"
          stackId="health"
          fill="var(--chart-5)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
