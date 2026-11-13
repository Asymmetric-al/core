"use client";

import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import * as React from "react";

import { useSupportReport } from "../../../hooks/use-support-reports";
import { useSupportReportRouteState } from "../../../lib/report-state";
import { combineReportStatus } from "../../../lib/report-status";
import { ReportExportMenu } from "../ReportExportMenu";
import { ReportFilters } from "../ReportFilters";
import { ReportLineChart } from "../ReportLineChart";
import { ReportLoadError } from "../ReportLoadError";
import { ReportSummaryCards } from "../ReportSummaryCards";
import { ReportTable } from "../ReportTable";

export function InboxReport() {
  const { request, state } = useSupportReportRouteState();
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
        helper: "Snoozed now, including ready to wake",
      },
    ],
    [
      received.data.total,
      resolved.data.total,
      sent.data.total,
      snoozed.data.total,
    ],
  );

  const exports = [
    { label: "Messages received", series: received.data },
    { label: "Messages sent", series: sent.data },
    { label: "Conversations resolved", series: resolved.data },
    { label: "Snoozed", series: snoozed.data },
  ];
  const reportStatus = combineReportStatus([received, sent, resolved, snoozed]);
  if (reportStatus.isError || reportStatus.isLoading)
    return (
      <div className="flex flex-col gap-6">
        <ReportFilters
          lockScopeKind="inbox"
          trailing={
            <ReportExportMenu
              items={exports}
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
            <ReportSummaryCards cards={cards} isLoading />
            <Skeleton className="h-64 w-full" />
            <span className="sr-only">Loading report…</span>
          </div>
        )}
      </div>
    );
  return (
    <div className="flex flex-col gap-6">
      <ReportFilters
        lockScopeKind="inbox"
        trailing={<ReportExportMenu items={exports} />}
      />
      <ReportSummaryCards
        cards={cards.slice(0, 3)}
        label="Inbox summary"
        heading="In this range"
      />
      <ReportSummaryCards
        cards={cards.slice(3)}
        label="Current inbox summary"
        heading="Right now"
      />
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
      <ReportLineChart
        series={resolved.data}
        title="Conversations resolved"
        description="Conversations resolved by period."
      />
      <ReportTable
        series={resolved.data}
        caption="Conversations resolved"
        columns={["Period", "Resolved"]}
        periodUnit={state.groupBy}
      />
    </div>
  );
}
