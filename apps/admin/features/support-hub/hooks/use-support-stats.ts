"use client";

import * as React from "react";

import { useSupportConversations } from "./use-support-conversations";
import { computeInboxStats } from "../lib/selectors";

import type { SupportInboxStats } from "../types";

interface UseSupportInboxStatsOptions {
  inboxId?: string | null;
  /** Override "now" for deterministic tests/snapshots. */
  now?: Date | string;
}

interface UseSupportInboxStatsReturn {
  data: SupportInboxStats;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

/**
 * Computes inbox stats from the conversations query, memoized on the rows,
 * the inbox and `now`.
 */
export function useSupportInboxStats(
  options: UseSupportInboxStatsOptions = {},
): UseSupportInboxStatsReturn {
  const query = useSupportConversations();
  const inboxId = options.inboxId ?? null;
  const now = options.now;

  const data = React.useMemo<SupportInboxStats>(() => {
    return computeInboxStats(query.data ?? [], now ?? new Date(), inboxId);
  }, [inboxId, now, query.data]);

  return {
    data,
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}
