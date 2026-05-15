"use client";

import { useQuery } from "@tanstack/react-query";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type { SupportConversation } from "@asym/database/hooks";

interface ConversationResponse {
  conversation: SupportConversation;
}

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
  const query = useQuery({
    queryKey: conversationId
      ? supportHubQueryKeys.conversation(conversationId)
      : [...supportHubQueryKeys.conversations, "empty"],
    queryFn: async () =>
      (
        await supportApiGet<ConversationResponse>(
          `/api/admin/support/conversations/${conversationId}`,
        )
      ).conversation,
    enabled: Boolean(conversationId),
    ...supportApiQueryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}
