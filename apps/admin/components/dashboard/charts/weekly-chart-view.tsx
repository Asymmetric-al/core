"use client";

import { useReducedMotion } from "@asym/lib/motion";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { WeeklyDataPoint } from "./chart-data-types";
import type { CSSProperties } from "react";

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

export function WeeklyChartView({ data, height = 200 }: WeeklyChartProps) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      className="h-(--chart-height)"
      style={{ "--chart-height": `${height}px` } as CSSProperties}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartConfig.margin}>
          <XAxis
            dataKey="day"
            stroke={chartConfig.axis.stroke}
            fontSize={chartConfig.axis.fontSize}
            tickLine={chartConfig.axis.tickLine}
            axisLine={chartConfig.axis.axisLine}
            dy={8}
          />
          <YAxis
            stroke={chartConfig.axis.stroke}
            fontSize={chartConfig.axis.fontSize}
            tickLine={chartConfig.axis.tickLine}
            axisLine={chartConfig.axis.axisLine}
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
          <Bar
            isAnimationActive={!reduceMotion}
            dataKey="amount"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
