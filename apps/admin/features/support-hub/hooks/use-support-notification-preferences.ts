"use client";

import { useSupportNotificationPreferencesLive } from "@asym/database/hooks";
import * as React from "react";

import type { SupportNotificationPreferences } from "../types";

interface UseSupportNotificationPreferencesReturn {
  data: SupportNotificationPreferences[];
  for: (
    agentId: string | null | undefined,
  ) => SupportNotificationPreferences | null;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

export function useSupportNotificationPreferences(): UseSupportNotificationPreferencesReturn {
  const query = useSupportNotificationPreferencesLive();
  const rows = React.useMemo<SupportNotificationPreferences[]>(
    () => (query.data ?? []) as SupportNotificationPreferences[],
    [query.data],
  );
  return {
    data: rows,
    for: (agentId) =>
      agentId ? (rows.find((row) => row.agentId === agentId) ?? null) : null,
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}
