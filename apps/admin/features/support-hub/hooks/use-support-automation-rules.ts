"use client";

import { useSupportAutomationRulesLive } from "@asym/database/hooks";

import type { SupportAutomationRule } from "../types";

interface UseSupportAutomationRulesReturn {
  data: SupportAutomationRule[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

/**
 * Thin wrapper around the live automation-rules collection. Keeps the support
 * feature the single consumer of `@asym/database/hooks` so Phase 7 can swap
 * the seed query for a Supabase fetch without touching the settings UI.
 */
export function useSupportAutomationRules(): UseSupportAutomationRulesReturn {
  const query = useSupportAutomationRulesLive();
  return {
    data: (query.data ?? []) as SupportAutomationRule[],
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}
