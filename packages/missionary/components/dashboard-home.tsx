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
import {
  ArrowUpRight,
  AlertCircle,
  Circle,
  ArrowRight,
  Activity,
} from "lucide-react";
import React from "react";

import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

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
  const { support, pendingTasks, updates: latestUpdates, alerts } =
    buildMissionaryDashboardView(portalQuery.data);

  if (portalQuery.isLoading) {
    return (
      <PageShell
        title="Dashboard"
        description="Your ministry at a glance"
        contentClassName="section-gap"
      >
        {belowHeaderSlot}
        <div
          className="grid gap-4"
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
      </PageShell>
    );
  }

  if (portalQuery.error) {
    return (
      <PageShell
        title="Dashboard"
        description="Your ministry at a glance"
        contentClassName="section-gap"
      >
        {belowHeaderSlot}
        <Card className="border-destructive/40 rounded-xl">
          <CardContent className="p-6 space-y-3 text-left">
            <p role="alert" className="text-sm font-medium text-destructive">
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
      actions={
        <Button
          variant="outline"
          className="h-11 rounded-xl border-zinc-200 bg-white font-semibold uppercase tracking-widest text-[10px] shadow-sm hover:bg-zinc-50"
        >
          Download Report
        </Button>
      }
      contentClassName="section-gap"
    >
      {belowHeaderSlot}
      <MetricTiles missionaryId={missionaryId} />

      <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-0.5 border-b border-zinc-50 gap-y-2 sm:gap-y-0 px-3 sm:px-4 pt-2.5">
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold text-zinc-900 leading-none">
              Giving Breakdown
            </CardTitle>
            <CardDescription className="text-[9px] sm:text-[10px] mt-0.5">
              Monthly support trends over the last 13 months.
            </CardDescription>
          </div>
          {setActiveTab && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] font-semibold text-zinc-500 hover:text-zinc-900 px-2 rounded-md border border-zinc-100 hover:border-zinc-200 transition-colors w-full sm:w-auto"
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
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <Card className="bg-zinc-900 text-zinc-50 border-zinc-800 shadow-xl relative overflow-hidden group rounded-xl">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br from-zinc-700/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-[40px] pointer-events-none" />

            <CardContent className="p-3 sm:p-4 relative z-10">
              {support?.hasGoal ? (
                <>
                  <div>
                    <h2 className="text-zinc-500 font-semibold text-[9px] uppercase tracking-[0.2em] mb-1 leading-none">
                      Monthly Support Goal
                    </h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tighter text-white leading-none">
                        {formatSupportAmount(raisedCents)}
                      </span>
                      <span className="text-zinc-600 text-sm sm:text-base font-medium leading-none">
                        / {formatSupportAmount(goalCents)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <div className="flex justify-between text-[9px] mb-1 text-zinc-500 font-semibold leading-none">
                      <span>{percentFunded}% Funded</span>
                      <span className="text-zinc-400">
                        {formatSupportAmount(remainingCents)} remaining
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      {/* Animate transform: scaleX (GPU, no layout) instead of width */}
                      <div
                        className="size-full origin-left bg-white transition-transform duration-700 ease-[var(--ease-out-soft)]"
                        style={{
                          transform: `scaleX(${Math.min(percentFunded, 100) / 100})`,
                        }}
                        role="progressbar"
                        aria-valuenow={percentFunded}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Support funded"
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-y-2 sm:gap-x-8 pt-2.5 border-t border-zinc-800/50">
                    <div className="flex flex-col gap-0">
                      <span className="text-zinc-600 text-[8px] uppercase tracking-[0.1em] font-semibold leading-none">
                        Gifts
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-white mt-0.5 leading-none">
                        {support.giftCount}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0">
                      <span className="text-zinc-600 text-[8px] uppercase tracking-[0.1em] font-semibold leading-none">
                        Active Donors
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-white mt-0.5 leading-none">
                        {support.activeDonorCount}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <h2 className="text-zinc-500 font-semibold text-[9px] uppercase tracking-[0.2em] mb-1 leading-none">
                    Monthly Support Goal
                  </h2>
                  <p className="text-white text-sm font-medium mt-1">
                    No support goal set yet
                  </p>
                  <p className="text-zinc-500 text-[10px] mt-1">
                    Set a monthly goal to start tracking your support.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardHeader className="pb-1 flex flex-row items-center justify-between gap-y-0 pt-2.5 px-3 sm:px-4">
              <div className="flex items-center gap-1.5">
                <Activity className="size-3 text-zinc-400" />
                <CardTitle className="text-xs sm:text-sm font-semibold text-zinc-900 leading-none">
                  Latest Updates
                </CardTitle>
              </div>
              {setActiveTab && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-md"
                  onClick={() => setActiveTab("feed")}
                >
                  <ArrowUpRight className="size-3" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 sm:px-4 sm:pb-3">
              {latestUpdates.length === 0 ? (
                <p className="sm:col-span-2 text-[10px] text-muted-foreground text-center py-4">
                  No ministry updates yet.
                </p>
              ) : (
                latestUpdates.slice(0, 2).map((post) => (
                  <div
                    key={post.id}
                    className="group flex gap-2 p-1.5 rounded-lg border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-zinc-700 leading-tight font-medium line-clamp-2">
                        {post.content}
                      </p>
                      <p className="text-[8px] text-zinc-400 mt-0.5 font-semibold uppercase tracking-wider">
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
                  className="sm:col-span-2 w-full text-[9px] font-semibold h-7 border-dashed border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                  onClick={() => setActiveTab("feed")}
                >
                  Compose New Update
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="flex flex-col h-auto border-zinc-200 shadow-sm bg-white overflow-hidden rounded-xl">
            <CardHeader className="pb-1.5 border-b border-zinc-50 bg-zinc-50/10 space-y-0 pt-2.5 px-3 sm:px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-semibold text-zinc-900 leading-none">
                  Tasks & Alerts
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-white text-zinc-600 border border-zinc-100 text-[8px] font-semibold px-1 py-0"
                >
                  {pendingTasks.length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {alerts.length > 0 && (
                  <div className="p-1.5 bg-amber-50/10 space-y-1 border-b border-amber-50/50">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex gap-1.5 items-start bg-white p-1.5 rounded-md border border-amber-100/50 shadow-sm"
                      >
                        <AlertCircle className="size-2.5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[9px] font-semibold text-amber-900 leading-tight">
                          {alert.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="divide-y divide-zinc-50">
                  {pendingTasks.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-6">
                      No tasks need attention — you&apos;re all caught up.
                    </p>
                  ) : (
                    pendingTasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        className="group p-2 px-3 sm:px-3.5 hover:bg-zinc-50/50 transition-colors flex items-start gap-2 cursor-pointer touch-target"
                      >
                        <Circle className="size-3 text-zinc-300 group-hover:text-zinc-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-zinc-800 truncate tracking-tight leading-none">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 leading-none flex-wrap">
                            {task.priority === "high" && (
                              <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none text-[7px] h-3 font-semibold uppercase tracking-widest px-1">
                                Urgent
                              </Badge>
                            )}
                            <span className="text-[8px] text-zinc-400 font-semibold uppercase tracking-wider">
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
              <div className="p-1.5 bg-zinc-50/10 border-t border-zinc-50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[8px] font-semibold text-zinc-500 hover:text-zinc-900 h-6 justify-between group rounded-md uppercase tracking-wider touch-target"
                >
                  View All Tasks{" "}
                  <ArrowRight className="size-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
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
