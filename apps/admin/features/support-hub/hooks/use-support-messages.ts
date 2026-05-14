"use client";

import { useSupportMessagesLive } from "@asym/database/hooks";
import * as React from "react";

import type { SupportMessage } from "@asym/database/hooks";

interface UseSupportMessagesOptions {
  /** When true, drops `type === "note"` rows. Defaults to false (show all). */
  excludePrivate?: boolean;
}

interface UseSupportMessagesReturn {
  data: SupportMessage[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

/**
 * Subscribes to the messages collection scoped to a single conversation,
 * sorted by `postedAt` ascending so the email thread renders top-to-bottom in
 * order.
 */
export function useSupportMessages(
  conversationId: string | null | undefined,
  options: UseSupportMessagesOptions = {},
): UseSupportMessagesReturn {
  const query = useSupportMessagesLive();

  const data = React.useMemo<SupportMessage[]>(() => {
    if (!conversationId) return [];
    const rows = (query.data ?? []).filter(
      (row) => row.conversationId === conversationId,
    );
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
    isReady: query.isReady,
    isError: query.isError,
  };
}
