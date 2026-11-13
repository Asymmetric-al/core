"use client";

import { useAuth, useDonationMetrics } from "@asym/lib/hooks";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { MONEY_UNAVAILABLE } from "@asym/missionary/components/money-units";
import { PageHeader } from "@asym/ui/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import dynamic from "next/dynamic";
import * as React from "react";

import {
  formatMoney,
  givingMix,
  givingYear,
  monthlyYearOverYear,
  partnerRetention,
  YEAR_OVER_YEAR_SERIES,
  yearOverYearTable,
  type AnalyticsGift,
  type YearOverYearMonth,
} from "./analytics-model";

// Recharts loads only on this page, after the numbers have rendered.
const YearOverYearChart = dynamic(() => import("./analytics-charts"), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

const YEAR_OVER_YEAR_TITLE = "The last 12 months beside the year before";

function Region({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
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
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StatRegion({
  title,
  value,
  comparison,
}: {
  title: string;
  value: string;
  comparison: string;
}) {
  const titleId = React.useId();
  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle>
          <h2
            id={titleId}
            className="text-sm font-normal text-muted-foreground"
          >
            {title}
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{comparison}</p>
      </CardContent>
    </Card>
  );
}

/**
 * The chart's values for screen readers: the plotted bars are hidden from
 * them, so each month's exact amounts are read from this table instead.
 */
function YearOverYearTable({
  months,
  currency,
}: {
  months: YearOverYearMonth[];
  currency: string;
}) {
  const { period, rows } = yearOverYearTable(months);
  return (
    // A table grows to fit its content whatever its width, so the hidden
    // wrapper does the clipping; sr-only on the table could widen the page.
    <div className="sr-only">
      <table>
        <caption>{`${YEAR_OVER_YEAR_TITLE}, ${period}`}</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">{YEAR_OVER_YEAR_SERIES.thisYear}</th>
            <th scope="col">{YEAR_OVER_YEAR_SERIES.lastYear}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3}>No months to show.</td>
            </tr>
          ) : null}
          {rows.map((month) => (
            <tr key={month.key}>
              <th scope="row">{month.name}</th>
              <td>{formatMoney(month.thisYearCents, currency)}</td>
              <td>{formatMoney(month.lastYearCents, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function changeSentence(
  changePct: number | null,
  priorCents: number | null,
  currency: string | null,
) {
  if (!currency) return MONEY_UNAVAILABLE;
  if (changePct === null) return "Nothing to compare with from the year before";
  if (changePct === 0)
    return `The same as the 12 months before (${formatMoney(priorCents, currency)})`;
  return `${changePct > 0 ? "Up" : "Down"} ${Math.abs(changePct)}% on the 12 months before (${formatMoney(priorCents, currency)})`;
}

function AnalyticsContent({ gifts }: { gifts: AnalyticsGift[] }) {
  const now = React.useMemo(() => new Date(), []);
  const year = givingYear(gifts, now);
  const retention = partnerRetention(gifts, now);
  const mix = givingMix(gifts, now);
  const months = monthlyYearOverYear(gifts, now);
  const chartData = months.map((month) => ({
    label: month.label,
    thisYear: month.thisYearCents,
    lastYear: month.lastYearCents,
  }));
  const bestMonth = [...months].sort(
    (a, b) => b.thisYearCents - a.thisYearCents,
  )[0];

  if (!gifts.some((gift) => gift.status === "completed")) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No gifts in the last 12 months yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Unused kinds are left out rather than shown as 0%; swatches match the
  // home chart's bars.
  const mixRows = [
    {
      kind: "recurring",
      label: "Recurring",
      cents: mix.recurringCents,
      swatch: "bg-chart-1",
    },
    {
      kind: "one-time",
      label: "One-time",
      cents: mix.oneTimeCents,
      swatch: "bg-chart-2",
    },
    {
      kind: "offline",
      label: "Offline (cash and checks)",
      cents: mix.offlineCents,
      swatch: "bg-chart-3",
    },
  ].filter(
    (row): row is typeof row & { cents: number } =>
      row.cents !== null && row.cents > 0,
  );
  const mixTotal = mixRows.reduce((sum, row) => sum + row.cents, 0);
  const share = (cents: number) =>
    mixTotal > 0 ? Math.round((cents / mixTotal) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatRegion
          title="Given in the last 12 months"
          value={formatMoney(year.last12Cents, year.currency)}
          comparison={changeSentence(
            year.changePct,
            year.prior12Cents,
            year.currency,
          )}
        />
        <StatRegion
          title="Partners who gave again"
          value={retention.ratePct === null ? "—" : `${retention.ratePct}%`}
          comparison={
            retention.priorPartners === 0
              ? "No partners gave in the year before"
              : `${retention.retainedPartners} of ${retention.priorPartners} partners from the year before gave again`
          }
        />
        <StatRegion
          title="Typical gift"
          value={formatMoney(year.medianGiftCents, year.currency)}
          comparison={
            !year.currency
              ? `${year.giftCount} gifts. ${MONEY_UNAVAILABLE}`
              : year.averageGiftCents === null
                ? "No gifts yet"
                : `Middle of ${year.giftCount} gifts · average ${formatMoney(year.averageGiftCents, year.currency)}`
          }
        />
      </div>

      <Region
        title={YEAR_OVER_YEAR_TITLE}
        description={
          bestMonth && bestMonth.thisYearCents > 0
            ? `Each month of the last 12 against the same month a year earlier. Your strongest month was ${bestMonth.label} (${formatMoney(bestMonth.thisYearCents, year.currency)}).`
            : "Each month of the last 12 against the same month a year earlier."
        }
      >
        {year.currency ? (
          <>
            <div className="h-72">
              <YearOverYearChart data={chartData} currency={year.currency} />
            </div>
            <YearOverYearTable months={months} currency={year.currency} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{MONEY_UNAVAILABLE}</p>
        )}
      </Region>

      <Region
        title="How people gave"
        description="The last 12 months by kind of gift."
      >
        {year.currency ? (
          <div className="flex flex-col gap-4">
            <div
              role="img"
              aria-label={mixRows
                .map((row) => `${row.label} ${share(row.cents)}%`)
                .join(", ")}
              className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted"
            >
              {mixRows.map((row) => (
                <div
                  key={row.kind}
                  data-kind={row.kind}
                  className={cn(
                    "h-full w-(--share) first:rounded-l-full last:rounded-r-full",
                    row.swatch,
                  )}
                  style={
                    {
                      "--share": `${(row.cents / mixTotal) * 100}%`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
            <ul className="flex flex-col gap-3">
              {mixRows.map((row) => (
                <li
                  key={row.kind}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <span
                      aria-hidden
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        row.swatch,
                      )}
                    />
                    {row.label}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {`${formatMoney(row.cents, year.currency)} · ${share(row.cents)}%`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{MONEY_UNAVAILABLE}</p>
        )}
      </Region>
    </div>
  );
}

export default function AnalyticsPage() {
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();
  const { profile, loading } = useAuth();
  const metrics = useDonationMetrics(loading ? "" : (profile?.id ?? ""));
  const gifts = metrics.gifts ?? [];

  return (
    <div
      className={cn(
        "mx-auto flex max-w-6xl flex-col gap-6 pb-20",
        !withinRouteVt && "animate-in fade-in duration-300",
      )}
    >
      <PageHeader
        title="Analytics"
        description="How your support has changed over the last year."
      />
      {loading || metrics.isLoading ? (
        <div
          role="status"
          aria-label="Loading analytics"
          className="flex flex-col gap-6"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : metrics.error ? (
        <Card>
          <CardContent>
            <p role="alert" className="text-sm text-foreground">
              We couldn’t load your giving history. Refresh the page to try
              again.
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnalyticsContent gifts={gifts} />
      )}
    </div>
  );
}
