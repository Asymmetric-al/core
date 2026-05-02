"use client";

import { useMC } from "@asym/lib/mission-control/context";
import { resolveMissionControlHref } from "@asym/lib/mission-control/routes";
import { TILES, WORKFLOWS } from "@asym/lib/mission-control/tiles";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/ui/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  GripVertical,
  LayoutGrid,
  Settings2,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
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

import { QuickActionsRow } from "./quick-actions-row";
import { TileCard } from "./tile-card";
import { WorkflowsPanel } from "./workflows-panel";
import { DynamicIcon, getIcon } from "../icons";

import type { DashboardStats } from "@asym/api/reads/dashboard-stats";
import type { Tile } from "@asym/lib/mission-control/types";

type MissionControlHomeProps = {
  dashboardMissionaryId?: string | null;
  stats?: DashboardStats | null;
};

type OverviewMetric = {
  id: string;
  label: string;
  value: string;
  context: string;
  tone: "info" | "success" | "warning" | "neutral";
};

const PRIMARY_TILE_IDS = [
  "crm",
  "contributions",
  "reports",
  "care",
  "mobilize",
  "events",
  "support",
  "admin",
] as const;

const DASHBOARD_GUIDE_ITEMS = [
  {
    label: "Today",
    value: "Attention first",
    detail: "Start with work that has risk, deadlines, or operational impact.",
  },
  {
    label: "This week",
    value: "Operational picture",
    detail: "Scan giving, people, care, mobilization, events, and support.",
  },
  {
    label: "Customize",
    value: "Role-aware modules",
    detail: "Your tools and quick actions follow your Mission Control role.",
  },
];

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

const WIDGET_LIBRARY = [
  "Giving trends",
  "Donor health",
  "Care alerts",
  "Mission pipeline",
  "Event readiness",
  "Support SLA",
  "Admin health",
  "Content review",
];

function getMetricToneClass(tone: OverviewMetric["tone"]) {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "info":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "neutral":
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }
}

function buildOverviewMetrics(stats: DashboardStats | null): OverviewMetric[] {
  if (!stats) {
    return [
      {
        id: "setup",
        label: "Dashboard data",
        value: "Limited",
        context: "Showing the command center layout while tenant metrics load.",
        tone: "warning",
      },
      {
        id: "modules",
        label: "Module map",
        value: "Ready",
        context: "Use the role-aware modules below to keep moving.",
        tone: "info",
      },
      {
        id: "actions",
        label: "Quick actions",
        value: "Live",
        context: "Actions are available from your enabled Mission Control tools.",
        tone: "success",
      },
    ];
  }

  return [
    {
      id: "revenue",
      label: "Revenue this month",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(stats.revenueThisMonth),
      context: "Settled gifts since month start",
      tone: "success",
    },
    {
      id: "donations",
      label: "Donations this month",
      value: stats.totalDonationsThisMonth.toLocaleString(),
      context: "Settled contribution records",
      tone: stats.totalDonationsThisMonth > 0 ? "info" : "warning",
    },
    {
      id: "relationships",
      label: "People in view",
      value: stats.totalDonors.toLocaleString(),
      context: "Tenant-wide donor profiles",
      tone: "neutral",
    },
  ];
}

function classifyTile(tile: Tile) {
  if (tile.id === "support" || tile.id === "care") return "Attention";
  if (tile.id === "contributions" || tile.id === "reports") return "Money";
  if (tile.id === "mobilize" || tile.id === "events") return "Operations";
  if (tile.id === "crm") return "Relationships";
  if (tile.id === "admin") return "Admin";
  return "Tools";
}

