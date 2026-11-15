"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type { SupportMessage } from "@asym/database/hooks";

interface MessagesResponse {
  messages: SupportMessage[];
}

interface UseSupportMessagesOptions {
  /** When true, drops private rows (`isPrivate`, such as internal notes). */
  excludePrivate?: boolean;
}

interface UseSupportMessagesReturn {
  data: SupportMessage[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
}

/**
 * Reads one conversation's messages from its route, sorted by `postedAt`
 * ascending (ties by id) so the thread renders oldest first.
 */
export function useSupportMessages(
  conversationId: string | null | undefined,
  options: UseSupportMessagesOptions = {},
): UseSupportMessagesReturn {
  const query = useQuery({
    queryKey: conversationId
      ? supportHubQueryKeys.messages(conversationId)
      : [...supportHubQueryKeys.messagesAll, "empty"],
    queryFn: async () =>
      (
        await supportApiGet<MessagesResponse>(
          `/api/admin/support/conversations/${conversationId}/messages`,
        )
      ).messages,
    enabled: Boolean(conversationId),
    ...supportApiQueryDefaults,
  });

  const data = React.useMemo<SupportMessage[]>(() => {
    if (!conversationId) return [];
    const rows = query.data ?? [];
    const filtered = options.excludePrivate
      ? rows.filter((row) => !row.isPrivate)
      : rows;
    return Array.from(filtered).sort((left, right) => {
      if (left.postedAt === right.postedAt) {
        return left.id.localeCompare(right.id);
      }
      return left.postedAt < right.postedAt ? -1 : 1;
    });
  }, [conversationId, options.excludePrivate, query.data]);

  return {
    data,
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
    refetch: query.refetch,
  };
}
