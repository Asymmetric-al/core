"use client";

import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

import { useSupportReport } from "../../../hooks/use-support-reports";
import { useSupportReportRouteState } from "../../../lib/report-state";
import { combineReportStatus } from "../../../lib/report-status";
import { ReportBarChart } from "../ReportBarChart";
import { ReportExportMenu } from "../ReportExportMenu";
import { ReportFilters } from "../ReportFilters";
import { ReportLoadError } from "../ReportLoadError";
import { ReportTable } from "../ReportTable";

export function LabelsReport() {
  const { request } = useSupportReportRouteState();
  const series = useSupportReport(request("label-mix"));
  const reportStatus = combineReportStatus([series]);
  if (reportStatus.isError || reportStatus.isLoading)
    return (
      <div className="flex flex-col gap-6">
        <ReportFilters
          kinds={["all", "inbox", "agent"]}
          hideGroupBy
          hideBusinessHours
          trailing={
            <ReportExportMenu
              items={[
                { label: "Conversations per label", series: series.data },
              ]}
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
      {/* Like the agent mix, the label mix has no periods to group and no
          message times to clip to business hours. */}
      <ReportFilters
        kinds={["all", "inbox", "agent"]}
        hideGroupBy
        hideBusinessHours
        trailing={
          <ReportExportMenu
            items={[{ label: "Conversations per label", series: series.data }]}
          />
        }
      />
      <ReportBarChart
        series={series.data}
        title="Conversations per label"
        description="Donor-care label mix in the selected window."
      />
      <ReportTable
        series={series.data}
        caption="Conversations per label"
        columns={["Label", "Conversations"]}
      />
    </div>
  );
}
