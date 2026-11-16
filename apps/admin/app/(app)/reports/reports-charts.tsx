"use client";

import { useIsMobile, useIsTablet } from "@asym/lib/hooks/use-mobile";
import { ChartCard } from "@asym/ui/components/primitives/chart-wrappers";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@asym/ui/components/shadcn/chart";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";

export interface GivingByFundPoint {
  label: string;
  amount: number;
}

export interface DonorsByFundPoint {
  label: string;
  donors: number;
}

interface ReportsChartsProps {
  group?: { singular: string; plural: string; title: string };
  giving: GivingByFundPoint[];
  donors: DonorsByFundPoint[];
  coverage: string;
  period: string;
  isEmpty: boolean;
  isLoading?: boolean;
  isError?: boolean;
  isIncomplete?: boolean;
  onRetry?: () => void;
}

const EXACT_CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const COMPACT_CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const givingConfig = {
  amount: { label: "Giving", color: "var(--chart-1)" },
} satisfies ChartConfig;

const donorsConfig = {
  donors: { label: "Donors", color: "var(--chart-2)" },
} satisfies ChartConfig;

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      role="status"
      aria-label="Loading chart"
      className="w-full animate-pulse rounded-xl bg-muted/40"
      style={{ height }}
    />
  );
}

const GivingChart = dynamic<{ data: GivingByFundPoint[] }>(
  async () => {
    const { Bar, BarChart, CartesianGrid, XAxis, YAxis } =
      await import("recharts");

    function GivingChartInner({ data }: { data: GivingByFundPoint[] }) {
      return (
        <div className="h-72 w-full">
          <ChartContainer config={givingConfig} layout="fill">
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                dataKey="amount"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) =>
                  COMPACT_CURRENCY.format(value)
                }
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={150}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      typeof value === "number"
                        ? EXACT_CURRENCY.format(value)
                        : String(value)
                    }
                  />
                }
              />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      );
    }

    return GivingChartInner;
  },
  { ssr: false, loading: () => <ChartSkeleton height={288} /> },
);

const DonorsChart = dynamic<{ data: DonorsByFundPoint[] }>(
  async () => {
    const { Bar, BarChart, CartesianGrid, XAxis, YAxis } =
      await import("recharts");

    function DonorsChartInner({ data }: { data: DonorsByFundPoint[] }) {
      return (
        <div className="h-72 w-full">
          <ChartContainer config={donorsConfig} layout="fill">
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                dataKey="donors"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={150}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="donors" fill="var(--color-donors)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      );
    }

    return DonorsChartInner;
  },
  { ssr: false, loading: () => <ChartSkeleton height={288} /> },
);

type ChartKind = "giving" | "donors";

export function ReportsCharts({
  donors,
  giving,
  coverage,
  period,
  isEmpty,
  isLoading = false,
  isError = false,
  isIncomplete = false,
  onRetry,
  group = { singular: "fund", plural: "funds", title: "Funds" },
}: ReportsChartsProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [shown, setShown] = useState<ChartKind>("giving");
  const compareDonors = group.singular !== "donor";
  const state = {
    isEmpty,
    isLoading,
    isError: isError || isIncomplete,
    onRetry,
    headingLevel: 2,
    errorTitle: isIncomplete
      ? "Charts need a complete report"
      : "The chart could not load",
    errorMessage: isIncomplete
      ? "Choose a shorter period to compare all settled gifts. The partial records remain listed below."
      : "Load the report again to see this comparison.",
  } as const;

  const charts = {
    giving: {
      title: `Giving by ${group.singular}`,
      description: `Net giving, largest first. Period: ${period}.`,
      summary: `Net giving after refunds and corrections. Period: ${period}. ${giving.map((point) => `${point.label}: ${EXACT_CURRENCY.format(point.amount)}`).join("; ")}.`,
      emptyMessage: "No settled giving yet.",
      body: <GivingChart data={giving} />,
    },
    donors: {
      title: `Donors by ${group.singular}`,
      description: `Different donors giving to each ${group.singular}, in the same order. Period: ${period}.`,
      summary: `Distinct donors per ${group.singular}, not an additive total. Period: ${period}. ${donors.map((point) => `${point.label}: ${point.donors.toLocaleString("en-US")} ${point.donors === 1 ? "donor" : "donors"}`).join("; ")}.`,
      emptyMessage: "No donors yet.",
      body: <DonorsChart data={donors} />,
    },
  } satisfies Record<
    ChartKind,
    {
      title: string;
      description: string;
      summary: string;
      emptyMessage: string;
      body: ReactNode;
    }
  >;

  if ((isMobile || isTablet) && compareDonors) {
    const chart = charts[shown];
    return (
      <ChartCard
        {...state}
        role="region"
        aria-label={`By ${group.singular}`}
        title={`By ${group.singular}`}
        description={chart.description}
        summary={chart.summary}
        note={coverage}
        emptyMessage={chart.emptyMessage}
        actions={
          <ToggleGroup
            aria-label="Chart"
            variant="outline"
            size="sm"
            value={[shown]}
            onValueChange={(next) => {
              const [value] = next;
              if (value === "giving" || value === "donors") setShown(value);
            }}
          >
            <ToggleGroupItem value="giving">Giving</ToggleGroupItem>
            <ToggleGroupItem value="donors">Donors</ToggleGroupItem>
          </ToggleGroup>
        }
      >
        {chart.body}
      </ChartCard>
    );
  }

  return (
    <div className={compareDonors ? "grid gap-6 lg:grid-cols-2" : "grid gap-6"}>
      <ChartCard
        {...state}
        role="region"
        aria-label={charts.giving.title}
        title={charts.giving.title}
        description={charts.giving.description}
        summary={charts.giving.summary}
        note={coverage}
        emptyMessage={charts.giving.emptyMessage}
      >
        {charts.giving.body}
      </ChartCard>
      {compareDonors ? (
        <ChartCard
          {...state}
          role="region"
          aria-label={charts.donors.title}
          title={charts.donors.title}
          description={charts.donors.description}
          summary={charts.donors.summary}
          note={coverage}
          emptyMessage={charts.donors.emptyMessage}
        >
          {charts.donors.body}
        </ChartCard>
      ) : null}
    </div>
  );
}
