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
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
      <Avatar size="lg">
        <AvatarImage src={undefined} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">{name}</p>
        <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <Mail className="size-3 shrink-0 text-muted-foreground" />
          <span className="truncate">{conversation.externalContactEmail}</span>
        </p>
        <ConversationCrmLinks
          contact={conversation.contact}
          donorEmail={conversation.externalContactEmail}
        />
      </div>
    </div>
  );
}
