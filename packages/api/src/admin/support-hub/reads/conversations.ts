import { supportHubAdapter } from "../adapter";

import type { SupportConversationFilter } from "../adapter";

/**
 * Reads a paginated/filtered conversation list. The adapter is the single
 * source of truth — Phase 7 returns in-memory rows; Phase 8 swaps to
 * Supabase reads.
 */
export async function listSupportConversations(
  filter: SupportConversationFilter = {},
) {
  return supportHubAdapter.conversations.list(filter);
}

export async function getSupportConversation(id: string) {
  return supportHubAdapter.conversations.get(id);
}

export async function listSupportConversationMessages(conversationId: string) {
  return supportHubAdapter.conversations.listMessages(conversationId);
}
