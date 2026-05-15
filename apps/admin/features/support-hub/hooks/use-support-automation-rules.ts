"use client";

import { useQuery } from "@tanstack/react-query";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type { SupportAutomationRule } from "../types";

interface AutomationRulesResponse {
  automationRules: SupportAutomationRule[];
}

interface UseSupportAutomationRulesReturn {
  data: SupportAutomationRule[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

/**
 * Thin wrapper around the server-owned automation-rules route. Keeps the
 * support feature on the same shape while persistence lives in `packages/api`.
 */
export function useSupportAutomationRules(): UseSupportAutomationRulesReturn {
  const query = useQuery({
    queryKey: supportHubQueryKeys.automationRules,
    queryFn: async () =>
      (
        await supportApiGet<AutomationRulesResponse>(
          "/api/admin/support/automation-rules",
        )
      ).automationRules,
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}
