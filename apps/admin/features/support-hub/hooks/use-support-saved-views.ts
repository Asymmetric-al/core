"use client";

import { useQuery } from "@tanstack/react-query";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";
import {
  NO_SUPPORT_SETTINGS_ACCESS,
  type SupportSettingsAccess,
} from "../lib/settings-access";

import type { SupportSavedView } from "@asym/database/hooks";

interface SavedViewsResponse {
  savedViews: SupportSavedView[];
  access?: SupportSettingsAccess;
}

export function useSupportSavedViews(): {
  data: SupportSavedView[];
  /** Which views this user may rename, delete or share. */
  access: SupportSettingsAccess;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
  /** Loads the data again, e.g. after a failed load. */
  refetch: () => Promise<unknown>;
} {
  const query = useQuery({
    queryKey: supportHubQueryKeys.savedViews,
    queryFn: () =>
      supportApiGet<SavedViewsResponse>("/api/admin/support/saved-views"),
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data?.savedViews ?? [],
    access: query.data?.access ?? NO_SUPPORT_SETTINGS_ACCESS,
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
    refetch: query.refetch,
  };
}
