"use client";

import { useQuery } from "@tanstack/react-query";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type { SupportLabel } from "@asym/database/hooks";

interface LabelsResponse {
  labels: SupportLabel[];
}

export function useSupportLabels(): {
  data: SupportLabel[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: supportHubQueryKeys.labels,
    queryFn: async () =>
      (await supportApiGet<LabelsResponse>("/api/admin/support/labels")).labels,
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}
