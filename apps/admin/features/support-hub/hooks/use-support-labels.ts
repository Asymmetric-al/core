"use client";

import { useSupportLabelsLive } from "@asym/database/hooks";

import type { SupportLabel } from "@asym/database/hooks";

export function useSupportLabels(): {
  data: SupportLabel[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useSupportLabelsLive();
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}
