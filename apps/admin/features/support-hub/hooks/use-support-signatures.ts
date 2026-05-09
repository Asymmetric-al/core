"use client";

import { useSupportSignaturesLive } from "@asym/database/hooks";
import * as React from "react";

import type { SupportSignature } from "../types";

interface UseSupportSignaturesReturn {
  data: SupportSignature[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

export function useSupportSignatures(
  agentId?: string | null,
): UseSupportSignaturesReturn {
  const query = useSupportSignaturesLive();
  const data = React.useMemo<SupportSignature[]>(() => {
    const rows = (query.data ?? []) as SupportSignature[];
    if (!agentId) return rows;
    return rows.filter(
      (row) => row.ownerAgentId === null || row.ownerAgentId === agentId,
    );
  }, [agentId, query.data]);
  return {
    data,
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}

export function useDefaultSupportSignature(
  agentId: string | null | undefined,
): SupportSignature | null {
  const query = useSupportSignaturesLive();
  return React.useMemo(() => {
    if (!agentId) return null;
    const rows = (query.data ?? []) as SupportSignature[];
    const scoped = rows.filter((row) => row.ownerAgentId === agentId);
    return scoped.find((row) => row.isDefault) ?? scoped[0] ?? null;
  }, [agentId, query.data]);
}
