"use client";

import { formatMoney, minorUnitExponent } from "@asym/api/money";
import { ChartCard } from "@asym/ui/components/primitives/chart-wrappers";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@asym/ui/components/shadcn/chart";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import dynamic from "next/dynamic";

import type { GivingTrend } from "@asym/api/reads/dashboard-stats";

const TITLE = "Net giving by month";

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const MONTH_SHORT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const MONTH_DAY = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
const FULL_DATE = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const trendConfig = {
  net: { label: "Net giving", color: "var(--chart-1)" },
} satisfies ChartConfig;

type TrendPoint = {
  label: string;
  name: string;
  net: number;
  exact: string;
  soFar: boolean;
};

function monthDate(month: string): Date {
  return new Date(`${month}-01T00:00:00.000Z`);
}

function joinNames(names: string[]): string {
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function giftWord(count: number): string {
  return `${count.toLocaleString("en-US")} ${count === 1 ? "gift" : "gifts"}`;
}

const TrendChart = dynamic<{ data: TrendPoint[]; compact: Intl.NumberFormat }>(
  async () => {
    const { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } =
      await import("recharts");

    function TrendChartInner({
      data,
      compact,
    }: {
      data: TrendPoint[];
      compact: Intl.NumberFormat;
    }) {
      return (
        <div className="h-56 w-full">
          <ChartContainer config={trendConfig} layout="fill">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ left: 4, right: 4 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(value: number) => compact.format(value)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_label, payload) => {
                      const point = payload?.[0]?.payload as
                        TrendPoint | undefined;
                      return point?.name ?? "";
                    }}
                    formatter={(_value, _name, item) =>
                      (item.payload as TrendPoint).exact
                    }
                  />
                }
              />
              <Bar dataKey="net" fill="var(--color-net)" radius={4}>
                {data.map((point) => (
                  // The month in progress is lighter, so it never reads as
                  // a finished month that fell short.
                  <Cell key={point.name} fillOpacity={point.soFar ? 0.45 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      );
    }

    return TrendChartInner;
  },
  {
    ssr: false,
    loading: () => <Skeleton className="h-56 w-full rounded-lg" />,
  },
);

/**
 * Why the trend period's amounts can't be added together, or null when the
 * gifts share one known currency (or there are none). Home's monthly figure
 * comes from the same gifts, so it uses the same notice.
 */
export function mixedCurrencyNotice(
  trend: GivingTrend,
  totals: string,
): string | null {
  if (trend.currency || trend.currencies.length === 0) return null;
  return trend.currencies.includes("unknown")
    ? `Some gifts in this period have no currency recorded, so ${totals} can't be added together.`
    : `Gifts in this period are in more than one currency (${joinNames(trend.currencies)}), so ${totals} can't be added together.`;
}

function describeTrend(trend: GivingTrend) {
  const start = MONTH_YEAR.format(new Date(trend.periodStart));
  const asOf = new Date(trend.asOf);
  const current = trend.months.at(-1);
  const currentName = current
    ? MONTH_YEAR.format(monthDate(current.month))
    : "";
  return {
    period: `${start} to ${FULL_DATE.format(asOf)}`,
    soFarNote: `${currentName} is so far, through ${MONTH_DAY.format(asOf)} (UTC), not a full month.`,
  };
}

/**
 * Both Home and Reports use applied amount/currency corrections, then refunds.
 */
const NETTING = "Settled gifts, after refunds.";
const CORRECTIONS_NOTE =
  "Applied amount and currency corrections are included.";

/**
 * Settled giving by UTC month, after refunds: the last 12 full months, then
 * the current month so far. Shared by Home and Reports.
 */
export function GivingTrendCard({
  trend,
  isLoading = false,
  onRetry,
  errorMessage = "Load the page again to see giving by month.",
  scopeNote,
}: {
  /** `null` means the read failed; leave it out while loading. */
  trend?: GivingTrend | null;
  isLoading?: boolean;
  onRetry?: () => void;
  errorMessage?: string;
  /** Where the page around it has its own filters, says they don't apply. */
  scopeNote?: string;
}) {
  const ownDescription = (period?: string) =>
    [
      NETTING,
      CORRECTIONS_NOTE,
      period ? `Period: ${period} (UTC).` : null,
      scopeNote,
    ]
      .filter(Boolean)
      .join(" ");
  const shared = {
    role: "region",
    "aria-label": TITLE,
    title: TITLE,
    headingLevel: 2,
    errorTitle: `${TITLE} couldn't load`,
    errorMessage,
    onRetry,
  } as const;

  if (isLoading || trend === undefined) {
    return (
      <ChartCard {...shared} description={ownDescription()} isLoading>
        {null}
      </ChartCard>
    );
  }

  if (trend === null) {
    return (
      <ChartCard {...shared} description={ownDescription()} isError>
        {null}
      </ChartCard>
    );
  }

  const { period, soFarNote } = describeTrend(trend);
  const description = ownDescription(period);
  const hasGifts = trend.months.some((month) => month.giftCount > 0);

  if (!trend.currency) {
    const emptyMessage =
      (hasGifts && mixedCurrencyNotice(trend, "monthly totals")) ||
      `No settled gifts from ${period}.`;
    return (
      <ChartCard
        {...shared}
        description={description}
        isEmpty
        emptyMessage={emptyMessage}
      >
        {null}
      </ChartCard>
    );
  }

  const currency = trend.currency;
  const minorUnitsPerMajor = 10 ** minorUnitExponent(currency);
  const compact = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: trend.currency,
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const data: TrendPoint[] = trend.months.map((month) => {
    const date = monthDate(month.month);
    const cents = month.netCents ?? 0;
    const name = `${MONTH_YEAR.format(date)}${month.soFar ? " so far" : ""}`;
    return {
      label: MONTH_SHORT.format(date),
      name,
      net: cents / minorUnitsPerMajor,
      exact: formatMoney(cents, currency, "en-US"),
      soFar: month.soFar,
    };
  });
  const summary = `Net giving by month, ${period} (UTC). ${trend.months
    .map(
      (month, index) =>
        `${data[index]!.name}: ${data[index]!.exact} from ${giftWord(month.giftCount)}`,
    )
    .join("; ")}.`;

  return (
    <ChartCard
      {...shared}
      description={description}
      summary={summary}
      note={soFarNote}
    >
      <TrendChart data={data} compact={compact} />
    </ChartCard>
  );
}
