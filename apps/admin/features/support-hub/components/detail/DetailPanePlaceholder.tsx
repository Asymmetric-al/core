"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { cn } from "@asym/ui/lib/utils";
import { ArrowRight, MessageSquare, X } from "lucide-react";

import { useSupportConversation } from "../../hooks/use-support-conversation";

import type { SupportConversation } from "../../types";

interface DetailPanePlaceholderProps {
  conversationId: string | null;
  onClose: () => void;
  /** Mobile = render as Sheet, desktop = render inline as the right rail. */
  layout: "sheet" | "inline";
}

/**
 * Right-side pane (desktop) or `Sheet` (mobile) that opens whenever the URL
 * carries `?id=...`. Phase 4 swaps this for the real conversation detail; the
 * URL contract and the responsive container split are wired now so the swap
 * stays a one-file change.
 */
export function DetailPanePlaceholder({
  conversationId,
  onClose,
  layout,
}: DetailPanePlaceholderProps) {
  const { data: conversation } = useSupportConversation(conversationId);

  if (layout === "inline") {
    return (
      <aside
        aria-label="Conversation detail"
        className={cn(
          "flex h-full min-h-[420px] flex-col rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm",
          conversationId === null && "items-center justify-center text-center",
        )}
      >
        {conversationId === null ? (
          <EmptyState />
        ) : (
          <DetailBody conversation={conversation} onClose={onClose} />
        )}
      </aside>
    );
  }

  return (
    <Sheet
      open={conversationId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-4 p-4 sm:max-w-md"
      >
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-sm font-semibold text-zinc-900">
            Conversation detail
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-500">
            Phase 4 lands the donor email thread here.
          </SheetDescription>
        </SheetHeader>
        <DetailBody conversation={conversation} onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-zinc-50 ring-1 ring-zinc-100">
        <MessageSquare className="size-5 text-zinc-300" />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-zinc-900">
          Pick a conversation
        </p>
        <p className="mt-1 max-w-xs text-[12px] text-zinc-500">
          Select any card or row to preview donor details. The reply composer
          and full thread land in the next phase.
        </p>
      </div>
    </div>
  );
}

interface DetailBodyProps {
  conversation: SupportConversation | undefined;
  onClose: () => void;
}

function DetailBody({ conversation, onClose }: DetailBodyProps) {
  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-[12px] text-zinc-500">
        Conversation not found.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            {conversation.status}
          </p>
          <h2 className="mt-1 truncate text-sm font-semibold text-zinc-900">
            {conversation.subject}
          </h2>
          <p className="mt-0.5 truncate text-[12px] text-zinc-500">
            {conversation.externalContactName ??
              conversation.externalContactEmail}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close detail"
          className="size-7 text-zinc-400 hover:text-zinc-700"
        >
          <X className="size-4" />
        </Button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/40 p-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-100">
          <ArrowRight className="size-4 text-zinc-300" />
        </div>
        <p className="text-[12px] font-medium text-zinc-700">
          Conversation thread, reply composer, and notes land in Phase 4.
        </p>
        <p className="text-[11px] text-zinc-500">
          The URL is already wired — refresh and the same conversation reopens.
        </p>
      </div>
    </div>
  );
}
