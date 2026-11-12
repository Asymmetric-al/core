"use client";
import { toast } from "sonner";

import { useSetSupportConversationStatus } from "./use-support-mutations";

import type { SupportConversation } from "../types";
export function useResolveSupportConversation() {
  const setStatus = useSetSupportConversationStatus();
  return async (conversation: SupportConversation | undefined) => {
    if (
      !conversation ||
      conversation.status === "resolved" ||
      setStatus.isPending
    )
      return;
    const previous = {
      conversationId: conversation.id,
      status: conversation.status,
      snoozedUntil: conversation.snoozedUntil,
    };
    try {
      await setStatus.mutateAsync({
        conversationId: conversation.id,
        status: "resolved",
      });
      toast.success("Conversation resolved.", {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await setStatus.mutateAsync(previous);
            } catch {
              toast.error("Couldn’t undo. The conversation is still resolved.");
            }
          },
        },
      });
    } catch {
      toast.error("Couldn’t resolve the conversation. Try again.");
    }
  };
}
