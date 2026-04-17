"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import { ArrowLeft, MessageSquareWarning } from "lucide-react";

import { ConversationComposer } from "./composer/ConversationComposer";
import { ConversationDetailEmpty } from "./ConversationDetailEmpty";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationTimeline } from "./ConversationTimeline";
import { useSupportConversation } from "../../hooks/use-support-conversation";

import type { SupportAssignee, SupportConversation } from "../../types";

interface ConversationDetailProps {
  conversationId: string | null;
  onClose: () => void;
  /** Mobile = render as Sheet, desktop = render inline as the right rail. */
  layout: "sheet" | "inline";
}

/**
 * Real conversation workspace. Replaces the Phase 3 `<DetailPanePlaceholder />`.
 * Same prop shape so the SupportInbox swap is one import + one rename.
 *
 * Composition:
 *   - `<ConversationHeader />` — donor identity + status / priority / assignee
 *     menus + SLA chip + Snooze / Resolve actions + close button.
 *   - `<ConversationTimeline />` — merged email + note + activity stream.
 *   - `<ConversationComposer />` — Tiptap reply / private note tabs sticky at
 *     the bottom of the pane scroll container (NOT the page).
 *
 * Phase 5 extension points are documented in the composer files (slash menu,
 * mention extension, macro / canned-response slots, hotkey surface).
 */
export function ConversationDetail({
  conversationId,
  onClose,
  layout,
}: ConversationDetailProps) {
  const { data: conversation, isLoading } =
    useSupportConversation(conversationId);

  if (layout === "inline") {
    return (
      <aside
        aria-label="Conversation detail"
        className={cn(
          "flex h-full min-h-[480px] flex-col rounded-2xl border border-zinc-100 bg-white shadow-sm",
          conversationId === null && "items-center justify-center text-center",
        )}
      >
        {conversationId === null ? (
          <div className="p-4">
            <ConversationDetailEmpty />
          </div>
        ) : (
          <DetailBody
            conversation={conversation}
            isLoading={isLoading}
            onClose={onClose}
          />
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
        className="flex w-full max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-zinc-100 px-4 py-3">
          <SheetTitle className="text-sm font-semibold text-zinc-900">
            Conversation
          </SheetTitle>
          <SheetDescription className="sr-only">
            Donor email thread, internal notes, and reply composer.
          </SheetDescription>
        </SheetHeader>
        <DetailBody
          conversation={conversation}
          isLoading={isLoading}
          onClose={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}

interface DetailBodyProps {
  conversation: SupportConversation | undefined;
  isLoading: boolean;
  onClose: () => void;
}

function DetailBody({ conversation, isLoading, onClose }: DetailBodyProps) {
  if (isLoading && !conversation) {
    return <DetailSkeleton />;
  }
  if (!conversation) {
    return <ConversationNotFound onClose={onClose} />;
  }

  const agent = conversation.assignee as SupportAssignee | null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ConversationHeader conversation={conversation} onClose={onClose} />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <ConversationTimeline conversationId={conversation.id} />
      </div>
      <div className="border-t border-zinc-100 bg-zinc-50/40 px-3 py-3">
        <ConversationComposer conversation={conversation} agent={agent} />
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 p-4">
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-6 w-2/3 rounded-md" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="mt-auto h-32 w-full rounded-2xl" />
    </div>
  );
}

interface ConversationNotFoundProps {
  onClose: () => void;
}

function ConversationNotFound({ onClose }: ConversationNotFoundProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 ring-1 ring-rose-100">
        <MessageSquareWarning className="size-5 text-rose-400" />
      </div>
      <p className="text-[13px] font-semibold text-zinc-900">
        Conversation not found
      </p>
      <p className="max-w-xs text-[12px] text-zinc-500">
        It may have been resolved or removed. Head back to the inbox to pick
        another conversation.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClose}
        className="mt-1 h-8 gap-1.5 rounded-lg border-zinc-200 px-3 text-xs"
      >
        <ArrowLeft className="size-3.5" />
        Back to inbox
      </Button>
    </div>
  );
}
