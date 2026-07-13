"use client";

import { useAuth, useDonationMetrics } from "@asym/lib/hooks";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { PageHeader } from "@asym/ui/components/page-header";
import {
  ChartCard,
  KpiTile,
  ChartTooltip,
} from "@asym/ui/components/primitives/chart-wrappers";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { cn } from "@asym/ui/lib/utils";
import {
  Users,
  DollarSign,
  Target,
  Calendar,
  Download,
  Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";

import { resolveGivingTrendState, selectGivingTrend } from "./analytics-data";

type LooseChartProps = Record<string, unknown> & { children?: React.ReactNode };
type RechartsComponentName =
  | "BarChart"
  | "Bar"
  | "XAxis"
  | "YAxis"
  | "Tooltip"
  | "ResponsiveContainer";

function loadRechartsComponent(name: RechartsComponentName) {
  return dynamic<LooseChartProps>(
    async () => {
      try {
        const mod = await import("recharts");
        return mod[name] as React.ComponentType<LooseChartProps>;
      } catch (error) {
        console.error(`Failed to load recharts component: ${name}`, error);
        throw error;
      }
    },
    { ssr: false },
  );
}

const BarChart = loadRechartsComponent("BarChart");
const Bar = loadRechartsComponent("Bar");
const XAxis = loadRechartsComponent("XAxis");
const YAxis = loadRechartsComponent("YAxis");
const RechartsTooltip = loadRechartsComponent("Tooltip");
const ResponsiveContainer = loadRechartsComponent("ResponsiveContainer");

export default function AnalyticsPage() {
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();

  // Real giving trend: the shared donation-metrics hook aggregates the existing
  // /api/missionaries/[id]/metrics endpoint into per-month recurring/one-time
  // sums (no donor-identifying fields cross this boundary).
  const { profile, loading: authLoading } = useAuth();
  const {
    monthlyBreakdown,
    isLoading: metricsLoading,
    error,
  } = useDonationMetrics(profile?.id ?? "");

  const givingTrend = React.useMemo(
    () => selectGivingTrend(monthlyBreakdown),
    [monthlyBreakdown],
  );
  const givingTrendState = resolveGivingTrendState({
    isLoading: authLoading || metricsLoading,
    error,
    points: givingTrend,
  });

  return (
    <div
      className={cn(
        "space-y-6",
        !withinRouteVt && "animate-in fade-in duration-300",
      )}
    >
      <PageHeader
        title="Analytics"
        description="Detailed insights into your support network and trends."
      >
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs font-medium"
        >
          <Download className="mr-2 size-4" />
          Download
        </Button>
        <Button size="sm" className="h-9 px-4 text-xs font-medium">
          <Sparkles className="mr-2 size-4" />
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
          isLoading={givingTrendState === "loading"}
          isError={givingTrendState === "error"}
          isEmpty={givingTrendState === "empty"}
          errorMessage="We couldn't load your giving trends. Please try again."
          emptyMessage="No giving activity yet. Recurring and one-time gifts will appear here."
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
              <BarChart data={givingTrend} barGap={6}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 9,
                    fontWeight: 700,
                    fill: "var(--muted-foreground)",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 9,
                    fontWeight: 700,
                    fill: "var(--muted-foreground)",
                  }}
                  tickFormatter={(value: number) => `$${value}`}
                  width={35}
                />
                <RechartsTooltip
                  cursor={{ fill: "var(--muted)", radius: 4 }}
                  content={<ChartTooltip />}
                />
                <Bar
                  dataKey="recurring"
                  fill="var(--foreground)"
                  radius={[3, 3, 0, 0]}
                  name="Recurring"
                />
                <Bar
                  dataKey="oneTime"
                  fill="var(--muted)"
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
          isEmpty
          emptyMessage="Partner segmentation is coming soon."
        >
          <div className="h-[200px] w-full" />
        </ChartCard>
      </div>

      <ChartCard
        title="Yearly Performance"
        description="YOY Comparison"
        isEmpty
        emptyMessage="Year-over-year comparison is coming soon."
      >
        <div className="h-[250px] w-full" />
      </ChartCard>
    </div>
  );
}
