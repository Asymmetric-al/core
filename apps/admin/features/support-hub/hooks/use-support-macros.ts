"use client";

import { useQuery } from "@tanstack/react-query";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type { SupportMacro } from "@asym/database/hooks";

interface MacrosResponse {
  macros: SupportMacro[];
}

export function useSupportMacros(): {
  data: SupportMacro[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: supportHubQueryKeys.macros,
    queryFn: async () =>
      (await supportApiGet<MacrosResponse>("/api/admin/support/macros")).macros,
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}
