"use client";

import { memo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface WeeklyDataPoint {
  day: string;
  amount: number;
}

interface WeeklyChartProps {
  data: WeeklyDataPoint[];
  height?: number;
}

const chartConfig = {
  margin: { top: 8, right: 8, left: 0, bottom: 0 },
  axis: {
    stroke: "#a1a1aa",
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "var(--background)",
      borderColor: "var(--border)",
      borderRadius: "8px",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      fontSize: "13px",
    },
  },
};

export const WeeklyChart = memo(function WeeklyChart({
  data,
  height = 200,
}: WeeklyChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartConfig.margin}>
          <XAxis dataKey="day" {...chartConfig.axis} dy={8} />
          <YAxis
            {...chartConfig.axis}
            tickFormatter={(value) => `$${value}`}
            dx={-8}
          />
          <Tooltip
            contentStyle={chartConfig.tooltip.contentStyle}
            formatter={(value: number) => [
              `$${value.toLocaleString()}`,
              "Donations",
            ]}
          />
          <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
