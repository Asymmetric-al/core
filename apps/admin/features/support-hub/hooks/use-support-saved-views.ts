"use client";

import { useSupportSavedViewsLive } from "@asym/database/hooks";

import type { SupportSavedView } from "@asym/database/hooks";

export function useSupportSavedViews(): {
  data: SupportSavedView[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useSupportSavedViewsLive();
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}
