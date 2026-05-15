"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { useSupportBusinessHours } from "./use-support-inbox-settings";
import { useSupportLabels } from "./use-support-labels";
import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";
import { buildReportSeries } from "../lib/report-aggregations";
import { computeReportSlice } from "../lib/selectors";

import type {
  SupportConversation,
  SupportMessage,
  SupportReportRequest,
  SupportReportSeries,
  SupportReportSlice,
} from "../types";

interface ReportsResponse {
  conversations: SupportConversation[];
  messages: SupportMessage[];
}

interface UseSupportReportsOptions {
  inboxId?: string | null;
  now?: Date | string;
}

interface UseSupportReportsReturn {
  data: SupportReportSeries;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

/**
 * Computes one report slice from the live conversation collection. Kept for
 * the Phase 3 inbox stats strip (simple slice input, no date range).
 *
 * For the Phase 6 reports surfaces, use `useSupportReport(request)` instead —
 * that one takes a full `SupportReportRequest`, pulls the message +
 * business-hours collections, and delegates to `buildReportSeries`.
 */
export function useSupportReports(
  slice: SupportReportSlice,
  options: UseSupportReportsOptions = {},
): UseSupportReportsReturn {
  const query = useQuery({
    queryKey: supportHubQueryKeys.reports(slice, options.inboxId ?? null),
    queryFn: async () =>
      supportApiGet<ReportsResponse>("/api/admin/support/reports"),
    ...supportApiQueryDefaults,
  });
  const labels = useSupportLabels();
  const inboxId = options.inboxId ?? null;
  const now = options.now;

  const data = React.useMemo<SupportReportSeries>(() => {
    return computeReportSlice(query.data?.conversations ?? [], slice, {
      inboxId,
      now: now ?? new Date(),
      labels: labels.data ?? [],
    });
  }, [inboxId, labels.data, now, query.data?.conversations, slice]);

  const isLoading = query.isLoading || labels.isLoading;
  const isReady = query.isSuccess && labels.isReady;
  const isError = query.isError || labels.isError;

  return { data, isLoading, isReady, isError };
}

interface UseSupportReportOptions {
  now?: Date | string;
}

/**
 * Full Phase 6 report hook. Consumes the conversation + message + label +
 * business-hours collections and returns a `SupportReportSeries` through
 * `buildReportSeries`.
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
    query.isLoading || labels.isLoading || businessHours.isLoading;
  const isReady = query.isSuccess && labels.isReady && businessHours.isReady;
  const isError = query.isError || labels.isError || businessHours.isError;

  return { data, isLoading, isReady, isError };
}
