"use client";

import { useReducedMotion } from "@asym/lib/motion";
import { useId } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenueDataPoint } from "./chart-data-types";
import type { CSSProperties } from "react";

interface RevenueChartProps {
  data: RevenueDataPoint[];
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
    itemStyle: { color: "var(--foreground)" },
  },
};

export function RevenueChartView({ data, height = 280 }: RevenueChartProps) {
  const reduceMotion = useReducedMotion();
  const id = useId();
  const gradientId = `revenueGradient-${id.replace(/:/g, "")}`;

  return (
    <div
      className="h-(--chart-height)"
      style={{ "--chart-height": `${height}px` } as CSSProperties}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={chartConfig.margin}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.12} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
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
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            dx={-8}
          />
          <Tooltip
            contentStyle={chartConfig.tooltip.contentStyle}
            itemStyle={chartConfig.tooltip.itemStyle}
            formatter={(value) =>
              typeof value === "number"
                ? [`$${value.toLocaleString()}`, "Revenue"]
                : null
            }
          />
          <Area
            isAnimationActive={!reduceMotion}
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
