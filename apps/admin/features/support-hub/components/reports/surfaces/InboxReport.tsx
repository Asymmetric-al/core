"use client";

import * as React from "react";

import { useSupportReport } from "../../../hooks/use-support-reports";
import { useSupportReportRouteState } from "../../../lib/report-state";
import { ReportExportMenu } from "../ReportExportMenu";
import { ReportFilters } from "../ReportFilters";
import { ReportLineChart } from "../ReportLineChart";
import { ReportSummaryCards } from "../ReportSummaryCards";
import { ReportTable } from "../ReportTable";

export function InboxReport() {
  const { request } = useSupportReportRouteState();
  const received = useSupportReport(request("messages-received"));
  const sent = useSupportReport(request("messages-sent"));
  const resolved = useSupportReport(request("resolution-count"));
  const snoozed = useSupportReport(request("snoozed-count"));

  const cards = React.useMemo(
    () => [
      {
        label: "Messages received",
        value: received.data.total,
        helper: "Inbound emails in range",
      },
      {
        label: "Messages sent",
        value: sent.data.total,
        helper: "Outbound replies in range",
      },
      {
        label: "Resolved",
        value: resolved.data.total,
        helper: "Conversations resolved in range",
      },
      {
        label: "Snoozed",
        value: snoozed.data.total,
        helper: "Currently snoozed (incl. ready to wake)",
      },
    ],
    [
      received.data.total,
      resolved.data.total,
      sent.data.total,
      snoozed.data.total,
    ],
  );

  return (
    <div className="flex flex-col gap-6">
      <ReportFilters
        lockScopeKind="inbox"
        trailing={<ReportExportMenu series={received.data} />}
      />
      <ReportSummaryCards cards={cards} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportLineChart
          series={received.data}
          title="Messages received"
          description="Inbound donor emails by period."
        />
        <ReportLineChart
          series={sent.data}
          title="Messages sent"
          description="Outbound replies by period."
        />
      </div>
      <ReportTable series={resolved.data} />
    </div>
  );
}
