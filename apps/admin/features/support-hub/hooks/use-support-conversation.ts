"use client";

import { useSupportConversationsLive } from "@asym/database/hooks";
import * as React from "react";

import type { SupportConversation } from "@asym/database/hooks";

interface UseSupportConversationReturn {
  data: SupportConversation | undefined;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

/**
 * Returns a single conversation by id. Implemented as a client-side filter
 * over the conversations collection rather than a separate single-result
 * query so it stays consistent with optimistic updates from the mutation
 * hooks.
 */
export function useSupportConversation(
  conversationId: string | null | undefined,
): UseSupportConversationReturn {
  const query = useSupportConversationsLive();

  const data = React.useMemo<SupportConversation | undefined>(() => {
    if (!conversationId) return undefined;
    return (query.data ?? []).find((row) => row.id === conversationId);
  }, [conversationId, query.data]);

  return {
    data,
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}
