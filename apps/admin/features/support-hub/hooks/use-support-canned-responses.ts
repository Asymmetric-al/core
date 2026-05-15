"use client";

import { useQuery } from "@tanstack/react-query";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type { SupportCannedResponse } from "@asym/database/hooks";

interface CannedResponsesResponse {
  cannedResponses: SupportCannedResponse[];
}

export function useSupportCannedResponses(): {
  data: SupportCannedResponse[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: supportHubQueryKeys.cannedResponses,
    queryFn: async () =>
      (
        await supportApiGet<CannedResponsesResponse>(
          "/api/admin/support/canned-responses",
        )
      ).cannedResponses,
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}
