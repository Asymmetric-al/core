"use client";

import { useSupportConversationsLive } from "@asym/database/hooks";
import * as React from "react";

import { selectConversations } from "../lib/selectors";

import type { SupportConversationFilter } from "../lib/selectors";
import type { SupportConversation } from "@asym/database/hooks";

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
  const query = useSupportConversationsLive();

  const data = React.useMemo<SupportConversation[]>(() => {
    const rows = query.data ?? [];
    if (!options.filter) return rows;
    return selectConversations(rows, options.filter);
  }, [options.filter, query.data]);

  return {
    data,
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}
