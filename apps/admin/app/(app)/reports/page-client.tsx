"use client";

import { useAdminCrmReport } from "@asym/database/hooks";
import { SafeHtml } from "@asym/lib/components/safe-html";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { formatCurrency } from "@asym/lib/utils";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  TrendingUp,
  DollarSign,
  Users,
  Receipt,
  FileText,
  X,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import {
  ReportsCharts,
  type DonorsByFundPoint,
  type GivingByFundPoint,
} from "./reports-charts";

import type { AdminCrmReportResponse } from "@asym/database/types";

/** Cap chart series so long fund lists stay legible; the endpoint already sorts by amount desc. */
const TOP_FUNDS = 8;

interface ReportKpi {
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

function ReportsErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle aria-hidden="true" className="size-4" />
      <AlertTitle>Could not load reports</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function KpiSkeletonRow() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="h-[92px] animate-pulse rounded-2xl border border-border bg-muted/40"
        />
      ))}
    </div>
  );
}

function KpiRow({ kpis }: { kpis: ReportKpi[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.25,
            ease: [0.25, 0.1, 0.25, 1],
            delay: index * 0.05,
          }}
        >
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
            <div className="flex min-w-0 flex-col">
              <span className="text-3xl font-black tabular-nums tracking-tight text-foreground">
                {kpi.value}
              </span>
              <span className="mt-0.5 text-sm font-semibold text-foreground">
                {kpi.label}
              </span>
              <span className="mt-1 text-xs font-medium text-muted-foreground">
                {kpi.context}
              </span>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <kpi.icon className="size-4" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ReportsPageView({
  errorMessage,
  hasLoadedData = true,
  isError,
  isLoading,
  report,
}: {
  errorMessage?: string;
  hasLoadedData?: boolean;
  isError: boolean;
  isLoading: boolean;
  report: AdminCrmReportResponse | null;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const queryError = errorMessage ?? "Could not load report data.";

  const kpis = useMemo(() => deriveReportKpis(report), [report]);
  const giving = useMemo(() => deriveGivingByFund(report), [report]);
  const donors = useMemo(() => deriveDonorsByFund(report), [report]);

  const hasGiving = (report?.totals.rowCount ?? 0) > 0;
  const showEmptyState =
    hasLoadedData && !isLoading && !isError && report != null && !hasGiving;
  const canSummarize = !isLoading && !isError && hasGiving;

  return (
    <PageShell
      title="Reports"
      description="Financial and operational insights for the organization."
      density="compact"
      actions={
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setSummary(buildReportSummary(report))}
            disabled={!canSummarize}
            className="h-10 rounded-xl px-5 text-sm font-semibold shadow-md"
          >
            <ClipboardList className="size-4" />
            Quick Summary
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {isError ? <ReportsErrorAlert message={queryError} /> : null}

        {/* Deterministic summary derived from the loaded report */}
        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="overflow-hidden"
            >
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg">
                <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                  <FileText className="size-4 text-primary" /> Executive Summary
                </div>
                <SafeHtml
                  className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-foreground"
                  html={summary.replace(/\n/g, "<br/>")}
                />
                <div className="absolute right-4 top-4">
                  <Button
                    aria-label="Dismiss report summary"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSummary(null)}
                    className="size-9 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <>
            <p
              className="text-sm font-medium text-muted-foreground"
              role="status"
            >
              Loading reports…
            </p>
            <KpiSkeletonRow />
          </>
        ) : (
          <KpiRow kpis={kpis} />
        )}

        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="text-base font-semibold text-foreground">
              No completed giving to report yet
            </p>
            <p className="max-w-md text-sm font-medium text-muted-foreground">
              This tenant has no completed gifts in the selected range. Reports
              will populate once giving is recorded.
            </p>
          </div>
        ) : (
          <ReportsCharts
            donors={donors}
            giving={giving}
            isEmpty={!isLoading && !hasGiving}
          />
        )}
      </div>
    </PageShell>
  );
}

export default function MissionControlReports() {
  const reportQuery = useAdminCrmReport("funds");
  const errorMessage =
    reportQuery.error instanceof Error
      ? reportQuery.error.message
      : reportQuery.error
        ? String(reportQuery.error)
        : undefined;

  return (
    <ReportsPageView
      errorMessage={errorMessage}
      hasLoadedData={reportQuery.report != null}
      isError={reportQuery.isError}
      isLoading={reportQuery.isLoading}
      report={reportQuery.report}
    />
  );
}
