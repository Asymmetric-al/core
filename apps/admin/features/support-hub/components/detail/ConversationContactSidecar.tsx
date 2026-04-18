"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Mail } from "lucide-react";

import { ConversationCrmLinks } from "./ConversationCrmLinks";

import type { SupportConversation } from "../../types";

interface ConversationContactSidecarProps {
  conversation: SupportConversation;
}

/**
 * Compact donor identity block + CRM-ready references summary. Phase 7
 * extracts the link-rendering logic into `<ConversationCrmLinks />` so the
 * cross-link surface is testable in isolation and so Phase 8's CRM-hydration
 * work can swap in live donor / gift / missionary lookups without touching
 * this layout.
 */
export function ConversationContactSidecar({
  conversation,
}: ConversationContactSidecarProps) {
  const name =
    conversation.externalContactName ?? conversation.externalContactEmail;
  const initials = (name ?? "??").charAt(0).toUpperCase();

  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-3 shadow-sm">
      <Avatar className="size-10 border border-zinc-100">
        <AvatarImage src={undefined} alt={name} />
        <AvatarFallback className="text-xs font-semibold text-zinc-700">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-zinc-900">
          {name}
        </p>
        <p className="truncate text-[11px] text-zinc-500">
          <Mail className="mr-1 inline size-3 align-[-2px] text-zinc-400" />
          {conversation.externalContactEmail}
        </p>
        <ConversationCrmLinks
          contact={conversation.contact}
          donorEmail={conversation.externalContactEmail}
        />
      </div>
    </div>
  );
}
