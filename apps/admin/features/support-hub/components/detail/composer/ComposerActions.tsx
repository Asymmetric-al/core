"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Loader2, Save, Send, StickyNote } from "lucide-react";
import { useId } from "react";

import type {
  ComposerMode,
  ConversationComposerHandlers,
} from "./use-conversation-composer";

interface ComposerActionsProps {
  mode: ComposerMode;
  isPending: boolean;
  pendingAction: ConversationComposerHandlers["pendingAction"];
  isDirty: boolean;
  onSend: () => void;
  onSaveDraft: () => void;
  onCancel?: () => void;
  /** Optional pre-send slot (Phase 5 macros / canned-response palette mounts here). */
  beforeSend?: React.ReactNode;
}

/**
 * Send / Save draft / Cancel row. Renders different primary actions per
 * composer mode. The `beforeSend` slot is a Phase 5 extension point for
 * macros and canned response launchers.
 */
export function ComposerActions({
  mode,
  isPending,
  pendingAction,
  isDirty,
  onSend,
  onSaveDraft,
  onCancel,
  beforeSend,
}: ComposerActionsProps) {
  const pendingActionLabelId = useId();

  const isReply = mode === "reply";
  const isSending = pendingAction === "send";
  const isSavingDraft = pendingAction === "draft";
  const sendIcon = isSending ? (
    <Loader2 className="size-3.5 animate-spin" />
  ) : isReply ? (
    <Send className="size-3.5" />
  ) : (
    <StickyNote className="size-3.5" />
  );

  const sendLabel = isReply
    ? isSending
      ? "Sending"
      : "Send reply"
    : isSending
      ? "Saving"
      : "Add note";
  const sendAccessibleLabel = isReply
    ? isSending
      ? "Sending reply to donor"
      : "Send reply to donor"
    : isSending
      ? "Saving internal note"
      : "Add internal note";

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
        {beforeSend}
        {!beforeSend ? (
          <span aria-hidden className="text-zinc-300">
            Cmd+Enter to send
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={onCancel}
            className="h-8 rounded-lg px-3 text-xs"
          >
            Cancel
          </Button>
        ) : null}
        {isReply ? (
          <Button
            focusableWhenDisabled={isSavingDraft}
            aria-labelledby={`${pendingActionLabelId}-draft`}
            aria-busy={isSavingDraft}
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending || !isDirty}
            onClick={onSaveDraft}
            className="h-8 gap-1.5 rounded-lg border-zinc-200 px-3 text-xs"
          >
            <Save className="size-3.5" />
            <span id={`${pendingActionLabelId}-draft`}>
              {isSavingDraft ? "Saving draft" : "Save draft"}
            </span>
          </Button>
        ) : null}
        <Button
          aria-labelledby={`${pendingActionLabelId}-17`}
          focusableWhenDisabled={isSending}
          type="button"
          size="sm"
          disabled={isPending || !isDirty}
          aria-busy={isSending}
          onClick={onSend}
          className="h-8 gap-1.5 rounded-lg bg-zinc-900 px-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-zinc-800"
        >
          {sendIcon}
          <span id={`${pendingActionLabelId}-17`} className="sr-only">
            {sendAccessibleLabel}
          </span>
          {sendLabel}
        </Button>
      </div>
    </div>
  );
}
