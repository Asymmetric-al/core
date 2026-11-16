"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";
import {
  NO_SUPPORT_SETTINGS_ACCESS,
  type SupportSettingsAccess,
} from "../lib/settings-access";

import type { SupportNotificationPreferences } from "../types";

interface NotificationPreferencesResponse {
  preferences: SupportNotificationPreferences[];
  access?: SupportSettingsAccess;
}

interface UseSupportNotificationPreferencesReturn {
  data: SupportNotificationPreferences[];
  for: (
    agentId: string | null | undefined,
  ) => SupportNotificationPreferences | null;
  /** Whose preferences this user may change. */
  access: SupportSettingsAccess;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
  /** Loads the data again, e.g. after a failed load. */
  refetch: () => Promise<unknown>;
}

export function useSupportNotificationPreferences(): UseSupportNotificationPreferencesReturn {
  const query = useQuery({
    queryKey: supportHubQueryKeys.notificationPreferences,
    queryFn: () =>
      supportApiGet<NotificationPreferencesResponse>(
        "/api/admin/support/notification-preferences",
      ),
    ...supportApiQueryDefaults,
  });
  const rows = React.useMemo<SupportNotificationPreferences[]>(
    () => query.data?.preferences ?? [],
    [query.data],
  );
  return {
    data: rows,
    for: (agentId) =>
      agentId ? (rows.find((row) => row.agentId === agentId) ?? null) : null,
    access: query.data?.access ?? NO_SUPPORT_SETTINGS_ACCESS,
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
    refetch: query.refetch,
  };
}
