"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { useSupportTeams } from "./use-support-agents";
import { useSupportBusinessHours } from "./use-support-inbox-settings";
import { useSupportLabels } from "./use-support-labels";
import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";
import { buildReportSeries } from "../lib/report-aggregations";

import type {
  SupportConversation,
  SupportMessage,
  SupportReportRequest,
  SupportReportSeries,
} from "../types";

interface ReportsResponse {
  conversations: SupportConversation[];
  messages: SupportMessage[];
}

interface UseSupportReportsReturn {
  data: SupportReportSeries;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
}

interface UseSupportReportOptions {
  now?: Date | string;
}

/**
 * Builds one report in the browser: fetches the tenant's conversations and
 * messages from `/api/admin/support/reports`, then aggregates them with the
 * labels and the default business hours (the one marked default, else the
 * first) through `buildReportSeries`. A team scope stays loading until the
 * team list contains the selected team.
 */
export function useSupportReport(
  request: SupportReportRequest,
  options: UseSupportReportOptions = {},
): UseSupportReportsReturn {
  const query = useQuery({
    queryKey: supportHubQueryKeys.reports(
      request.slice,
      request.scope.kind === "inbox" ? (request.scope.id ?? null) : null,
    ),
    queryFn: async () =>
      supportApiGet<ReportsResponse>("/api/admin/support/reports"),
    ...supportApiQueryDefaults,
  });
  const labels = useSupportLabels();
  const businessHours = useSupportBusinessHours();
  const teams = useSupportTeams();
  const teamScope = request.scope.kind === "team";
  const teamSelected = teams.data.some((team) => team.id === request.scope.id);

  const data = React.useMemo<SupportReportSeries>(() => {
    const defaultBiz =
      (businessHours.data ?? []).find((row) => row.isDefault) ??
      (businessHours.data ?? [])[0] ??
      null;
    return buildReportSeries(request, {
      conversations: query.data?.conversations ?? [],
      messages: query.data?.messages ?? [],
      labels: labels.data ?? [],
      businessHours: defaultBiz,
      now: options.now,
    });
  }, [
    businessHours.data,
    labels.data,
    options.now,
    query.data?.conversations,
    query.data?.messages,
    request,
  ]);

  const isLoading =
    query.isLoading ||
    labels.isLoading ||
    businessHours.isLoading ||
    (teamScope && (teams.isLoading || !teamSelected));
  const isReady =
    query.isSuccess &&
    labels.isReady &&
    businessHours.isReady &&
    (!teamScope || (teams.isReady && teamSelected));
  const isError =
    query.isError ||
    labels.isError ||
    businessHours.isError ||
    (teamScope && teams.isError);

  const refetch = async () =>
    Promise.all([
      ...(query.isError ? [query.refetch()] : []),
      ...(labels.isError ? [labels.refetch()] : []),
      ...(businessHours.isError ? [businessHours.refetch()] : []),
      ...(teamScope && teams.isError ? [teams.refetch()] : []),
    ]);
  return { data, isLoading, isReady, isError, refetch };
}
