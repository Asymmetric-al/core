"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { UserRoundX } from "lucide-react";
import Link from "next/link";

import { useSupportReport } from "../../../hooks/use-support-reports";
import { useSupportReportRouteState } from "../../../lib/report-state";
import { combineReportStatus } from "../../../lib/report-status";
import { ReportBarChart } from "../ReportBarChart";
import { ReportExportMenu } from "../ReportExportMenu";
import { ReportFilters } from "../ReportFilters";
import { ReportLoadError } from "../ReportLoadError";
import { ReportTable } from "../ReportTable";

/** The agent-mix bucket for conversations no agent holds yet. */
const UNASSIGNED_KEY = "unassigned";
const UNASSIGNED_INBOX_HREF = "/support?view=unassigned";

export function AgentsReport() {
  const { request } = useSupportReportRouteState();
  const series = useSupportReport(request("agent-mix"));
  const data = series.data;
  // Unassigned is not an agent: it is counted apart rather than ranked
  // among the people (the export keeps every bucket).
  const unassigned =
    data?.buckets.find((bucket) => bucket.key === UNASSIGNED_KEY)?.value ?? 0;
  const agents = data
    ? {
        ...data,
        buckets: data.buckets.filter((bucket) => bucket.key !== UNASSIGNED_KEY),
      }
    : data;

  const reportStatus = combineReportStatus([series]);
  if (reportStatus.isError || reportStatus.isLoading)
    return (
      <div className="flex flex-col gap-6">
        <ReportFilters
          hideScope
          hideGroupBy
          hideBusinessHours
          trailing={
            <ReportExportMenu
              items={[{ label: "Conversations per agent", series: data }]}
              disabled
              disabledReason={
                reportStatus.isError
                  ? "The report couldn’t load."
                  : "The report is still loading."
              }
            />
          }
        />
        {reportStatus.isError ? (
          <ReportLoadError onRetry={reportStatus.retry} />
        ) : (
          <div role="status" aria-label="Loading report">
            <Skeleton className="h-64 w-full" />
            <span className="sr-only">Loading report…</span>
          </div>
        )}
      </div>
    );
  return (
    <div className="flex flex-col gap-6">
      {/* The agent mix counts the range's conversations per agent: no
          periods to group, no message times to clip to business hours. */}
      <ReportFilters
        hideScope
        hideGroupBy
        hideBusinessHours
        trailing={
          <ReportExportMenu
            items={[{ label: "Conversations per agent", series: data }]}
          />
        }
      />
      {unassigned > 0 ? (
        <Alert role="status" aria-label="Unassigned conversations">
          <UserRoundX aria-hidden="true" />
          <AlertTitle>
            {unassigned === 1
              ? "1 conversation has no agent yet"
              : `${unassigned} conversations have no agent yet`}
          </AlertTitle>
          <AlertDescription>
            {/* One paragraph: the description lays out its children as rows. */}
            <p>
              Counted apart from the agents below.{" "}
              {/* The inbox's Unassigned view lists them, ready to assign. */}
              <Link
                href={UNASSIGNED_INBOX_HREF}
                className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                Assign them from the inbox
              </Link>
              .
            </p>
          </AlertDescription>
        </Alert>
      ) : null}
      <ReportBarChart
        series={agents}
        title="Conversations per agent"
        description="How the selected range's conversations are spread across agents."
      />
      <ReportTable
        series={agents}
        caption="Agent conversation totals"
        columns={["Agent", "Conversations"]}
      />
    </div>
  );
}
