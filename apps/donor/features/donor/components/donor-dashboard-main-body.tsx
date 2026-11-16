"use client";

import {
  mapToRecentUpdate,
  useDonorFeedPosts,
  useDonorPortalSnapshot,
  useDonorWallet,
  type DonorPortalSnapshot,
} from "@asym/database/hooks";
import { formatCurrency } from "@asym/lib/utils";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { PageHeader } from "@asym/ui/components/page-header";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import { CircleAlert, Download } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { FeaturedUpdateHero } from "./featured-update-hero";
import {
  giveHref,
  givenThisYear,
  lastSupported,
  nextScheduledGift,
  noNextGiftNote,
  overviewAlerts,
  statementPromptYear,
  supportedMissionaries,
} from "./overview/overview-model";
import { UpdateRailThumbnail } from "./update-rail-thumbnail";

const LONG_DAY = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

function dateOnly(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year!, (month ?? 1) - 1, day ?? 1);
}

/** "today", "tomorrow" or "on November 20". */
function whenFrom(date: string) {
  const day = dateOnly(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return `on ${LONG_DAY.format(day)}`;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "?"
  );
}

function StatCard({
  title,
  value,
  detail,
  href,
  linkLabel,
}: {
  title: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  href: string;
  linkLabel: string;
}) {
  const titleId = React.useId();
  return (
    <Card role="region" aria-labelledby={titleId} className="h-full gap-3">
      <CardHeader>
        <CardTitle>
          <h2
            id={titleId}
            className="text-sm font-normal text-muted-foreground"
          >
            {title}
          </h2>
        </CardTitle>
        {/* Half-width on phones leaves no room beside the title, and the
            phone tab bar already offers Giving and Recurring one tap away. */}
        <CardAction className="-mt-1.5 hidden sm:flex">
          <Link
            href={href}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            {linkLabel}
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-xl font-semibold tracking-tight tabular-nums wrap-anywhere text-foreground sm:text-2xl">
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function SupportedCard({ snapshot }: { snapshot: DonorPortalSnapshot }) {
  const titleId = React.useId();
  const people = supportedMissionaries(snapshot);
  return (
    <Card
      role="region"
      aria-labelledby={titleId}
      className="col-span-2 h-full gap-3 md:col-span-1"
    >
      <CardHeader>
        <CardTitle>
          <h2
            id={titleId}
            className="text-sm font-normal text-muted-foreground"
          >
            Who you support
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Missionaries you give to will appear here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {people.slice(0, 3).map((person) => (
              <li key={person.id} className="flex items-center gap-3">
                <Avatar size="sm">
                  {person.avatarUrl ? (
                    <AvatarImage src={person.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback>{initials(person.name)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {person.name}
                </span>
                <Link
                  href={giveHref(person.id)}
                  aria-label={`Give to ${person.name}`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Give
                </Link>
              </li>
            ))}
            {people.length > 3 ? (
              <li className="text-sm text-muted-foreground">
                and {people.length - 3} more
              </li>
            ) : null}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecentUpdatesCard({
  feedQuery,
}: {
  feedQuery: ReturnType<typeof useDonorFeedPosts>;
}) {
  const titleId = React.useId();
  // The newest update is the featured one; the list shows the next few.
  const updates = feedQuery.data
    .slice(1, 5)
    .map((post) => mapToRecentUpdate(post));
  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle>
          <h2 id={titleId}>More updates</h2>
        </CardTitle>
        <CardAction className="-mt-1.5">
          <Link
            href="/donor-dashboard/feed"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            All updates
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {feedQuery.isLoading ? (
          <div className="flex flex-col gap-4" aria-busy="true">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-12 w-full" />
            ))}
          </div>
        ) : feedQuery.error ? (
          <p className="text-sm text-muted-foreground">
            Updates couldn’t load right now.
          </p>
        ) : updates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            New updates from the missionaries you support will show up here.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {updates.map((update) => (
              <li key={update.id}>
                <Link
                  href={`/donor-dashboard/feed#update-${update.id}`}
                  className="-mx-2 flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <UpdateRailThumbnail
                    image={update.image}
                    authorAvatar={update.authorAvatar}
                    initials={update.avatar}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">
                      {update.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {update.author} · {update.time}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function DonorDashboardMainBody() {
  const portalQuery = useDonorPortalSnapshot();
  const walletQuery = useDonorWallet();
  const feedQuery = useDonorFeedPosts({ limit: 5 });
  const withinRouteVt = useWithinViewTransitionRouteLayer();
  const portal = portalQuery.data;
  const firstName = portal?.profile.displayName.split(" ")[0];
  const alerts = overviewAlerts({ snapshot: portal, wallet: walletQuery.data });
  const year = givenThisYear(portal);
  const next = nextScheduledGift(portal);
  const statementYear = statementPromptYear(portal);
  const giveAgain = lastSupported(portal);

  return (
    <div
      className={cn(
        // Tighter on phones, so the latest update starts within the first
        // screen.
        "mx-auto flex w-full max-w-6xl flex-col gap-4 pb-20 sm:gap-6",
        !withinRouteVt && "animate-in fade-in duration-700",
      )}
    >
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Your giving, what’s coming up, and news from the field."
      >
        {statementYear ? (
          <a
            href={`/api/donor/statements/${statementYear}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Download data-icon="inline-start" aria-hidden />
            {`${statementYear} giving statement`}
          </a>
        ) : null}
        <Link
          href={giveAgain ? giveHref(giveAgain.id) : "/workers"}
          className={buttonVariants()}
        >
          {giveAgain ? `Give to ${giveAgain.name} again` : "Find a missionary"}
        </Link>
      </PageHeader>

      {alerts.map((alert) => (
        <Alert key={alert.id} variant="warning">
          <CircleAlert aria-hidden />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{alert.detail}</span>
              <Link
                href={alert.href}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {alert.action}
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      ))}

      {portalQuery.isLoading ? (
        <div
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3"
          aria-busy="true"
        >
          {[0, 1, 2].map((key) => (
            <Skeleton
              key={key}
              className="h-36 rounded-xl last:col-span-2 md:last:col-span-1"
            />
          ))}
        </div>
      ) : portalQuery.error || !portal ? (
        <Card>
          <CardContent>
            <p role="alert" className="text-sm text-foreground">
              We couldn’t load your giving summary. Refresh the page to try
              again.
            </p>
          </CardContent>
        </Card>
      ) : (
        // Phones set the two money summaries side by side and give the
        // names a full row, so the latest update isn't pushed off screen.
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          <StatCard
            title={`Given in ${new Date().getFullYear()}`}
            value={
              year.complete
                ? formatCurrency(year.paid)
                : `At least ${formatCurrency(year.paid)}`
            }
            detail={
              <>
                {year.complete
                  ? year.paidCount === 1
                    ? "1 gift"
                    : `${year.paidCount} gifts`
                  : `Your latest ${year.paidCount} gifts; see Giving history`}
                {year.processing > 0
                  ? ` · ${formatCurrency(year.processing)} still processing`
                  : ""}
              </>
            }
            href="/donor-dashboard/history"
            linkLabel="Giving history"
          />
          <StatCard
            title="Next gift"
            value={next ? formatCurrency(next.amount) : "None scheduled"}
            detail={
              next
                ? `To ${next.name} ${whenFrom(next.date)}`
                : noNextGiftNote(portal)
            }
            href="/donor-dashboard/pledges"
            linkLabel="Recurring gifts"
          />
          <SupportedCard snapshot={portal} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        <section aria-label="Latest update" className="min-w-0 lg:col-span-8">
          <FeaturedUpdateHero
            key={feedQuery.data[0]?.id ?? "none"}
            post={feedQuery.data[0] ?? null}
            isLoading={feedQuery.isLoading}
            error={feedQuery.error}
          />
        </section>
        <div className="min-w-0 lg:col-span-4">
          <RecentUpdatesCard feedQuery={feedQuery} />
        </div>
      </div>
    </div>
  );
}
