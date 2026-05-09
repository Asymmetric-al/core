"use client";

import { useSupportReport } from "../../../hooks/use-support-reports";
import { useSupportReportRouteState } from "../../../lib/report-state";
import { ReportBarChart } from "../ReportBarChart";
import { ReportExportMenu } from "../ReportExportMenu";
import { ReportFilters } from "../ReportFilters";
import { ReportTable } from "../ReportTable";

export function AgentsReport() {
  const { request } = useSupportReportRouteState();
  const series = useSupportReport(request("agent-mix"));

  return (
    <div className="flex flex-col gap-6">
      <ReportFilters
        hideScope
        trailing={<ReportExportMenu series={series.data} />}
      />
      <ReportBarChart
        series={series.data}
        title="Conversations per agent"
        description="Workload distribution for the selected window."
      />
      <ReportTable series={series.data} />
    </div>
  );
}