function TileSummaryCard({ tile }: { tile: Tile }) {
  return (
    <Link href={resolveMissionControlHref(tile.route)} className="group block">
      <Card className="h-full border-border/70 bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] hover-lift hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50">
        <CardContent className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground transition-[background-color,color,border-color] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
              <DynamicIcon name={tile.icon} className="size-5" />
            </div>
            <Badge
              variant="outline"
              className="h-5 rounded-md border-border bg-background px-1.5 text-[10px] font-semibold text-muted-foreground"
            >
              {classifyTile(tile)}
            </Badge>
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="text-sm font-bold leading-tight text-foreground">
              {tile.title}
            </h3>
            <p className="line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">
              {tile.purpose}
            </p>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3 text-xs font-semibold text-muted-foreground">
            <span>{tile.quickActions.length} quick actions</span>
            <ArrowRight className="size-3.5 transition-transform duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function MissionControlHome({
  dashboardMissionaryId: _dashboardMissionaryId,
  stats = null,
}: MissionControlHomeProps) {
  const { role } = useMC();
  const [showAllTools, setShowAllTools] = useState(false);

  const visibleTiles = TILES.filter((tile) => tile.roles.includes(role));
  const allTiles = TILES;
  const overviewMetrics = useMemo(() => buildOverviewMetrics(stats), [stats]);
  const primaryTiles = useMemo(() => {
    const byId = new Map(visibleTiles.map((tile) => [tile.id, tile]));
    const ordered = PRIMARY_TILE_IDS.flatMap((id) => {
      const tile = byId.get(id);
      return tile ? [tile] : [];
    });
    return ordered.length > 0 ? ordered : visibleTiles.slice(0, 8);
  }, [visibleTiles]);
  const topWorkflows = WORKFLOWS.slice(0, 3);

  return (
    <div className="relative isolate min-h-full px-4 pb-16 pt-5 sm:px-6 lg:px-7">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-zinc-50 via-background to-transparent" />

      <div className="relative space-y-6">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
          <Card className="overflow-hidden border-zinc-900 bg-zinc-950 text-white shadow-xl">
            <CardContent className="relative p-5 sm:p-6">
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-3">
                  <Badge className="h-6 w-fit border border-white/10 bg-white/10 px-2 text-xs font-semibold text-zinc-100 hover:bg-white/10">
                    Mission Control dashboard
                  </Badge>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                      Start here. See the whole ministry picture.
                    </h1>
                    <p className="max-w-2xl text-sm font-medium leading-6 text-zinc-300">
                      A command-center view for attention, money, people,
                      mobilization, events, support, and admin readiness.
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:w-[460px]">
                  {DASHBOARD_GUIDE_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
                    >
                      <p className="text-xs font-medium text-zinc-400">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {item.value}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="size-4 text-muted-foreground" />
                Customizable workspace
              </CardTitle>
              <CardDescription>
                Role-aware modules now form the starting map for daily work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border bg-muted/20 p-3">
                  <p className="text-2xl font-black tabular-nums">
                    {visibleTiles.length}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    enabled modules
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3">
                  <p className="text-2xl font-black tabular-nums">
                    {TILES.length}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    available tools
                  </p>
                </div>
              </div>
              <Dialog open={showAllTools} onOpenChange={setShowAllTools}>
                <DialogTrigger asChild>
                  <Button className="h-10 w-full rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800">
                    <LayoutGrid className="mr-2 size-4" />
                    Customize modules
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Mission Control tools</DialogTitle>
                    <DialogDescription>
                      Complete list of tools and whether your current role can
                      access them.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-3">
                    {allTiles.map((tile) => {
                      const Icon = getIcon(tile.icon);
                      const hasAccess = tile.roles.includes(role);
                      return (
                        <div
                          key={tile.id}
                          className={cn(
                            "flex items-start gap-3 rounded-2xl border p-3 transition-[border-color,background-color] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)]",
                            hasAccess
                              ? "border-border bg-card shadow-sm hover:border-zinc-300"
                              : "border-border/60 bg-muted/30 opacity-70",
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-9 items-center justify-center rounded-xl border",
                              hasAccess
                                ? "border-border bg-muted/30 text-foreground"
                                : "border-border/60 bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-bold text-foreground">
                              {tile.title}
                            </p>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "h-5 px-1.5 text-[10px] font-semibold",
                                hasAccess
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-zinc-100 text-zinc-500",
                              )}
                            >
                              {hasAccess ? "Available" : "Locked"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-3 sm:grid-cols-3">
            {overviewMetrics.map((metric) => (
              <Card
                key={metric.id}
                className="border-border bg-card shadow-sm"
              >
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-foreground tabular-nums">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
                      {metric.context}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl border",
                      getMetricToneClass(metric.tone),
                    )}
                  >
                    {metric.tone === "success" ? (
                      <CheckCircle2 className="size-4" />
                    ) : metric.tone === "warning" ? (
                      <AlertTriangle className="size-4" />
                    ) : (
                      <BarChart3 className="size-4" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock3 className="size-4 text-amber-600" />
                Priority scan
              </CardTitle>
              <CardDescription>
                Use the first minute to decide where attention goes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {
                  label: "Support and care",
                  detail: "Review people-facing risk before routine work.",
                  tone: "text-rose-600 bg-rose-50 border-rose-100",
                },
                {
                  label: "Giving and reports",
                  detail: "Check settled giving and operational signals.",
                  tone: "text-emerald-700 bg-emerald-50 border-emerald-100",
                },
                {
                  label: "Pipeline and events",
                  detail: "Move candidates, sessions, and tasks forward.",
                  tone: "text-blue-700 bg-blue-50 border-blue-100",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border",
                      item.tone,
                    )}
                  >
                    <Star className="size-3" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Ministry health widgets
              </h2>
              <p className="text-sm font-medium text-muted-foreground">
                Two snapshot charts are pinned by default; teams can tune this
                area by role and season.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-zinc-200 bg-white px-4 text-sm font-semibold hover:bg-zinc-50"
                >
                  <LayoutGrid className="mr-2 size-4" />
                  Add widget
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Widget library</DialogTitle>
                  <DialogDescription>
                    Choose the views that matter for your role. This preview
                    keeps customization visual-only until saved layouts are
                    wired to user preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4 sm:grid-cols-2">
                  {WIDGET_LIBRARY.map((widget) => (
                    <div
                      key={widget}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                    >
                      <GripVertical className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {widget}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Drag into your dashboard layout
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Ministry health trend
                </CardTitle>
                <CardDescription>
                  Giving, engagement, and care signals on one six-month view.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
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
                        formatter={(value: number, name: string) => [
                          `${value}%`,
                          name,
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="giving"
                        name="Giving"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="engagement"
                        name="Engagement"
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="care"
                        name="Care"
                        stroke="var(--chart-5)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    ["Giving", "bg-blue-50 text-blue-700"],
                    ["Engagement", "bg-emerald-50 text-emerald-700"],
                    ["Care", "bg-amber-50 text-amber-700"],
                  ].map(([label, className]) => (
                    <Badge
                      key={label}
                      className={cn(
                        "border-none text-xs font-semibold hover:bg-current/10",
                        className,
                      )}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Health distribution
                </CardTitle>
                <CardDescription>
                  Healthy, watch, and risk bands across operational areas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
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
                        formatter={(value: number, name: string) => [
                          `${value}%`,
                          name,
                        ]}
                      />
                      <Bar
                        dataKey="healthy"
                        name="Healthy"
                        stackId="health"
                        fill="var(--chart-2)"
                        radius={[4, 0, 0, 4]}
                      />
                      <Bar
                        dataKey="watch"
                        name="Watch"
                        stackId="health"
                        fill="var(--chart-4)"
                      />
                      <Bar
                        dataKey="risk"
                        name="Risk"
                        stackId="health"
                        fill="var(--chart-5)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Healthy", "text-emerald-700", "Stable"],
                    ["Watch", "text-amber-700", "Follow up"],
                    ["Risk", "text-rose-700", "Act now"],
                  ].map(([label, className, helper]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-border bg-muted/20 p-2"
                    >
                      <p className={cn("text-xs font-bold", className)}>
                        {label}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {helper}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Quick actions
              </h2>
              <p className="text-sm font-medium text-muted-foreground">
                Role-aware shortcuts for the work you are most likely to do
                next.
              </p>
            </div>
          </div>
          <QuickActionsRow />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Operational map
              </h2>
              <p className="text-sm font-medium text-zinc-500">
                The most important Mission Control modules, grouped for fast
                scanning.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {primaryTiles.map((tile) => (
              <TileSummaryCard key={tile.id} tile={tile} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Enabled tools
              </h2>
              <p className="text-sm font-medium text-muted-foreground">
                Full module cards remain below for deeper navigation and quick
                actions.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleTiles.map((tile) => (
                <TileCard key={tile.id} tile={tile} />
              ))}
            </div>
          </div>

          <Card className="h-fit border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-purple-600" />
                Suggested workflows
              </CardTitle>
              <CardDescription>
                Cross-module flows that explain what the dashboard connects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topWorkflows.map((workflow) => (
                <Link
                  key={workflow.id}
                  href={resolveMissionControlHref(workflow.route)}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 transition-[border-color,background-color] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] hover:border-zinc-300 hover:bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {workflow.title}
                    </p>
                    <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {workflow.description}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        <WorkflowsPanel />
      </div>
    </div>
  );
}
