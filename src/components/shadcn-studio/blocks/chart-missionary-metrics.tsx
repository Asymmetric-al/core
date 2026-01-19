"use client";

import {
  HeartHandshakeIcon,
  ChartNoAxesCombinedIcon,
  CirclePercentIcon,
  DollarSignIcon,
  UsersIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Bar, BarChart, Label, Pie, PieChart } from "recharts";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const supportGoalPercentage = 85;
const totalBars = 24;
const filledBars = Math.round((supportGoalPercentage * totalBars) / 100);

const supportChartData = Array.from({ length: totalBars }, (_, index) => {
  const date = new Date(2025, 11, 15);

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return {
    date: formattedDate,
    support: index < filledBars ? 315 : 0,
  };
});

const supportChartConfig = {
  support: {
    label: "Support Raised",
  },
} satisfies ChartConfig;

const MetricsData = [
  {
    icons: <TrendingUpIcon className="size-5" />,
    title: "Monthly Support",
    value: "$4,250",
  },
  {
    icons: <HeartHandshakeIcon className="size-5" />,
    title: "Recurring Gifts",
    value: "$3,800",
  },
  {
    icons: <DollarSignIcon className="size-5" />,
    title: "Year to Date",
    value: "$48,500",
  },
  {
    icons: <UsersIcon className="size-5" />,
    title: "Active Supporters",
    value: "42",
  },
];

const fundingChartData = [
  { month: "recurring", amount: 3800, fill: "var(--color-recurring)" },
  { month: "one-time", amount: 450, fill: "var(--color-one-time)" },
  { month: "special", amount: 250, fill: "var(--color-special)" },
];

const fundingChartConfig = {
  amount: {
    label: "Amount",
  },
  recurring: {
    label: "Recurring",
    color: "var(--primary)",
  },
  "one-time": {
    label: "One-time",
    color: "color-mix(in oklab, var(--primary) 60%, transparent)",
  },
  special: {
    label: "Special Gifts",
    color: "color-mix(in oklab, var(--primary) 20%, transparent)",
  },
} satisfies ChartConfig;

const MissionaryMetricsCard = ({ className }: { className?: string }) => {
  return (
    <Card className={className}>
      <CardContent className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-7 lg:col-span-3">
            <span className="text-lg font-semibold">Ministry Metrics</span>
            <div className="flex items-center gap-3">
              <div className="flex h-10.5 w-10.5 items-center justify-center rounded-lg bg-emerald-100">
                <HeartHandshakeIcon className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xl font-medium">Your Ministry</span>
                <span className="text-muted-foreground text-sm">
                  Support Overview
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {MetricsData.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-md border px-4 py-2"
                >
                  <Avatar className="size-8.5 rounded-sm">
                    <AvatarFallback className="bg-primary/10 text-primary shrink-0 rounded-sm">
                      {metric.icons}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-sm font-medium">
                      {metric.title}
                    </span>
                    <span className="text-lg font-medium">{metric.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="gap-4 py-4 shadow-none lg:col-span-2">
            <CardHeader className="gap-1">
              <CardTitle className="text-lg font-semibold">
                Funding Goal
              </CardTitle>
            </CardHeader>

            <CardContent className="px-0">
              <ChartContainer
                config={fundingChartConfig}
                className="h-38.5 w-full"
              >
                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={fundingChartData}
                    dataKey="amount"
                    nameKey="month"
                    startAngle={300}
                    endAngle={660}
                    innerRadius={58}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 12}
                                className="fill-card-foreground text-lg font-medium"
                              >
                                $4,250
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 19}
                                className="fill-muted-foreground text-sm"
                              >
                                Monthly Total
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>

            <CardFooter className="justify-between">
              <span className="text-xl">Goal Progress</span>
              <span className="text-2xl font-medium">
                {supportGoalPercentage}%
              </span>
            </CardFooter>
          </Card>
        </div>
        <Card className="shadow-none">
          <CardContent className="grid gap-4 px-4 lg:grid-cols-5">
            <div className="flex flex-col justify-center gap-6">
              <span className="text-lg font-semibold">Support Plan</span>
              <span className="max-lg:5xl text-6xl">
                {supportGoalPercentage}%
              </span>
              <span className="text-muted-foreground text-sm">
                Progress toward monthly support goal
              </span>
            </div>
            <div className="flex flex-col gap-6 text-lg md:col-span-4">
              <span className="font-medium">Donor Engagement Metrics</span>
              <span className="text-muted-foreground text-wrap">
                Track your support growth and donor engagement over time. This
                helps identify trends and opportunities for deepening partner
                relationships.
              </span>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <ChartNoAxesCombinedIcon className="size-6" />
                  <span className="text-lg font-medium">Support Trends</span>
                </div>
                <div className="flex items-center gap-2">
                  <CirclePercentIcon className="size-6" />
                  <span className="text-lg font-medium">Donor Retention</span>
                </div>
              </div>

              <ChartContainer
                config={supportChartConfig}
                className="h-7.75 w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={supportChartData}
                  margin={{
                    left: 0,
                    right: 0,
                  }}
                  maxBarSize={16}
                >
                  <Bar
                    dataKey="support"
                    fill="var(--primary)"
                    background={{
                      fill: "color-mix(in oklab, var(--primary) 10%, transparent)",
                      radius: 12,
                    }}
                    radius={12}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default MissionaryMetricsCard;
