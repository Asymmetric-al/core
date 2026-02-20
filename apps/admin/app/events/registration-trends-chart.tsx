"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import dynamic from "next/dynamic";

import type { ComponentType } from "react";
import type * as Recharts from "recharts";

function dynamicRechartsComponent(
  exportName: keyof typeof Recharts,
): ComponentType<Record<string, unknown>> {
  return dynamic(
    async () => {
      const recharts = await import("recharts");
      return recharts[exportName] as unknown as ComponentType<
        Record<string, unknown>
      >;
    },
    { ssr: false },
  );
}

const Area = dynamicRechartsComponent("Area");
const AreaChart = dynamicRechartsComponent("AreaChart");
const CartesianGrid = dynamicRechartsComponent("CartesianGrid");
const ResponsiveContainer = dynamicRechartsComponent("ResponsiveContainer");
const Tooltip = dynamicRechartsComponent("Tooltip");
const XAxis = dynamicRechartsComponent("XAxis");
const YAxis = dynamicRechartsComponent("YAxis");

const REGISTRATION_TRENDS = [
  { date: "Aug 1", count: 120 },
  { date: "Aug 8", count: 180 },
  { date: "Aug 15", count: 240 },
  { date: "Aug 22", count: 310 },
  { date: "Aug 29", count: 380 },
  { date: "Sep 5", count: 450 },
];

export function RegistrationTrendsChart() {
  return (
    <Card className="col-span-4 overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/30">
        <CardTitle className="text-base font-bold">
          Registration Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REGISTRATION_TRENDS}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
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
