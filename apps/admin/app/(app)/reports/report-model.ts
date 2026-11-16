import { formatCurrency } from "@asym/lib/utils";
import { format, parseISO } from "date-fns";
import { TrendingUp, DollarSign, Users, Receipt } from "lucide-react";

import type { DonorsByFundPoint, GivingByFundPoint } from "./reports-charts";
import type { AdminCrmReportResponse } from "@asym/database/types";
import type React from "react";

/** Cap chart series so long fund lists stay legible; the endpoint already sorts by amount desc. */
export const TOP_FUNDS = 8;

export interface ReportKpi {
  label: string;
  value: string;
  context: string;
  icon: React.ComponentType<{ className?: string }>;
}

function toDollars(amountCents: number): number {
  return amountCents / 100;
}

/** All KPI figures come from the report totals — no fabricated benchmarks. */
export function deriveReportKpis(
  report: AdminCrmReportResponse | null,
): ReportKpi[] {
  const totals = report?.totals;
  const amount = toDollars(totals?.amountCents ?? 0);
  const gifts = totals?.giftCount ?? 0;
  const donors = totals?.donorCount ?? 0;
  const average = gifts > 0 ? amount / gifts : 0;

  return [
    {
      context: "Settled gifts, after refunds and corrections",
      icon: DollarSign,
      label: "Net giving",
      value: formatCurrency(amount),
    },
    {
      context: "Settled gifts",
      icon: Receipt,
      label: "Gifts",
      value: gifts.toLocaleString("en-US"),
    },
    {
      context: "Per settled gift",
      icon: TrendingUp,
      label: "Average gift",
      value: formatCurrency(average),
    },
    {
      context: "Different people who gave",
      icon: Users,
      label: "Donors",
      value: donors.toLocaleString("en-US"),
    },
  ];
}

export function deriveGivingByFund(
  report: AdminCrmReportResponse | null,
): GivingByFundPoint[] {
  return (report?.rows ?? []).slice(0, TOP_FUNDS).map((row) => ({
    amount: toDollars(row.amountCents),
    label: row.label,
  }));
}

export function deriveDonorsByFund(
  report: AdminCrmReportResponse | null,
): DonorsByFundPoint[] {
  return (report?.rows ?? []).slice(0, TOP_FUNDS).map((row) => ({
    donors: row.donorCount,
    label: row.label,
  }));
}

function formatDay(value: string) {
  return format(parseISO(value), "MMM d, yyyy");
}

/** The period the report covers, from its date filters. */
export function describeReportPeriod(
  report: AdminCrmReportResponse | null,
): string {
  const from = report?.filters.dateFrom ?? null;
  const to = report?.filters.dateTo ?? null;
  if (from && to) return `${formatDay(from)} – ${formatDay(to)}`;
  if (from) return `Since ${formatDay(from)}`;
  if (to) return `Through ${formatDay(to)}`;
  return "All time";
}

/** Says which funds the charts show, so a capped chart never hides that. */
export function describeChartCoverage(
  report: AdminCrmReportResponse | null,
): string {
  const { singular, plural } = reportGroupLabels(report);
  const funds = report?.rows.length ?? 0;
  if (funds > TOP_FUNDS) {
    return `Top ${TOP_FUNDS} of ${funds} ${plural} by net giving; every ${singular} is listed below.`;
  }
  return funds === 1
    ? `The one ${singular} with giving.`
    : `All ${funds} ${plural}.`;
}

export interface FundRow {
  id: string;
  label: string;
  amountCents: number;
  giftCount: number;
  donorCount: number;
  /** Share of all completed giving, 0–1. */
  share: number;
  lastGiftAt: string | null;
}

/** Every fund in the report, with its share of total giving. */
export function deriveFundRows(
  report: AdminCrmReportResponse | null,
): FundRow[] {
  const total = report?.totals.amountCents ?? 0;
  return (report?.rows ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    amountCents: row.amountCents,
    giftCount: row.giftCount,
    donorCount: row.donorCount,
    share: total > 0 ? row.amountCents / total : 0,
    lastGiftAt: row.lastGiftAt,
  }));
}

/**
 * A plain-text giving summary to paste into an email or a board report:
 * totals, the average gift and the top fund with its share, from the same
 * report the page shows (amounts exact, from cents). Null when nothing was
 * given, so no empty summary is offered.
 */
export function buildGivingSummaryText(
  report: AdminCrmReportResponse | null,
): string | null {
  const totals = report?.totals;
  if (!report || !totals || totals.rowCount === 0 || totals.amountCents === 0) {
    return null;
  }
  const period = describeReportPeriod(report);
  const periodLead = /^(All|Since|Through)\b/.test(period)
    ? period.charAt(0).toLowerCase() + period.slice(1)
    : period;
  const gifts = totals.giftCount;
  const average = gifts > 0 ? toDollars(totals.amountCents) / gifts : 0;
  const lines = [
    `Giving summary, ${periodLead}`,
    `Net giving (after refunds): ${formatCurrency(toDollars(totals.amountCents))} from ${gifts.toLocaleString("en-US")} ${gifts === 1 ? "gift" : "gifts"} by ${totals.donorCount.toLocaleString("en-US")} ${totals.donorCount === 1 ? "donor" : "donors"}.`,
    `Average gift: ${formatCurrency(average)}.`,
  ];
  if (report.completeness?.complete === false) {
    const limit = report.completeness.donationLimit;
    lines.splice(
      1,
      0,
      limit === null
        ? "Incomplete report: these totals may omit gifts from this period."
        : `Incomplete report: totals cover only the most recent ${limit.toLocaleString("en-US")} gifts in this period.`,
    );
  } else if (report.completeness?.complete !== true) {
    lines.splice(
      1,
      0,
      "Couldn’t confirm that these totals include every gift in this period.",
    );
  }
  const top = report.rows.reduce<(typeof report.rows)[number] | null>(
    (best, row) => (!best || row.amountCents > best.amountCents ? row : best),
    null,
  );
  if (top && top.amountCents > 0) {
    const share = (top.amountCents / totals.amountCents) * 100;
    lines.push(
      `Top ${reportGroupLabels(report).singular}: ${top.label}, ${formatCurrency(toDollars(top.amountCents))} (${share.toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}% of giving).`,
    );
  }
  return lines.join("\n");
}

export function reportGroupLabels(report: AdminCrmReportResponse | null) {
  switch (report?.slice) {
    case "missionaries":
      return {
        singular: "missionary",
        plural: "missionaries",
        title: "Missionaries",
      };
    case "donors":
      return { singular: "donor", plural: "donors", title: "Donors" };
    default:
      return { singular: "fund", plural: "funds", title: "Funds" };
  }
}
