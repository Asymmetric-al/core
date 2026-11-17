"use client";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@asym/ui/components/shadcn/collapsible";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  MessageSquareWarning,
  StickyNote,
} from "lucide-react";
import { useRef, useState } from "react";

import { ConversationComposer } from "./composer/ConversationComposer";
import { ConversationDetailEmpty } from "./ConversationDetailEmpty";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationTimeline } from "./ConversationTimeline";
import { useSupportConversation } from "../../hooks/use-support-conversation";
import { SupportApiError } from "../../lib/api-client";
import { useFocusReturn } from "../../lib/use-focus-return";

import type { ComposerMode } from "./composer/use-conversation-composer";
import type { SupportAssignee, SupportConversation } from "../../types";
import type { RefObject } from "react";

interface ConversationDetailProps {
  conversationId: string | null;
  onClose: () => void;
  /** Mobile = render as Sheet, desktop = render inline as the right rail. */
  layout: "sheet" | "inline";
  /** Where the sheet returns focus once it has closed. */
  finalFocus?: () => HTMLElement | null;
}

export function ConversationDetail({
  conversationId,
  onClose,
  layout,
  finalFocus,
}: ConversationDetailProps) {
  const {
    data: conversation,
    isLoading,
    isError,
    isNotFound,
    error,
    refetch,
  } = useSupportConversation(conversationId);

  // Closing returns focus to the row or card that opened the pane, or to the
  // one j/k last focused while it stayed open. The sheet uses finalFocus.
  const paneRef = useRef<HTMLDivElement | null>(null);
  useFocusReturn(layout === "inline" && conversationId !== null, {
    key: conversationId,
    container: paneRef,
  });
  const threadRef = useRef<HTMLElement | null>(null);

  if (layout === "inline") {
    return (
      <aside
        ref={paneRef}
        aria-label="Conversation detail"
        className={cn(
          "flex h-full min-h-0 flex-col rounded-xl border border-border bg-card shadow-sm",
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
            isError={isError}
            isNotFound={isNotFound}
            error={error}
            onRetry={refetch}
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
      {/* The conversation header carries the close button; a second one
          from the sheet would repeat it. */}
      {/* Focus starts on the thread (the reason to open the sheet), not on
          the first toolbar button. */}
      <SheetContent
        side="right"
        showCloseButton={isLoading && !conversation}
        initialFocus={threadRef}
        finalFocus={finalFocus}
        className="flex w-full max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{conversation?.subject ?? "Conversation"}</SheetTitle>
          <SheetDescription>
            Donor email thread, internal notes, and reply composer.
          </SheetDescription>
        </SheetHeader>
        <DetailBody
          conversation={conversation}
          isLoading={isLoading}
          isError={isError}
          isNotFound={isNotFound}
          error={error}
          onRetry={refetch}
          onClose={onClose}
          threadRef={threadRef}
        />
      </SheetContent>
    </Sheet>
  );
}

interface DetailBodyProps {
  conversation: SupportConversation | undefined;
  isLoading: boolean;
  isError: boolean;
  isNotFound: boolean;
  error: unknown;
  onRetry: () => Promise<unknown>;
  onClose: () => void;
  /** The scrolling thread, for the sheet's initial focus. */
  threadRef?: RefObject<HTMLElement | null>;
}

function DetailBody({
  conversation,
  isLoading,
  onClose,
  threadRef,
  isError,
  isNotFound,
  error,
  onRetry,
}: DetailBodyProps) {
  // The composer starts closed in both layouts, so the thread is what staff
  // read first (the desktop pane is one screen tall and an open composer
  // took most of it); Reply or Internal note opens it.
  const [composerMode, setComposerMode] = useState<ComposerMode | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  if (isLoading && !conversation) {
    return <DetailSkeleton />;
  }
  if (!conversation && isError && !isNotFound) {
    const accessDenied =
      error instanceof SupportApiError &&
      (error.status === 401 || error.status === 403);
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn’t load conversation</AlertTitle>
        <AlertDescription>
          {accessDenied
            ? "You don’t have access to this conversation. Sign in with an authorized account or ask a support admin."
            : "Something went wrong loading it. Try again, or go back to the inbox."}
        </AlertDescription>
        <Button variant="outline" size="sm" onClick={() => void onRetry()}>
          Try again
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Back to inbox
        </Button>
      </Alert>
    );
  }
  if (!conversation) {
    return <ConversationNotFound onClose={onClose} />;
  }

  const agent = conversation.assignee as SupportAssignee | null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ConversationHeader conversation={conversation} onClose={onClose} />
      {/* A keyboard user can scroll the thread once it is focused. */}
      <section
        ref={threadRef}
        aria-label="Messages"
        tabIndex={0}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <ConversationTimeline conversationId={conversation.id} />
      </section>
      <div className="border-t border-border bg-muted/40 p-3">
        {composerMode === null ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={() => {
                setComposerMode("reply");
                setComposerOpen(true);
              }}
            >
              <Mail aria-hidden="true" />
              Reply
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setComposerMode("note");
                setComposerOpen(true);
              }}
            >
              <StickyNote aria-hidden="true" />
              Internal note
            </Button>
          </div>
        ) : (
          <Collapsible
            open={composerOpen}
            onOpenChange={setComposerOpen}
            className="flex flex-col gap-2"
          >
            {/* One button for Hide and Show, so focus stays on it when the
                composer hides instead of dropping to the page. */}
            <CollapsibleTrigger
              render={
                <Button
                  type="button"
                  variant={composerOpen ? "ghost" : "default"}
                  size={composerOpen ? "sm" : "default"}
                  className={cn(composerOpen && "self-end")}
                >
                  {composerOpen ? (
                    <ChevronDown aria-hidden="true" />
                  ) : (
                    <Mail aria-hidden="true" />
                  )}
                  {composerOpen ? "Hide composer" : "Show composer"}
                </Button>
              }
            />
            <CollapsibleContent keepMounted>
              {/* Keyed per conversation so drafts, attachments, and mode start
                  fresh when the agent switches threads instead of being reset
                  in an effect. Hiding keeps it mounted, so a draft survives. */}
              <ConversationComposer
                key={conversation.id}
                conversation={conversation}
                agent={agent}
                initialMode={composerMode}
                active={composerOpen}
              />
            </CollapsibleContent>
          </Collapsible>
        )}
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
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
        <MessageSquareWarning className="size-5 text-destructive" />
      </div>
      <p className="text-xs font-semibold text-foreground">
        Conversation not found
      </p>
      <p className="max-w-xs text-xs text-muted-foreground">
        It may have been removed or you may not have access. Head back to the
        inbox to pick another conversation.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClose}
        className="mt-1"
      >
        <ArrowLeft className="size-3.5" />
        Back to inbox
      </Button>
    </div>
  );
}
