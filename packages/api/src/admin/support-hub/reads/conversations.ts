import { supportHubAdapter } from "../adapter";

import type { SupportConversationFilter } from "../adapter";

/**
 * Reads a filtered conversation list through the live adapter, scoped to the
 * bound request tenant. Access checks happen in the route handler
 * (`withSupportHubAccess`), not here.
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
