"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { cn } from "@asym/ui/lib/utils";
import { Building2, Heart, Mail, Receipt, Sparkles } from "lucide-react";

import type { SupportContactRef, SupportConversation } from "../../types";

interface ConversationContactSidecarProps {
  conversation: SupportConversation;
}

/**
 * Compact donor identity block + CRM-ready references summary. Phase 4 only
 * surfaces the data we already have; Phase 5+ will hydrate live donor /
 * gift / missionary / church lookups when CRM linkage lands.
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
        <ContactRefRow contact={conversation.contact} />
      </div>
    </div>
  );
}

function ContactRefRow({ contact }: { contact: SupportContactRef | null }) {
  if (!contact) return null;
  const refs = collectActiveRefs(contact);
  if (refs.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {refs.map((ref) => (
        <span
          key={ref.label}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border border-zinc-100 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500",
          )}
          title={`${ref.label}: ${ref.value}`}
        >
          {ref.icon}
          {ref.label}
        </span>
      ))}
    </div>
  );
}

interface RefSummary {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function collectActiveRefs(contact: SupportContactRef): RefSummary[] {
  const refs: RefSummary[] = [];
  if (contact.donorId) {
    refs.push({
      label: "Donor",
      value: contact.donorId,
      icon: <Heart className="size-3 text-rose-400" />,
    });
  }
  if (contact.contributionId) {
    refs.push({
      label: "Gift",
      value: contact.contributionId,
      icon: <Receipt className="size-3 text-amber-500" />,
    });
  }
  if (contact.missionaryId) {
    refs.push({
      label: "Missionary",
      value: contact.missionaryId,
      icon: <Sparkles className="size-3 text-violet-500" />,
    });
  }
  if (contact.churchId) {
    refs.push({
      label: "Church",
      value: contact.churchId,
      icon: <Building2 className="size-3 text-zinc-500" />,
    });
  }
  return refs;
}
