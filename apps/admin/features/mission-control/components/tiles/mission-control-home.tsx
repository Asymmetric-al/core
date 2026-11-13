"use client";

import { formatMoney } from "@asym/api/money";
import { navigation } from "@asym/config/navigation";
import { useMC } from "@asym/lib/mission-control/context";
import { resolveMissionControlHref } from "@asym/lib/mission-control/routes";
import { TILES } from "@asym/lib/mission-control/tiles";
import {
  MetricCard,
  MetricGrid,
} from "@asym/ui/components/primitives/metric-card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/ui/lib/utils";
import { ChevronDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import { QuickActionsRow } from "./quick-actions-row";
import { TileCard } from "./tile-card";
import { WorkflowsPanel } from "./workflows-panel";
import { GivingTrendCard, mixedCurrencyNotice } from "../giving-trend-card";
import { getIcon } from "../icon-map";
import { NeedsAttentionSummary } from "./needs-attention-summary";

import type { DashboardStats } from "@asym/api/reads/dashboard-stats";
import type { Tile, Role } from "@asym/lib/mission-control/types";
import type { ReactNode } from "react";

type MissionControlHomeProps = {
  stats?: DashboardStats | null;
};

type OverviewMetric = {
  id: string;
  label: string;
  value: string;
  context: string;
  href?: string;
  /** Set when the figure can't be shown truthfully, with the reason. */
  unavailableReason?: string;
};

const SIDEBAR_ORDER = new Map(
  navigation.map((item, index) => [item.id, index]),
);

function sidebarRank(tileId: string): number {
  return SIDEBAR_ORDER.get(tileId) ?? Number.MAX_SAFE_INTEGER;
}

function buildOverviewMetrics(stats: DashboardStats): OverviewMetric[] {
  // The read sums this month's gifts whatever their currency, so the total
  // only means something when the gifts share one currency.
  const currencyNotice = mixedCurrencyNotice(
    stats.givingTrend,
    "this month's total",
  );
  return [
    {
      id: "revenue",
      label: "Net giving this month",
      value: currencyNotice
        ? "—"
        : formatMoney(
            stats.revenueThisMonthCents,
            stats.givingTrend.currency ?? "USD",
            "en-US",
          ),
      context: "Settled gifts since the 1st (UTC), after refunds",
      unavailableReason: currencyNotice ?? undefined,
    },
    {
      id: "donations",
      label: "Gifts this month",
      value: stats.totalDonationsThisMonth.toLocaleString("en-US"),
      context: "Settled gift records",
    },
    {
      id: "relationships",
      label: "In CRM",
      value: stats.crmRecordCount.toLocaleString("en-US"),
      context: "Donors, churches and organizations",
      href: "/crm",
    },
  ];
}

function moduleCountSummary(role: Role) {
  const inRole = TILES.filter((tile) => tile.roles.includes(role));
  const notSetUp = inRole.filter((tile) => tile.unavailableReason).length;
  const outsideRole = TILES.length - inRole.length;
  const parts = [
    `You can open ${inRole.length - notSetUp} of ${TILES.length} modules.`,
  ];
  if (notSetUp > 0) {
    parts.push(
      notSetUp === 1
        ? "1 is not set up yet."
        : `${notSetUp} are not set up yet.`,
    );
  }
  if (outsideRole > 0) {
    parts.push(
      outsideRole === 1
        ? "1 is not part of your role."
        : `${outsideRole} are not part of your role.`,
    );
  }
  return parts.join(" ");
}

export function MissionControlHome({ stats = null }: MissionControlHomeProps) {
  const { role } = useMC();
  const canOpenContributions = TILES.some(
    (tile) => tile.id === "contributions" && tile.roles.includes(role),
  );
  const [showAllTools, setShowAllTools] = useState(false);
  const [modulesExpanded, setModulesExpanded] = useState(false);
  const quickActionsHeadingId = useId();
  const modulesHeadingId = useId();
  const modulesListId = useId();

  const visibleTiles = TILES.filter(
    (tile) => tile.roles.includes(role) && !tile.unavailableReason,
  );
  const allTiles = [...TILES].sort(
    (a, b) =>
      Number(Boolean(a.unavailableReason) || !a.roles.includes(role)) -
      Number(Boolean(b.unavailableReason) || !b.roles.includes(role)),
  );
  const workspaceTiles = [...visibleTiles].sort(
    (first, second) => sidebarRank(first.id) - sidebarRank(second.id),
  );

  return (
    <main
      aria-label="Mission Control workspace"
      className="min-h-full px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground wrap-break-word sm:text-3xl lg:text-4xl">
            Mission Control
          </h1>
          <p className="text-sm text-muted-foreground">
            Your workspace for giving, people, and ministry operations.
          </p>
        </header>

        {canOpenContributions ? <NeedsAttentionSummary /> : null}

        <section
          aria-labelledby={quickActionsHeadingId}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <h2
              id={quickActionsHeadingId}
              className="text-lg font-semibold text-foreground"
            >
              Quick actions
            </h2>
            <p className="text-sm text-muted-foreground">
              Start a common task.
            </p>
          </div>
          <QuickActionsRow />
        </section>

        {stats ? (
          <>
            <MissionControlMetrics
              overviewMetrics={buildOverviewMetrics(stats)}
              canOpenCrm={navigation.some(
                (item) => item.href === "/crm" && item.roles.includes(role),
              )}
            />
            <GivingTrendCard trend={stats.givingTrend} />
          </>
        ) : (
          // The figures and the trend come from one read, so one failure is
          // said once here, not on each tile and again in an empty chart.
          <DashboardFiguresUnavailable />
        )}

        <WorkflowsPanel />

        <ModuleCatalogDialog
          open={showAllTools}
          onOpenChange={setShowAllTools}
          allTiles={allTiles}
          role={role}
        >
          <section
            aria-labelledby={modulesHeadingId}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex flex-col gap-1">
                <h2
                  id={modulesHeadingId}
                  className="text-lg font-semibold text-foreground"
                >
                  Your modules
                </h2>
                <p className="text-sm text-muted-foreground">
                  Open a module or jump straight to a page inside it.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-xs text-muted-foreground">
                  {moduleCountSummary(role)}
                </p>
                <ModuleCatalogTrigger />
              </div>
            </div>
            {/* Phones fold the directory; wider screens show all of it. */}
            <div className="w-full sm:hidden">
              <Button
                variant="outline"
                className="w-full"
                aria-expanded={modulesExpanded}
                aria-controls={modulesListId}
                onClick={() => setModulesExpanded((expanded) => !expanded)}
              >
                {modulesExpanded
                  ? "Show fewer modules"
                  : `Show all ${workspaceTiles.length} modules`}
                <ChevronDown
                  aria-hidden="true"
                  data-icon="inline-end"
                  className={cn(
                    "transition-transform duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] motion-reduce:transition-none",
                    modulesExpanded && "rotate-180",
                  )}
                />
              </Button>
            </div>
            <ul
              id={modulesListId}
              role="list"
              aria-label="Workspace modules"
              className={cn(
                "grid gap-2 sm:grid-cols-2 xl:grid-cols-3 [&>li]:min-w-0",
                !modulesExpanded && "max-sm:hidden",
              )}
            >
              {workspaceTiles.map((tile) => (
                <TileCard key={tile.id} tile={tile} />
              ))}
            </ul>
          </section>
        </ModuleCatalogDialog>
      </div>
    </main>
  );
}

function ModuleCatalogTrigger({ className }: { className?: string }) {
  return (
    <DialogTrigger
      render={
        <Button variant="outline" className={className}>
          <LayoutGrid aria-hidden="true" data-icon="inline-start" />
          Explore modules
        </Button>
      }
    />
  );
}

function ModuleCatalogDialog({
  open,
  onOpenChange,
  allTiles,
  role,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTiles: Tile[];
  role: Role;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent scrollable className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Mission Control modules</DialogTitle>
          <DialogDescription>
            Every module and whether your current role can open it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-3">
          {allTiles.map((tile) => {
            const Icon = getIcon(tile.icon);
            const hasAccess = tile.roles.includes(role);
            const available = hasAccess && !tile.unavailableReason;
            return (
              <div
                key={tile.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-3 transition-colors duration-[var(--duration-micro)] ease-[var(--ease-out-soft)]",
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
                  <Icon aria-hidden="true" className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                  {available ? (
                    <Link
                      href={resolveMissionControlHref(tile.route)}
                      className="rounded-sm text-sm font-semibold text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {tile.title}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-foreground">
                      {tile.title}
                    </p>
                  )}
                  <Badge variant={available ? "success" : "secondary"}>
                    {!hasAccess
                      ? "Not in your role"
                      : available
                        ? "Available"
                        : "Not set up"}
                  </Badge>
                  {hasAccess && tile.unavailableReason && (
                    <p className="text-xs text-muted-foreground">
                      {tile.unavailableReason}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MissionControlMetrics({
  overviewMetrics,
  canOpenCrm,
}: {
  overviewMetrics: OverviewMetric[];
  canOpenCrm: boolean;
}) {
  return (
    <MetricGrid label="Tenant overview">
      {overviewMetrics.map((metric) => (
        <MetricCard
          key={metric.id}
          label={metric.label}
          state={metric.unavailableReason ? "unavailable" : "ready"}
          unavailableReason={metric.unavailableReason}
          value={
            metric.href && canOpenCrm ? (
              <Link
                href={metric.href}
                aria-label={`${metric.label}: ${metric.value}`}
                className="underline underline-offset-4"
              >
                {metric.value}
              </Link>
            ) : (
              metric.value
            )
          }
          detail={metric.context}
        />
      ))}
    </MetricGrid>
  );
}

function DashboardFiguresUnavailable() {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();
  const [hasRetried, setHasRetried] = useState(false);
  return (
    <Alert variant="warning">
      <AlertTitle>Dashboard figures couldn&apos;t load</AlertTitle>
      <AlertDescription>
        <p>
          Net giving, gift counts, the CRM total and net giving by month are
          unavailable right now. You can still use your workspace tools.
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={isRetrying}
          onClick={() => {
            setHasRetried(true);
            startRetry(() => router.refresh());
          }}
        >
          {isRetrying ? "Trying again…" : "Try again"}
        </Button>
        {hasRetried ? (
          <p role="status">
            {isRetrying
              ? "Checking dashboard figures…"
              : "Figures are still unavailable. You can try again."}
          </p>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
