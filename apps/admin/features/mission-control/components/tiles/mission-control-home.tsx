"use client";

import { useMC } from "@asym/lib/mission-control/context";
import { TILES } from "@asym/lib/mission-control/tiles";
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
  BarChart3,
  CheckCircle2,
  Clock3,
  GripVertical,
  LayoutGrid,
  Settings2,
  Star,
} from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";

import { QuickActionsRow } from "./quick-actions-row";
import { TileCard } from "./tile-card";
import { WorkflowsPanel } from "./workflows-panel";
import { getIcon } from "../icon-map";

import type { DashboardStats } from "@asym/api/reads/dashboard-stats";
import type { Tile, Role } from "@asym/lib/mission-control/types";

const NUMBER_FORMATTER_1 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

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

const WIDGET_LIBRARY = [
  "Giving trends",
  "Donor health",
  "Care alerts",
  "Mission pipeline",
  "Event readiness",
  "Support SLA",
  "Admin health",
  "Content review",
] as const;

function getMetricToneClass(tone: OverviewMetric["tone"]) {
  switch (tone) {
    case "success":
      return "border-success/25 bg-success/10 text-success";
    case "warning":
      return "border-warning/25 bg-warning/10 text-warning";
    case "info":
      return "border-info/25 bg-info/10 text-info";
    case "neutral":
      return "border-border bg-muted text-muted-foreground";
    default:
      return "border-border bg-muted text-muted-foreground";
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
        context:
          "Actions are available from your enabled Mission Control tools.",
        tone: "success",
      },
    ];
  }

  return [
    {
      id: "revenue",
      label: "Revenue this month",
      value: NUMBER_FORMATTER_1.format(stats.revenueThisMonth),
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

export function MissionControlHome({
  dashboardMissionaryId: _dashboardMissionaryId,
  stats = null,
}: MissionControlHomeProps) {
  const { role } = useMC();
  const [showAllTools, setShowAllTools] = useState(false);

  const visibleTiles = TILES.filter((tile) => tile.roles.includes(role));
  const allTiles = TILES;
  const overviewMetrics = useMemo(() => buildOverviewMetrics(stats), [stats]);
  const workspaceTiles = useMemo(() => {
    const byId = new Map(visibleTiles.map((tile) => [tile.id, tile]));
    const ordered = PRIMARY_TILE_IDS.flatMap((id) => {
      const tile = byId.get(id);
      return tile ? [tile] : [];
    });
    const primaryIds = new Set<string>(PRIMARY_TILE_IDS);
    return [
      ...ordered,
      ...visibleTiles.filter((tile) => !primaryIds.has(tile.id)),
    ];
  }, [visibleTiles]);

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <MissionControlReadiness
          visibleTiles={visibleTiles}
          showAllTools={showAllTools}
          setShowAllTools={setShowAllTools}
          allTiles={allTiles}
          role={role}
        />

        <MissionControlMetrics overviewMetrics={overviewMetrics} />

        <section className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
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

        <MissionControlWorkflows />

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">
              Workspace tools
            </h2>
            <p className="text-sm text-muted-foreground">
              Your enabled modules and their most useful shortcuts.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {workspaceTiles.map((tile) => (
              <TileCard key={tile.id} tile={tile} />
            ))}
          </div>
        </section>

        <WorkflowsPanel />
      </div>
    </div>
  );
}

function MissionControlReadiness({
  visibleTiles,
  showAllTools,
  setShowAllTools,
  allTiles,
  role,
}: {
  visibleTiles: Tile[];
  showAllTools: boolean;
  setShowAllTools: React.Dispatch<React.SetStateAction<boolean>>;
  allTiles: Tile[];
  role: Role;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="overflow-hidden border-border bg-card text-card-foreground shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="max-w-3xl space-y-3">
              <Badge variant="secondary" className="w-fit">
                Mission Control dashboard
              </Badge>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Mission Control
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  A command-center view for attention, money, people,
                  mobilization, events, support, and admin readiness.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {DASHBOARD_GUIDE_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border bg-muted/30 p-3"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
            Your workspace
          </CardTitle>
          <CardDescription>
            Explore the tools available to your current role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-2xl font-semibold tabular-nums">
                {visibleTiles.length}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                enabled modules
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-2xl font-semibold tabular-nums">
                {TILES.length}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                available tools
              </p>
            </div>
          </div>
          <Dialog open={showAllTools} onOpenChange={setShowAllTools}>
            <DialogTrigger
              render={
                <Button className="w-full">
                  <LayoutGrid data-icon="inline-start" />
                  Explore modules
                </Button>
              }
            />
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
                          ? "border-border bg-card shadow-sm hover:border-ring/30"
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
                        <p className="text-sm font-semibold text-foreground">
                          {tile.title}
                        </p>
                        <Badge variant={hasAccess ? "success" : "secondary"}>
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
  );
}

function MissionControlMetrics({
  overviewMetrics,
}: {
  overviewMetrics: OverviewMetric[];
}) {
  return (
    <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-3 sm:grid-cols-3">
        {overviewMetrics.map((metric) => (
          <Card key={metric.id} className="border-border bg-card shadow-sm">
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {metric.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
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
            <Clock3 className="size-4 text-warning" />
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
              tone: "text-destructive bg-destructive/10 border-destructive/20",
            },
            {
              label: "Giving and reports",
              detail: "Check settled giving and operational signals.",
              tone: "text-success bg-success/10 border-success/20",
            },
            {
              label: "Pipeline and events",
              detail: "Move candidates, sessions, and tasks forward.",
              tone: "text-info bg-info/10 border-info/20",
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
  );
}

function MissionControlWorkflows() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Ministry health widgets
          </h2>
          <p className="text-sm font-medium text-muted-foreground">
            Two snapshot charts are pinned by default; teams can tune this area
            by role and season.
          </p>
        </div>
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="outline">
                <LayoutGrid data-icon="inline-start" />
                Preview widgets
              </Button>
            }
          />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Widget library preview</DialogTitle>
              <DialogDescription>
                Choose the views that matter for your role. This preview keeps
                customization visual-only until saved layouts are wired to user
                preferences.
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
                      Available as a future dashboard preference
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
            <CardTitle className="text-base">Ministry health trend</CardTitle>
            <CardDescription>
              Demo snapshot data showing how giving, engagement, and care can
              share one six-month view.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <Suspense
                fallback={<div aria-hidden className="size-full bg-muted/30" />}
              >
                <MinistryHealthTrendChart />
              </Suspense>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["Giving", "bg-[var(--chart-1)]/10 text-foreground"],
                ["Engagement", "bg-[var(--chart-2)]/10 text-foreground"],
                ["Care", "bg-[var(--chart-5)]/10 text-foreground"],
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
            <CardTitle className="text-base">Health distribution</CardTitle>
            <CardDescription>
              Demo snapshot bands for the core ministry system; wire to
              source-of-truth data before treating as live health.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <Suspense
                fallback={<div aria-hidden className="size-full bg-muted/30" />}
              >
                <MinistryHealthMixChart />
              </Suspense>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["Healthy", "text-foreground", "Stable"],
                ["Watch", "text-foreground", "Follow up"],
                ["Risk", "text-foreground", "Act now"],
              ].map(([label, className, helper]) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-muted/20 p-2"
                >
                  <p className={cn("text-xs font-semibold", className)}>
                    {label}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {helper}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

const MinistryHealthTrendChart = lazy(() =>
  import("./mission-control-chart-views").then((module) => ({
    default: module.MinistryHealthTrendChart,
  })),
);
const MinistryHealthMixChart = lazy(() =>
  import("./mission-control-chart-views").then((module) => ({
    default: module.MinistryHealthMixChart,
  })),
);
