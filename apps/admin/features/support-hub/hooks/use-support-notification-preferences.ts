"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type { SupportNotificationPreferences } from "../types";

interface NotificationPreferencesResponse {
  preferences: SupportNotificationPreferences[];
}

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
  const query = useQuery({
    queryKey: supportHubQueryKeys.notificationPreferences,
    queryFn: async () =>
      (
        await supportApiGet<NotificationPreferencesResponse>(
          "/api/admin/support/notification-preferences",
        )
      ).preferences,
    ...supportApiQueryDefaults,
  });
  const rows = React.useMemo<SupportNotificationPreferences[]>(
    () => query.data ?? [],
    [query.data],
  );
  return {
    data: rows,
    for: (agentId) =>
      agentId ? (rows.find((row) => row.agentId === agentId) ?? null) : null,
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}
