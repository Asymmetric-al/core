"use client";

import { useSupportCannedResponsesLive } from "@asym/database/hooks";

import type { SupportCannedResponse } from "@asym/database/hooks";

export function useSupportCannedResponses(): {
  data: SupportCannedResponse[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useSupportCannedResponsesLive();
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}
