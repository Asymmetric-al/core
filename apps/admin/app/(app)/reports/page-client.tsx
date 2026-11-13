"use client";

import {
  crmReportExportHref,
  crmReportPeriodRange,
  useAdminCrmReport,
  type CrmReportGroup,
  type CrmReportPeriodKey,
} from "@asym/database/hooks";
import {
  MetricCard,
  MetricGrid,
} from "@asym/ui/components/primitives/metric-card";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import { AlertTriangle, ArrowDown, RotateCw } from "lucide-react";
import { parseAsStringEnum, useQueryStates } from "nuqs";
import { useId, useMemo, type ReactNode } from "react";

import { FundsGrid } from "./funds-grid";
import { GivingSummaryDialog } from "./giving-summary-dialog";
import {
  buildGivingSummaryText,
  deriveReportKpis,
  deriveGivingByFund,
  deriveDonorsByFund,
  deriveFundRows,
  describeChartCoverage,
  describeReportPeriod,
  reportGroupLabels,
} from "./report-model";
import { ReportsCharts } from "./reports-charts";

import type { ReportKpi } from "./report-model";
import type { AdminCrmReportResponse } from "@asym/database/types";

const FUNDS_HEADING_ID = "report-funds";

const PERIOD_LABELS: Record<CrmReportPeriodKey, string> = {
  all: "All time",
  year: "This year",
  "12m": "Last 12 months",
  "90d": "Last 90 days",
  "30d": "Last 30 days",
};

const GROUPS = ["funds", "missionaries", "donors"] as const;

/**
 * Grouping and period live in the URL, so reloading or sharing the page
 * keeps the selection. Unknown values fall back to the default report, and
 * the defaults leave the URL clean.
 */
const reportSearchParams = {
  group: parseAsStringEnum<CrmReportGroup>([...GROUPS]).withDefault("funds"),
  period: parseAsStringEnum<CrmReportPeriodKey>(
    Object.keys(PERIOD_LABELS) as CrmReportPeriodKey[],
  ).withDefault("all"),
};

/**
 * Whether the report's totals cover every gift in the period. A response
 * without the field must not take the page down; its totals are shown, but
 * not as a complete picture.
 */
function reportCompleteness(
  report: AdminCrmReportResponse | null,
): "complete" | "capped" | "unknown" | null {
  if (!report) return null;
  const complete = report.completeness?.complete;
  if (complete === true) return "complete";
  return complete === false ? "capped" : "unknown";
}

