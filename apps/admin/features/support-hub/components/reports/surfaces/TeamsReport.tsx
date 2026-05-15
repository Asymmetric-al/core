"use client";

import * as React from "react";

import { useSupportTeams } from "../../../hooks/use-support-agents";
import { useSupportConversations } from "../../../hooks/use-support-conversations";
import {
  filterConversationsByScope,
  isIsoWithinRange,
} from "../../../lib/report-aggregations";
import { useSupportReportRouteState } from "../../../lib/report-state";
import { ReportBarChart } from "../ReportBarChart";
import { ReportExportMenu } from "../ReportExportMenu";
import { ReportFilters } from "../ReportFilters";
import { ReportTable } from "../ReportTable";

import type {
  SupportConversation,
  SupportReportBucket,
  SupportReportSeries,
} from "../../../types";

export function TeamsReport() {
  const { request, range, scope } = useSupportReportRouteState();
  const conversations = useSupportConversations();
  const teams = useSupportTeams();

  const series = React.useMemo<SupportReportSeries>(() => {
    const scoped = filterConversationsByScope(conversations.data ?? [], scope);
    const inRange = scoped.filter((c: SupportConversation) =>
      isIsoWithinRange(c.createdAt, range),
    );
    const counts = new Map<string, { name: string; count: number }>();
    for (const conversation of inRange) {
      const team = conversation.team;
      const key = team?.id ?? "none";
      const name = team?.name ?? "No team";
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { name, count: 1 });
    }
    const buckets: SupportReportBucket[] = [...counts.entries()]
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([id, entry]) => ({
        key: id,
        label: entry.name,
        value: entry.count,
        secondaryValue: null,
      }));
    return {
      slice: "volume",
      generatedAt: new Date().toISOString(),
      unit: "count",
      total: inRange.length,
      buckets,
      request: request("volume"),
    };
  }, [conversations.data, range, request, scope]);

  return (
    <div className="flex flex-col gap-6">
      <ReportFilters trailing={<ReportExportMenu series={series} />} />
      <ReportBarChart
        series={series}
        title="Conversations per team"
        description={`${teams.data?.length ?? 0} teams, grouped by conversations in range.`}
      />
      <ReportTable series={series} />
    </div>
  );
}
