import { formatCurrency } from "@asym/lib/utils";
import { TrendingUp, DollarSign, Users, Receipt } from "lucide-react";

import type { DonorsByFundPoint, GivingByFundPoint } from "./reports-charts";
import type { AdminCrmReportResponse } from "@asym/database/types";
import type React from "react";

/** Cap chart series so long fund lists stay legible; the endpoint already sorts by amount desc. */
const TOP_FUNDS = 8;

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
      context: "Across all completed gifts",
      icon: DollarSign,
      label: "Completed Giving",
      value: formatCurrency(amount),
    },
    {
      context: "Completed gift count",
      icon: Receipt,
      label: "Total Gifts",
      value: gifts.toLocaleString("en-US"),
    },
    {
      context: "Per completed gift",
      icon: TrendingUp,
      label: "Average Gift",
      value: formatCurrency(average),
    },
    {
      context: "Unique giving donors",
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

/** Deterministic executive summary computed from the loaded report — no LLM, no fake latency. */
export function buildReportSummary(
  report: AdminCrmReportResponse | null,
): string | null {
  const totals = report?.totals;
  if (!totals || totals.rowCount === 0 || totals.amountCents === 0) {
    return null;
  }

  const amount = toDollars(totals.amountCents);
  const average = totals.giftCount > 0 ? amount / totals.giftCount : 0;
  const topFund = report?.rows[0];

  const lines = [
    "### Giving Summary",
    `*   **Completed giving:** ${formatCurrency(amount)} across ${totals.giftCount.toLocaleString(
      "en-US",
    )} gifts from ${totals.donorCount.toLocaleString("en-US")} donors.`,
    `*   **Average gift:** ${formatCurrency(average)}.`,
  ];

  if (topFund) {
    lines.push(
      `*   **Top fund:** ${topFund.label} — ${formatCurrency(
        toDollars(topFund.amountCents),
      )}.`,
    );
  }

  return lines.join("\n");
}
