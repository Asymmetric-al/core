"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";
import { selectConversations } from "../lib/selectors";

import type { SupportConversationFilter } from "../lib/selectors";
import type { SupportConversation } from "@asym/database/hooks";

interface ConversationsResponse {
  conversations: SupportConversation[];
}

interface UseSupportConversationsOptions {
  filter?: SupportConversationFilter;
}

interface UseSupportConversationsReturn {
  data: SupportConversation[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

/**
 * Subscribes to the support conversations collection. When `filter` is
 * provided, conversations are run through the shared selector pipeline so the
 * hook returns exactly what the table or board view should render.
 */
export function useSupportConversations(
  options: UseSupportConversationsOptions = {},
): UseSupportConversationsReturn {
  const query = useQuery({
    queryKey: supportHubQueryKeys.conversations,
    queryFn: async () =>
      (
        await supportApiGet<ConversationsResponse>(
          "/api/admin/support/conversations",
        )
      ).conversations,
    ...supportApiQueryDefaults,
  });

  const data = React.useMemo<SupportConversation[]>(() => {
    const rows = query.data ?? [];
    if (!options.filter) return rows;
    return selectConversations(rows, options.filter);
  }, [options.filter, query.data]);

  return {
    data,
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}
