'use client'

import { memo, useId } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface RevenueDataPoint {
  name: string
  revenue: number
  donors?: number
}

interface RevenueChartProps {
  data: RevenueDataPoint[]
  height?: number
}

const chartConfig = {
  margin: { top: 8, right: 8, left: 0, bottom: 0 },
  axis: {
    stroke: '#a1a1aa',
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'var(--background)',
      borderColor: 'var(--border)',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      fontSize: '13px',
    },
    itemStyle: { color: 'var(--foreground)' },
  },
}

export const RevenueChart = memo(function RevenueChart({ data, height = 280 }: RevenueChartProps) {
  const id = useId()
  const gradientId = `revenueGradient-${id.replace(/:/g, '')}`

  return (
    <div style={{ height }}>
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
            {...chartConfig.axis}
            dy={8}
          />
          <YAxis
            {...chartConfig.axis}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            dx={-8}
          />
          <Tooltip
            contentStyle={chartConfig.tooltip.contentStyle}
            itemStyle={chartConfig.tooltip.itemStyle}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})
