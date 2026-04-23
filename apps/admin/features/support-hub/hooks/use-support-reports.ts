"use client";

import {
  useSupportBusinessHoursLive,
  useSupportConversationsLive,
  useSupportLabelsLive,
  useSupportMessagesLive,
} from "@asym/database/hooks";
import * as React from "react";

import { buildReportSeries } from "../lib/report-aggregations";
import { computeReportSlice } from "../lib/selectors";

import type {
  SupportReportRequest,
  SupportReportSeries,
  SupportReportSlice,
} from "../types";

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
  const conversations = useSupportConversationsLive();
  const labels = useSupportLabelsLive();
  const inboxId = options.inboxId ?? null;
  const now = options.now;

  const data = React.useMemo<SupportReportSeries>(() => {
    return computeReportSlice(conversations.data ?? [], slice, {
      inboxId,
      now: now ?? new Date(),
      labels: labels.data ?? [],
    });
  }, [conversations.data, inboxId, labels.data, now, slice]);

  const isLoading = conversations.isLoading || labels.isLoading;
  const isReady = conversations.isReady && labels.isReady;
  const isError = conversations.isError || labels.isError;

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
  const conversations = useSupportConversationsLive();
  const messages = useSupportMessagesLive();
  const labels = useSupportLabelsLive();
  const businessHours = useSupportBusinessHoursLive();

  const data = React.useMemo<SupportReportSeries>(() => {
    const defaultBiz =
      (businessHours.data ?? []).find((row) => row.isDefault) ??
      (businessHours.data ?? [])[0] ??
      null;
    return buildReportSeries(request, {
      conversations: conversations.data ?? [],
      messages: messages.data ?? [],
      labels: labels.data ?? [],
      businessHours: defaultBiz,
      now: options.now,
    });
  }, [
    businessHours.data,
    conversations.data,
    labels.data,
    messages.data,
    options.now,
    request,
  ]);

  const isLoading =
    conversations.isLoading ||
    messages.isLoading ||
    labels.isLoading ||
    businessHours.isLoading;
  const isReady =
    conversations.isReady &&
    messages.isReady &&
    labels.isReady &&
    businessHours.isReady;
  const isError =
    conversations.isError ||
    messages.isError ||
    labels.isError ||
    businessHours.isError;

  return { data, isLoading, isReady, isError };
}
