"use client";

import { DEMO_PROFILE_ID } from "@asym/auth/constants";
import { useMissionaryPortalSnapshot } from "@asym/database/hooks";
import { useAuth } from "@asym/lib/hooks";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  ArrowUpRight,
  AlertCircle,
  Circle,
  ArrowRight,
  Activity,
} from "lucide-react";
import React from "react";

import { buildMissionaryDashboardView } from "./dashboard-view";
import { GivingBreakdownChart } from "./giving-breakdown-chart";
import { MetricTiles } from "./metric-tiles";

/** Same as demo profile id so metrics API finds the seeded missionary row. */
const DEMO_MISSIONARY_ID = DEMO_PROFILE_ID;

function formatSupportAmount(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(dollars % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${dollars.toLocaleString()}`;
}

interface DashboardHomeProps {
  setActiveTab?: (tab: string) => void;
  missionaryId?: string;
  /** Inserted directly under the page header (e.g. tenant stats on Mission Control home). */
  belowHeaderSlot?: React.ReactNode;
}

function DashboardHomeContent({
  missionaryId,
  setActiveTab,
  belowHeaderSlot,
}: {
  missionaryId: string;
  setActiveTab?: (tab: string) => void;
  belowHeaderSlot?: React.ReactNode;
}) {
  const portalQuery = useMissionaryPortalSnapshot();
  const {
    support,
    pendingTasks,
    updates: latestUpdates,
    alerts,
  } = buildMissionaryDashboardView(portalQuery.data);

  if (portalQuery.isLoading) {
    return (
      <PageShell title="Dashboard" description="Your ministry at a glance">
        <div className="section-gap">
          {belowHeaderSlot}
          <div
            className="grid gap-4"
            role="group"
            aria-busy="true"
            aria-label="Loading dashboard"
          >
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <Skeleton className="h-56 rounded-xl lg:col-span-7" />
              <Skeleton className="h-56 rounded-xl lg:col-span-5" />
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (portalQuery.error) {
    return (
      <PageShell title="Dashboard" description="Your ministry at a glance">
        <div className="section-gap">
          {belowHeaderSlot}
          <Card>
            <CardContent className="p-6 flex flex-col gap-3">
              <p role="alert" className="text-sm font-medium text-foreground">
                We couldn&apos;t load your dashboard.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => portalQuery.refetch()}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  const raisedCents = support?.raisedCents ?? 0;
  const goalCents = support?.goalCents ?? 0;
  const remainingCents = support?.remainingCents ?? 0;
  const percentFunded = support?.percentFunded ?? 0;

  return (
    <PageShell
      title="Dashboard"
      description="Your ministry at a glance"
      actions={<Button variant="outline">Download Report</Button>}
    >
      <div className="section-gap">
        {belowHeaderSlot}
        <MetricTiles missionaryId={missionaryId} />

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-0.5 gap-y-2 sm:gap-y-0 px-3 sm:px-4 pt-2.5">
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold leading-none">
                Giving Breakdown
              </CardTitle>
              <CardDescription className="text-xs sm:text-xs mt-0.5">
                Monthly support trends over the last 13 months.
              </CardDescription>
            </div>
            {setActiveTab && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("analytics")}
              >
                Analytics
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-2 pb-1 px-0.5 sm:px-2 md:px-4">
            <GivingBreakdownChart missionaryId={missionaryId} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
          <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                {support?.hasGoal ? (
                  <>
                    <div>
                      <h2 className="text-muted-foreground font-semibold text-xs uppercase tracking-widest mb-1 leading-none">
                        Monthly Support Goal
                      </h2>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tighter text-foreground leading-none">
                          {formatSupportAmount(raisedCents)}
                        </span>
                        <span className="text-muted-foreground text-sm sm:text-base font-medium leading-none">
                          / {formatSupportAmount(goalCents)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <div className="flex justify-between text-xs mb-1 text-muted-foreground font-semibold leading-none">
                        <span>{percentFunded}% Funded</span>
                        <span className="text-muted-foreground">
                          {formatSupportAmount(remainingCents)} remaining
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        {/* Animate transform: scaleX (GPU, no layout) instead of width */}
                        <div
                          className="size-full origin-left bg-primary transform-(--funding-progress-transform) transition-transform duration-700 ease-[var(--ease-out-soft)]"
                          style={
                            {
                              "--funding-progress-transform": `scaleX(${Math.min(percentFunded, 100) / 100})`,
                            } as React.CSSProperties
                          }
                          role="progressbar"
                          aria-valuenow={Math.max(
                            0,
                            Math.min(percentFunded, 100),
                          )}
                          aria-valuetext={`${percentFunded}% funded`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Support funded"
                        />
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-y-2 sm:gap-x-8 pt-2.5 border-t border-border">
                      <div className="flex flex-col gap-0">
                        <span className="text-muted-foreground text-xs uppercase tracking-wide font-semibold leading-none">
                          Gifts
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-foreground mt-0.5 leading-none">
                          {support.giftCount}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0">
                        <span className="text-muted-foreground text-xs uppercase tracking-wide font-semibold leading-none">
                          Active Donors
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-foreground mt-0.5 leading-none">
                          {support.activeDonorCount}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <h2 className="text-muted-foreground font-semibold text-xs uppercase tracking-widest mb-1 leading-none">
                      Monthly Support Goal
                    </h2>
                    <p className="text-foreground text-sm font-medium mt-1">
                      No support goal set yet
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Set a monthly goal to start tracking your support.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 flex flex-row items-center justify-between gap-y-0 pt-2.5 px-3 sm:px-4">
                <div className="flex items-center gap-1.5">
                  <Activity className="size-3 text-muted-foreground" />
                  <CardTitle className="text-xs sm:text-sm font-semibold leading-none">
                    Latest Updates
                  </CardTitle>
                </div>
                {setActiveTab && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="View ministry updates"
                    onClick={() => setActiveTab("feed")}
                  >
                    <ArrowUpRight className="size-3" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 sm:px-4 sm:pb-3">
                {latestUpdates.length === 0 ? (
                  <p className="sm:col-span-2 text-xs text-muted-foreground text-center py-4">
                    No ministry updates yet.
                  </p>
                ) : (
                  latestUpdates.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className="group flex gap-2 p-1.5 rounded-lg border border-border hover:border-border hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-tight font-medium line-clamp-2">
                          {post.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-semibold uppercase tracking-wider">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleDateString()
                            : "Draft"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {setActiveTab && (
                  <Button
                    variant="outline"
                    className="sm:col-span-2 w-full"
                    onClick={() => setActiveTab("feed")}
                  >
                    Compose New Update
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card>
              <CardHeader className="pb-1.5 pt-2.5 px-3 sm:px-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-semibold leading-none">
                    Tasks & Alerts
                  </CardTitle>
                  <Badge variant="secondary">
                    {pendingTasks.length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {alerts.length > 0 && (
                    <div className="p-1.5 bg-muted/10 flex flex-col gap-1 border-b border-border">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="flex gap-1.5 items-start bg-muted p-1.5 rounded-md border border-border shadow-sm"
                        >
                          <AlertCircle className="size-2.5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-foreground leading-tight">
                            {alert.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="divide-y divide-border">
                    {pendingTasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        No tasks need attention — you&apos;re all caught up.
                      </p>
                    ) : (
                      pendingTasks.slice(0, 4).map((task) => (
                        <div
                          key={task.id}
                          className="group p-2 px-3 sm:px-3.5 hover:bg-muted/50 transition-colors flex items-start gap-2 cursor-pointer touch-target"
                        >
                          <Circle className="size-3 text-muted-foreground group-hover:text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate tracking-tight leading-none">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 leading-none flex-wrap">
                              {task.priority === "high" && (
                                <Badge variant="destructive">Urgent</Badge>
                              )}
                              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                {task.dueDate
                                  ? `Due ${new Date(task.dueDate).toLocaleDateString()}`
                                  : "No due date"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="p-1.5 bg-muted/10 border-t border-border">
                  <Button variant="ghost" size="sm">
                    View All Tasks{" "}
                    <ArrowRight className="size-2 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function DashboardHomeWithAuth({
  setActiveTab,
  belowHeaderSlot,
}: DashboardHomeProps) {
  const { profile, loading } = useAuth();

  const resolvedMissionaryId =
    !loading && profile?.id ? profile.id : DEMO_MISSIONARY_ID;

  return (
    <DashboardHomeContent
      missionaryId={resolvedMissionaryId}
      setActiveTab={setActiveTab}
      belowHeaderSlot={belowHeaderSlot}
    />
  );
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  setActiveTab,
  missionaryId,
  belowHeaderSlot,
}) => {
  if (missionaryId) {
    return (
      <DashboardHomeContent
        missionaryId={missionaryId}
        setActiveTab={setActiveTab}
        belowHeaderSlot={belowHeaderSlot}
      />
    );
  }

  return (
    <DashboardHomeWithAuth
      setActiveTab={setActiveTab}
      belowHeaderSlot={belowHeaderSlot}
    />
  );
};
