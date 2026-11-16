"use client";

import { formatSharedContributionAmount } from "@asym/api/admin/contribution-shared";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@asym/ui/components/shadcn/chart";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import dynamic from "next/dynamic";
import { useId } from "react";

import { crmGivingByYear, type CrmGivingYear } from "./giving-by-year";

import type { CrmDonorDetailResponse } from "@asym/database/types";

const CHART_HEIGHT_CLASS = "h-32";

const givingConfig = {
  amount: { label: "Settled giving", color: "var(--chart-1)" },
} satisfies ChartConfig;

type ChartPoint = { label: string; amount: number };

function compactCurrency(currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

const GivingBars = dynamic<{ data: ChartPoint[]; currencyCode: string }>(
  async () => {
    const { Bar, BarChart, CartesianGrid, XAxis, YAxis } =
      await import("recharts");

    function GivingBarsInner({
      data,
      currencyCode,
    }: {
      data: ChartPoint[];
      currencyCode: string;
    }) {
      const compact = compactCurrency(currencyCode);
      return (
        <ChartContainer config={givingConfig} layout="fill">
          {/* No keyboard layer: the chart is hidden from assistive
              technology, which reads the table instead. */}
          <BarChart
            accessibilityLayer={false}
            data={data}
            margin={{ left: 0, right: 0, top: 4 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickCount={3}
              tickFormatter={(value: number) => compact.format(value / 100)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    typeof value === "number"
                      ? formatSharedContributionAmount(value, currencyCode)
                      : String(value)
                  }
                />
              }
            />
            <Bar
              dataKey="amount"
              fill="var(--color-amount)"
              radius={4}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      );
    }

    return GivingBarsInner;
  },
  {
    ssr: false,
    loading: () => <Skeleton className={`${CHART_HEIGHT_CLASS} w-full`} />,
  },
);

function yearLabel(year: CrmGivingYear) {
  return year.isCurrentYear ? `${year.year} (so far)` : String(year.year);
}

function GivingByYearTable({
  years,
  currencyCode,
}: {
  years: CrmGivingYear[];
  currencyCode: string;
}) {
  return (
    <table className="sr-only">
      <caption>Settled giving by year</caption>
      <thead>
        <tr>
          <th scope="col">Year</th>
          <th scope="col">Settled giving</th>
          <th scope="col">Gifts</th>
        </tr>
      </thead>
      <tbody>
        {years.map((year) => (
          <tr key={year.year}>
            <th scope="row">{yearLabel(year)}</th>
            <td>
              {formatSharedContributionAmount(year.amountCents, currencyCode)}
            </td>
            <td>
              {year.giftCount === 1 ? "1 gift" : `${year.giftCount} gifts`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * A donor's settled giving per calendar year, so staff can see at a glance
 * whether support is growing, steady or lapsing before they reach out.
 * Drawn from the gift history the drawer already loads; a failed read is
 * covered by the drawer's one detail error, so nothing renders for it.
 */
export function GivingByYearChart({
  detail,
  isLoading,
}: {
  detail: CrmDonorDetailResponse | undefined;
  isLoading: boolean;
}) {
  const headingId = useId();
  if (!detail) {
    return isLoading ? (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Loading giving by year…</span>
        <Skeleton className="h-4 w-28" />
        <Skeleton className={`${CHART_HEIGHT_CLASS} w-full`} />
      </div>
    ) : null;
  }

  const giving = crmGivingByYear(detail, new Date().getFullYear());
  if (giving.kind === "none") return null;

  const heading = (
    <h3 id={headingId} className="text-sm font-semibold text-foreground">
      Giving by year
    </h3>
  );

  if (giving.kind === "mixed-currency") {
    return (
      <section aria-labelledby={headingId} className="flex flex-col gap-1">
        {heading}
        <p className="text-xs text-muted-foreground">
          These gifts are in more than one currency, so they can&apos;t be added
          up by year.
        </p>
      </section>
    );
  }

  const { currencyCode, years } = giving;
  const firstYear = years[0]?.year;
  const notes = [
    "Settled gifts, after refunds.",
    giving.olderYearsLeftOut ? `Last ${years.length} years.` : null,
    giving.truncated
      ? `Counts the 100 most recent gifts only, so ${firstYear} may be incomplete.`
      : null,
  ].filter(Boolean);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        {heading}
        <p className="text-xs text-muted-foreground">{notes.join(" ")}</p>
      </div>
      {/* The table below carries the same figures for assistive technology. */}
      <div aria-hidden="true" className={CHART_HEIGHT_CLASS}>
        <GivingBars
          currencyCode={currencyCode}
          data={years.map((year) => ({
            label: String(year.year),
            amount: year.amountCents,
          }))}
        />
      </div>
      <GivingByYearTable currencyCode={currencyCode} years={years} />
    </section>
  );
}
