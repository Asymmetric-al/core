"use client";

import { useSupportMacrosLive } from "@asym/database/hooks";

import type { SupportMacro } from "@asym/database/hooks";

export function useSupportMacros(): {
  data: SupportMacro[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useSupportMacrosLive();
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}
