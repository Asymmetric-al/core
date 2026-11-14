"use client";

import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

import { useSupportTeams } from "../../../hooks/use-support-agents";
import { useSupportReport } from "../../../hooks/use-support-reports";
import { useSupportReportRouteState } from "../../../lib/report-state";
import { combineReportStatus } from "../../../lib/report-status";
import { ReportBarChart } from "../ReportBarChart";
import { ReportExportMenu } from "../ReportExportMenu";
import { ReportFilters } from "../ReportFilters";
import { ReportLoadError } from "../ReportLoadError";
import { ReportTable } from "../ReportTable";

export function TeamsReport() {
  const { request } = useSupportReportRouteState();
  const report = useSupportReport(request("team-mix"));
  const teams = useSupportTeams();
  const series = report.data;
  const reportStatus = combineReportStatus([report, teams]);
  if (reportStatus.isError || reportStatus.isLoading)
    return (
      <div className="flex flex-col gap-6">
        <ReportFilters
          kinds={["all", "inbox", "agent", "label"]}
          hideGroupBy
          hideBusinessHours
          trailing={
            <ReportExportMenu
              items={[{ label: "Conversations per team", series: series }]}
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
      {/* Team counts are conversations created in the window, per team: no
          periods to group, no message times to clip to business hours. */}
      <ReportFilters
        kinds={["all", "inbox", "agent", "label"]}
        hideGroupBy
        hideBusinessHours
        trailing={
          <ReportExportMenu
            items={[{ label: "Conversations per team", series: series }]}
          />
        }
      />
      <ReportBarChart
        series={series}
        title="Conversations per team"
        description={`${teams.data?.length ?? 0} teams, grouped by conversations in range.`}
      />
      <ReportTable
        series={series}
        caption="Conversations per team"
        columns={["Team", "Conversations"]}
      />
    </div>
  );
}
