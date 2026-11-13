"use client";

import {
  useMissionaryPortalSnapshot,
  usePendingFollowRequestCount,
} from "@asym/database/hooks";
import { useAuth, useDonationMetrics, useLocaleFormat } from "@asym/lib/hooks";
import { PageHeader } from "@asym/ui/components/page-header";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { PenLine, UserPlus } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { buildMissionaryDashboardView } from "./dashboard-view";
import { GivingBreakdownChartContent } from "./giving-breakdown-chart";
import {
  LatestUpdatesCard,
  NeedsYouCard,
  RecentGiftsCard,
  SupportCard,
} from "./home/home-cards";
import {
  buildNeedsYou,
  monthlyPartnerCount,
  recentGifts,
} from "./home/home-model";

import type { DonationMetrics } from "@asym/lib/hooks";

const SHORT_DAY: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
};

interface DashboardHomeProps {
  missionaryId?: string;
  /** Inserted directly under the page header. */
  belowHeaderSlot?: React.ReactNode;
}

function firstName(displayName: string | undefined) {
  return displayName?.trim().split(/\s+/)[0] ?? "";
}

function HomeActions() {
  return (
    <>
      <Link
        href="/donors?add=1"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <UserPlus data-icon="inline-start" aria-hidden />
        Add partner
      </Link>
      <Link href="/feed" className={buttonVariants({ size: "sm" })}>
        <PenLine data-icon="inline-start" aria-hidden />
        Write an update
      </Link>
    </>
  );
}

/** The same frame and header as the other missionary pages. */
function HomeFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 pb-20">
      <PageHeader title={title} description={description}>
        <HomeActions />
      </PageHeader>
      {children}
    </div>
  );
}

function GivingTrendCard({
  metrics,
  committedCents,
  committedCurrency,
}: {
  metrics: DonationMetrics;
  committedCents: number | null;
  committedCurrency: string | null;
}) {
  const titleId = React.useId();
  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle>
          <h2 id={titleId}>Giving by month</h2>
        </CardTitle>
        <CardDescription>
          The last 13 months.{" "}
          {metrics.currency &&
          metrics.currency === committedCurrency &&
          committedCents !== null &&
          committedCents > 0
            ? "The dashed line is what partners have committed each month right now."
            : "A commitment line is shown only when its currency matches these gifts."}
        </CardDescription>
        <CardAction className="-mt-1.5">
          <Link
            href="/analytics"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Analytics
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <GivingBreakdownChartContent
          metrics={metrics}
          committedCents={committedCents}
          committedCurrency={committedCurrency}
        />
      </CardContent>
    </Card>
  );
}

function DashboardHomeContent({
  missionaryId,
  belowHeaderSlot,
}: {
  /** Empty until the signed-in missionary is known. */
  missionaryId: string;
  belowHeaderSlot?: React.ReactNode;
}) {
  const portalQuery = useMissionaryPortalSnapshot();
  const followRequests = usePendingFollowRequestCount();
  const fetched = useDonationMetrics(missionaryId);
  const metrics = missionaryId ? fetched : { ...fetched, isLoading: true };
  const { formatDate } = useLocaleFormat();
  const snapshot = portalQuery.data;
  const name = firstName(snapshot?.profile?.displayName);
  const title = name ? `Welcome back, ${name}` : "Welcome back";
  const description = "Here’s what needs you and how your support is doing.";

  if (portalQuery.isLoading) {
    return (
      <HomeFrame title={title} description={description}>
        <div className="section-gap">
          {belowHeaderSlot}
          <div
            className="grid gap-4 lg:grid-cols-12"
            role="group"
            aria-busy="true"
            aria-label="Loading your home page"
          >
            <Skeleton className="h-64 rounded-xl lg:col-span-7" />
            <Skeleton className="h-64 rounded-xl lg:col-span-5" />
            <Skeleton className="h-80 rounded-xl lg:col-span-7" />
            <Skeleton className="h-80 rounded-xl lg:col-span-5" />
          </div>
        </div>
      </HomeFrame>
    );
  }

  if (portalQuery.error) {
    return (
      <HomeFrame title={title} description={description}>
        <div className="section-gap">
          {belowHeaderSlot}
          <Card>
            <CardContent className="flex flex-col items-start gap-3">
              <p role="alert" className="text-sm font-medium text-foreground">
                We couldn’t load your home page.
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
      </HomeFrame>
    );
  }

  const { support } = buildMissionaryDashboardView(snapshot);
  const committedCents = support?.monthlyCommittedCents ?? null;
  const committedCurrency = support?.monthlyCommittedCurrency ?? null;
  const formatDay = (value: string) => formatDate(value, SHORT_DAY);
  const needsYou = buildNeedsYou({
    snapshot,
    followRequestCount: followRequests.error
      ? null
      : (followRequests.data ?? 0),
    formatDay,
  });
  const urgent = needsYou.some((item) => item.tone === "urgent");
  const needsYouCard = (
    <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-start-1">
      <NeedsYouCard items={needsYou} />
    </div>
  );

  return (
    <HomeFrame title={title} description={description}>
      <div className="section-gap">
        {belowHeaderSlot}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* On phones, urgent work is read before the totals. Wide screens
              place each card explicitly, so source order only sets reading
              order. */}
          {urgent ? needsYouCard : null}
          <div className="min-w-0 lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <SupportCard
              committedCents={committedCents}
              goalCents={support?.goalCents ?? null}
              goalCurrency={support?.goalCurrency ?? null}
              committedCurrency={committedCurrency}
              metricsCurrency={metrics.currency}
              thisMonthCents={metrics.thisMonth.total}
              lastMonthCents={metrics.lastMonth.total}
              yearCents={metrics.yearToDate.total}
              monthlyPartners={monthlyPartnerCount(snapshot)}
              metricsLoading={metrics.isLoading}
              metricsFailed={Boolean(metrics.error)}
              onRetryMetrics={metrics.retry}
            />
          </div>
          {urgent ? null : needsYouCard}
          <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-start-2">
            <RecentGiftsCard
              gifts={recentGifts(snapshot)}
              formatDay={formatDay}
            />
          </div>
          <div className="min-w-0 lg:col-span-7 lg:col-start-1 lg:row-start-2">
            <GivingTrendCard
              metrics={metrics}
              committedCents={committedCents}
              committedCurrency={committedCurrency}
            />
          </div>
        </div>
        <LatestUpdatesCard
          updates={snapshot?.ministryUpdates ?? []}
          formatDay={formatDay}
        />
      </div>
    </HomeFrame>
  );
}

function DashboardHomeWithAuth({ belowHeaderSlot }: DashboardHomeProps) {
  const { profile, loading } = useAuth();
  return (
    <DashboardHomeContent
      missionaryId={loading ? "" : (profile?.id ?? "")}
      belowHeaderSlot={belowHeaderSlot}
    />
  );
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  missionaryId,
  belowHeaderSlot,
}) => {
  if (missionaryId) {
    return (
      <DashboardHomeContent
        missionaryId={missionaryId}
        belowHeaderSlot={belowHeaderSlot}
      />
    );
  }
  return <DashboardHomeWithAuth belowHeaderSlot={belowHeaderSlot} />;
};