function ReportsErrorAlert({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive">
      <AlertTriangle aria-hidden="true" className="size-4" />
      <AlertTitle>Could not load reports</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw aria-hidden="true" />
            Retry
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

function KpiSkeletonRow() {
  return (
    <MetricGrid label="Loading giving summary" busy>
      {[0, 1, 2, 3].map((index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
      ))}
    </MetricGrid>
  );
}

function KpiRow({
  kpis,
  unavailable,
}: {
  kpis: ReportKpi[];
  unavailable: boolean;
}) {
  return (
    <MetricGrid label="Giving summary">
      {kpis.map((kpi) => (
        <MetricCard
          key={kpi.label}
          label={kpi.label}
          state={unavailable ? "unavailable" : "ready"}
          unavailableReason="Could not load this figure."
          value={kpi.value}
          detail={kpi.context}
        />
      ))}
    </MetricGrid>
  );
}

export function ReportsPageView({
  errorMessage,
  hasLoadedData = true,
  isError,
  isLoading,
  onRetry,
  report,
  isUpdating = false,
  controls,
  givingTrend,
}: {
  controls?: ReactNode;
  /** Net giving by month: its own fixed period, read on the server. */
  givingTrend?: ReactNode;
  isUpdating?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  hasLoadedData?: boolean;
  isError: boolean;
  isLoading: boolean;
  report: AdminCrmReportResponse | null;
}) {
  const exportReasonId = useId();
  const group = reportGroupLabels(report);
  const exportReason = isError
    ? "Load the report successfully before exporting."
    : isUpdating
      ? "Wait for the report to finish updating."
      : !report || isLoading
        ? "Load a report before exporting."
        : null;
  const queryError = errorMessage ?? "Could not load report data.";

  const kpis = useMemo(() => deriveReportKpis(report), [report]);
  const giving = useMemo(() => deriveGivingByFund(report), [report]);
  const donors = useMemo(() => deriveDonorsByFund(report), [report]);
  const funds = useMemo(() => deriveFundRows(report), [report]);

  const hasGiving = (report?.totals.rowCount ?? 0) > 0;
  const showEmptyState =
    hasLoadedData && !isLoading && !isError && report != null && !hasGiving;
  const showFunds = !isLoading && !isError && hasGiving;
  const period = report ? describeReportPeriod(report) : null;
  const completeness = reportCompleteness(report);
  const summaryText = useMemo(
    () => (showFunds ? buildGivingSummaryText(report) : null),
    [report, showFunds],
  );

  return (
    <PageShell
      title="Reports"
      description={
        period
          ? `Net giving by ${group.singular}, after refunds and corrections. Period: ${period}.`
          : "Net giving, after refunds and corrections."
      }
      density="compact"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {controls}
          {summaryText && !isUpdating ? (
            <GivingSummaryDialog text={summaryText} />
          ) : null}
          {exportReason ? (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled
                aria-describedby={exportReasonId}
              >
                Export CSV
              </Button>
              <span
                id={exportReasonId}
                className="text-xs text-muted-foreground"
              >
                {exportReason}
              </span>
            </>
          ) : (
            <ButtonLink
              variant="outline"
              size="sm"
              render={<a href={crmReportExportHref(report!)} />}
            >
              Export CSV
            </ButtonLink>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6" aria-busy={isUpdating || undefined}>
        {isUpdating ? (
          <p role="status" className="text-sm text-muted-foreground">
            Updating report… The figures below are from the previous selection.
          </p>
        ) : null}
        {isError ? (
          <ReportsErrorAlert message={queryError} onRetry={onRetry} />
        ) : null}

        {completeness === "capped" && !isError ? (
          <Alert role="note">
            <AlertDescription>
              These totals cover only the most recent{" "}
              {report?.completeness.donationLimit} gifts in this period, so they
              are incomplete.
            </AlertDescription>
          </Alert>
        ) : completeness === "unknown" && !isError ? (
          <Alert role="note">
            <AlertDescription>
              Couldn’t confirm that these totals include every gift in this
              period.
            </AlertDescription>
          </Alert>
        ) : null}
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
          <KpiRow kpis={kpis} unavailable={isError || !report} />
        )}

        {showFunds ? (
          <ButtonLink
            variant="outline"
            size="sm"
            className="self-start sm:hidden"
            render={<a href={`#${FUNDS_HEADING_ID}`} />}
          >
            <ArrowDown aria-hidden="true" />
            Jump to {group.plural}
          </ButtonLink>
        ) : null}

        {showEmptyState ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No settled giving to report yet</EmptyTitle>
              <EmptyDescription>
                Giving appears here once gifts are settled.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : !isError && (report || isLoading) ? (
          <ReportsCharts
            donors={donors}
            giving={giving}
            coverage={describeChartCoverage(report)}
            group={group}
            period={period ?? "Selected period"}
            isLoading={isLoading}
            isIncomplete={
              completeness === "capped" || completeness === "unknown"
            }
            onRetry={onRetry}
            isEmpty={!isLoading && !hasGiving}
          />
        ) : null}

        {showFunds ? (
          <FundsGrid funds={funds} headingId={FUNDS_HEADING_ID} group={group} />
        ) : null}

        {/* Its own fixed period and scope, so it follows the figures for the
            selection instead of pushing the funds list down. */}
        {givingTrend}
      </div>
    </PageShell>
  );
}

export default function MissionControlReports({
  givingTrend,
}: {
  givingTrend?: ReactNode;
}) {
  const [{ group, period: periodKey }, setSelection] =
    useQueryStates(reportSearchParams);
  const range = useMemo(() => crmReportPeriodRange(periodKey), [periodKey]);
  const reportQuery = useAdminCrmReport(group, range);
  const errorMessage =
    reportQuery.error instanceof Error
      ? reportQuery.error.message
      : reportQuery.error
        ? String(reportQuery.error)
        : undefined;

  return (
    <ReportsPageView
      givingTrend={givingTrend}
      controls={
        <>
          <ToggleGroup
            aria-label="Group by"
            variant="outline"
            size="sm"
            value={[group]}
            onValueChange={(values) => {
              const value = values[0];
              if (GROUPS.includes(value as CrmReportGroup))
                void setSelection({ group: value as CrmReportGroup });
            }}
          >
            <ToggleGroupItem value="funds">Fund</ToggleGroupItem>
            <ToggleGroupItem value="missionaries">Missionary</ToggleGroupItem>
            <ToggleGroupItem value="donors">Donor</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={periodKey}
            // Lets the trigger show "All time", not the stored key "all".
            items={PERIOD_LABELS}
            onValueChange={(value) => {
              if (value) void setSelection({ period: value });
            }}
          >
            <SelectTrigger aria-label="Period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </>
      }
      isUpdating={reportQuery.isUpdating}
      errorMessage={errorMessage}
      hasLoadedData={reportQuery.report != null}
      isError={reportQuery.isError}
      isLoading={reportQuery.isLoading}
      onRetry={() => void reportQuery.onRefresh()}
      report={reportQuery.report}
    />
  );
}
