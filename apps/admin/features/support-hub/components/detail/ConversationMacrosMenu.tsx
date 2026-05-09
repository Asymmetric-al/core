"use client";

import { MacroLauncher } from "../macros/MacroLauncher";

import type { SupportConversation } from "../../types";

interface ConversationMacrosMenuProps {
  conversation: SupportConversation;
}

/**
 * Conversation-header mount point for the macro launcher. Wraps
 * `<MacroLauncher />` with a header-friendly trigger so the popover behavior
 * stays in one place.
 */
export function ConversationMacrosMenu({
  conversation,
}: ConversationMacrosMenuProps) {
  return <MacroLauncher conversation={conversation} />;
}
