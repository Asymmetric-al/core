"use client";

import {
  useSupportConversationsLive,
  useSupportLabelsLive,
} from "@asym/database/hooks";
import * as React from "react";

import { computeReportSlice } from "../lib/selectors";

import type { SupportReportSeries, SupportReportSlice } from "../types";

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
 * Computes one report slice from the live conversation collection. Phase 4
 * adds a charting layer on top; this hook is the data contract that layer
 * will consume.
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
