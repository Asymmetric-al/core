"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Meter } from "@asym/ui/components/shadcn/meter";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import {
  CircleAlert,
  CircleCheck,
  HandHeart,
  ListChecks,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { formatCents, MONEY_UNAVAILABLE, moneyProgress } from "../money-units";
import { postTypeLabel } from "./home-model";

import type { NeedsYouItem, RecentGift } from "./home-model";
import type { MissionaryPortalSnapshot } from "@asym/database/hooks";

type FormatDay = (value: string) => string;

/** Hosts the image optimizer is configured for (see next.config images). */
const OPTIMIZED_IMAGE_HOST =
  /(^|\.)(images\.unsplash\.com|res\.cloudinary\.com|supabase\.co)$/;

function canOptimize(src: string) {
  try {
    return OPTIMIZED_IMAGE_HOST.test(new URL(src).hostname);
  } catch {
    return false;
  }
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

/** A card announced as a named region, titled by its own heading. */
function RegionCard({
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const titleId = React.useId();
  return (
    <Card role="region" aria-labelledby={titleId} className={className}>
      <CardHeader>
        <CardTitle>
          <h2 id={titleId}>{title}</h2>
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <CardAction className="-mt-1.5">{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
        {loading ? <Skeleton className="h-7 w-16" /> : value}
      </dd>
    </div>
  );
}

/** Goal coverage first, then what has come in. */
export function SupportCard({
  committedCents,
  committedCurrency,
  goalCents,
  goalCurrency,
  metricsCurrency,
  thisMonthCents,
  lastMonthCents,
  yearCents,
  monthlyPartners,
  metricsLoading,
  metricsFailed = false,
  onRetryMetrics,
}: {
  committedCents: number | null;
  committedCurrency: string | null;
  goalCents: number | null;
  goalCurrency: string | null;
  metricsCurrency: string | null;
  thisMonthCents: number | null;
  lastMonthCents: number | null;
  yearCents: number | null;
  monthlyPartners: number;
  metricsLoading: boolean;
  metricsFailed?: boolean;
  onRetryMetrics?: () => void;
}) {
  const progress = moneyProgress(
    committedCents,
    committedCurrency,
    goalCents,
    goalCurrency,
  );
  const hasGoal = progress !== null;
  const covered = progress?.covered ?? 0;
  const percent = progress?.percent ?? 0;
  const stillNeeded = progress?.remaining ?? null;
  // No commitments have no currency to show a zero in.
  const noCommitments = monthlyPartners === 0;

  return (
    <RegionCard
      title="Monthly support"
      description="What partners have committed to give each month."
      className="h-full"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          {noCommitments ? (
            <p className="text-muted-foreground">
              No partners have committed monthly support yet.
            </p>
          ) : (
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
                {formatCents(committedCents, committedCurrency)}
              </span>
              <span className="text-muted-foreground">
                {hasGoal
                  ? `a month of your ${formatCents(goalCents, goalCurrency)} goal`
                  : "a month"}
              </span>
            </p>
          )}
          {noCommitments ? null : hasGoal ? (
            <>
              <Meter
                value={covered}
                max={goalCents ?? 1}
                aria-label="Monthly support toward your goal"
                getAriaValueText={() => `${percent}% of your monthly goal`}
              />
              <p className="text-sm text-muted-foreground">
                {stillNeeded === 0
                  ? "You’ve reached your monthly goal."
                  : `${percent}% of your goal · ${formatCents(stillNeeded, goalCurrency)} a month still needed`}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Goal comparison unavailable: the goal and commitments need the
              same known currency.
            </p>
          )}
        </div>
        {!metricsLoading && !metricsCurrency && !metricsFailed ? (
          <p className="text-sm text-muted-foreground">{MONEY_UNAVAILABLE}</p>
        ) : null}
        {metricsFailed && !metricsLoading ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p role="alert" className="text-sm text-foreground">
              We couldn’t load your giving totals.
            </p>
            <Button variant="outline" size="sm" onClick={onRetryMetrics}>
              Try again
            </Button>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="This month so far"
              value={formatCents(thisMonthCents, metricsCurrency)}
              loading={metricsLoading}
            />
            <Stat
              label="Last month"
              value={formatCents(lastMonthCents, metricsCurrency)}
              loading={metricsLoading}
            />
            <Stat
              label="This year"
              value={formatCents(yearCents, metricsCurrency)}
              loading={metricsLoading}
            />
            <Stat label="Monthly partners" value={String(monthlyPartners)} />
          </dl>
        )}
      </div>
    </RegionCard>
  );
}

const NEEDS_YOU_ICONS: Record<NeedsYouItem["kind"], typeof CircleAlert> = {
  "overdue-tasks": ListChecks,
  behind: CircleAlert,
  thank: HandHeart,
  "follow-requests": UserPlus,
};

/** How many "Needs you" items show before "Show more". */
const NEEDS_YOU_VISIBLE = 3;

/** What needs the missionary today, each with a way to act. */
export function NeedsYouCard({ items }: { items: NeedsYouItem[] }) {
  const [expanded, setExpanded] = React.useState(false);
  const listId = React.useId();
  const hidden = Math.max(0, items.length - NEEDS_YOU_VISIBLE);
  const shown = expanded ? items : items.slice(0, NEEDS_YOU_VISIBLE);
  return (
    <RegionCard
      title="Needs you"
      description={
        items.length > 0
          ? "Most urgent first."
          : "Nothing is waiting on you right now."
      }
      className="h-full"
    >
      {items.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleCheck className="size-4 text-success" aria-hidden />
          You’re all caught up.
        </p>
      ) : (
        <ul id={listId} className="flex flex-col divide-y divide-border">
          {shown.map((item) => {
            const Icon = NEEDS_YOU_ICONS[item.kind];
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Icon
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0",
                    item.tone === "urgent"
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  {item.detail ? (
                    <p className="text-sm text-muted-foreground">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={item.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {item.action}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {hidden > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 self-start"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Show less" : `Show ${hidden} more`}
        </Button>
      ) : null}
    </RegionCard>
  );
}

export function RecentGiftsCard({
  gifts,
  formatDay,
}: {
  gifts: RecentGift[];
  formatDay: FormatDay;
}) {
  return (
    <RegionCard
      title="Recent gifts"
      className="h-full"
      action={
        <Link
          href="/donors"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          All partners
        </Link>
      }
    >
      {gifts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Gifts will show up here as they arrive.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {gifts.map((gift) => (
            <li key={gift.id} className="flex items-center gap-3">
              <Avatar>
                {gift.avatarUrl ? (
                  <AvatarImage src={gift.avatarUrl} alt="" />
                ) : null}
                <AvatarFallback>{initials(gift.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {gift.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDay(gift.date)}
                  {gift.recurring ? " · Monthly" : ""}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums text-foreground">
                {formatCents(gift.amountCents, gift.currency)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </RegionCard>
  );
}

type Update = MissionaryPortalSnapshot["ministryUpdates"][number];

function responses(count: number) {
  return `${count} ${count === 1 ? "response" : "responses"}`;
}

export function LatestUpdatesCard({
  updates,
  formatDay,
}: {
  updates: Update[];
  formatDay: FormatDay;
}) {
  const published = updates
    .filter((update) => update.status === "published")
    .slice(0, 3);
  return (
    <RegionCard
      title="Your latest updates"
      action={
        <Link
          href="/feed"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          All updates
        </Link>
      }
    >
      {published.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Your partners haven’t heard from you yet. A short update or prayer
          request is a great start.
        </p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-3 md:gap-4">
          {published.map((update) => (
            <li key={update.id} className="flex min-w-0 flex-col gap-3">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                {update.imageUrl ? (
                  <Image
                    src={update.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    unoptimized={!canOptimize(update.imageUrl)}
                    className="object-cover"
                  />
                ) : (
                  // Text-only updates show their opening lines instead.
                  <p
                    aria-hidden
                    className="line-clamp-4 p-4 text-sm text-muted-foreground"
                  >
                    {update.excerpt}
                  </p>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {postTypeLabel(update.postType)}
                  </Badge>
                  {update.visibility === "partners_only" ? (
                    <Badge variant="outline">Partners only</Badge>
                  ) : null}
                </div>
                <p className="line-clamp-2 font-medium text-foreground">
                  {update.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[
                    update.createdAt ? formatDay(update.createdAt) : null,
                    update.engagementCount > 0
                      ? responses(update.engagementCount)
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </RegionCard>
  );
}
