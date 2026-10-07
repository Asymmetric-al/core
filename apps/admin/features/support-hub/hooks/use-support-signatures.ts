"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type { SupportSignature } from "../types";

interface SignaturesResponse {
  signatures: SupportSignature[];
}

interface UseSupportSignaturesReturn {
  data: SupportSignature[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

export function useSupportSignatures(
  agentId?: string | null,
): UseSupportSignaturesReturn {
  const query = useQuery({
    queryKey: supportHubQueryKeys.signatures,
    queryFn: async () =>
      (await supportApiGet<SignaturesResponse>("/api/admin/support/signatures"))
        .signatures,
    ...supportApiQueryDefaults,
  });
  const data = React.useMemo<SupportSignature[]>(() => {
    const rows = query.data ?? [];
    if (!agentId) return rows;
    return rows.filter(
      (row) => row.ownerAgentId === null || row.ownerAgentId === agentId,
    );
  }, [agentId, query.data]);
  return {
    data,
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}
