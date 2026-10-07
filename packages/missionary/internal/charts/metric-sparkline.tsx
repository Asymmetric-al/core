"use client";
import { useReducedMotion } from "@asym/lib/motion";
import {
  ChartContainer,
  type ChartConfig,
} from "@asym/ui/components/shadcn/chart";
import { Area, AreaChart } from "recharts";

import type { ChartDataPoint } from "@asym/lib/hooks";
const chartConfig = {
  value: {
    label: "Amount",
    color: "var(--primary)",
  },
} satisfies ChartConfig;
export default function MetricSparkline({
  chartData,
  color,
  gradientId,
}: {
  chartData: ChartDataPoint[];
  color: string;
  gradientId: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <ChartContainer config={chartConfig} className="w-full self-stretch">
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={!reduceMotion}
          animationDuration={800}
        />
      </AreaChart>
    </ChartContainer>
  );
}
