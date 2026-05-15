"use client";

import { useQuery } from "@tanstack/react-query";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type { SupportSavedView } from "@asym/database/hooks";

interface SavedViewsResponse {
  savedViews: SupportSavedView[];
}

export function useSupportSavedViews(): {
  data: SupportSavedView[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: supportHubQueryKeys.savedViews,
    queryFn: async () =>
      (
        await supportApiGet<SavedViewsResponse>(
          "/api/admin/support/saved-views",
        )
      ).savedViews,
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}
