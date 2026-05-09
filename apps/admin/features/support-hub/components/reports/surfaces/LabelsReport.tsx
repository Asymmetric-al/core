"use client";

import { useSupportReport } from "../../../hooks/use-support-reports";
import { useSupportReportRouteState } from "../../../lib/report-state";
import { ReportBarChart } from "../ReportBarChart";
import { ReportExportMenu } from "../ReportExportMenu";
import { ReportFilters } from "../ReportFilters";
import { ReportTable } from "../ReportTable";

export function LabelsReport() {
  const { request } = useSupportReportRouteState();
  const series = useSupportReport(request("label-mix"));
  return (
    <div className="flex flex-col gap-6">
      <ReportFilters trailing={<ReportExportMenu series={series.data} />} />
      <ReportBarChart
        series={series.data}
        title="Conversations per label"
        description="Donor-care label mix in the selected window."
      />
      <ReportTable series={series.data} />
    </div>
  );
}
