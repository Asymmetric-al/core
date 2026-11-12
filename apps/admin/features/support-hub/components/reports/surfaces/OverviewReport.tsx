"use client";

import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import * as React from "react";

import { useSupportReport } from "../../../hooks/use-support-reports";
import { formatSupportDuration } from "../../../lib/format-duration";
import { useSupportReportRouteState } from "../../../lib/report-state";
import { combineReportStatus } from "../../../lib/report-status";
import { ReportBarChart } from "../ReportBarChart";
import { ReportExportMenu } from "../ReportExportMenu";
import { ReportFilters } from "../ReportFilters";
import { ReportLineChart } from "../ReportLineChart";
import { ReportLoadError } from "../ReportLoadError";
import { ReportSummaryCards } from "../ReportSummaryCards";
import { ReportTable } from "../ReportTable";

export function OverviewReport() {
  const { request, state } = useSupportReportRouteState();
  const volume = useSupportReport(request("volume"));
  const openCount = useSupportReport(request("open-count"));
  const firstResponse = useSupportReport(request("first-response"));
  const resolution = useSupportReport(request("resolution"));
  const customerWaiting = useSupportReport(request("customer-waiting"));

  // The card names the split the overview table used to show.
  const activeSplit = React.useMemo(() => {
    const count = (key: string) =>
      openCount.data.buckets.find((bucket) => bucket.key === key)?.value ?? 0;
    return `${count("open").toLocaleString("en-US")} open · ${count("pending").toLocaleString("en-US")} pending`;
  }, [openCount.data.buckets]);

  const responded =
    firstResponse.data.buckets.find((bucket) => bucket.key === "responded")
      ?.value ?? 0;
  const resolved =
    resolution.data.buckets.find((bucket) => bucket.key === "resolved")
      ?.value ?? 0;
  const sample = (count: number) =>
    `Average of ${count} conversation${count === 1 ? "" : "s"} started in this range`;
  const cards = [
    {
      label: "Created",
      value: volume.data.total,
      helper: "Conversations started in range",
    },
    {
      label: "First reply",
      value: responded
        ? firstResponse.data.total === 0
          ? "<1 min"
          : formatSupportDuration(firstResponse.data.total)
        : "—",
      helper: responded ? sample(responded) : "No replies in this range",
    },
    {
      label: "Resolution",
      value: resolved
        ? resolution.data.total === 0
          ? "<1 min"
          : formatSupportDuration(resolution.data.total)
        : "—",
      helper: resolved ? sample(resolved) : "None resolved in this range",
    },
  ];
  const currentCards = [
    {
      label: "Open or pending",
      value: openCount.data.total,
      helper: activeSplit,
    },
  ];

  const waitingCount =
    customerWaiting.data.buckets.find(
      (bucket) => bucket.key === "conversations-waiting",
    )?.value ?? 0;
  // The aggregation names wait rows "Average wait (min)"; the table shows
  // them as durations (h, d), so the unit leaves the name.
  const waiting = React.useMemo(
    () => ({
      ...customerWaiting.data,
      buckets: customerWaiting.data.buckets.map((bucket) => ({
        ...bucket,
        label: bucket.label.replace(/\s*\(min\)$/, ""),
      })),
    }),
    [customerWaiting.data],
  );
  // Plotted in hours (one decimal), as the cards and table read; the
  // series itself stays in minutes.
  const waitTimes = React.useMemo(
    () => ({
      ...waiting,
      buckets: waiting.buckets
        .filter((bucket) => bucket.key !== "conversations-waiting")
        .map((bucket) => ({
          ...bucket,
          value: Math.round((bucket.value / 60) * 10) / 10,
        })),
    }),
    [waiting],
  );

  const exports = [
    { label: "Conversations created", series: volume.data },
    { label: "Open or pending", series: openCount.data },
    { label: "First reply", series: firstResponse.data },
    { label: "Resolution", series: resolution.data },
    { label: "Customer waiting (minutes)", series: customerWaiting.data },
  ];
  const reportStatus = combineReportStatus([
    volume,
    openCount,
    firstResponse,
    resolution,
    customerWaiting,
  ]);
  if (reportStatus.isError || reportStatus.isLoading)
    return (
      <div className="flex flex-col gap-6">
        <ReportFilters
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
      <ReportFilters trailing={<ReportExportMenu items={exports} />} />

      <ReportSummaryCards
        cards={cards}
        label="Support summary"
        heading="In this range"
      />
      <ReportSummaryCards
        cards={currentCards}
        label="Current support summary"
        heading="Right now"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportLineChart
          series={volume.data}
          title="Conversations created"
          description="New donor conversations by period."
        />
        {/* The count and the two wait times have different units, so the
            chart plots only the wait times and the count leads its text. */}
        <ReportBarChart
          series={waitTimes}
          title="Customer waiting"
          description={`${waitingCount === 1 ? "1 donor is" : `${waitingCount.toLocaleString("en-US")} donors are`} waiting on a reply. Wait times in hours.`}
          valueLabel="Hours"
          note="Wait times are rounded to the nearest tenth of an hour. The table below shows durations in minutes, hours or days."
        />
      </div>

      {/* Top-aligned: the three-row waiting table keeps its own height
          beside a month of days. */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <ReportTable
          series={volume.data}
          caption="Conversations created"
          columns={["Period", "Conversations"]}
          periodUnit={state.groupBy}
        />
        <ReportTable
          series={waiting}
          caption="Customer waiting"
          columns={["Measure", "Value"]}
          formatValue={(bucket) =>
            bucket.key === "conversations-waiting"
              ? bucket.value.toLocaleString("en-US")
              : formatSupportDuration(bucket.value)
          }
        />
      </div>
    </div>
  );
}
