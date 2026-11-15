"use client";

import { MacroLauncher } from "../macros/MacroLauncher";

import type { SupportConversation } from "../../types";

interface ConversationMacrosMenuProps {
  conversation: SupportConversation;
}

/**
 * Conversation-header mount point for `<MacroLauncher />` with its full-size
 * trigger; the composer mounts the compact one.
 */
export function ConversationMacrosMenu({
  conversation,
}: ConversationMacrosMenuProps) {
  return <MacroLauncher conversation={conversation} />;
}
