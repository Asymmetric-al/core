"use client";

import * as React from "react";

import { useSupportReport } from "../../../hooks/use-support-reports";
import { useSupportReportRouteState } from "../../../lib/report-state";
import { ReportBarChart } from "../ReportBarChart";
import { ReportExportMenu } from "../ReportExportMenu";
import { ReportFilters } from "../ReportFilters";
import { ReportLineChart } from "../ReportLineChart";
import { ReportSummaryCards } from "../ReportSummaryCards";
import { ReportTable } from "../ReportTable";

export function OverviewReport() {
  const { request } = useSupportReportRouteState();
  const volume = useSupportReport(request("volume"));
  const openCount = useSupportReport(request("open-count"));
  const firstResponse = useSupportReport(request("first-response"));
  const resolution = useSupportReport(request("resolution"));
  const customerWaiting = useSupportReport(request("customer-waiting"));

  const cards = React.useMemo(
    () => [
      {
        label: "Created",
        value: volume.data.total,
        helper: "Conversations in range",
      },
      {
        label: "Open + pending",
        value: openCount.data.total,
        helper: "Currently active",
      },
      {
        label: "First response",
        value: `${firstResponse.data.total} min`,
        helper: "Average minutes",
      },
      {
        label: "Resolution",
        value: `${resolution.data.total} min`,
        helper: "Average minutes",
      },
    ],
    [
      firstResponse.data.total,
      openCount.data.total,
      resolution.data.total,
      volume.data.total,
    ],
  );

  return (
    <div className="flex flex-col gap-6">
      <ReportFilters trailing={<ReportExportMenu series={volume.data} />} />

      <ReportSummaryCards cards={cards} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportLineChart
          series={volume.data}
          title="Conversations created"
          description="New donor conversations by period."
        />
        <ReportBarChart
          series={customerWaiting.data}
          title="Customer waiting"
          description="Donors currently waiting on a reply."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportTable series={volume.data} />
        <ReportTable series={openCount.data} />
      </div>
    </div>
  );
}
